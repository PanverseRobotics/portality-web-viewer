import { createOutTextures, fullTexShader } from "./shader.js";
import toArrayFunc from "./to-array.js";
import endianNess from "./endian.js";

// unpackRGBA8: set to true to unpack the output in terms of an RGBA8
// rather than a single R32
function createPermuteKernel(gl, n, m, unpackRGBA8=false) {
    let endian = endianNess();

    let assignSrc;
    let outType;
    let internalFormat;

    if (unpackRGBA8) {
        switch(endian){
            case 'le':
                assignSrc = `
                perm_idx[0] = 0.003921568f*float(uint(0xff) & (out_idx));
                perm_idx[1] = 0.003921568f*float(uint(0xff) & (out_idx >> 8));
                perm_idx[2] = 0.003921568f*float(uint(0xff) & (out_idx >> 16));
                perm_idx[3] = 0.003921568f*float(uint(0xff) & (out_idx >> 24));`;
                break;

            case 'be':
                assignSrc = `
                perm_idx[0] = 0.003921568f*float(uint(0xff) & (out_idx >> 24));
                perm_idx[1] = 0.003921568f*float(uint(0xff) & (out_idx >> 16));
                perm_idx[2] = 0.003921568f*float(uint(0xff) & (out_idx >> 8));
                perm_idx[3] = 0.003921568f*float(uint(0xff) & (out_idx));`;
                break;

            case 'unknown':
            default:
                throw "Trying to use unpackRGBA8 but cannot determine system endianness; please set unpackRGBA8=false."
        }
        internalFormat = gl.RGBA8;
        outType = 'vec4';
    } else {
        assignSrc = `perm_idx = out_idx;`
        internalFormat = gl.R32UI;
        outType = 'uint';
    }

    const fragSrc =
    `#version 300 es
    precision lowp float;
    precision lowp int;
    precision lowp sampler2D;
    precision lowp sampler2DArray;

    uniform int group_size;
    uniform lowp usampler2D perm_inner_idx;
    uniform lowp usampler2D perm_outer_idx;

    out ${outType} perm_idx;

    void main(void) {
        int inner_idx = int(gl_FragCoord.x);
        int outer_idx = int(gl_FragCoord.y);

        int idx = int(texelFetch(perm_outer_idx, ivec2(0, outer_idx), 0)[0]);
        int val = int(texelFetch(perm_inner_idx, ivec2(inner_idx, idx), 0)[0]);

        uint out_idx = uint(group_size)*uint(idx) + uint(val);
        ${assignSrc}
    }`

    let outTextures = createOutTextures(gl, n, m, [internalFormat]); 
    let shdr = fullTexShader(gl, fragSrc, n, m, outTextures);

    const innerKernel = function (groupInnerIdx, groupOuterIdx) {
        /** end setup uploads for kernel values **/
        gl.useProgram(shdr.program);
        gl.scissor(0, 0, n, m);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, groupOuterIdx.texture);
        const permOuterIdxLoc = gl.getUniformLocation(shdr.program, 'perm_outer_idx');
        gl.uniform1i(permOuterIdxLoc, 2);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, groupInnerIdx.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        const permInnerIdxLoc = gl.getUniformLocation(shdr.program, 'perm_inner_idx');
        gl.uniform1i(permInnerIdxLoc, 0);

        const groupSizeLoc = gl.getUniformLocation(shdr.program, 'group_size');
        gl.uniform1i(groupSizeLoc, n);

        gl.bindFramebuffer(gl.FRAMEBUFFER, shdr.frameBuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        let glFormat = unpackRGBA8 ? gl.RGBA : gl.RGBA_INTEGER;
        let glType = unpackRGBA8 ? gl.UNSIGNED_BYTE : gl.UNSIGNED_INT;
        let nChannels = unpackRGBA8 ? 4 : 1;

        return {
            texture: shdr.outTextures[0],
            type: 'ArrayTexture(1)',
            //buffer: buffer,
            framebuffer: shdr.frameBuffer,
            toArray: () => toArrayFunc(gl, shdr.frameBuffer, shdr.outTextures[0], n, m, glType, nChannels, glFormat, unpackRGBA8)
        };
    };
    return innerKernel;
}

export default createPermuteKernel;