function createPermuteKernel(gl, n, m) {
    const fragSrc =
    `#version 300 es
    precision lowp float;
    precision lowp int;
    precision lowp sampler2D;
    precision lowp sampler2DArray;

    uniform int group_size;
    uniform lowp sampler2D perm_inner_idx;
    uniform lowp usampler2D perm_outer_idx;

    out ivec2 perm_idx;

    void main(void) {
        // int idx_linear = int(gl_FragCoord.x)
        // int inner_idx = idx_linear % group_size;
        // int outer_idx = idx_linear / group_size;

        int inner_idx = int(gl_FragCoord.x);
        int outer_idx = int(gl_FragCoord.y);

        int idx = int(texelFetch(perm_outer_idx, ivec2(0, outer_idx), 0)[0]);
        int val = int(texelFetch(perm_inner_idx, ivec2(inner_idx, idx), 0)[0]);

        perm_idx[0] = val;
        perm_idx[1] = idx;
    }`

    outTextures = createOutTextures(gl, n, m, [gl.RG32I]);
    let shdr = fullTexShader(gl, fragSrc, n, m, outTextures);

    const innerKernel = function (groupInnerIdx, groupOuterIdx) {
        /** end setup uploads for kernel values **/
        gl.useProgram(shdr.program);
        gl.scissor(0, 0, n, m);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, groupOuterIdx.texture);
        const permOutIdxLoc = gl.getUniformLocation(shdr.program, 'perm_outer_idx');
        gl.uniform1i(permOutIdxLoc, 2);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, groupInnerIdx.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const permInnerIdxLoc = gl.getUniformLocation(shdr.program, 'perm_inner_idx');
        gl.uniform1i(permInnerIdxLoc, 0);

        const groupSizeLoc = gl.getUniformLocation(shdr.program, 'group_size');
        gl.uniform1i(groupSizeLoc, n);

        gl.bindFramebuffer(gl.FRAMEBUFFER, shdr.frameBuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        return {
            texture: shdr.outTextures[0],
            type: 'ArrayTexture(1)',
            // toArray doesn't work here because webgl is silly
        };
    };
    return innerKernel;
}