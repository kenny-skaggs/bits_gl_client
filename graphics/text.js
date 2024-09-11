import { textData } from "../font/montserrat";
import { InputManager } from "../services";


let renderingInitialized = false;

let textAtlas = undefined;
const atlasData = {
    width: 0,
    height: 0
}

function initRendering(gl) {
    const image = new Image();
    image.onload = () => { handleAtlasLoaded(image, gl); };
    image.src = "/font/montserrat_transparent.png";
}

function handleAtlasLoaded(image, gl) {
    atlasData.width = image.width;
    atlasData.height = image.height;

    textAtlas = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textAtlas);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    renderingInitialized = true;
}


class Text {
    constructor(content, glContext, x, y, width, height) {
        this._content = content;
        this._gl = glContext;

        this._scale = height / 32;
        this._vertexCoords = [];
        this._xOffset = 0;
        this._dimensions = {
            x: x, y: y,
            width: width, height: height
        }
        this._voa = this._buildVoa(glContext);

        InputManager.getInstance().addKeydownListener(this);
    }

    _buildVoa(gl) {
        const voa = gl.createVertexArray();
        gl.bindVertexArray(voa);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        this._sendVertices();

        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 4 * 4, 0);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
        gl.enableVertexAttribArray(1);

        return voa;
    }

    _sendVertices() {
        [...this._content].forEach((char) => this._appendQuad(char));
        this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(this._vertexCoords), this._gl.STATIC_DRAW);
    }

    onKeydown(char) {
        this._content += char;
        this._vertexCoords = [];
        this._xOffset = 0;
        this._sendVertices();
    }

    _appendQuad(char) {
        const code = char.charCodeAt(0);
        const data = textData[code];
        this._vertexCoords.push(                             this._dimensions.x + this._xOffset + data.xoffset * this._scale,                                       this._dimensions.y,                  data.x / atlasData.width,   (data.y + data.height) / atlasData.height);
        this._vertexCoords.push(                             this._dimensions.x + this._xOffset + data.xoffset * this._scale, this._dimensions.y + this._dimensions.height - data.yoffset * this._scale,                  data.x / atlasData.width,                   data.y / atlasData.height);
        this._vertexCoords.push(  data.width * this._scale + this._dimensions.x + this._xOffset + data.xoffset * this._scale,                                       this._dimensions.y,   (data.x + data.width) / atlasData.width,   (data.y + data.height) / atlasData.height);
        this._vertexCoords.push(  data.width * this._scale + this._dimensions.x + this._xOffset + data.xoffset * this._scale, this._dimensions.y + this._dimensions.height - data.yoffset * this._scale,   (data.x + data.width) / atlasData.width,                   data.y / atlasData.height);

        this._xOffset += data.xadvance * this._scale;
    }

    render(gl, textShader) {
        textShader.loadUniform1i(textShader.uniforms.texture, this._textureID);

        gl.bindVertexArray(this._voa);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4 * this._content.length);
    }
};

export { Text, initRendering, renderingInitialized };
