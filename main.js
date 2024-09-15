import { Button, TextInput } from "./graphics/components";
import { initRendering, renderingInitialized } from "./graphics/text";
import { ShaderProgram } from "./graphics/shader";
import { InputManager } from "./services";
import { tickAnimations } from "./animation";
import { app as betterApp } from "./services";

import { HomeListView } from "./views";

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
    uniform vec4 uColor;

    void main() {
        gl_FragColor = uColor * texture2D(uTexture, vTexCoord);
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


const button = new Button(2, 8, 2, 0.5);
button.onClick = () => button.color = [0.0, 0.0, 0.8, 1.0];

let text = undefined;
initRendering(app.glContext);

let mainListView = undefined;


let lastTime = 0;
let rotation = 0;

function renderLoop(now) {
    now *= 0.001; // convert to seconds
    const deltaTime = now - lastTime;
    lastTime = now;

    render(rotation);

    requestAnimationFrame(renderLoop);

    tickAnimations(deltaTime);
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
    mat4.rotate(modelViewMatrix, modelViewMatrix, rotation, [0, 0, 1]);

    app.shaderProgram.use();
    app.shaderProgram.loadUniformMatrix4fv(app.shaderProgram.uniforms.projectionMatrix, projectionMatrix);
    app.shaderProgram.loadUniformMatrix4fv(app.shaderProgram.uniforms.modelViewMatrix, modelViewMatrix);

    app.textureProgram.use();
    app.textureProgram.loadUniformMatrix4fv(app.textureProgram.uniforms.projectionMatrix, projectionMatrix);
    app.textureProgram.loadUniformMatrix4fv(app.textureProgram.uniforms.modelViewMatrix, modelViewMatrix);

    app.shaderProgram.use();
    button.render(app);


    if (text === undefined && renderingInitialized) {
        text = new TextInput(app.glContext, 1, 6, 5, 1);
        mainListView = new HomeListView(6.5, 4, 3, 5);
        text.onSubmit = () => {
            console.log(text.value);
            mainListView.addItem(text.value);
            text.setValue("");
        };

    } else if (text !== undefined) {
        text.render(app);
        mainListView.render();
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
        ["projectionMatrix", "modelViewMatrix", "texture", "color"]
    );
    betterApp.shaderProgram = app.shaderProgram;
    betterApp.textureProgram = app.textureProgram;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    app.glContext = gl;
    app.canvas = canvas;
    betterApp.gl = gl;
}
