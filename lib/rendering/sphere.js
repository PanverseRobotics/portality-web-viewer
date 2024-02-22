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
    const angleStep = 2 * Math.PI / (segments-1);
  
    for (let i = 0; i <= segments; i++) {
      let angle = i * angleStep;
      switch (plane) {
        case 'xy':
          vertices.push(radius * Math.cos(angle), radius * Math.sin(angle), 0.0);
          break;
        case 'xz':
          vertices.push(radius * Math.cos(angle), 0.0, radius * Math.sin(angle));
          break;
        case 'yz':
          vertices.push(0.0, radius * Math.cos(angle), radius * Math.sin(angle));
          break;
      }
    }
  
    return vertices;
}

function createSphereCircles(circleRadius, circleSegments) {

    const xCircleVertices = createCircleVertices(circleRadius, circleSegments, 'yz');
    const yCircleVertices = createCircleVertices(circleRadius, circleSegments, 'xz');
    const zCircleVertices = createCircleVertices(circleRadius, circleSegments, 'xy');

    return [xCircleVertices, yCircleVertices, zCircleVertices];
}

// Render function (continued)
function renderSphereCircles(gl, program, verts) {
    const nCircleSegs = verts[0].length / 3 - 1;

    // Create vertex buffers
    const xBuffer = gl.createBuffer();
    const yBuffer = gl.createBuffer();
    const zBuffer = gl.createBuffer();

    // Get attribute locations
    const colorAttribLocation = gl.getUniformLocation(program, 'aColor');
    
    // // X-axis circle (Red)
    gl.enableVertexAttribArray(APOS_ATTRIB_LOC);

    gl.bindBuffer(gl.ARRAY_BUFFER, xBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts[0]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(APOS_ATTRIB_LOC, 3, gl.FLOAT, false, 0, 0);
    gl.uniform4f(colorAttribLocation, 1.0, 0.0, 0.0, 0.75); // Red with transparency
    gl.drawArrays(gl.LINE_STRIP, 0, nCircleSegs); 
  
    // Y-axis circle (Green)
    gl.bindBuffer(gl.ARRAY_BUFFER, yBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts[1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, yBuffer);
    gl.vertexAttribPointer(APOS_ATTRIB_LOC, 3, gl.FLOAT, false, 0, 0); 
    gl.uniform4f(colorAttribLocation, 0.0, 0.7, 0.0, 0.75); // Green with transparency
    gl.drawArrays(gl.LINE_STRIP, 0, nCircleSegs);
  
     // Z-axis circle (Blue)
    gl.bindBuffer(gl.ARRAY_BUFFER, zBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts[2]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, zBuffer);
    gl.vertexAttribPointer(APOS_ATTRIB_LOC, 3, gl.FLOAT, false, 0, 0);
    gl.uniform4f(colorAttribLocation, 0.0, 0.0, 1.0, 0.75); // Blue with transparency
    gl.drawArrays(gl.LINE_STRIP, 0, nCircleSegs); 

    gl.disableVertexAttribArray(APOS_ATTRIB_LOC);
}


export {createSphereRenderProgram, createSphereCircles, renderSphereCircles};
