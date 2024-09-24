import { textData } from "../font/montserrat";
import { app } from "../services";


let renderingInitialized = false;

let textAtlas = undefined;
const atlasData = {
    width: 0,
    height: 0
}

function initRendering(gl) {
    const image = new Image();
    image.onload = () => { handleAtlasLoaded(image); };
    image.src = "/font/montserrat_transparent.png";
}

function handleAtlasLoaded(image) {
    atlasData.width = image.width;
    atlasData.height = image.height;

    textAtlas = app.gl.createTexture();
    app.gl.bindTexture(app.gl.TEXTURE_2D, textAtlas);
    app.gl.texImage2D(app.gl.TEXTURE_2D, 0, app.gl.RGBA, app.gl.RGBA, app.gl.UNSIGNED_BYTE, image);
    app.gl.texParameteri(app.gl.TEXTURE_2D, app.gl.TEXTURE_MAG_FILTER, app.gl.LINEAR);
    app.gl.texParameteri(app.gl.TEXTURE_2D, app.gl.TEXTURE_MIN_FILTER, app.gl.LINEAR_MIPMAP_NEAREST);
    app.gl.generateMipmap(app.gl.TEXTURE_2D);

    renderingInitialized = true;
}


class Text {
    constructor(content, x, y, width, height, parent = undefined) {
        this._content = content;
        this._textColor = [0, 0, 0, 1];

        this._scale = height / 32;
        this.dimensions = {
            x: x, y: y,
            width: width, height: height
        }
        this._setCharVars();
        this._buildVoa();

        this._parent = parent;
    }

    setTextColor(color) {
        this._textColor = color;
    }

    _setCharVars() {
        this._vertices = [];
        this._indices = [];
        this._xOffset = 0;
        this.characterWidths = [];
    }

    _buildVoa() {
        this._ab = app.gl.createBuffer();
        this._eab = app.gl.createBuffer();

        this._setupBuffers();
        this._sendVertices();
    }

    _setupBuffers() {
        app.gl.bindBuffer(app.gl.ARRAY_BUFFER, this._ab);
        app.gl.bindBuffer(app.gl.ELEMENT_ARRAY_BUFFER, this._eab);

        app.gl.vertexAttribPointer(0, 2, app.gl.FLOAT, false, 4 * 4, 0);
        app.gl.enableVertexAttribArray(0);
        app.gl.vertexAttribPointer(1, 2, app.gl.FLOAT, false, 4 * 4, 2 * 4);
        app.gl.enableVertexAttribArray(1);
    }

    setContent(content) {
        this._content = content;
        this._setCharVars();
        
        this._setupBuffers();
        this._sendVertices();
    }

    _sendVertices() {
        [...this._content].forEach((char, index) => this._appendQuad(char, index));
        app.gl.bufferData(
            app.gl.ARRAY_BUFFER,
            new Float32Array(this._vertices),
            app.gl.DYNAMIC_DRAW
        );
        app.gl.bufferData(
            app.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this._indices),
            app.gl.DYNAMIC_DRAW
        );
    }

    _appendQuad(char, charIndex) {
        const code = char.charCodeAt(0);
        const data = textData[code];
        const baselineOffset = 10; // the font offsets things a little low
        const charTop = this.dimensions.height - (data.yoffset - baselineOffset) * this._scale;
        const charBottom = charTop - data.height * this._scale;
        const charLeft = this._xOffset;
        this._vertices.push(
            charLeft,
            charBottom,
            data.x / atlasData.width,
            (data.y + data.height) / atlasData.height
        );
        this._vertices.push(
            charLeft,
            charTop,
            data.x / atlasData.width,
            data.y / atlasData.height
        );
        this._vertices.push(
            data.width * this._scale + this._xOffset + data.xoffset * this._scale,
            charBottom,
            (data.x + data.width) / atlasData.width,
            (data.y + data.height) / atlasData.height
        );
        this._vertices.push(
            data.width * this._scale + this._xOffset + data.xoffset * this._scale,
            charTop,
            (data.x + data.width) / atlasData.width,
            data.y / atlasData.height
        );

        const nextIndex = charIndex * 4;
        this._indices.push(
            nextIndex, nextIndex + 2, nextIndex + 1,
            nextIndex + 1, nextIndex + 2, nextIndex + 3
        );

        const charWidth = data.xadvance * this._scale;
        this._xOffset += charWidth;
        this.characterWidths.push(charWidth);
    }

    render() {
        app.textureProgram.loadUniformVec4v(
            app.textureProgram.uniforms.color, this._textColor
        );
        app.textureProgram.loadUniform1i(
            app.textureProgram.uniforms.texture, 
            this._textureID
        );


        let modelViewMatrix = glMatrix.mat4.create();
        if (this._parent !== undefined) modelViewMatrix = this._parent.getModelMatrix();

        glMatrix.mat4.translate(
            modelViewMatrix, modelViewMatrix,
            [this.dimensions.x, this.dimensions.y, 0.0]
        );
        app.textureProgram.loadUniformMatrix4fv(
            app.textureProgram.uniforms.modelViewMatrix,
            modelViewMatrix
        );

        this._setupBuffers();
        app.gl.drawElements(app.gl.TRIANGLES, this._indices.length, app.gl.UNSIGNED_SHORT, 0);
        
        app.textureProgram.loadUniformMatrix4fv(
            app.textureProgram.uniforms.modelViewMatrix,
            glMatrix.mat4.create()
        );
    }
};

export { Text, initRendering, renderingInitialized };
