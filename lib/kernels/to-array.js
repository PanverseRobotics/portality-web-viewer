function toArrayFunc(gl, frameBuffer, texture, n, m, texType=gl.FLOAT, nChannels=1, rpFormat=gl.RGBA, packu32=false){
    function erectOutput(array, width){
        if((texType == gl.UNSIGNED_BYTE) && (rpFormat == gl.RGBA) && (packu32)){
            return new Uint32Array(array);
        } else {
            const xResults = new Float32Array(width*nChannels);
            for (let c = 0; c < nChannels; c++) {
                let i = 0;
                for (let x = 0; (x < nChannels*width); x+=nChannels) {
                    xResults[x+c] = array[i+c];
                    i += 4;
                };
            };
            return xResults;
        }

    };
    function renderRawOutput() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        if(packu32){
            // Special case for RGBA8UI unpacking, where we unpack to a uint32
            let buf = new ArrayBuffer(n * m * nChannels);
            let bufu8 = new Uint8Array(buf);
            gl.readPixels(0, 0, n, m, rpFormat, texType, bufu8);
            return buf; 
        }

        let result;
        if(texType == gl.FLOAT){
            result = new Float32Array(n * m * 4 * nChannels);
        }
        if(texType == gl.UNSIGNED_INT){
            result = new Uint32Array(n * m * 4 * nChannels);
        }
        gl.readPixels(0, 0, n, m, rpFormat, texType, result);
        return result;
    }
    function toArray() {
        // const ext1 = gl.getExtension('EXT_color_buffer_float');
        // const ext2 = gl.getExtension('WEBGL_draw_buffers');

        return erectOutput(renderRawOutput(), n * m);
    }
    return toArray();
}

export default toArrayFunc;