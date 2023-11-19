import { createOutTextures, fullTexShader } from "./shader.js";
import toArrayFunc from "./to-array.js";

function createBitonicKernel(gl, n, m, order='forward') {
    let op = {'forward': '>', 'reverse': '<'}[order];
    
    const fragSrc =
    `#version 300 es
    precision highp float;
    precision highp int;
    precision highp sampler2D;
    precision highp sampler2DArray;

    uniform highp sampler2D uInputTexture;

    uniform uint uStepj;
    uniform uint uStepk;

    out float data0;

    void main(void) {
        ivec2 fragCoord = ivec2(gl_FragCoord.xy);

        uint idx = uint(fragCoord.x);

        uint l = idx ^ uStepj;
        uint idxk = idx & uStepk;
        bool ik = int(idxk)==0;

        bool islow = l ${op} idx;

        float xl = texelFetch(uInputTexture, ivec2(int(l), fragCoord.y), 0)[0];
        float xi = texelFetch(uInputTexture, fragCoord, 0)[0];

        bool isorder = xi > xl;
        bool swap = ik == isorder;

        data0 = islow==swap ? xl : xi;
    }`

    let shdr = fullTexShader(gl, fragSrc, n, m, createOutTextures(gl, n, m));

    const innerKernel = function (x, uStepj, uStepk) {
        /** end setup uploads for kernel values **/
        gl.useProgram(shdr.program);
        gl.scissor(0, 0, n, m);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, x.texture);
        const glVariable95 = gl.getUniformLocation(shdr.program, 'uInputTexture');
        gl.uniform1i(glVariable95, 0);

        const glVariable17 = gl.getUniformLocation(shdr.program, 'uStepj');
        gl.uniform1ui(glVariable17, uStepj);

        const glVariable18 = gl.getUniformLocation(shdr.program, 'uStepk');
        gl.uniform1ui(glVariable18, uStepk);

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

export default createBitonicKernel;