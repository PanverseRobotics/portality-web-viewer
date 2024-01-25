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

        data0 = (xl == xi) ? xi : (islow==swap ? xl : xi);
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

function createFullBitonicKernel(gl, n, m, order='forward') {
    let op = {'forward': '>', 'reverse': '<'}[order];
    
    const fragSrc =
    `#version 300 es
    precision highp float;
    precision highp int;
    precision highp usampler2D;
    precision highp usampler2DArray;

    uniform highp usampler2D uInputTexture;

    uniform uint uStepjx;
    uniform uint uStepjy;
    uniform uint uTexSizeX;
    uniform uint uTexSizeY;

    out uvec2 data;

    void main(void) {
        ivec2 fragCoord = ivec2(gl_FragCoord.xy);

        uint idxx = uint(fragCoord.x);
        uint idxy = uint(fragCoord.y);

        uint lx = idxx ^ uStepjx;
        uint ly = idxy ^ uStepjy;

        bool inbounds = ly < uTexSizeY;

        uvec2 x_idx_i = texelFetch(uInputTexture, fragCoord, 0).xy;

        if (inbounds){
            bool islow = idxy < ly || (idxy == ly && idxx < lx);

            ivec2 idx_l = ivec2(int(lx), int(ly));

            uvec2 x_idx_l = texelFetch(uInputTexture, idx_l, 0).xy;
            
            uint xl = x_idx_l.x;
            uint xi = x_idx_i.x;

            bool isnotorder = xi ${op} xl;

            bool swap = (isnotorder == islow) && (xl != xi);

            data = swap ? x_idx_l : x_idx_i;
        } else {
            data = x_idx_i;
        }

    }`


    let shdr = fullTexShader(gl, fragSrc, n, m, createOutTextures(gl, n, m, [gl.RG32UI]));

    const innerKernel = function (x, uStepj, uStepk) {
        /** end setup uploads for kernel values **/
        gl.useProgram(shdr.program);
        gl.scissor(0, 0, n, m);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, x.texture);
        const uixVar = gl.getUniformLocation(shdr.program, 'uInputTexture');
        gl.uniform1i(uixVar, 0);

        const usjxVar = gl.getUniformLocation(shdr.program, 'uStepjx');
        gl.uniform1ui(usjxVar, uStepj % n);

        const usjyVar = gl.getUniformLocation(shdr.program, 'uStepjy');
        gl.uniform1ui(usjyVar, Math.floor(uStepj / n));

        const utsxVar = gl.getUniformLocation(shdr.program, 'uTexSizeX');
        gl.uniform1ui(utsxVar, n);

        const utsyVar = gl.getUniformLocation(shdr.program, 'uTexSizeY');
        gl.uniform1ui(utsyVar, m);

        gl.bindFramebuffer(gl.FRAMEBUFFER, shdr.frameBuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        return {
            texture: shdr.outTextures[0],
            type: 'ArrayTexture(1)',
            // No toArrayFunc here      
        };
    };
    return innerKernel;
}



function createFullEvenOddKernel(gl, n, m, order='forward') {
    let op = {'forward': '>', 'reverse': '<'}[order];
    

    const fragSrc =
    `#version 300 es
    precision highp float;
    precision highp int;
    precision highp usampler2D;
    precision highp usampler2DArray;

    uniform highp usampler2D uInputTexture;

    uniform uint uStepj; // smaller one
    uniform uint uStepk; // bigger one
    uniform uint uStart;
    uniform uint uTotalLen;

    out uvec2 data;

    void main(void) {
        ivec2 fragCoord = ivec2(gl_FragCoord.xy);
        ivec2 texSize = textureSize(uInputTexture, 0);

        uint idx = uint(fragCoord.x) + uint(fragCoord.y)*uint(texSize.x);

        int j = int(idx) - int(uStart);
        uint l = (uint(j) ^ uStepj) + uStart;

        bool inbounds = (j >= 0) && (l < uTotalLen);

        uint group_i = idx & uStepk;
        uint group_l = l & uStepk;
        bool samegroup = (group_i == group_l);

        uvec2 x_idx_i = texelFetch(uInputTexture, fragCoord, 0).xy;

        if (inbounds && samegroup){
            bool islow = idx < l;
            
            ivec2 idx_l = ivec2(int(l) % texSize.x, int(l) / texSize.x);

            uvec2 x_idx_l = texelFetch(uInputTexture, idx_l, 0).xy;

            uint xl = x_idx_l.x;
            uint xi = x_idx_i.x;

            bool isnotorder = ((xi ${op} xl) == islow);

            data = (xl == xi) ? x_idx_i : (isnotorder ? x_idx_l : x_idx_i);
        } else {
            data = x_idx_i;
        }
    }`


    let shdr = fullTexShader(gl, fragSrc, n, m, createOutTextures(gl, n, m, [gl.RG32UI]));

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

        const glVariable19 = gl.getUniformLocation(shdr.program, 'uStart');
        gl.uniform1ui(glVariable19, (uStepj % (uStepk>>1)) | 0);

        const glVariable20 = gl.getUniformLocation(shdr.program, 'uTotalLen');
        gl.uniform1ui(glVariable20, n*m);

        gl.bindFramebuffer(gl.FRAMEBUFFER, shdr.frameBuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        return {
            texture: shdr.outTextures[0],
            type: 'ArrayTexture(1)',
            // No toArrayFunc here      
        };
    };
    return innerKernel;
}

function createTexturePermuteKernel0(gl, n, m){
    const fragSrc =
    `#version 300 es
    precision highp float;
    precision highp int;
    // precision highp sampler2D;
    // precision highp sampler2DArray;
    // precision highp usampler2D;
    // precision highp usampler2DArray;

    uniform highp usampler2D perm_idx;

    uniform sampler2D uInputPosition;
    uniform sampler2D uInputColor;
    uniform sampler2D uInputCovP1;
    uniform sampler2D uInputCovP2;

    layout(location = 0) out vec4 outPosition;
    layout(location = 1) out vec4 outColor;
    layout(location = 2) out vec4 outCovP1;
    layout(location = 3) out vec2 outCovP2;
    
    void main(void) {
        ivec2 fragCoord = ivec2(gl_FragCoord.xy);
        ivec2 texSize = textureSize(perm_idx, 0);

        uint idx = texelFetch(perm_idx, fragCoord, 0)[0];
        ivec2 texCoord = ivec2(int(idx) % texSize.x, int(idx) / texSize.x);

        outPosition = texelFetch(uInputPosition, texCoord, 0).xyzw;
        outColor = texelFetch(uInputColor, texCoord, 0).xyzw;
        outCovP1 = texelFetch(uInputCovP1, texCoord, 0).xyzw;
        outCovP2 = texelFetch(uInputCovP2, texCoord, 0).xy;
    }`

    let shdr = fullTexShader(gl, fragSrc, n, m, createOutTextures(gl, n, m, [gl.RGBA32F, gl.RGBA32F, gl.RGBA32F, gl.RG32F]));
    //let shdr = fullTexShader(gl, fragSrc, n, m, createOutTextures(gl, n, m, [gl.RGBA32F, gl.RGBA32F]));

    const innerKernel = function (perm_idx, vertexTextures) {
        /** end setup uploads for kernel values **/
        gl.useProgram(shdr.program);
        gl.scissor(0, 0, n, m);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, perm_idx.texture);
        const perm_idxLoc = gl.getUniformLocation(shdr.program, 'perm_idx');
        gl.uniform1i(perm_idxLoc, 0);

        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, vertexTextures.position.texture);
        const positionLoc = gl.getUniformLocation(shdr.program, 'uInputPosition');
        gl.uniform1i(positionLoc, 3);

        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, vertexTextures.color.texture);
        const colorLoc = gl.getUniformLocation(shdr.program, 'uInputColor');
        gl.uniform1i(colorLoc, 4);

        gl.activeTexture(gl.TEXTURE5);
        gl.bindTexture(gl.TEXTURE_2D, vertexTextures.covP1.texture);
        const covP1Loc = gl.getUniformLocation(shdr.program, 'uInputCovP1');
        gl.uniform1i(covP1Loc, 5);

        gl.activeTexture(gl.TEXTURE6);
        gl.bindTexture(gl.TEXTURE_2D, vertexTextures.covP2.texture);
        const covP2Loc = gl.getUniformLocation(shdr.program, 'uInputCovP2');
        gl.uniform1i(covP2Loc, 6);

        gl.bindFramebuffer(gl.FRAMEBUFFER, shdr.frameBuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        return {
            position: {
                texture: shdr.outTextures[0],
                type: 'ArrayTexture(1)',
                // No toArrayFunc here      
            },
            color: {
                texture: shdr.outTextures[1],
                type: 'ArrayTexture(1)',
                // No toArrayFunc here      
            },
            covP1: {
                texture: shdr.outTextures[2],
                type: 'ArrayTexture(1)',
                // No toArrayFunc here      
            },
            covP2: {
                texture: shdr.outTextures[3],
                type: 'ArrayTexture(1)',
                // No toArrayFunc here      
            },
        };
    };
    return innerKernel;
}



function createTexturePermuteKernel(gl, n, m, nChannels){
    let swiz = nChannels==4 ? 'xyzw' : 'xy';

    const fragSrc =
    `#version 300 es
    precision highp float;
    precision highp int;

    uniform highp usampler2D perm_idx;

    uniform sampler2D uInput;

    out vec${nChannels} data;
    
    void main(void) {
        ivec2 fragCoord = ivec2(gl_FragCoord.xy);
        ivec2 texSize = textureSize(perm_idx, 0);

        uint idx = texelFetch(perm_idx, fragCoord, 0)[0];
        ivec2 texCoord = ivec2(int(idx) % texSize.x, int(idx) / texSize.x);

        data = texelFetch(uInput, texCoord, 0).${swiz};
    }`

    let internalFormat = nChannels==4 ? gl.RGBA32F : gl.RG32F;
    let shdr = fullTexShader(gl, fragSrc, n, m, createOutTextures(gl, n, m, [internalFormat]));

    const innerKernel = function (perm_idx, x) {
        /** end setup uploads for kernel values **/
        gl.useProgram(shdr.program);
        gl.scissor(0, 0, n, m);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, perm_idx.texture);
        const perm_idxLoc = gl.getUniformLocation(shdr.program, 'perm_idx');
        gl.uniform1i(perm_idxLoc, 0);

        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, x.texture);
        const positionLoc = gl.getUniformLocation(shdr.program, 'uInput');
        gl.uniform1i(positionLoc, 3);

        gl.bindFramebuffer(gl.FRAMEBUFFER, shdr.frameBuffer);
    
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                
        return {
            texture: shdr.outTextures[0],
            type: 'ArrayTexture(1)',
            // No toArrayFunc here      
        };
    };
    return innerKernel;
}

function createSwapTextureKernel(gl, n, m, nChannels){
    let swiz = nChannels==4 ? 'xyzw' : 'xy';

    const fragSrc =
    `#version 300 es
    precision highp float;
    precision highp int;

    uniform sampler2D uInput;

    out vec${nChannels} data;
    
    void main(void) {
        ivec2 fragCoord = ivec2(gl_FragCoord.xy);

        data = texelFetch(uInput, fragCoord, 0).${swiz};
    }`

    let internalFormat = nChannels==4 ? gl.RGBA32F : gl.RG32F;
    let shdr = fullTexShader(gl, fragSrc, n, m, createOutTextures(gl, n, m, [internalFormat]));

    const innerKernel = function (x) {
        /** end setup uploads for kernel values **/
        gl.useProgram(shdr.program);
        gl.scissor(0, 0, n, m);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, x.texture);
        const positionLoc = gl.getUniformLocation(shdr.program, 'uInput');
        gl.uniform1i(positionLoc, 0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, shdr.frameBuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                
        return {
            texture: shdr.outTextures[0],
            type: 'ArrayTexture(1)',
            // No toArrayFunc here      
        };
    };
    return innerKernel;
}

export {
    createBitonicKernel,
    createFullBitonicKernel,
    createFullEvenOddKernel,
    createTexturePermuteKernel,
    createSwapTextureKernel
};