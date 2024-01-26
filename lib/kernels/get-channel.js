import { createOutTextures, fullTexShader } from "./shader.js";
import toArrayFunc from "./to-array.js";

/* Create kernel that takes RG32UI texture and gets either the R or G channel as R32UI */
function createGetChannelKernel(gl, n, m, channel){
    const fragSrc =
    `#version 300 es
    precision highp float;
    precision highp int;
    precision highp usampler2D;
    precision highp usampler2DArray;

    uniform highp usampler2D uInputTexture;

    out uint data0;

    void main(void) {
        ivec2 fragCoord = ivec2(gl_FragCoord.xy);
        uvec2 x_idx_i = texelFetch(uInputTexture, fragCoord, 0).xy;
        data0 = x_idx_i[${channel}];
    }`

    let shdr = fullTexShader(gl, fragSrc, n, m, createOutTextures(gl, n, m, [gl.R32UI]));

    const innerKernel = function (x) {
        /** end setup uploads for kernel values **/
        gl.useProgram(shdr.program);
        gl.scissor(0, 0, n, m);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, x.texture);
        const glVariable95 = gl.getUniformLocation(shdr.program, 'uInputTexture');
        gl.uniform1i(glVariable95, 0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, shdr.frameBuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        return {
            texture: shdr.outTextures[0],
            type: 'ArrayTexture(1)',
            toArray: () => toArrayFunc(gl, shdr.frameBuffer, shdr.outTextures[0], n, m, gl.UNSIGNED_INT, 1, gl.RED_UNSIGNED)
        };
    };
    return innerKernel;

}

export default createGetChannelKernel;