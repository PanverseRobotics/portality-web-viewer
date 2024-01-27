import './lib/utils/linalg.js';
import './lib/pipeline.js';

import { mat3transpose, mat3multiply, mat4multiply, mat4perspective, mat4lookAt } from './lib/utils/linalg.js';
import { getRadius, viewMoveMouse, viewDollyWheelTranslate, viewMoveKey, viewMoveTouch } from './lib/utils/view.js';
import { rotorToRotationMatrix, rotorsToCov3D } from './lib/utils/rotors.js';
import { createPipeline, applyPipeline, createFullSortPipeline, applyFullSortPipeline, toTexture } from './lib/pipeline.js';
import { permuteArray } from './lib/pointarray.js';
import createRenderProgram from './lib/rendering/vpshaders.js';

let fpsData = {
    then: 0,
    frameTimes: [],
    frameCursor: 0,
    numFrames: 0,
    maxFrames: 20,
    totalFPS: 0
};

function initCanvas() {
    var canvas = document.getElementById("gl-canvas");
    //canvas.width = window.innerWidth;
    //canvas.height = window.innerHeight;

    return canvas;
}

function initWebgl(canvas) {
    var gl = canvas.getContext("webgl2");

    if (!gl) {
        console.error("WebGL 2 not available");
        document.body.innerHTML = "This example requires WebGL 2 which is unavailable on this system."
    }

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    // gl.enable(gl.BLEND);
    // gl.depthMask(false);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (!gl.getExtension("EXT_color_buffer_float")) {
        console.error("FLOAT color buffer not available");
        document.body.innerHTML = "This example requires EXT_color_buffer_float which is unavailable on this system."
    }

    return gl;
}

function updateFPSDisplay(fps, averageFPS) {
    const fpsElem = document.querySelector("#fps");
    if (!fpsElem) return;
    fpsElem.textContent = fps.toFixed(1);  // update fps display
    const avgElem = document.querySelector("#avg");
    if (!avgElem) return;
    avgElem.textContent = averageFPS.toFixed(1);  // update avg display
}

function calcFPS(now) {
    const deltaTime = now - fpsData.then;
    fpsData.then = now;
    if (deltaTime == 0) return;

    const fps = 1000 / deltaTime;

    // add the current fps and remove the oldest fps
    fpsData.totalFPS += fps - (fpsData.frameTimes[fpsData.frameCursor] || 0);

    // record the newest fps
    fpsData.frameTimes[fpsData.frameCursor++] = fps;

    // needed so the first N frames, before we have maxFrames, is correct.
    fpsData.numFrames = Math.max(fpsData.numFrames, fpsData.frameCursor);

    // wrap the cursor
    fpsData.frameCursor %= fpsData.maxFrames;

    updateFPSDisplay(fps, fpsData.totalFPS / fpsData.numFrames);
}

function getCameraTransform(canvas, viewParams) {
    var projMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var viewProjMatrix = new Float32Array(16);

    mat4perspective(projMatrix, Math.PI / 3, canvas.width / canvas.height, 0.1, 20.0);
    mat4lookAt(viewMatrix, viewParams.eyePosition, viewParams.focusPosition, viewParams.up);
    mat4multiply(viewProjMatrix, projMatrix, viewMatrix);

    return {
        proj: projMatrix,
        view: viewMatrix,
        viewProj: viewProjMatrix
    }
}


// pad to change positions from [x1, y1, z1, x2, y2, z2, ...]
// to [x1, y1, z1, 0, x1, y1, z2, 0, ...]
function padPositions(positions) {
    let n = Math.ceil((positions.length / 3) | 0);

    let paddedPositions = new Float32Array(4 * n);

    for (let i = 0; i < n; i += 1) {
        paddedPositions[4 * i] = positions[3 * i];
        paddedPositions[4 * i + 1] = positions[3 * i + 1];
        paddedPositions[4 * i + 2] = positions[3 * i + 2];
        paddedPositions[4 * i + 3] = 0;
    }

    return paddedPositions;
}

function makeTextures(gl, position, color, covP2, covP1, group_size, n_groups) {
    return {
        position: toTexture(gl, position, group_size, n_groups, 'float', 4),
        color: toTexture(gl, color, group_size, n_groups, 'float', 4),
        covP1: toTexture(gl, covP1, group_size, n_groups, 'float', 4),
        covP2: toTexture(gl, covP2, group_size, n_groups, 'float', 2)
    }
}

function bindTextures(gl, program, permTextures, vertexTextures, pipelineType) {
    if (pipelineType == 'kdtree') {
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, permTextures.outer.texture);
        gl.uniform1i(gl.getUniformLocation(program, 'perm_outer_idx'), 2);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, permTextures.inner.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        const permInnerIdxLoc = gl.getUniformLocation(program, 'perm_inner_idx');
        gl.uniform1i(permInnerIdxLoc, 0);
    }

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, vertexTextures.position.texture);
    gl.uniform1i(gl.getUniformLocation(program, 'positionTexture'), 3);

    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, vertexTextures.color.texture);
    gl.uniform1i(gl.getUniformLocation(program, 'colorTexture'), 4);

    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, vertexTextures.covP1.texture);
    gl.uniform1i(gl.getUniformLocation(program, 'covP1Texture'), 5);

    gl.activeTexture(gl.TEXTURE6);
    gl.bindTexture(gl.TEXTURE_2D, vertexTextures.covP2.texture);
    gl.uniform1i(gl.getUniformLocation(program, 'covP2Texture'), 6);
}


// pipelineType can be 'full' or 'kdtree'
function renderMain(data, cameraParams, pipelineType) {
    let canvas = initCanvas();
    let gl = initWebgl(canvas);

    let shaderProgram = createRenderProgram(gl, pipelineType);

    // Create objects
    const GROUP_SIZE = 1024; //gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const N_GROUPS = Math.floor(Math.floor(data.positions.length / 3) / GROUP_SIZE);
    const NUM_PARTICLES = GROUP_SIZE * N_GROUPS;

    const SORT_INTERVAL = 6;

    let positionData = padPositions(data.positions);
    let colorData = data.colors;

    let covData = rotorsToCov3D(data.scales, data.rotors);
    let covP1Data = covData.p1;
    let covP2Data = covData.p2;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.useProgram(shaderProgram);

    var buffer = gl.createBuffer();
    // make this buffer the current 'ELEMENT_ARRAY_BUFFER'
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint32Array(32),
        gl.STATIC_DRAW
    );

    let pipeline;
    if (pipelineType == 'full') {
        pipeline = createFullSortPipeline(gl, GROUP_SIZE, N_GROUPS);
    } else {
        pipeline = createPipeline(gl, positionData, GROUP_SIZE, N_GROUPS);

        positionData = permuteArray(positionData, pipeline.perm, 4);
        colorData = permuteArray(colorData, pipeline.perm, 4);
        covP1Data = permuteArray(covP1Data, pipeline.perm, 4);
        covP2Data = permuteArray(covP2Data, pipeline.perm, 2);
    }

    let vertexTextures = makeTextures(gl, positionData, colorData, covP2Data, covP1Data, GROUP_SIZE, N_GROUPS);

    var animationFrameId;

    var i = 0;
    let isMouseDown = false;
    let isKeyDown = false;
    let lastMousePosition = [0, 0];
    let keyPressed = '';

    var viewParams = {
        up: cameraParams.up,
        eyePosition: cameraParams.position,
        focusPosition: cameraParams.lookAt,
        azimuth: 0.0,
        elevation: 0.0,
        lookSensitivity: 300.0,
        viewSpin: true,
    };

    viewParams.radius = getRadius(viewParams);

    var permTextures;

    let draw = function (now) {
        // Check if the canvas still exists
        if (!document.body.contains(gl.canvas)) {
            cancelAnimationFrame(animationFrameId);
            return;
        }

        // Set scene transforms.
        let cameraXform = getCameraTransform(canvas, viewParams);

        // apply sorting pipeline.
        if (pipelineType == 'full') {
            applyFullSortPipeline(gl, pipeline, vertexTextures, cameraXform.viewProj, Math.ceil(pipeline.sortSteps.length / SORT_INTERVAL));
            permTextures = [];
        } else {
            if (((i % SORT_INTERVAL) | 0) == 0) {
                permTextures = applyPipeline(gl, pipeline, viewParams.eyePosition, cameraXform.viewProj);
            }
            i += 1;
        }

        // Set scene transform uniforms.
        gl.useProgram(shaderProgram);
        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'uView'), false, cameraXform.view);
        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'uViewProj'), false, cameraXform.viewProj);

        let viewportScale = new Float32Array([canvas.width, canvas.height]);
        //let viewportScale = new Float32Array([512,512]);

        gl.uniform3fv(gl.getUniformLocation(shaderProgram, 'uEyePosition'), viewParams.eyePosition);
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'uViewportScale'), viewportScale);

        // Set viewport params.
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(0, 0, canvas.width, canvas.height);

        bindTextures(gl, shaderProgram, permTextures, vertexTextures, pipelineType);
        gl.uniform2i(gl.getUniformLocation(shaderProgram, 'textureSize'), GROUP_SIZE, N_GROUPS);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // Prepare viewport for rendering and blending.
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);                //gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES);

        // Draw all the vertices as points, in the order given in the element array buffer.
        gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES);

        // Reset values of variables so that other shaders can run.
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);

        calcFPS(now);

        // Request next animation frame
        animationFrameId = requestAnimationFrame(draw);
    }

    // Function to resize the canvas to full window size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }


    function handleVisibilityChange() {
        if (document.hidden) {
            cancelAnimationFrame(animationFrameId);
        } else {
            animationFrameId = requestAnimationFrame(draw);
        }
    }

    // Listen for window resize events
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial resize

    // Event listener for tab visibility
    document.addEventListener("visibilitychange", handleVisibilityChange, false);

    // Function to create the camera query string
    function createQueryString(cameraObject) {
        // Parse existing query parameters
        const params = new URLSearchParams(window.location.search);

        // Update with new parameters from cameraObject
        params.set('camera', cameraObject.eyePosition.join(','));
        params.set('lookAt', cameraObject.focusPosition.join(','));
        params.set('up', cameraObject.up.join(','));

        // Return the full query string
        return params.toString();
    }

    // event listener for the button to get the url link
    const urlLinkButton = document.getElementById('urlLinkButton');
    urlLinkButton.addEventListener('click', () => {
        const queryString = createQueryString(viewParams);

        const fullUrl = `${window.location.origin}${window.location.pathname}?${queryString}`;
        alert(fullUrl);
        console.log(fullUrl);
        // why doesn't this work??!?!??!
        navigator.clipboard.writeText(fullUrl).then(() => {
            console.log('URL copied to clipboard');
        }).catch(err => {
            console.error('Error in copying text: ', err);
        });
    });

    // Start the animation loop
    animationFrameId = requestAnimationFrame(draw);

    // Prevent default right-click context menu on the canvas
    canvas.addEventListener('contextmenu', function (e) {
        e.preventDefault(); // Prevents the default context menu from appearing
    });

    canvas.addEventListener('mousedown', function (event) {
        isMouseDown = true;
        lastMousePosition = [event.clientX, event.clientY];
    });

    canvas.addEventListener('mousemove', function (event) {
        viewParams.viewSpin = false;
        viewMoveMouse(event, lastMousePosition, isKeyDown, keyPressed, viewParams);
        lastMousePosition = [event.clientX, event.clientY];
    });

    window.addEventListener('keydown', function (event) {
        viewParams.viewSpin = false;
        isKeyDown = true;
        keyPressed = event.key;
        viewMoveKey(event, viewParams);
    });



    window.addEventListener('keyup', function (event) {
        isKeyDown = false;
        keyPressed = '';
    });

    canvas.addEventListener('mouseup', function (event) {
        isMouseDown = false;
    });


    canvas.addEventListener('wheel', function (event) {
        event.preventDefault(); // Prevents the default scrolling behavior

        viewDollyWheelTranslate(event, viewParams);
        // Formerly viewDollyWheel

    }, { passive: false });

    canvas.addEventListener('mouseleave', function (event) {
        isMouseDown = false;
    });

    window.addEventListener('touchstart', function (event) {
        console.log(event)
        event.preventDefault();
        isMouseDown = true;
        lastMousePosition = [event.touches[0].clientX, event.touches[0].clientY];
    });

    window.addEventListener('touchmove', function (event) {
        console.log(event)
        event.preventDefault();
        viewParams.viewSpin = false;
        viewMoveTouch(event, lastMousePosition, viewParams);
        lastMousePosition = [event.touches[0].clientX, event.touches[0].clientY];
    });

    window.addEventListener('touchend', function (event) {
        isMouseDown = false;
    });



    // if (viewParams.viewSpin) {
    //     console.log(viewParams.viewSpin)
    //     viewAutoSpin(viewParams);
    // } else {
    //     stopAutoSpin(viewParams);
    // }
    // IT WON'T STOP SPINNING!!!!

    return draw;
}


export { renderMain };

