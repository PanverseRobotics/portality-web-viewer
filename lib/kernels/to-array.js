function toArrayFunc(gl, frameBuffer, texture, n, m, texType=gl.FLOAT, nChannels=1, rpFormat=gl.RGBA, packu32=false){
    function erectOutput(array, width){
        if((texType == gl.UNSIGNED_BYTE) && ((rpFormat == gl.RGBA) || (rpFormat == gl.RG)) && (packu32)){
            if (nChannels == 4){
                return new Uint32Array(array);
            }
            if (nChannels == 2) {
                return new Uint16Array(array);
            }
            throw `Specified number of channels (${nChannels}) unimplemented.`;
        } else {
            let xResults;
            if (texType == gl.FLOAT){
                xResults = new Float32Array(width*nChannels);
            }
            if (texType == gl.UNSIGNED_INT){
                xResults = new Uint32Array(width*nChannels);
            }
            
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
            rpFormat = gl.RGBA_INTEGER;
            result = new Uint32Array(n * m * 4 * nChannels);
        }
        if(texType == gl.UNSIGNED_SHORT){
            result = new Uint16Array(n * m * 4 * nChannels);
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

/* Create kernel that expands a RG32F output texture to RGBA32F */
function createOutputExpandKernel(gl, n, m){
    
}

export default toArrayFunc;