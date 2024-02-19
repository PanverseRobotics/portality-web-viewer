import {
    mat3multiply,
    mat3transpose,
    mat3vecmultiply,
    mat4lookAt,
    mat4multiply,
    mat4rotateX,
    mat4rotateY,
    mat4rotateZ,
    submat3
} from './linalg.js';
import { rotorToRotationMatrix } from './rotors.js';

function mat4multiplyNew(a, b){
    var out = new Float32Array(16);
    mat4multiply(out, a, b);
    return out;
}

function viewMatGetLookAt(viewMatrix, radius) {
    // First get coordinates of the focus point in the world frame.
    // We know that view_matrix = [R, t]
    // and that R*focus_pos + t = [0, 0, -viewParams.radius]
    // So we can solve for focus_pos 
    let r = new Float32Array(9);
    let t = [viewMatrix[12], viewMatrix[13], viewMatrix[14]];
    submat3(r, viewMatrix);
    let rinv = new Float32Array(9);
    mat3transpose(rinv, r); // Invert rotation
    let p = [-t[0],-t[1],-t[2]-radius]; // Difference.
    mat3vecmultiply(t, rinv, p); // focus point coords in world frame.

    return t;
}

function viewMatGetPoseParams(viewMatrix, radius) {
    let lookAtPos = viewMatGetLookAt(viewMatrix, radius);
    let cameraPos = viewMatGetLookAt(viewMatrix,    0.0);
    let upVec = [ viewMatrix[1],  viewMatrix[5],  viewMatrix[9]];

    return {
        camera: cameraPos,
        lookAt: lookAtPos,
        up: upVec
    }
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


function eulerRotation(angles) {
    let rotation = identity(4);
    mat4rotateX(rotation, rotation, angles[0]);
    mat4rotateY(rotation, rotation, angles[1]);
    mat4rotateZ(rotation, rotation, angles[2]);
    return rotation;
}

function updateViewMatrix(angles, p, viewMatrix) {
    let rotation = eulerRotation(angles);
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
    // First get coordinates of the focus point in the world frame.
    // We know that view_matrix = [R, t]
    // and that R*focus_pos + t = [0, 0, -viewParams.radius]
    // So we can solve for focus_pos 
    let r = new Float32Array(9);
    //let t = [viewParams.matrix[12], viewParams.matrix[13], viewParams.matrix[14]];
    let t = viewParams.matrix.slice(12, 15);
    submat3(r, viewParams.matrix);
    let rinv = new Float32Array(9);
    mat3transpose(rinv, r); // Invert rotation
    let p = [-t[0],-t[1],-t[2]-viewParams.radius]; // Difference.
    mat3vecmultiply(t, rinv, p); // focus point coords in world frame.

    // Now we can rotate the camera 
    let s = eulerRotation([delta[1], delta[0], 0.0]);
    let transformMatrix = buildTransformMatrix(s, [0, 0, 0]);
    let newViewMatrix = mat4multiplyNew(transformMatrix, viewParams.matrix);

    // And then move the camera back to the original focus point,
    // Via t2 = -R*t + [0, 0, -viewParams.radius]
    submat3(r, newViewMatrix);
    mat3vecmultiply(p, r, t);
    let t2 = [-p[0],-p[1],-p[2]-viewParams.radius];
    newViewMatrix[12] = t2[0];
    newViewMatrix[13] = t2[1];
    newViewMatrix[14] = t2[2];

    return newViewMatrix;
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

function viewChangeRadius(radiusDelta, viewParams) {
    return viewParams.radius + radiusDelta[1];
}

const actionMap = {
    "pan": viewPan,
    "orbit": viewOrbit,
    "dolly": viewDolly,
    "roll": viewRoll,
    "dollyRoll": viewDollyTranslateRotate,
    "strafe": viewStrafeVert,
    "changeRadius": viewChangeRadius
};


function viewUpdate(action, delta, viewParams) {
    let newViewParams = Object.assign({}, viewParams);

    let f = actionMap[action];

    if (action == "changeRadius"){
        newViewParams.radius = viewChangeRadius(delta, viewParams);
    } else {
        newViewParams.matrix = f(delta, viewParams);
    }
    
    return newViewParams;
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


export { viewUpdate, viewAutoSpin, stopAutoSpin, initializeViewMatrix, viewMatGetPoseParams };

