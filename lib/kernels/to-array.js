function toArrayFunc(frameBuffer, texture, n, m){
    function framebuffer() {
        return frameBuffer;
    };
    function erectFloat(array, width){
        const xResults = new Float32Array(width);
        let i = 0;
        for (let x = 0; (x < width); x++) {
            xResults[x] = array[i];
            i += 4;
        };
        return xResults;
    };
    function renderRawOutput() {
        const size = { "0": n, "1": m };
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer());
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        const result = new Float32Array(((size[0] * size[1]) * 4));
        gl.readPixels(0, 0, size[0], size[1], gl.RGBA, gl.FLOAT, result);
        return result;
    }
    function renderValues() {
        return renderRawOutput();
    }
    function toArray() {
        return erectFloat(renderValues(), [n * m][0]);
    }
    return toArray();
}