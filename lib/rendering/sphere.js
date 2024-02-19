function createSphereRenderProgram(gl) {
    // Vertex shader source code
    const vertexShaderSource = `#version 300 es
    in vec3 aPosition;
    in vec4 aColor;

    out vec4 vColor;

    void main() {
        gl_Position = vec4(aPosition, 1.0);
        vColor = aColor;
    }
    `;

    // Fragment shader source code
    const fragmentShaderSource = `#version 300 es
    precision mediump float;

    in vec4 vColor;
    layout(location=3) out vec4 fragColor;

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
    gl.linkProgram(program);

    return program;
}

// Function to create a circle's vertices in a specified plane
function createCircleVertices(radius, segments, plane) {
    const vertices = [];
    const angleStep = 2 * Math.PI / segments;
  
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
    const nCircleSegs = 1; //verts[0].length / 3 - 1;

    gl.useProgram(program);

    // Create vertex buffers
    const xBuffer = gl.createBuffer();
    const yBuffer = gl.createBuffer();
    const zBuffer = gl.createBuffer();

    // Get attribute locations
    const positionAttribLocation = gl.getUniformLocation(program, 'aPosition');
    const colorAttribLocation = gl.getUniformLocation(program, 'aColor');
    
    // // X-axis circle (Red)
    gl.bindBuffer(gl.ARRAY_BUFFER, xBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts[0]), gl.STATIC_DRAW);
    //gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
    //gl.enableVertexAttribArray(positionAttribLocation);
    // gl.vertexAttrib4f(colorAttribLocation, 1.0, 0.0, 0.0, 0.1); // Red with transparency
    // gl.drawArrays(gl.LINE_STRIP, 0, nCircleSegs); 
  
    // // Y-axis circle (Green)
    // gl.bindBuffer(gl.ARRAY_BUFFER, yBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts[1]), gl.STATIC_DRAW);
    // gl.bindBuffer(gl.ARRAY_BUFFER, yBuffer);
    // gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0); 
    // gl.vertexAttrib4f(colorAttribLocation, 0.0, 1.0, 0.0, 0.1); // Green with transparency
    // gl.drawArrays(gl.LINE_STRIP, 0, nCircleSegs);
  
    //  // Z-axis circle (Blue)
    /// gl.bindBuffer(gl.ARRAY_BUFFER, zBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts[2]), gl.STATIC_DRAW);
    // gl.bindBuffer(gl.ARRAY_BUFFER, zBuffer);
    // gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
    // gl.vertexAttrib4f(colorAttribLocation, 0.0, 0.0, 1.0, 0.1); // Blue with transparency
    // gl.drawArrays(gl.LINE_STRIP, 0, nCircleSegs); 
}


export {createSphereRenderProgram, createSphereCircles, renderSphereCircles};
