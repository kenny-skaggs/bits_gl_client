const vertexShaderSource = `
    attribute vec4 aPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
    }
`;
const fragmentShaderSource = `
    void main() {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    }
`;

const mat4 = glMatrix.mat4;

const app = {
    glContext: null,
    shaderProgram: null,
    shaderLocations: null,
    vertexBuffer: null
}
initGL();

initVertexBuffer(app.glContext);


let lastTime = 0;
let rotation = 0;

function renderLoop(now) {
    now *= 0.001; // convert to seconds
    const deltaTime = now - lastTime;
    lastTime = now;
    rotation += deltaTime;

    render(rotation);

    requestAnimationFrame(renderLoop);
}

requestAnimationFrame(renderLoop);



function render(rotation) {
    const gl = app.glContext;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    const fieldOfView = (45 * Math.PI) / 180
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;

    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, rotation, [0, 0, 1]);

    gl.useProgram(app.shaderProgram);
    gl.uniformMatrix4fv(
        app.shaderLocations.uniform.projectionMatrix, false, projectionMatrix
    );
    gl.uniformMatrix4fv(
        app.shaderLocations.uniform.modelViewMatrix, false, modelViewMatrix
    );


    gl.bindBuffer(gl.ARRAY_BUFFER, app.vertexBuffer);
    const offset = 0;
    const vertexCount = 3;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
}

function initGL() {
    const canvas = document.querySelector("#glcanvas");
    const gl = canvas.getContext("webgl");

    if (gl === null) {
        alert("WebGL init failed");
    }

    initShaderProgram(gl);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    app.glContext = gl;
}


function initShaderProgram(gl) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("error linking shader program");
        console.log(gl.getProgramInfoLog(shaderProgram));
    }

    app.shaderProgram = shaderProgram;
    app.shaderLocations = {
        attribute: {
            position: gl.getAttribLocation(shaderProgram, "aPosition")
        },
        uniform: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix")
        }
    }
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("error compiling shader!");
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    return shader;
}

function initVertexBuffer(gl) {
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    const coords = [
         0.0,  1.0,
        -1.0, -1.0,
         1.0, -1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);

    const numValues = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;  // tell GL to calculate it itself
    const offset = 0;
    gl.vertexAttribPointer(
        app.shaderLocations.attribute.position,
        numValues,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(app.shaderLocations.attribute.position);

    app.vertexBuffer = vertexBuffer;
}
