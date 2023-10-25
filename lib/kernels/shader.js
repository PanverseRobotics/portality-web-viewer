function fullTexShader(gl, fragSrc, n, m){

    gl.enable(gl.SCISSOR_TEST);
    gl.viewport(0, 0, n, m);
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `#version 300 es
        precision lowp float;
        precision lowp int;
        precision lowp sampler2D;

        in vec2 aPos;

        void main(void) {
            gl_Position = vec4((aPos + vec2(1)) + vec2(-1), 0, 1);
        }`
    );
    gl.compileShader(vertexShader);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragSrc);

    gl.compileShader(fragmentShader);
    // TODO: do something with these
    const glVariable5 = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    const glVariable6 = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    const framebuf = gl.createFramebuffer();
    const glVariable9 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, glVariable9);
    gl.bufferData(gl.ARRAY_BUFFER, 64, gl.STATIC_DRAW);
    const glVariable10 = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, glVariable10);
    const glVariable11 = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
    gl.bufferSubData(gl.ARRAY_BUFFER, 32, glVariable11);
    const glVariable12 = gl.getAttribLocation(shaderProgram, 'aPos');
    gl.enableVertexAttribArray(glVariable12);
    gl.vertexAttribPointer(glVariable12, 2, gl.FLOAT, false, 0, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuf);
    gl.useProgram(shaderProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuf);
    const outTexture = gl.createTexture();
    gl.activeTexture(33985);
    gl.bindTexture(gl.TEXTURE_2D, outTexture);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.R32F, n, m);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outTexture, 0);

    return {
        program: shaderProgram,
        frameBuffer: framebuf,
        outTexture: outTexture
    };
}