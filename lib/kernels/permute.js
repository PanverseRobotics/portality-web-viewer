function createPermuteKernel(gl, n, m) {
    const fragSrc =
    `#version 300 es
    precision lowp float;
    precision lowp int;
    precision lowp sampler2D;
    precision lowp sampler2DArray;

    uniform lowp sampler2D perm_user_x;
    uniform lowp sampler2D perm_user_idx;

    out vec4 data0;

    void main(void) {
        ivec2 idxFragCoord = ivec2(0, gl_FragCoord.y);

        int idx = int(texelFetch(perm_user_idx, idxFragCoord, 0)[0]);
        ivec2 fragCoord = ivec2(gl_FragCoord.x, idx);

        float val = texelFetch(perm_user_x, fragCoord, 0)[0];

        data0[0] = val;
    }`

    let shdr = fullTexShader(gl, fragSrc, n, m);

    const innerKernel = function (x, idx) {
        /** end setup uploads for kernel values **/
        gl.useProgram(shdr.program);
        gl.scissor(0, 0, n, m);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, idx.texture);
        const idxTexLocation = gl.getUniformLocation(shdr.program, 'perm_user_idx');
        gl.uniform1i(idxTexLocation, 2);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, x.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const inpTexLocation = gl.getUniformLocation(shdr.program, 'perm_user_x');
        gl.uniform1i(inpTexLocation, 0);

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