import { mat4lookAt, mat4multiply, mat4rotateX, mat4rotateY, mat4rotateZ } from './linalg.js';
import { rotorToRotationMatrix } from './rotors.js';

function getRadius(viewParams) {
    let ep = viewParams.eyePosition;
    let fp = viewParams.focusPosition;

    return Math.sqrt((ep[0] - fp[0]) ** 2 + (ep[1] - fp[1]) ** 2 + (ep[2] - fp[2]) ** 2);
}

function lazyInitializeViewMatrix(viewParams) {
    let viewMatrix = new Float32Array(16);
    mat4lookAt(viewMatrix, viewParams.eyePosition, viewParams.focusPosition, viewParams.up);
    return viewMatrix;
}

function I(n) {
    let out = new Float32Array(n * n);
    for (let i = 0; i < n; i++) {
        out[i * n + i] = 1;
    }
    return out;
}

function buildTransformMatrix(R, x, y, z) {
    var out = new Float32Array(16);
    out[0] = R[0];
    out[1] = R[1];
    out[2] = R[2];
    out[3] = 0;
    out[4] = R[4];
    out[5] = R[5];
    out[6] = R[6];
    out[7] = 0;
    out[8] = R[8];
    out[9] = R[9];
    out[10] = R[10];
    out[11] = 0;
    out[12] = x;
    out[13] = y;
    out[14] = z;
    out[15] = 1;
    return out;
}

function viewUpdateEyePosition(radius, az, elev, offs) {
    let x = radius * Math.cos(az) * Math.cos(elev) + offs[0];
    let z = radius * Math.sin(az) * Math.cos(elev) + offs[2];
    let y = radius * Math.sin(elev) + offs[1];

    return [x, y, z];
}


function translateEyeAndFocusPositions(movementFactor, movementDirectionVector, viewParams) {

    // translate the focus position by movementFactor * movementDirectionVector
    viewParams.focusPosition = [viewParams.focusPosition[0] + movementFactor * movementDirectionVector[0], viewParams.focusPosition[1] + movementFactor * movementDirectionVector[1], viewParams.focusPosition[2] + movementFactor * movementDirectionVector[2]];
    // translate the eye position by movementFactor * movementDirectionVector
    viewParams.eyePosition = [viewParams.eyePosition[0] + movementFactor * movementDirectionVector[0], viewParams.eyePosition[1] + movementFactor * movementDirectionVector[1], viewParams.eyePosition[2] + movementFactor * movementDirectionVector[2]];

}

function viewOrbit(event, lastMousePosition, viewParams) {
    // with left click, spin around the focus position
    let dx = 1 * (event.clientX - lastMousePosition[0]) / viewParams.lookSensitivity;
    let dy = 1 * (event.clientY - lastMousePosition[1]) / viewParams.lookSensitivity;
    let rotation = I(4);
    mat4rotateY(rotation, rotation, -dx); 
    mat4rotateX(rotation, rotation, -dy);
    var translation_matrix = buildTransformMatrix(rotation, -viewParams.radius*dx, viewParams.radius*dy, 0);
    var placeholder_matrix = new Float32Array(16);
    mat4multiply(placeholder_matrix, translation_matrix, viewParams.viewMatrix);
    viewParams.viewMatrix = placeholder_matrix;
}





function viewDollyTranslateRotate(event, lastMousePosition, viewParams) {
    // this one translates focus and eye together with vertical and rotates view with horizontal
    let dx = 1 * (event.clientX - lastMousePosition[0]) / viewParams.lookSensitivity;
    let dy = 2 * (event.clientY - lastMousePosition[1]) / viewParams.lookSensitivity;
    let rotation = I(4);
    mat4rotateZ(rotation, rotation, dx);   
    var translation_matrix = buildTransformMatrix(rotation, 0, 0, -dy);
    var placeholder_matrix = new Float32Array(16);
    mat4multiply(placeholder_matrix, translation_matrix, viewParams.viewMatrix);
    viewParams.viewMatrix = placeholder_matrix;
    
}



function viewStrafeVert(event, lastMousePosition, viewParams) {
    // with right click, translate the focus and eye positions in a plane defined by the eye, focus, and up vector
    // this one goes up and down with vertical motion
    let dx = 3 * (event.clientX - lastMousePosition[0]) / viewParams.lookSensitivity;
    let dy = 3 * (event.clientY - lastMousePosition[1]) / viewParams.lookSensitivity;
    let rotation = I(4);
    var translation_matrix = buildTransformMatrix(rotation, dx, -dy, 0);
    var placeholder_matrix = new Float32Array(16);
    mat4multiply(placeholder_matrix, translation_matrix, viewParams.viewMatrix);
    viewParams.viewMatrix = placeholder_matrix;

}


function viewPan(event, lastMousePosition, viewParams) {
    // pan the view
    let dx = (event.clientX - lastMousePosition[0]) / viewParams.lookSensitivity;
    let dy = (event.clientY - lastMousePosition[1]) / viewParams.lookSensitivity;
    let rotation = I(4);
    mat4rotateY(rotation, rotation, dx); 
    mat4rotateX(rotation, rotation, dy);
    var translation_matrix = buildTransformMatrix(rotation, 0, 0, 0);
    var placeholder_matrix = new Float32Array(16);
    mat4multiply(placeholder_matrix, translation_matrix, viewParams.viewMatrix);
    viewParams.viewMatrix = placeholder_matrix;
}

function viewMoveTouch(event, lastMousePosition, viewParams) {
    // only pass the first touch
    if (event.touches.length == 1) {
        viewOrbit(event.touches[0], lastMousePosition, viewParams);
    } else if (event.touches.length == 2) {
        viewDollyTranslateRotate(event.touches[0], lastMousePosition, viewParams);

    } else {
        viewStrafeVert(event.touches[0], lastMousePosition, viewParams);
    }
}




function viewRadius(event, viewParams) {
    viewParams.radius += event.deltaY / viewParams.lookSensitivity;

    // clamp the radius to [0, 10]
    viewParams.radius = Math.max(0.1, Math.min(30, viewParams.radius));

    // update eye positions with new radius
    viewParams.eyePosition = viewUpdateEyePosition(viewParams.radius, viewParams.azimuth, viewParams.elevation, viewParams.focusPosition);
}

function viewDollyWheelTranslate(event, viewParams) {
// with middle scroll, strafe in and out
    let dy = -event.deltaY / viewParams.lookSensitivity;
    let rotation = I(4);
    var translation_matrix = buildTransformMatrix(rotation, 0, 0, dy);
    var placeholder_matrix = new Float32Array(16);
    mat4multiply(placeholder_matrix, translation_matrix, viewParams.viewMatrix);
    viewParams.viewMatrix = placeholder_matrix;
}

function viewMoveMouse(event, lastMousePosition, isKeyDown, keyPressed, viewParams) {
    if (event.buttons == 1) {
        if (isKeyDown) {
            if (keyPressed == "Shift") {
                viewPan(event, lastMousePosition, viewParams);
            } else if (keyPressed == "Control") {
                viewStrafeVert(event, lastMousePosition, viewParams);
                (event, lastMousePosition, viewParams);
            } else if (keyPressed == "Alt") {
                viewDollyTranslateRotate(event, lastMousePosition, viewParams);
            } else {
                viewOrbit(event, lastMousePosition, viewParams);
            }
        }
        else {
            viewOrbit(event, lastMousePosition, viewParams);
        }
    } else if (event.buttons == 4) {
        viewDollyTranslateRotate(event, lastMousePosition, viewParams);
    } else if (event.buttons == 2) {
        viewStrafeVert(event, lastMousePosition, viewParams);
        // formerly viewPan and also viewStrafe
    }


}

function viewMoveKey(event, viewParams) {
    let keySensitivityAdjustment = 100;
    // with WASD, move the focus position and the eye position
    // find the vector from the eye to the focus
    let eyeToFocus = [viewParams.focusPosition[0] - viewParams.eyePosition[0], viewParams.focusPosition[1] - viewParams.eyePosition[1], viewParams.focusPosition[2] - viewParams.eyePosition[2]];
    // find the vector perpendicular to the eyeToFocus vector and the up vector
    let right = [eyeToFocus[1] * viewParams.up[2] - eyeToFocus[2] * viewParams.up[1], eyeToFocus[2] * viewParams.up[0] - eyeToFocus[0] * viewParams.up[2], eyeToFocus[0] * viewParams.up[1] - eyeToFocus[1] * viewParams.up[0]];
    // normalize the right vector
    let rightNorm = Math.sqrt(right[0] ** 2 + right[1] ** 2 + right[2] ** 2);
    right = [right[0] / rightNorm, right[1] / rightNorm, right[2] / rightNorm];
    // normalize the vector from the eye to the focus
    let eyeToFocusNorm = Math.sqrt(eyeToFocus[0] ** 2 + eyeToFocus[1] ** 2 + eyeToFocus[2] ** 2);
    eyeToFocus = [eyeToFocus[0] / eyeToFocusNorm, eyeToFocus[1] / eyeToFocusNorm, eyeToFocus[2] / eyeToFocusNorm];

    // rotate up vector around eyeToFocus vector
    let up = viewParams.up;
    let upNorm = Math.sqrt(up[0] ** 2 + up[1] ** 2 + up[2] ** 2);
    up = [up[0] / upNorm, up[1] / upNorm, up[2] / upNorm];



    if (event.key == "w" || event.key == "ArrowUp") {
        viewParams.focusPosition = [viewParams.focusPosition[0] + (keySensitivityAdjustment / viewParams.lookSensitivity) * eyeToFocus[0], viewParams.focusPosition[1] + (keySensitivityAdjustment / viewParams.lookSensitivity) * eyeToFocus[1], viewParams.focusPosition[2] + (keySensitivityAdjustment / viewParams.lookSensitivity) * eyeToFocus[2]];
        viewParams.eyePosition = [viewParams.eyePosition[0] + (keySensitivityAdjustment / viewParams.lookSensitivity) * eyeToFocus[0], viewParams.eyePosition[1] + (keySensitivityAdjustment / viewParams.lookSensitivity) * eyeToFocus[1], viewParams.eyePosition[2] + (keySensitivityAdjustment / viewParams.lookSensitivity) * eyeToFocus[2]];
    }
    else if (event.key == "s" || event.key == "ArrowDown") {
        viewParams.focusPosition = [viewParams.focusPosition[0] - (keySensitivityAdjustment / viewParams.lookSensitivity) * eyeToFocus[0], viewParams.focusPosition[1] - (keySensitivityAdjustment / viewParams.lookSensitivity) * eyeToFocus[1], viewParams.focusPosition[2] - (keySensitivityAdjustment / viewParams.lookSensitivity) * eyeToFocus[2]];
        viewParams.eyePosition = [viewParams.eyePosition[0] - (keySensitivityAdjustment / viewParams.lookSensitivity) * eyeToFocus[0], viewParams.eyePosition[1] - (keySensitivityAdjustment / viewParams.lookSensitivity) * eyeToFocus[1], viewParams.eyePosition[2] - (keySensitivityAdjustment / viewParams.lookSensitivity) * eyeToFocus[2]];
    }
    else if (event.key == "a" || event.key == "ArrowLeft") {
        viewParams.focusPosition = [viewParams.focusPosition[0] - (keySensitivityAdjustment / viewParams.lookSensitivity) * right[0], viewParams.focusPosition[1] - (keySensitivityAdjustment / viewParams.lookSensitivity) * right[1], viewParams.focusPosition[2] - (keySensitivityAdjustment / viewParams.lookSensitivity) * right[2]];
        viewParams.eyePosition = [viewParams.eyePosition[0] - (keySensitivityAdjustment / viewParams.lookSensitivity) * right[0], viewParams.eyePosition[1] - (keySensitivityAdjustment / viewParams.lookSensitivity) * right[1], viewParams.eyePosition[2] - (keySensitivityAdjustment / viewParams.lookSensitivity) * right[2]];
    }
    else if (event.key == "d" || event.key == "ArrowRight") {
        viewParams.focusPosition = [viewParams.focusPosition[0] + (keySensitivityAdjustment / viewParams.lookSensitivity) * right[0], viewParams.focusPosition[1] + (keySensitivityAdjustment / viewParams.lookSensitivity) * right[1], viewParams.focusPosition[2] + (keySensitivityAdjustment / viewParams.lookSensitivity) * right[2]];
        viewParams.eyePosition = [viewParams.eyePosition[0] + (keySensitivityAdjustment / viewParams.lookSensitivity) * right[0], viewParams.eyePosition[1] + (keySensitivityAdjustment / viewParams.lookSensitivity) * right[1], viewParams.eyePosition[2] + (keySensitivityAdjustment / viewParams.lookSensitivity) * right[2]];
    }
    else if (event.key == "h") {
        viewParams.focusPosition = [0, 0, 0];
        viewParams.eyePosition = [5, 0, 0];
    }
    else if (event.key == "Enter") {
        viewParams.viewSpin = true;
    }

    else if (event.key == "q") {
        let dx = -0.1 * (keySensitivityAdjustment / viewParams.lookSensitivity);
        let upNew = [up[0] * Math.cos(dx) + right[0] * Math.sin(dx), up[1] * Math.cos(dx) + right[1] * Math.sin(dx), up[2] * Math.cos(dx) + right[2] * Math.sin(dx)];
        let upNewNorm = Math.sqrt(upNew[0] ** 2 + upNew[1] ** 2 + upNew[2] ** 2);
        viewParams.up = [upNew[0] / upNewNorm, upNew[1] / upNewNorm, upNew[2] / upNewNorm];
    }
    else if (event.key == "e") {
        let dx = 0.1 * (keySensitivityAdjustment / viewParams.lookSensitivity);
        let upNew = [up[0] * Math.cos(dx) + right[0] * Math.sin(dx), up[1] * Math.cos(dx) + right[1] * Math.sin(dx), up[2] * Math.cos(dx) + right[2] * Math.sin(dx)];
        let upNewNorm = Math.sqrt(upNew[0] ** 2 + upNew[1] ** 2 + upNew[2] ** 2);
        viewParams.up = [upNew[0] / upNewNorm, upNew[1] / upNewNorm, upNew[2] / upNewNorm];
    }
    else if (event.key == "i") {
        let dy = 0.1 * (keySensitivityAdjustment / viewParams.lookSensitivity);
        viewParams.focusPosition = [viewParams.focusPosition[0] + dy * viewParams.up[0], viewParams.focusPosition[1] + + dy * viewParams.up[1], viewParams.focusPosition[2] + dy * viewParams.up[2]];
        // translate the eye position by  dy * up
        viewParams.eyePosition = [viewParams.eyePosition[0] + dy * viewParams.up[0], viewParams.eyePosition[1] + dy * viewParams.up[1], viewParams.eyePosition[2] + dy * viewParams.up[2]];
    }
    else if (event.key == "k") {
        let dy = -0.1 * (keySensitivityAdjustment / viewParams.lookSensitivity);
        viewParams.focusPosition = [viewParams.focusPosition[0] + dy * viewParams.up[0], viewParams.focusPosition[1] + + dy * viewParams.up[1], viewParams.focusPosition[2] + dy * viewParams.up[2]];
        // translate the eye position by dy * up
        viewParams.eyePosition = [viewParams.eyePosition[0] + dy * viewParams.up[0], viewParams.eyePosition[1] + dy * viewParams.up[1], viewParams.eyePosition[2] + dy * viewParams.up[2]];
    }

}




function viewAutoSpin(viewParams) {
    console.log("spin")

    setInterval(() => {
        viewParams.azimuth += 0.01;
        viewParams.eyePosition = viewUpdateEyePosition(viewParams.radius, viewParams.azimuth, viewParams.elevation, viewParams.focusPosition);
    }, 1000 / 60);
}
function stopAutoSpin() {
    clearInterval();

}




export { viewMoveMouse, viewDollyWheelTranslate, viewMoveKey, viewMoveTouch, viewAutoSpin, stopAutoSpin, getRadius, lazyInitializeViewMatrix };
