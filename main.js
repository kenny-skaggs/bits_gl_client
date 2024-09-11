import { Button } from "./graphics/components";
import { Text, initRendering, renderingInitialized } from "./graphics/text";
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

const textVertexSource = `
    attribute vec4 aPosition;
    attribute vec2 aTexCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying vec2 vTexCoord;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
        vTexCoord = aTexCoord;
    }
`;
const textFragmentSource = `
    precision mediump float;


    varying vec2 vTexCoord;

    uniform sampler2D uTexture;

    void main() {
        gl_FragColor = texture2D(uTexture, vTexCoord);
    }
`;

const mat4 = glMatrix.mat4;

const app = {
    glContext: null,
    shaderProgram: null,
    textureProgram: null,
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

let text = undefined;
initRendering(app.glContext);


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

    app.textureProgram.use();
    app.textureProgram.loadUniformMatrix4fv(app.textureProgram.uniforms.projectionMatrix, projectionMatrix);
    app.textureProgram.loadUniformMatrix4fv(app.textureProgram.uniforms.modelViewMatrix, modelViewMatrix);

    if (text === undefined && renderingInitialized) {
        text = new Text("hello", app.glContext, 4.5, 7.7, 3, 0.7);
    } else if (text !== undefined) {
        text.render(app.glContext, app.textureProgram);
    }
}

function initGL() {
    const canvas = document.querySelector("#glcanvas");
    const gl = canvas.getContext("webgl2");

    if (gl === null) {
        alert("WebGL init failed");
    }

    app.shaderProgram = new ShaderProgram(
        gl, vertexShaderSource, fragmentShaderSource,
        ["projectionMatrix", "modelViewMatrix", "color"]
    );
    app.textureProgram = new ShaderProgram(
        gl, textVertexSource, textFragmentSource,
        ["projectionMatrix", "modelViewMatrix", "texture"]
    );

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    app.glContext = gl;
    app.canvas = canvas;
}
