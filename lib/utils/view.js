import { mat4lookAt, mat4multiply } from './linalg.js';
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

function buildTranslationMatrix(x, y, z) {
    var out = new Float32Array(16);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
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

//put this bad boy into the stuff below
function translateEyeAndFocusPositions(movementFactor, movementDirectionVector, viewParams) {

    // translate the focus position by movementFactor * movementDirectionVector
    viewParams.focusPosition = [viewParams.focusPosition[0] + movementFactor * movementDirectionVector[0], viewParams.focusPosition[1] + movementFactor * movementDirectionVector[1], viewParams.focusPosition[2] + movementFactor * movementDirectionVector[2]];
    // translate the eye position by movementFactor * movementDirectionVector
    viewParams.eyePosition = [viewParams.eyePosition[0] + movementFactor * movementDirectionVector[0], viewParams.eyePosition[1] + movementFactor * movementDirectionVector[1], viewParams.eyePosition[2] + movementFactor * movementDirectionVector[2]];

}

function viewOrbit(event, lastMousePosition, viewParams) {
    // with left click, spin around the focus position
    let dx = event.clientX - lastMousePosition[0];
    let dy = event.clientY - lastMousePosition[1];
    viewParams.azimuth -= dx / viewParams.lookSensitivity;
    viewParams.elevation -= dy / viewParams.lookSensitivity;

    // Clamp the elevation to [-pi/2, pi/2]
    viewParams.elevation = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, viewParams.elevation));
    //console.log(eyePosition)

    viewParams.eyePosition = viewUpdateEyePosition(viewParams.radius, viewParams.azimuth, viewParams.elevation, viewParams.focusPosition);
}



function viewDolly(event, lastMousePosition, viewParams) {
    // this one adjusts radius
    viewParams.radius = getRadius(viewParams);

    // with middle click, zoom in and out
    let dx = event.clientX - lastMousePosition[0];
    let dy = event.clientY - lastMousePosition[1];
    viewParams.radius += 2 * dy / viewParams.lookSensitivity; // 2 is a magic number that feels good

    // clamp the radius 
    viewParams.radius = Math.max(0.1, Math.min(30, viewParams.radius));

    viewParams.eyePosition = viewUpdateEyePosition(viewParams.radius, viewParams.azimuth, viewParams.elevation, viewParams.focusPosition);
}

function viewDollyTranslateRotate(event, lastMousePosition, viewParams) {
    // this one translates focus and eye together with vertical and rotates view with horizontal
    // find the vector from the eye to the focus
    let eyeToFocus = [viewParams.focusPosition[0] - viewParams.eyePosition[0], viewParams.focusPosition[1] - viewParams.eyePosition[1], viewParams.focusPosition[2] - viewParams.eyePosition[2]];


    // normalize the vector from the eye to the focus
    let eyeToFocusNorm = Math.sqrt(eyeToFocus[0] ** 2 + eyeToFocus[1] ** 2 + eyeToFocus[2] ** 2);
    eyeToFocus = [eyeToFocus[0] / eyeToFocusNorm, eyeToFocus[1] / eyeToFocusNorm, eyeToFocus[2] / eyeToFocusNorm];

    // with middle click, strafe up and down
    let dx = 1 * (event.clientX - lastMousePosition[0]) / viewParams.lookSensitivity;
    let dy = -2 * (event.clientY - lastMousePosition[1]) / viewParams.lookSensitivity;

    // translate the focus position by dx * right + dy * eyeToFocus
    viewParams.focusPosition = [viewParams.focusPosition[0] + dy * eyeToFocus[0], viewParams.focusPosition[1] + dy * eyeToFocus[1], viewParams.focusPosition[2] + dy * eyeToFocus[2]];
    // translate the eye position by dx * right + dy * eyeToFocus
    viewParams.eyePosition = [viewParams.eyePosition[0] + dy * eyeToFocus[0], viewParams.eyePosition[1] + dy * eyeToFocus[1], viewParams.eyePosition[2] + dy * eyeToFocus[2]];

    // rotate up vector around eyeToFocus vector
    let up = viewParams.up;
    let upNorm = Math.sqrt(up[0] ** 2 + up[1] ** 2 + up[2] ** 2);
    up = [up[0] / upNorm, up[1] / upNorm, up[2] / upNorm];
    let right = [eyeToFocus[1] * up[2] - eyeToFocus[2] * up[1], eyeToFocus[2] * up[0] - eyeToFocus[0] * up[2], eyeToFocus[0] * up[1] - eyeToFocus[1] * up[0]];
    let rightNorm = Math.sqrt(right[0] ** 2 + right[1] ** 2 + right[2] ** 2);
    right = [right[0] / rightNorm, right[1] / rightNorm, right[2] / rightNorm];
    let upNew = [up[0] * Math.cos(dx) + right[0] * Math.sin(dx), up[1] * Math.cos(dx) + right[1] * Math.sin(dx), up[2] * Math.cos(dx) + right[2] * Math.sin(dx)];
    let upNewNorm = Math.sqrt(upNew[0] ** 2 + upNew[1] ** 2 + upNew[2] ** 2);
    upNew = [upNew[0] / upNewNorm, upNew[1] / upNewNorm, upNew[2] / upNewNorm];
    viewParams.up = upNew;
}



function viewStrafe(event, lastMousePosition, viewParams) {
    // with right click, translate the focus and eye positions in a plane defined by the eye, focus, and up vector
    // this one goes in and out with vertical motion
    // console.log("strafe");
    // console.log(viewParams.focusPosition);
    let dx = 3 * (event.clientX - lastMousePosition[0]) / viewParams.lookSensitivity;
    let dy = -3 * (event.clientY - lastMousePosition[1]) / viewParams.lookSensitivity;
    // console.log(dx);
    // console.log(dy);
    // find the vector from the eye to the focus
    let eyeToFocus = [viewParams.focusPosition[0] - viewParams.eyePosition[0], viewParams.focusPosition[1] - viewParams.eyePosition[1], viewParams.focusPosition[2] - viewParams.eyePosition[2]];
    // find the vector perpendicular to the eyeToFocus vector and the up vector
    let right = [eyeToFocus[1] * viewParams.up[2] - eyeToFocus[2] * viewParams.up[1], eyeToFocus[2] * viewParams.up[0] - eyeToFocus[0] * viewParams.up[2], eyeToFocus[0] * viewParams.up[1] - eyeToFocus[1] * viewParams.up[0]];
    // normalize the right vector
    let rightNorm = Math.sqrt(right[0] ** 2 + right[1] ** 2 + right[2] ** 2);
    right = [right[0] / rightNorm, right[1] / rightNorm, right[2] / rightNorm];
    // console.log(right);

    // normalize the vector from the eye to the focus
    let eyeToFocusNorm = Math.sqrt(eyeToFocus[0] ** 2 + eyeToFocus[1] ** 2 + eyeToFocus[2] ** 2);
    eyeToFocus = [eyeToFocus[0] / eyeToFocusNorm, eyeToFocus[1] / eyeToFocusNorm, eyeToFocus[2] / eyeToFocusNorm];
    // console.log(eyeToFocus);
    // translate the focus position by dx * right + dy * eyeToFocus
    viewParams.focusPosition = [viewParams.focusPosition[0] + dx * right[0] + dy * eyeToFocus[0], viewParams.focusPosition[1] + dx * right[1] + dy * eyeToFocus[1], viewParams.focusPosition[2] + dx * right[2] + dy * eyeToFocus[2]];
    // translate the eye position by dx * right + dy * eyeToFocus
    viewParams.eyePosition = [viewParams.eyePosition[0] + dx * right[0] + dy * eyeToFocus[0], viewParams.eyePosition[1] + dx * right[1] + dy * eyeToFocus[1], viewParams.eyePosition[2] + dx * right[2] + dy * eyeToFocus[2]];
}


function viewStrafeVert(event, lastMousePosition, viewParams) {
    // with right click, translate the focus and eye positions in a plane defined by the eye, focus, and up vector
    // this one goes left and right with vertical motion
    // console.log("strafe");
    // console.log(viewParams.focusPosition);
    let dx = 3 * (event.clientX - lastMousePosition[0]) / viewParams.lookSensitivity;
    let dy = 3 * (event.clientY - lastMousePosition[1]) / viewParams.lookSensitivity;
    // console.log(dx);
    // console.log(dy);
    var translation_matrix = buildTranslationMatrix(0, dy, dx);
    // translation_matrix = buildTranslationMatrix(dx, dy, 0);
    var placeholder_matrix = new Float32Array(16);
    mat4multiply(placeholder_matrix, viewParams.viewMatrix, translation_matrix);
    viewParams.viewMatrix = placeholder_matrix;

}



function viewStrafeVertVectorVersion(event, lastMousePosition, viewParams) {
    // with right click, translate the focus and eye positions in a plane defined by the eye, focus, and up vector
    // this one goes left and right with vertical motion
    // console.log("strafe");
    // console.log(viewParams.focusPosition);
    let dx = -3 * (event.clientX - lastMousePosition[0]) / viewParams.lookSensitivity;
    let dy = 3 * (event.clientY - lastMousePosition[1]) / viewParams.lookSensitivity;
    // console.log(dx);
    // console.log(dy);
    // find the vector from the eye to the focus
    let eyeToFocus = [viewParams.focusPosition[0] - viewParams.eyePosition[0], viewParams.focusPosition[1] - viewParams.eyePosition[1], viewParams.focusPosition[2] - viewParams.eyePosition[2]];
    // find the vector perpendicular to the eyeToFocus vector and the up vector
    let right = [eyeToFocus[1] * viewParams.up[2] - eyeToFocus[2] * viewParams.up[1], eyeToFocus[2] * viewParams.up[0] - eyeToFocus[0] * viewParams.up[2], eyeToFocus[0] * viewParams.up[1] - eyeToFocus[1] * viewParams.up[0]];
    // normalize the right vector
    let rightNorm = Math.sqrt(right[0] ** 2 + right[1] ** 2 + right[2] ** 2);
    right = [right[0] / rightNorm, right[1] / rightNorm, right[2] / rightNorm];
    // console.log(right);

    // normalize the vector from the eye to the focus
    let eyeToFocusNorm = Math.sqrt(eyeToFocus[0] ** 2 + eyeToFocus[1] ** 2 + eyeToFocus[2] ** 2);
    eyeToFocus = [eyeToFocus[0] / eyeToFocusNorm, eyeToFocus[1] / eyeToFocusNorm, eyeToFocus[2] / eyeToFocusNorm];
    // console.log(eyeToFocus);
    // translate the focus position by dx * right + dy * up
    viewParams.focusPosition = [viewParams.focusPosition[0] + dx * right[0] + dy * viewParams.up[0], viewParams.focusPosition[1] + dx * right[1] + dy * viewParams.up[1], viewParams.focusPosition[2] + dx * right[2] + dy * viewParams.up[2]];
    // translate the eye position by dx * right + dy * up
    viewParams.eyePosition = [viewParams.eyePosition[0] + dx * right[0] + dy * viewParams.up[0], viewParams.eyePosition[1] + dx * right[1] + dy * viewParams.up[1], viewParams.eyePosition[2] + dx * right[2] + dy * viewParams.up[2]];
}


function viewPan(event, lastMousePosition, viewParams) {
    // with right click, move the focus position around on the surface of a sphere
    let dx = event.clientX - lastMousePosition[0];
    let dy = event.clientY - lastMousePosition[1];
    // move the focus position around on the surface of a sphere
    // internal elevation is just negative elevation
    viewParams.elevation -= dy / viewParams.lookSensitivity;

    // Clamp the elevation to [-pi/2, pi/2]
    viewParams.elevation = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, viewParams.elevation));
    viewParams.azimuth -= dx / viewParams.lookSensitivity;

    viewParams.focusPosition = viewUpdateEyePosition(viewParams.radius, (viewParams.azimuth + Math.PI) % (2 * Math.PI), -viewParams.elevation, viewParams.eyePosition);
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




function viewDollyWheel(event, viewParams) {
    viewParams.radius += event.deltaY / viewParams.lookSensitivity;

    // clamp the radius to [0, 10]
    viewParams.radius = Math.max(0.1, Math.min(30, viewParams.radius));

    // update eye positions with new radius
    viewParams.eyePosition = viewUpdateEyePosition(viewParams.radius, viewParams.azimuth, viewParams.elevation, viewParams.focusPosition);
}

function viewDollyWheelTranslate(event, viewParams) {
    // find the vector from the eye to the focus
    let eyeToFocus = [viewParams.focusPosition[0] - viewParams.eyePosition[0], viewParams.focusPosition[1] - viewParams.eyePosition[1], viewParams.focusPosition[2] - viewParams.eyePosition[2]];

    // normalize the vector from the eye to the focus
    let eyeToFocusNorm = Math.sqrt(eyeToFocus[0] ** 2 + eyeToFocus[1] ** 2 + eyeToFocus[2] ** 2);
    eyeToFocus = [eyeToFocus[0] / eyeToFocusNorm, eyeToFocus[1] / eyeToFocusNorm, eyeToFocus[2] / eyeToFocusNorm];

    // with middle click, strafe up and down
    let dy = -event.deltaY / viewParams.lookSensitivity;

    // translate the focus position by dy * eyeToFocus
    viewParams.focusPosition = [viewParams.focusPosition[0] + dy * eyeToFocus[0], viewParams.focusPosition[1] + dy * eyeToFocus[1], viewParams.focusPosition[2] + dy * eyeToFocus[2]];
    // translate the eye position by dy * eyeToFocus
    viewParams.eyePosition = [viewParams.eyePosition[0] + dy * eyeToFocus[0], viewParams.eyePosition[1] + dy * eyeToFocus[1], viewParams.eyePosition[2] + dy * eyeToFocus[2]];
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
        // formerly viewDolly
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
