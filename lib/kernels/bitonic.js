function bitonicKernel(gl, n, m) {
    const fragSrc =
    `#version 300 es
    precision lowp float;
    precision lowp int;
    precision lowp sampler2D;
    precision lowp sampler2DArray;

    uniform lowp sampler2D user_x;

    uniform uint sort_step_j;
    uniform uint sort_step_k;

    float kernelResult;
    out vec4 data0;

    void main(void) {
        ivec2 fragCoord = ivec2(gl_FragCoord.xy);

        uint idx = uint(fragCoord.x);

        uint l = idx ^ sort_step_j;
        uint idxk = idx & sort_step_k;
        bool ik = idxk==0;

        bool islow = l > idx;

        float xl = texelFetch(user_x, ivec2(int(l), fragCoord.y), 0)[0];
        float xi = texelFetch(user_x, fragCoord, 0)[0];

        bool isorder = xi > xl;
        swap = ik == isorder;

        data0[0] = islow==swap ? xl : xi;
    }`

    let shdr = fullTexShader(gl, fragSrc, n, m);

    const innerKernel = function (x, sort_step_j, sort_step_k) {
        /** end setup uploads for kernel values **/
        gl.useProgram(shdr.program);
        gl.scissor(0, 0, n, m);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, x.texture);
        const glVariable95 = gl.getUniformLocation(shdr.program, 'user_x');
        gl.uniform1i(glVariable95, 0);

        const glVariable17 = gl.getUniformLocation(shdr.program, 'sort_step_j');
        gl.uniform1ui(glVariable17, sort_step_j);

        const glVariable18 = gl.getUniformLocation(shdr.program, 'sort_step_k');
        gl.uniform1ui(glVariable18, sort_step_k);

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