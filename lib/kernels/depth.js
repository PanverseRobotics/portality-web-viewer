import { createOutTextures, fullTexShader } from "./shader.js";
import toArrayFunc from "./to-array.js";

function createDepthKernel(gl, n, m) {
    const fragSrc =
    `#version 300 es
    precision highp float;
    precision highp int;
    precision highp sampler2D;
    precision highp sampler2DArray;

    uniform highp sampler2D uCoords;
    uniform mat4 uViewProj_dk;

    out float data0;

    void main(void) {
        ivec2 fragCoord = ivec2(gl_FragCoord.xy);
        vec3 position_dk = texelFetch(uCoords, fragCoord, 0).xyz;

        vec4 clipPosition = uViewProj_dk * vec4(position_dk, 1.0);

        data0 = clipPosition.z / clipPosition.w; 
    }`

    let shdr = fullTexShader(gl, fragSrc, n, m, createOutTextures(gl, n, m));

    const innerKernel = function (coords, viewProjMatrix) {
        /** end setup uploads for kernel values **/
        gl.useProgram(shdr.program);
        gl.scissor(0, 0, n, m);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, coords.texture);
        const glVariable95 = gl.getUniformLocation(shdr.program, 'uCoords');
        gl.uniform1i(glVariable95, 0);

        const glVariable17 = gl.getUniformLocation(shdr.program, 'uViewProj_dk');
        var sceneUniformData = new Float32Array(viewProjMatrix);
        sceneUniformData.set(viewProjMatrix);
        gl.uniformMatrix4fv(glVariable17, false, sceneUniformData);

        gl.bindFramebuffer(gl.FRAMEBUFFER, shdr.frameBuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        return {
            program: shdr.program,
            texture: shdr.outTextures[0],
            type: 'ArrayTexture(1)',
            toArray: () => toArrayFunc(gl, shdr.frameBuffer, shdr.outTextures[0], n, m)
        };
    };
    return innerKernel;
}

export default createDepthKernel;