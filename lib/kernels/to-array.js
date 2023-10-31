function toArrayFunc(gl, frameBuffer, texture, n, m, texType=gl.FLOAT, nChannels=1, rpFormat=gl.RGBA){
    function erectFloat(array, width){
        const xResults = new Float32Array(width*nChannels);
        for (let c = 0; c < nChannels; c++) {
            let i = 0;
            for (let x = 0; (x < nChannels*width); x+=nChannels) {
                xResults[x+c] = array[i+c];
                i += 4;
            };
        };
        return xResults;
    };
    function renderRawOutput() {
        const size = { "0": n, "1": m };
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        var result = []
        if(texType == gl.FLOAT){
            result = new Float32Array(((size[0] * size[1]) * 4 * nChannels));
        } else {
            result = new Uint32Array(((size[0] * size[1]) * 4 * nChannels));
        }
            
        gl.readPixels(0, 0, size[0], size[1], rpFormat, texType, result);
        return result;
    }
    function renderValues() {
        return renderRawOutput();
    }
    function toArray() {
        // const ext1 = gl.getExtension('EXT_color_buffer_float');
        // const ext2 = gl.getExtension('WEBGL_draw_buffers');

        return erectFloat(renderValues(), [n * m][0]);
    }
    return toArray();
}

export default toArrayFunc;