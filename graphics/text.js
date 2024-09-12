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
        this._vertices = [];
        this._indices = [];
        this._xOffset = 0;
        this._dimensions = {
            x: x, y: y,
            width: width, height: height
        }
        this._buildVoa(glContext);

        InputManager.getInstance().addKeydownListener(this);
    }

    _buildVoa(gl) {
        this._ab = gl.createBuffer();
        this._eab = gl.createBuffer();

        this._setupBuffers();
        this._sendVertices();
    }

    _setupBuffers() {
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._ab);
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._eab);

        this._gl.vertexAttribPointer(0, 2, this._gl.FLOAT, false, 4 * 4, 0);
        this._gl.enableVertexAttribArray(0);
        this._gl.vertexAttribPointer(1, 2, this._gl.FLOAT, false, 4 * 4, 2 * 4);
        this._gl.enableVertexAttribArray(1);
    }

    onKeydown(char, keycode) {
        if (keycode < 32 || keycode > 126) {
            return;
        }

        this._content += char;
        this._vertices = [];
        this._indices = [];
        this._xOffset = 0;
        
        this._setupBuffers();
        this._sendVertices();
        // this._gl.bindVertexArray(null);
    }

    _sendVertices() {
        console.log(this._content);
        [...this._content].forEach((char, index) => this._appendQuad(char, index));
        this._gl.bufferData(
            this._gl.ARRAY_BUFFER,
            new Float32Array(this._vertices),
            this._gl.DYNAMIC_DRAW
        );
        this._gl.bufferData(
            this._gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this._indices),
            this._gl.DYNAMIC_DRAW
        );
    }

    _appendQuad(char, charIndex) {
        const code = char.charCodeAt(0);
        const data = textData[code];
        this._vertices.push(                             this._dimensions.x + this._xOffset + data.xoffset * this._scale,                                       this._dimensions.y,                  data.x / atlasData.width,   (data.y + data.height) / atlasData.height);
        this._vertices.push(                             this._dimensions.x + this._xOffset + data.xoffset * this._scale, this._dimensions.y + this._dimensions.height - data.yoffset * this._scale,                  data.x / atlasData.width,                   data.y / atlasData.height);
        this._vertices.push(  data.width * this._scale + this._dimensions.x + this._xOffset + data.xoffset * this._scale,                                       this._dimensions.y,   (data.x + data.width) / atlasData.width,   (data.y + data.height) / atlasData.height);
        this._vertices.push(  data.width * this._scale + this._dimensions.x + this._xOffset + data.xoffset * this._scale, this._dimensions.y + this._dimensions.height - data.yoffset * this._scale,   (data.x + data.width) / atlasData.width,                   data.y / atlasData.height);

        const nextIndex = charIndex * 4;
        this._indices.push(
            nextIndex, nextIndex + 2, nextIndex + 1,
            nextIndex + 1, nextIndex + 2, nextIndex + 3
        );

        this._xOffset += data.xadvance * this._scale;
    }

    render(gl, textShader) {
        textShader.loadUniform1i(textShader.uniforms.texture, this._textureID);

        this._setupBuffers();
        gl.drawElements(gl.TRIANGLES, this._indices.length, gl.UNSIGNED_SHORT, 0);
    }
};

export { Text, initRendering, renderingInitialized };
