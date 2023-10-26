    function toTextureKernel(gl, n, m, internalFormat=gl.R32F) {
    const inTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, inTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    let internalRBGAFormat=gl.RGBA32F;
    let format = gl.FLOAT;
    let internalType='float';
    let samplerType='sampler2D';
    let outVecType='vec4';
    switch(internalFormat)
    {
        case gl.R32F:
            internalRBGAFormat = gl.RGBA32F;
            format = gl.FLOAT;
            internalType = 'float'
            samplerType = 'sampler2D'
            outVecType='vec4';
            break;
        case gl.R32UI:
            internalRBGAFormat = gl.RGBA32UI;
            format = gl.UNSIGNED_INT;
            internalType = 'uint'
            samplerType = 'usampler2D'
            outVecType='uvec4';
            break;
        case gl.R32I:
            internalRBGAFormat = gl.RGBA32I;
            format = gl.INTEGER;
            internalType = 'int'
            samplerType = 'isampler2D'
            outVecType='ivec4';
            break;
        default: 
    }

    console.log(internalType, " ", samplerType);
    const fragSrc =
    `#version 300 es
    precision lowp float;
    precision lowp int;
    precision lowp sampler2D;
    precision lowp sampler2DArray;

    uniform lowp ${samplerType} user_x;

    out ${outVecType} data0;

    void main(void) {
        ivec2 fragCoord = ivec2(gl_FragCoord.xy);
        int channel = fragCoord.x % 4;
        ${internalType} val = texelFetch(user_x, ivec2(fragCoord.x/4, fragCoord.y), 0)[channel];
        data0[0] = val;
    }`;

    let shdr = fullTexShader(gl, fragSrc, n, m, internalFormat, format);

    const innerKernel = function (x) {
        /** start setup uploads for kernel values **/
        //const uploadValue_x = new Float32Array(n * m);
        //uploadValue_x.set(x);

        /** end setup uploads for kernel values **/
        gl.useProgram(shdr.program);
        gl.scissor(0, 0, n, m);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, inTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

        if (n % 4 != 0) {
            throw "Sorry we are being dumb and only supporting group_size divisible by 4";
        }

        gl.texImage2D(gl.TEXTURE_2D, 0, internalRBGAFormat, Math.floor(n / 4), m, 0, gl.RGBA, format, x);
        const glVariable16 = gl.getUniformLocation(shdr.program, 'user_x');
        gl.uniform1i(glVariable16, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, shdr.frameBuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        return {
            texture: shdr.outTexture,
            type: 'ArrayTexture(1)',
            toArray: () => toArrayFunc(shdr.frameBuffer, shdr.outTexture, n, m, format)
        };
    };

    return innerKernel;
}