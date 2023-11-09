function createRenderProgram(gl){
    let vertShaderSrc = `#version 300 es

    layout(location=9) in vec3 position;
    layout(location=10) in vec4 color;
    layout(location=11) in vec3 covDiag; // diagonal components of cov3d e.g. 11, 22, 33
    layout(location=12) in vec3 covUpper; // upper components of cov3d e.g. 12, 13, 23
        
    out vec2 vPosition;   // Output position in pixel coordinates.
    out float vDepth;
    flat out vec4 vColor;
    flat out vec3 vInvCov2d;

    uniform mat4 uViewProj;
    uniform mat4 uView;
    uniform vec3 uEyePosition;
    uniform vec2 uViewportScale;  

    // Forward version of 2D covariance matrix computation
    // t: transformed center
    vec3 computeCov2D(const vec3 t, const vec2 focal, const vec3 cov3dd, const vec3 cov3du, const mat4 viewmatrix)
    {
        mat3 J = mat3(
            focal.x / t.z, 0.0f, -(focal.x * t.x) / (t.z * t.z),
            0.0f, focal.y / t.z, -(focal.y * t.y) / (t.z * t.z),
            0, 0, 0);

        mat3 W = mat3(
            viewmatrix[0][0], viewmatrix[1][0], viewmatrix[2][0],
            viewmatrix[0][1], viewmatrix[1][1], viewmatrix[2][1],
            viewmatrix[0][2], viewmatrix[1][2], viewmatrix[2][2]);

        mat3 T = W * J;

        mat3 Vrk = mat3(
            cov3dd[0], cov3du[0], cov3du[1],
            cov3du[0], cov3dd[1], cov3du[2],
            cov3du[1], cov3du[2], cov3dd[2]);

        mat3 cov = transpose(T) * Vrk * T;

        // Apply low-pass filter: every Gaussian should be at least
        // one pixel wide/high. Discard 3rd row and column.
        return vec3(cov[0][0] + 0.3, cov[0][1], cov[1][1] + 0.3);
    }

    vec3 invCov2d(vec3 cov2d){
        float det = (cov2d.x * cov2d.z - cov2d.y * cov2d.y) + 1e-9;
        // if (det == 0.0f)
        //     return;
        float det_inv = 1.0 / det;
        return vec3(cov2d.z * det_inv, -cov2d.y * det_inv, cov2d.x * det_inv);
    }

    void main() {
        // The fragment shader needs to do its computations in pixel coords.
        // Here, in addition to computing clip space position,
        // we also precompute the apparent size parameters of the gaussian in pixel coords.
        // This is to reduce some of the workload of the fragment shader. 

        
        vec4 clipPosition = uViewProj * vec4(position, 1.0);

        vec2 ndcPosition = clipPosition.xy / clipPosition.w;

        vec2 pixelPosition = 0.5 * (1.0 + ndcPosition) * uViewportScale;

        vPosition = pixelPosition;
        vDepth = clipPosition.z / clipPosition.w;
        vColor = color; // TODO
        vec4 t = uView*vec4(position, 1.0);
        vec3 vCov2d = computeCov2D(t.xyz, 0.5*uViewportScale, covDiag, covUpper, uView);
        vInvCov2d = invCov2d(vCov2d);

        gl_Position = clipPosition;
        gl_PointSize = 5.0*sqrt(max(vCov2d.x, vCov2d.z)); // 5-sigma
    }
    `

    let fragShaderSrc = `#version 300 es
    precision highp float;

    layout(std140, column_major) uniform;

    in vec2 vPosition;
    in float vDepth;
    flat in vec4 vColor;
    flat in vec3 vInvCov2d;

    layout(location=0) out vec4 fragColor;

    float gaussian(vec2 d){
        float power = -0.5 * (vInvCov2d.x * d.x * d.x + vInvCov2d.z * d.y * d.y) - vInvCov2d.y * d.x * d.y;
        if (power > 0.0)
            discard;
        return min(0.99f, 1.0f * exp(power));
    }

    void main() {
        vec4 baseColor = vColor;

        vec2 d = gl_FragCoord.xy - vPosition;
        float gaussian_alpha = gaussian(d);

        vec4 color = vec4(baseColor.rgb, gaussian_alpha*vColor.a);

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