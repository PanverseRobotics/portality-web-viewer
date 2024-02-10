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

export { viewUpdate, viewAutoSpin, stopAutoSpin, initializeViewMatrix };
