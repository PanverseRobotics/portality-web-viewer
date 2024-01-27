import { mat3multiply, mat3transpose } from "./linalg.js";

function rotorToRotationMatrix(out, rotor) {
    // Extract the quaternion components.
    const w = rotor[0];
    const x = rotor[1];
    const y = rotor[2];
    const z = rotor[3];

    // Calculate the rotation matrix.
    out[0] = 1 - 2 * (y * y + z * z);
    out[1] = 2 * (x * y - w * z);
    out[2] = 2 * (x * z + w * y);

    out[3] = 2 * (x * y + w * z);
    out[4] = 1 - 2 * (x * x + z * z);
    out[5] = 2 * (y * z - w * x);

    out[6] = 2 * (x * z - w * y);
    out[7] = 2 * (y * z + w * x);
    out[8] = 1 - 2 * (x * x + y * y);
};

function rotorsToCov3D(scales, rotors) {
    let vertexCount = Math.floor(scales.length/3);

    let rotMat = new Float32Array(9);
    let scaleMat = new Float32Array(9);
    let mMat = new Float32Array(9);
    let mMatTr = new Float32Array(9);

    let covMat = new Float32Array(9);

    let rotor = new Float32Array(4);

    let covP1 = new Float32Array(4 * vertexCount);
    let covP2 = new Float32Array(2 * vertexCount);

    for (var i=0; i < vertexCount; i++) {
        rotor[0] = rotors[4*i+0];
        rotor[1] = rotors[4*i+1];
        rotor[2] = rotors[4*i+2];
        rotor[3] = rotors[4*i+3];

        scaleMat[0] = scales[3*i+0];
        scaleMat[4] = scales[3*i+1];
        scaleMat[8] = scales[3*i+2];

        rotorToRotationMatrix(rotMat, rotor);
        mat3multiply(mMat, scaleMat, rotMat);
        mat3transpose(mMatTr, mMat);
        mat3multiply(covMat, mMatTr, mMat);

        covP1[4*i+0] = covMat[0];
        covP1[4*i+1] = covMat[4];
        covP1[4*i+2] = covMat[8];

        covP1[4*i+3] = covMat[1];
        covP2[2*i+0] = covMat[2];
        covP2[2*i+1] = covMat[5];
    }

    return {
        p1: covP1,
        p2: covP2
    }
}


function propsToCov3D(props) {
    let vertexCount = Math.floor(props.scale_0.length);

    let rotMat = new Float32Array(9);
    let scaleMat = new Float32Array(9);
    let mMat = new Float32Array(9);
    let mMatTr = new Float32Array(9);

    let covMat = new Float32Array(9);

    let rotor = new Float32Array(4);

    let covP1 = new Float32Array(3 * vertexCount);
    let covP2 = new Float32Array(3 * vertexCount);

    for (var i=0; i < vertexCount; i++) {
        rotor[0] = props.rot_0[i];
        rotor[1] = props.rot_1[i];
        rotor[2] = props.rot_2[i];
        rotor[3] = props.rot_3[i];

        scaleMat[0] = props.scale_0[i];
        scaleMat[4] = props.scale_1[i];
        scaleMat[8] = props.scale_2[i];

        rotorToRotationMatrix(rotMat, rotor);
        mat3multiply(mMat, scaleMat, rotMat);
        mat3transpose(mMatTr, mMat);
        mat3multiply(covMat, mMatTr, mMat);

        covP1[3*i+0] = covMat[0];
        covP1[3*i+1] = covMat[4];
        covP1[3*i+2] = covMat[8];

        covP2[3*i+0] = covMat[1];
        covP2[3*i+1] = covMat[2];
        covP2[3*i+2] = covMat[5];
    }

    return {
        diag: covP1,
        upper: covP2
    }
}

export { rotorsToCov3D, propsToCov3D, rotorToRotationMatrix };