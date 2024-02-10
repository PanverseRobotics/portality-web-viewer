import { mat4lookAt, mat4multiply, mat4rotateX, mat4rotateY, mat4rotateZ } from './linalg.js';
import { rotorToRotationMatrix } from './rotors.js';

function mat4multiplyNew(a, b){
    var out = new Float32Array(16);
    mat4multiply(out, a, b);
    return out;
}

function initializeViewMatrix(cameraParams) {
    let viewMatrix = new Float32Array(16);
    mat4lookAt(viewMatrix, cameraParams.position, cameraParams.lookAt, cameraParams.up);
    return viewMatrix;
}

function identity(n) {
    let out = new Float32Array(n * n);
    for (let i = 0; i < n; i++) {
        out[i * n + i] = 1;
    }
    return out;
}

function buildTransformMatrix(R, p) {
    return new Float32Array([
        R[0], R[1], R[2],  0,
        R[4], R[5], R[6],  0,
        R[8], R[9], R[10], 0,
        p[0], p[1], p[2],  1 
    ]);
}

function updateViewMatrix(angles, p, viewMatrix) {
    let rotation = identity(4);
    mat4rotateX(rotation, rotation, angles[0]);
    mat4rotateY(rotation, rotation, angles[1]);
    mat4rotateZ(rotation, rotation, angles[2]);
    let transformMatrix = buildTransformMatrix(rotation, p);
    return mat4multiplyNew(transformMatrix, viewMatrix);
}

/**
 * Updates the view matrix to enable orbit-like rotation around a focus point.
 *
 * @param {Array} delta - The current cursor position difference from previous (x, y coordinates).
 * @param {Object} viewParams - An object containing the following properties:
 *   * radius {number} - The distance from the camera to the focus point.
 *   * viewMatrix {Float32Array} - The current view matrix (a 4x4 matrix). 
 */
function viewOrbit(delta, viewParams) {
    let t = [viewParams.radius*Math.sin(delta[0]), viewParams.radius*Math.sin(-delta[1]), 0];
    return updateViewMatrix([delta[1], delta[0], 0], t, viewParams.matrix);
}

/**
 * Updates the view to allow for dolly (translation along the view axis) and rotation around the Z-axis, controlled by cursor movement.
 *
 * @param {Array} delta - The current cursor position difference from previous (x, y coordinates).
 * @param {Object} viewParams - An object containing the following properties:
 *   * viewMatrix {Float32Array} - The current view matrix (a 4x4 matrix). 
 */
function viewDollyTranslateRotate(delta, viewParams) {
    return updateViewMatrix([0, 0, delta[0]], [0, 0, -2*delta[1]], viewParams.matrix);
}

/**
 * Updates the view matrix to allow for vertical and horizontal strafing movement based on cursor motion.  
 * Strafing refers to side-to-side and up/down movement without changing camera orientation.
 *
 * @param {Array} delta - The current cursor position difference from previous (x, y coordinates).
 * @param {Object} viewParams - An object containing the following properties:
 *   * viewMatrix {Float32Array} - The current view matrix (a 4x4 matrix). 
 */
function viewStrafeVert(delta, viewParams) {
    return updateViewMatrix([0, 0, 0], [3*delta[0], -3*delta[1], 0], viewParams.matrix);
}

/**
 * Updates the view matrix to simulate camera panning (pivoting the camera) based on cursor movement. 
 *
 * @param {Array} delta - The current cursor position difference from previous (x, y coordinates).
 * @param {Object} viewParams - An object containing the following properties:
 *   * viewMatrix {Float32Array} - The current view matrix (a 4x4 matrix). 
 */
function viewPan(delta, viewParams) {
    return updateViewMatrix([delta[1], delta[0], 0], [0, 0, 0], viewParams.matrix);
}

function viewRoll(angleDelta, viewParams) {
    return updateViewMatrix([0, 0, angleDelta], [0, 0, 0], viewParams.matrix);
}

function viewDolly(posDelta, viewParams) {
    return updateViewMatrix([0, 0, 0], [0, 0, -posDelta], viewParams.matrix);
}

function viewDollyTranslateRotateTouch(event, lastCursorPosition, viewParams) {
    // compute the distance between the two touches
    let touch1 = event.touches[0];
    let touch2 = event.touches[1];
    let dx = touch1.clientX - touch2.clientX;
    let dy = touch1.clientY - touch2.clientY;
    let distance = Math.sqrt(dx ** 2 + dy ** 2);
    // compute the angle between the two touches
    let angle = Math.atan2(dy, dx);
    // compute the change in distance between the two touches
    let lastTouch1x = lastTouchPosition[0];
    let lastTouch1y = lastTouchPosition[1];
    let lastTouch2x = lastTouchPosition[2];
    let lastTouch2y = lastTouchPosition[3];
    let lastDx = lastTouch1x - lastTouch2x;
    let lastDy = lastTouch1y - lastTouch2y;
    let lastDistance = Math.sqrt(lastDx ** 2 + lastDy ** 2);
    let distanceChange = (distance - lastDistance)/viewParams.lookSensitivity;
    // compute the change in angle between the two touches
    let lastAngle = Math.atan2(lastDy, lastDx);
    let angleChange = -1*(angle - lastAngle)/viewParams.lookSensitivity;


    // copied from viewDollyTranslateRotate
    // use distance change as dy from original function, because it controls zoom
    // use angle change as dx from original function, because it controls rotation
    let rotation = identity(4);
    mat4rotateZ(rotation, rotation, angleChange);   
    var translation_matrix = buildTransformMatrix(rotation, [0, 0, -distanceChange]);
    viewParams.viewMatrix = mat4multiplyNew(translation_matrix, viewParams.matrix);
    
}


function viewMoveTouch(event, lastTouchPosition, viewParams) {
    // only pass the first touch
    if (event.touches.length == 1) {
        viewOrbit(event.touches[0], lastTouchPosition, viewParams); // we can pass the whole lastTouchPosition because it only uses the first two elements anyways
    } else if (event.touches.length == 2) {
        // viewDollyTranslateRotate(event.touches[0], lastTouchPosition, viewParams);
        viewDollyTranslateRotateTouch(event, lastTouchPosition, viewParams); // Not tested as of Feb 7, 2024
    } else {
        viewStrafeVert(event.touches[0], lastTouchPosition, viewParams);
    }
}

const actionMap = {
    "pan": viewPan,
    "orbit": viewOrbit,
    "dolly": viewDolly,
    "roll": viewRoll,
    "dollyRoll": viewDollyTranslateRotate,
    "strafe": viewStrafeVert
};


function viewUpdate(action, delta, viewParams) {
    //let action = mouseControlMap[button][keyPressed];
    let f = actionMap[action];

    return f(delta, viewParams);
}

function viewAutoSpin(viewParams) {
    console.log("spin")

    setInterval(() => {
        viewOrbit([1, 0], [0, 0], viewParams);
    }, 1000 / 60);
}
function stopAutoSpin() {
    clearInterval();
}

export { viewUpdate, viewMoveTouch, viewAutoSpin, stopAutoSpin, initializeViewMatrix };
