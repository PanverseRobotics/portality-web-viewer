const APOS_ATTRIB_LOC = 1;

function createSphereRenderProgram(gl) {
    // Vertex shader source code
    const vertexShaderSource = `#version 300 es

    in vec3 aPosition;
    uniform vec4 aColor;

    uniform mat4 uViewProj;
    uniform float uRadius;
    uniform vec3 uLookAtPoint;

    out vec4 vColor;

    void main() {
        gl_Position = uViewProj * vec4((uRadius*aPosition) + uLookAtPoint, 1.0);
        gl_PointSize = 4.0;

        vColor = aColor;
    }
    `;

    // Fragment shader source code
    const fragmentShaderSource = `#version 300 es
    precision mediump float;

    in vec4 vColor;
    layout(location=0) out vec4 fragColor;

    void main() {
        fragColor = vColor;
    }
    `;

    // Initialize shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.bindAttribLocation(program, APOS_ATTRIB_LOC, 'aPosition');
    gl.linkProgram(program);

    return program;
}

// Function to create a circle's vertices in a specified plane
function createCircleVertices(radius, segments, plane) {
    const vertices = [];
    const angleStep = 2 * Math.PI / segments;
  
    for (let i = 0; i <= segments; i++) {
        let angle = i * angleStep;
        let x = radius * Math.cos(angle);
        let y = radius * Math.sin(angle);

        switch (plane) {
            case 'xy':
                vertices.push(x, y, 0.0);
                break;
            case 'xz':
                vertices.push(x, 0.0, y);
                break;
            case 'yz':
                vertices.push(0.0, x, y);
                break;
        }
    }
  
    return vertices;
}

function createDot(){
    return [0, 0, 0];
}

function createCrosshairVertices(length, axis) {
    let vertices = [];
    switch (axis) {
        case 'x':
            vertices = [-length, 0, 0, length, 0, 0];
            break;
        case 'y':
            vertices = [0, -length, 0, 0, length, 0];
            break;
        case 'z':
            vertices = [0, 0, -length, 0, 0, length];
            break;
    }
    return vertices;

}

function createSphereCircles(circleRadius, circleSegments) {
    const xCircleVertices = createCircleVertices(circleRadius, circleSegments, 'yz');
    const yCircleVertices = createCircleVertices(circleRadius, circleSegments, 'xz');
    const zCircleVertices = createCircleVertices(circleRadius, circleSegments, 'xy');

    const xCrosshairVertices = createCrosshairVertices(0.1*circleRadius, 'x');
    const yCrosshairVertices = createCrosshairVertices(0.1*circleRadius, 'y');
    const zCrosshairVertices = createCrosshairVertices(0.1*circleRadius, 'z');

    const dot = createDot();

    return [
        xCircleVertices,
        yCircleVertices,
        zCircleVertices,
        xCrosshairVertices,
        yCrosshairVertices,
        zCrosshairVertices,
        dot];
}

// Render function (continued)
function renderSphereCircles(gl, program, verts) {

    // Create vertex buffers
    const vertexBuffers = [];
    for (let i = 0; i < 7; i++) {
        vertexBuffers.push(gl.createBuffer());
    }

    // Colors 
    const colors = [
        [1.0, 0.0, 0.0, 0.75], // Red with transparency
        [0.0, 1.0, 0.0, 0.75], // Green with transparency
        [0.0, 0.0, 1.0, 0.75], // Blue with transparency
        [1.0, 0.0, 0.0, 1.0],  // Red
        [0.0, 1.0, 0.0, 1.0],  // Green
        [0.0, 0.0, 1.0, 1.0],  // Blue
        [1.0, 1.0, 1.0, 1.0]   // White
    ];

    // Get attribute locations
    const colorAttribLocation = gl.getUniformLocation(program, 'aColor');
    
    // // X-axis circle (Red)
    gl.enableVertexAttribArray(APOS_ATTRIB_LOC);

    for (let i = 0; i < 7; i++) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[i]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts[i]), gl.STATIC_DRAW);
        gl.vertexAttribPointer(APOS_ATTRIB_LOC, 3, gl.FLOAT, false, 0, 0);
        gl.uniform4fv(colorAttribLocation, colors[i]);
        if (i == 6){
            gl.drawArrays(gl.POINTS, 0, 1);
        } else {
            gl.drawArrays(gl.LINE_STRIP, 0, verts[i].length / 3);
        }
    }

    gl.disableVertexAttribArray(APOS_ATTRIB_LOC);
}

export {createSphereRenderProgram, createSphereCircles, renderSphereCircles};




