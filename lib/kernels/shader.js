function fullTexShader(gl, fragSrc, n, m, internalFormat=gl.R32F){
    const glExtColBuf = gl.getExtension('EXT_color_buffer_float');
    const glOESTexFlLin = gl.getExtension('OES_texture_float_linear');
    const glWebglDepthTex = gl.getExtension('WEBGL_depth_texture');
    const glWebColBufFloat = gl.getExtension('WEBGL_color_buffer_float');

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
    const vertCompileStat = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    const fragCompileStat = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
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
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, outTexture);
    gl.texStorage2D(gl.TEXTURE_2D, 1, internalFormat, n, m);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outTexture, 0);

    return {
        program: shaderProgram,
        compile_status: {
            vertex: vertCompileStat,
            fragment: fragCompileStat
        },
        frameBuffer: framebuf,
        outTexture: outTexture
    };
}