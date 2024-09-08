import { Button } from "./graphics/components";
import { ShaderProgram } from "./graphics/shader";
import { InputManager } from "./services";

const vertexShaderSource = `
    attribute vec4 aPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
    }
`;
const fragmentShaderSource = `
    precision mediump float;


    uniform vec4 uColor;

    void main() {
        gl_FragColor = uColor;
    }
`;

const mat4 = glMatrix.mat4;

const app = {
    glContext: null,
    shaderProgram: null,
    canvas: null,
    view: {
        width:  10.0,
        height: 10.0
    }
}
initGL();
InputManager.init(
    app.view.width, app.view.height,
    app.canvas.offsetLeft, app.canvas.offsetTop,
    app.canvas.width, app.canvas.height
);


const button = new Button(app.glContext, 5, 8, 2, 0.5);
button.onClick = () => button.color = [0.0, 0.0, 0.8, 1.0];


let lastTime = 0;
let rotation = 0;

function renderLoop(now) {
    now *= 0.001; // convert to seconds
    const deltaTime = now - lastTime;
    lastTime = now;
    // rotation += deltaTime;

    render(rotation);

    requestAnimationFrame(renderLoop);
}

requestAnimationFrame(renderLoop);




function render(rotation) {
    const gl = app.glContext;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const projectionMatrix = mat4.create();
    mat4.ortho(projectionMatrix, 0.0, app.view.width, 0.0, app.view.height, 0.0, -100.0);

    const modelViewMatrix = mat4.create();
    // mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, rotation, [0, 0, 1]);

    app.shaderProgram.use();
    app.shaderProgram.loadUniformMatrix4fv(app.shaderProgram.uniforms.projectionMatrix, projectionMatrix);
    app.shaderProgram.loadUniformMatrix4fv(app.shaderProgram.uniforms.modelViewMatrix, modelViewMatrix);

    button.render(app);
}

function initGL() {
    const canvas = document.querySelector("#glcanvas");
    const gl = canvas.getContext("webgl");

    if (gl === null) {
        alert("WebGL init failed");
    }

    app.shaderProgram = new ShaderProgram(
        gl, vertexShaderSource, fragmentShaderSource,
        ["projectionMatrix", "modelViewMatrix", "color"]
    );

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    app.glContext = gl;
    app.canvas = canvas;
}
