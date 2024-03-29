import { createOutTextures, fullTexShader } from "./shader.js";
import toArrayFunc from "./to-array.js";

function createEncodeKernel(gl, n, m) {
    const fragSrc =
    `#version 300 es
    precision highp float;
    precision highp int;
    precision highp sampler2D;
    precision highp sampler2DArray;

    uniform highp sampler2D uInputVals;
    uniform uint uGroupMask;

    out float data;

    void main(void) {
        ivec2 fragCoord = ivec2(gl_FragCoord.xy);
        float val = texelFetch(uInputVals, fragCoord, 0)[0];
        data = uintBitsToFloat((floatBitsToUint(val) & (~uGroupMask)) | uint(fragCoord.x));
    }`

    let shdr = fullTexShader(gl, fragSrc, n, m, createOutTextures(gl, n, m));

    const innerKernel = function (x) {
        const uploadValue_group_mask = n-1;

        /** end setup uploads for kernel values **/
        gl.useProgram(shdr.program);
        gl.scissor(0, 0, n, m);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, x.texture);
        const glVariable95 = gl.getUniformLocation(shdr.program, 'uInputVals');
        gl.uniform1i(glVariable95, 0);

        const glVariable17 = gl.getUniformLocation(shdr.program, 'uGroupMask');
        gl.uniform1ui(glVariable17, uploadValue_group_mask);
        gl.bindFramebuffer(gl.FRAMEBUFFER, shdr.frameBuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        return {
            texture: shdr.outTextures[0],
            type: 'ArrayTexture(1)',
            toArray: () => toArrayFunc(gl, shdr.frameBuffer, shdr.outTextures[0], n, m)
        };
    };
    return innerKernel;
}


function createDecodeKernel(gl, n, m) {
    // TODO: make this work with uint16 output instead of uint32
    
    const fragSrc =
    `#version 300 es
    precision highp float;
    precision highp int;
    precision highp sampler2D;
    precision highp sampler2DArray;

    uniform sampler2D aInputEncoding;
    uniform uint uGroupMask;
    
    out uint idx;

    void main(void) {
        ivec2 fragCoord = ivec2(gl_FragCoord.xy);
        float val = texelFetch(aInputEncoding, fragCoord, 0)[0];
        idx = (floatBitsToUint(val) & uGroupMask);
    }`

    let shdr = fullTexShader(gl, fragSrc, n, m, createOutTextures(gl, n, m, [gl.R32UI]));

    const innerKernel = function (x) {
        const uploadValue_group_mask = n-1;

        /** end setup uploads for kernel values **/
        gl.useProgram(shdr.program);
        gl.scissor(0, 0, n, m);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, x.texture);
        const glVariable95 = gl.getUniformLocation(shdr.program, 'aInputEncoding');
        gl.uniform1i(glVariable95, 0);

        const glVariable17 = gl.getUniformLocation(shdr.program, 'uGroupMask');
        gl.uniform1ui(glVariable17, uploadValue_group_mask);
        gl.bindFramebuffer(gl.FRAMEBUFFER, shdr.frameBuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        return {
            texture: shdr.outTextures[0],
            type: 'ArrayTexture(1)',
            toArray: () => toArrayFunc(gl, shdr.frameBuffer, shdr.outTextures[0], n, m, gl.UNSIGNED_INT, 1, gl.RGBA_INTEGER)
        };
    };
    return innerKernel;
}

export { createEncodeKernel, createDecodeKernel };