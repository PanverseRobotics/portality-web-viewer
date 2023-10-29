function createToRG32FKernel(gl, n, m) {
    const fragSrc =
    `#version 300 es
    precision lowp float;
    precision lowp int;
    precision lowp sampler2D;
    precision lowp sampler2DArray;

    uniform lowp isampler2D dec_user_perm;

    out vec4 data;

    void main(void) {
        ivec2 fragCoord = ivec2(gl_FragCoord.xy);
        ivec2 val = texelFetch(dec_user_perm, fragCoord, 0).xy;
        data = vec4(float(val.x), float(val.y), 0.0, 0.0);
    }`

    outTextures = createOutTextures(gl, n, m, [gl.RGBA32F]);
    let shdr = fullTexShader(gl, fragSrc, n, m, outTextures);

    const innerKernel = function (perm) {
        /** end setup uploads for kernel values **/
        gl.useProgram(shdr.program);
        gl.scissor(0, 0, n, m);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, perm.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        const glVariable95 = gl.getUniformLocation(shdr.program, 'dec_user_perm');
        gl.uniform1i(glVariable95, 0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, shdr.frameBuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        return {
            texture: shdr.outTextures[0],
            type: 'ArrayTexture(1)',
            toArray: () => toArrayFunc(gl, shdr.frameBuffer, shdr.outTextures[0], n, m, gl.FLOAT, 2)
        };
    };
    return innerKernel;
}