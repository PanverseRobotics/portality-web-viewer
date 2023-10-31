import { createOutTextures, fullTexShader } from "./shader.js";
import toArrayFunc from "./to-array.js";

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

    out uint perm_idx;

    void main(void) {
        // int idx_linear = int(gl_FragCoord.x)
        // int inner_idx = idx_linear % group_size;
        // int outer_idx = idx_linear / group_size;

        int inner_idx = int(gl_FragCoord.x);
        int outer_idx = int(gl_FragCoord.y);

        int idx = int(texelFetch(perm_outer_idx, ivec2(0, outer_idx), 0)[0]);
        int val = int(texelFetch(perm_inner_idx, ivec2(inner_idx, idx), 0)[0]);

        perm_idx = uint(group_size)*uint(idx) + uint(val);
    }`

    let outTextures = createOutTextures(gl, n, m, [gl.R32UI]); // TODO: possibly use RG16UI
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

        // // TODO: perhaps move this outside of this function
        // gl.pixelStorei(gl.PACK_ALIGNMENT, 1);
        // var buffer = gl.createBuffer();
        // gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buffer);
        // gl.bufferData(gl.PIXEL_PACK_BUFFER, 4*4*n*m, gl.DYNAMIC_READ);
        // gl.readPixels(0, 0, n, m, gl.RGBA_INTEGER, gl.UNSIGNED_INT, 0);
        // gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

        return {
            texture: shdr.outTextures[0],
            type: 'ArrayTexture(1)',
            //buffer: buffer,
            framebuffer: shdr.frameBuffer,
            toArray: () => toArrayFunc(gl, shdr.frameBuffer, shdr.outTextures[0], n, m, gl.UNSIGNED_INT, 1, gl.RGBA_INTEGER)
        };
    };
    return innerKernel;
}

export default createPermuteKernel;