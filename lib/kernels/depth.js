function createDepthKernel(gl, n, m) {
    const fragSrc =
    `#version 300 es
    precision lowp float;
    precision lowp int;
    precision lowp sampler2D;
    precision lowp sampler2DArray;

    uniform lowp sampler2D uCoords;
    uniform mat4 uViewProj;

    out vec4 data0;

    void main(void) {
        ivec2 fragCoord = ivec2(gl_FragCoord.xy);
        vec3 position = texelFetch(uCoords, fragCoord, 0).xyz;

        vec4 clipPosition = uViewProj * vec4(position, 1.0);

        data0[0] = clipPosition.z / clipPosition.w; 
    }`

    let shdr = fullTexShader(gl, fragSrc, n, m);

    const innerKernel = function (coords, viewProjMatrix) {
        /** end setup uploads for kernel values **/
        gl.useProgram(shdr.program);
        gl.scissor(0, 0, n, m);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, coords.texture);
        const glVariable95 = gl.getUniformLocation(shdr.program, 'uCoords');
        gl.uniform1i(glVariable95, 0);

        const glVariable17 = gl.getUniformLocation(shdr.program, 'uViewProj');
        var sceneUniformData = new Float32Array(16);
        sceneUniformData.set(viewProjMatrix);
        gl.uniformMatrix4fv(glVariable17, false, sceneUniformData);

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