function loadSplatData(fileBuffer) {
    // 6*4 + 4 + 4 = 8*4
    // XYZ - Position (Float32)
    // XYZ - Scale (Float32)
    // RGBA - colors (uint8)
    // IJKL - quaternion/rot (uint8)

    const rowLength = 3 * 4 + 3 * 4 + 4 + 4;

    console.log("c01");
    let splatData = new Uint8Array(fileBuffer);
    console.log("c02");
    let buffer = splatData.buffer;
    let vertexCount = Math.floor(splatData.length / rowLength);
    console.log("c03");
    console.log("vertexCount:", vertexCount);

    const fb = new Float32Array(buffer);
    console.log("c04");
    const ub = new Uint8Array(buffer);

    console.log("c1");
    let positions = new Float32Array(3 * vertexCount);
    console.log("c2");
    let scales = new Float32Array(3 * vertexCount);
    console.log("c3");
    let colors = new Float32Array(4 * vertexCount);
    console.log("c4");
    let rotors = new Float32Array(4 * vertexCount);
    console.log("c5");

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
    console.log("c6");

    return {
        positions: positions,
        scales: scales,
        colors: colors,
        rotors: rotors
    };
}

function loadSplatFile(url, callback) {
    const reader = new FileReader();

    reader.onload = function () {
        let data = loadSplatData(reader.result);

        callback(data);
    };

    fetch(url)
        .then(resp => resp.blob())
        .then(blob => reader.readAsArrayBuffer(blob));
}

export default loadSplatFile;
export { loadSplatData };