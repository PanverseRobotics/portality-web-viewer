function decodeKernel(gl, n, m) {
    const fragSrc =
    `#version 300 es
    precision lowp float;
    precision lowp int;
    precision lowp sampler2D;
    precision lowp sampler2DArray;

    uniform lowp sampler2D dec_user_x;

    uniform uint dec_user_groupu_umask;
    out vec4 data0;

    void main(void) {
        ivec2 fragCoord = ivec2(gl_FragCoord.xy);
        float val = texelFetch(dec_user_x, fragCoord, 0)[0];
        data0[0] = float((floatBitsToUint(val) & dec_user_groupu_umask));
    }`

    let shdr = fullTexShader(gl, fragSrc, n, m);

    const innerKernel = function (x) {
        const uploadValue_group_mask = n-1;

        /** end setup uploads for kernel values **/
        gl.useProgram(shdr.program);
        gl.scissor(0, 0, n, m);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, x.texture);
        const glVariable95 = gl.getUniformLocation(shdr.program, 'dec_user_x');
        gl.uniform1i(glVariable95, 0);

        const glVariable17 = gl.getUniformLocation(shdr.program, 'dec_user_groupu_umask');
        gl.uniform1ui(glVariable17, uploadValue_group_mask);
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