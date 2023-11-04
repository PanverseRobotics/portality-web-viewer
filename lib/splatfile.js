import { rotorToRotationMatrix, mat3transpose, mat3multiply } from './utils/linalg.js';

function loadSplatData(fileBuffer) {
    // 6*4 + 4 + 4 = 8*4
    // XYZ - Position (Float32)
    // XYZ - Scale (Float32)
    // RGBA - colors (uint8)
    // IJKL - quaternion/rot (uint8)

    const rowLength = 3 * 4 + 3 * 4 + 4 + 4;

    let splatData = new Uint8Array(fileBuffer);
    let buffer = splatData.buffer;
    let vertexCount = Math.floor(splatData.length / rowLength);

    const fb = new Float32Array(buffer);
    const ub = new Uint8Array(buffer);

    let positions = new Float32Array(3 * vertexCount);
    let scales = new Float32Array(3 * vertexCount);
    let colors = new Float32Array(4 * vertexCount);
    let rotors = new Float32Array(4 * vertexCount);

    for (var i = 0; i < vertexCount; i++) {
        positions[3 * i + 0] = fb[8 * i + 0];
        positions[3 * i + 1] = fb[8 * i + 1];
        positions[3 * i + 2] = fb[8 * i + 2];

        scales[3 * i + 0] = fb[8 * i + 3];
        scales[3 * i + 1] = fb[8 * i + 4];
        scales[3 * i + 2] = fb[8 * i + 5];

        colors[4 * i + 0] = 0.003921568 * ub[32 * i + 24];
        colors[4 * i + 1] = 0.003921568 * ub[32 * i + 25];
        colors[4 * i + 2] = 0.003921568 * ub[32 * i + 26];
        colors[4 * i + 3] = 0.003921568 * ub[32 * i + 27];

        rotors[4 * i + 0] = 0.0078125 * (ub[32 * i + 28] - 128);
        rotors[4 * i + 1] = 0.0078125 * (ub[32 * i + 29] - 128);
        rotors[4 * i + 2] = 0.0078125 * (ub[32 * i + 30] - 128);
        rotors[4 * i + 3] = 0.0078125 * (ub[32 * i + 31] - 128);
    }

    return {
        positions: positions,
        scales: scales,
        colors: colors,
        rotors: rotors
    };
}


function rotorsToCov3D(scales, rotors) {
    let vertexCount = Math.floor(scales.length/3);
    
    let rotMat = new Float32Array(9);
    let scaleMat = new Float32Array(9);
    let mMat = new Float32Array(9);
    let mMatTr = new Float32Array(9);

    let covMat = new Float32Array(9);

    let rotor = new Float32Array(4);

    let covDiag = new Float32Array(3 * vertexCount);
    let covUpper = new Float32Array(3 * vertexCount);

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

        covDiag[3*i+0] = covMat[0];
        covDiag[3*i+1] = covMat[4];
        covDiag[3*i+2] = covMat[8];

        covUpper[3*i+0] = covMat[1];
        covUpper[3*i+1] = covMat[2];
        covUpper[3*i+2] = covMat[5];
    }

    return {
        diag: covDiag,
        upper: covUpper
    }
}

function loadSplatFile(url) {
    const reader = new FileReader();

    reader.onload = function () {
        loadSplatData(reader.result);
    };

    reader.readAsDataURL(new URL(url));
}

export default loadSplatFile;
export { loadSplatData, rotorsToCov3D };
