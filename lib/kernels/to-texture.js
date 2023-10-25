function toTextureKernel(gl, n, m) {
    const inTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, inTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    const fragSrc =
    `#version 300 es
    precision lowp float;
    precision lowp int;
    precision lowp sampler2D;
    precision lowp sampler2DArray;

    uniform lowp sampler2D user_x;

    float kernelResult;
    out vec4 data0;

    void main(void) {
        ivec2 fragCoord = ivec2(gl_FragCoord.xy);
        int channel = fragCoord.x % 4;
        float val = texelFetch(user_x, ivec2(fragCoord.x/4, fragCoord.y), 0)[channel];
        data0[0] =val;

    }`;

    let shdr = fullTexShader(gl, fragSrc, n, m);

    const innerKernel = function (x) {
        /** start setup uploads for kernel values **/
        const uploadValue_x = new Float32Array(n * m);
        uploadValue_x.set(x);

        /** end setup uploads for kernel values **/
        gl.useProgram(shdr.program);
        gl.scissor(0, 0, n, m);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, inTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, Math.floor(n / 4), m, 0, gl.RGBA, gl.FLOAT, uploadValue_x);
        const glVariable16 = gl.getUniformLocation(shdr.program, 'user_x');
        gl.uniform1i(glVariable16, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, shdr.frameBuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        return {
            texture: shdr.outTexture,
            type: 'ArrayTexture(1)',
            toArray: () => toArrayFunc(shdr.frameBuffer, shdr.outTexture, n, m)
        };
    };

    return innerKernel;
}