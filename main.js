import { TextInput } from "./graphics/components";
import { initRendering, renderingInitialized } from "./graphics/text";
import { ShaderProgram } from "./graphics/shader";
import { InputManager } from "./services";
import { app as betterApp } from "./services";
import { Renderer } from "./rendering";

import { HomeListView, SearchResultsView } from "./views";

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
InputManager.init();


// const button = new Button(100, 500, 60, 20);
// button.onClick = () => button.color = [0.0, 0.0, 0.8, 1.0];
// Renderer.addRenderable(button);

let text = undefined;
initRendering(app.glContext);

let mainListView = undefined;
let searchResults = undefined;


let lastTime = 0;
let rotation = 0;

betterApp.view.width = app.canvas.width;
betterApp.view.height = app.canvas.height;

Renderer.startRenderLoop();

let nextItemId = 0;

function checkTextAssets() {
    if (renderingInitialized) {
        text = new TextInput(app.glContext, 10, 10, betterApp.view.width - 20, 40);

        mainListView = new HomeListView(
            10, 60, betterApp.view.width - 20, betterApp.view.height - 70
        );

        searchResults = new SearchResultsView(
            20, 50, betterApp.view.width - 40, 200
        )
        text.onTextChanged = () => {
            searchResults.showResults();
        };
        text.onSubmit = () => {
            mainListView.addItem({
                id: nextItemId,
                name: text.value
            });
            nextItemId += 1;
            text.setValue("");
            searchResults.hideResults();
        };

        Renderer.addRenderable(mainListView);
        Renderer.addRenderable(searchResults);
        Renderer.addRenderable(text);
    } else {
        setTimeout(checkTextAssets, 1);
    }
}

setTimeout(checkTextAssets, 1);


function render(rotation) {
    if (text === undefined && renderingInitialized) {

    } else if (text !== undefined) {
        Renderer._renderFrame();
    }
}

function initGL() {
    const canvas = document.querySelector("#glcanvas");
    betterApp.canvas = canvas;

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

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    app.glContext = gl;
    app.canvas = canvas;
    betterApp.gl = gl;
}
