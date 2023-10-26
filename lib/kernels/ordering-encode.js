function createEncodeKernel(gl, n, m) {
    const fragSrc =
    `#version 300 es
    precision lowp float;
    precision lowp int;
    precision lowp sampler2D;
    precision lowp sampler2DArray;

    uniform lowp sampler2D enc_user_x;

    uniform uint enc_user_groupu_umask;
    out vec4 data0;

    void main(void) {
        ivec2 fragCoord = ivec2(gl_FragCoord.xy);
        float val = texelFetch(enc_user_x, fragCoord, 0)[0];
        uint user_floatu_umask = ~enc_user_groupu_umask;
        data0[0] = uintBitsToFloat((floatBitsToUint(val) & user_floatu_umask) | uint(fragCoord.x));
    }`

    let shdr = fullTexShader(gl, fragSrc, n, m);

    const innerKernel = function (x) {
        const uploadValue_group_mask = n-1;

        /** end setup uploads for kernel values **/
        gl.useProgram(shdr.program);
        gl.scissor(0, 0, n, m);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, x.texture);
        const glVariable95 = gl.getUniformLocation(shdr.program, 'enc_user_x');
        gl.uniform1i(glVariable95, 0);

        const glVariable17 = gl.getUniformLocation(shdr.program, 'enc_user_groupu_umask');
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