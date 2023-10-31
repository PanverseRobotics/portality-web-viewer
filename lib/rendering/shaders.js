function createRenderProgram(gl){
    let vertShaderSrc = `#version 300 es

    layout(location=9) in vec3 position;
    layout(location=10) in vec4 color;
        
    out vec2 vPosition;   // Output position in pixel coordinates.
    out vec2 vSize;       // Output size in pixel coordinates. TODO: replace with output cov2d in pixel coords.
    out float vDepth;
    flat out vec4 vColor;

    uniform mat4 uViewProj;
    uniform vec3 uEyePosition;
    uniform vec2 uViewportScale;  

    void main() {
        // The fragment shader needs to do its computations in pixel coords.
        // Here, in addition to computing clip space position,
        // we also precompute the apparent size parameters of the gaussian in pixel coords.
        // This is to reduce some of the workload of the fragment shader. 

        vec2 size = vec2(0.03, 0.03); // TODO 
        
        vec4 clipPosition = uViewProj * vec4(position, 1.0);

        vec2 ndcPosition = clipPosition.xy / clipPosition.w;
        vec2 ndcSize = size / clipPosition.w;

        vec2 pixelPosition = 0.5 * (1.0 + ndcPosition) * uViewportScale;
        vec2 pixelSize = ndcSize * uViewportScale; 

        vPosition = pixelPosition;
        vSize = pixelSize;
        vDepth = clipPosition.z / clipPosition.w;
        vColor = color; // TODO

        gl_Position = clipPosition;
        gl_PointSize = max(pixelSize.x, pixelSize.y); // TODO: do it based on 3-sigma or something
    }
    `

    let fragShaderSrc = `#version 300 es
    precision highp float;

    layout(std140, column_major) uniform;

    in vec2 vPosition;
    in vec2 vSize;
    in float vDepth;
    flat in vec4 vColor;

    layout(location=0) out vec4 fragColor;

    float gaussian(vec2 d){
        //float power = -0.5f * (vConic.x * d.x * d.x + vConic.z * d.y * d.y) - vConic.y * d.x * d.y;
        float power = -0.5f * 0.3 * (d.x * d.x + d.y * d.y);
        return min(0.99f, 1.0f * exp(power));
    }

    void main() {
        vec4 baseColor = vColor;

        vec2 d = abs(gl_FragCoord.xy - vPosition);
        float gaussian_alpha = gaussian(d);

        vec4 color = vec4(baseColor.rgb, gaussian_alpha*vColor.a);

        //color.rgb *= color.a;
        //float w = weight1(gl_FragCoord.z, color.a);
        //float w = weight7(10.0 + 10.0*vDepth, color.a);


        fragColor = vec4(color.rgb, color.a);
    }`

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertShaderSrc);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragShaderSrc);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(vertexShader));
    }

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(fragmentShader));
    }

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    return shaderProgram;
}