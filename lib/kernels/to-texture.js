import toArrayFunc from "./to-array.js";

function toTexture(gl, x, n, m, elType='float', nChannels=1, isBuffer=false) {
    if (elType == 'integer' || elType == 'unsigned'){
        const ext = gl.getExtension('OES_element_index_uint');
    }

    if (!(Number.isInteger(nChannels)) || (nChannels < 1) || (nChannels > 4)){
        throw `nChannels must be and integer in the range [1, 4]; ${nChannels} given.`;
    }

    if (!(['float', 'unsigned', 'integer'].includes(elType))){
        throw `elType must be one of: float, unsigned, or integer; ${elType} given.`;
    }

    let suffix = {'float': 'F', 'integer': 'I', 'unsigned': 'UI'}[elType];
    let texTyp = {'float': 'FLOAT', 'integer': 'INT', 'unsigned': 'UNSIGNED_INT'}[elType];
    let format = ['RED', 'RG', 'RGB', 'RGBA'][nChannels-1];    
    let internalFormat = nChannels==1 ? `R32${suffix}` : `${format}32${suffix}`
    let glFormat = elType=='float' ? gl[format] : gl[`${format}_INTEGER`];
    let toArrayGLFormat = elType=='float' ? gl.RGBA : gl.RGBA_INTEGER;
    
    const inTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);

    if (isBuffer){
        let buffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, x, gl.STREAM_COPY);

        gl.bindTexture(gl.TEXTURE_BUFFER, inTexture);

        gl.texBuffer(gl.TEXTURE_BUFFER, gl[internalFormat], buffer);
    } else {
        gl.bindTexture(gl.TEXTURE_2D, inTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.bindTexture(gl.TEXTURE_2D, inTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl[internalFormat], n, m, 0, glFormat, gl[texTyp], x);
    }

    return {
        texture: inTexture,
        type: 'ArrayTexture(1)',
        toArray: () => toArrayFunc(gl, gl.createFramebuffer(), inTexture, n, m, gl[texTyp], nChannels, toArrayGLFormat)
    };
}

export default toTexture;