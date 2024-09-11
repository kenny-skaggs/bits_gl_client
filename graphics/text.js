import { textData } from "../font/montserrat";


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
        // this._textureID = this._buildTexture(glContext);
        this._scale = height / 32;
        this._voa = this._buildVoa(glContext, x, y, width, height);
    }

    // _buildTexture(glContext) {
    //     const canvas = renderContext.canvas;
    //     // canvas.width = 200;
    //     // canvas.height = 26;

    //     renderContext.font = "50px monospace";
    //     renderContext.textAlign = "center";
    //     renderContext.textBaseline = "middle";
    //     renderContext.fillStyle = "black";
    //     renderContext.clearRect(0, 0, canvas.width, canvas.height);
    //     renderContext.fillText(this._content, canvas.width / 2, canvas.height / 2);
        
    //     const glTex = glContext.createTexture();
    //     glContext.bindTexture(glContext.TEXTURE_2D, glTex);
    //     glContext.texImage2D(
    //         glContext.TEXTURE_2D, 0, glContext.RGBA, glContext.RGBA,
    //         glContext.UNSIGNED_BYTE, canvas
    //     );

    //     console.log(canvas.width, canvas.height);
        
    //     return glTex;
    // }

    _buildVoa(gl, x, y, width, height) {
        const voa = gl.createVertexArray();
        gl.bindVertexArray(voa);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        const coords = [];
        /*

                    x,          y, 0 , 0.27,
                    x, y + height, 0, 0.15,
            x + width,          y, 0.06, 0.27,
            x + width, y + height, 0.06, 0.15
        
        */
        let xOffset = 0;
        [...this._content].forEach(char => {
            const code = char.charCodeAt(0);
            const data = textData[code];
            coords.push(                             x + xOffset + data.xoffset * this._scale,                                       y,                  data.x / atlasData.width,   (data.y + data.height) / atlasData.height);
            coords.push(                             x + xOffset + data.xoffset * this._scale, y + height - data.yoffset * this._scale,                  data.x / atlasData.width,                   data.y / atlasData.height);
            coords.push(  data.width * this._scale + x + xOffset + data.xoffset * this._scale,                                       y,   (data.x + data.width) / atlasData.width,   (data.y + data.height) / atlasData.height);
            coords.push(  data.width * this._scale + x + xOffset + data.xoffset * this._scale, y + height - data.yoffset * this._scale,   (data.x + data.width) / atlasData.width,                   data.y / atlasData.height);

            xOffset += data.xadvance * this._scale;
        });
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);

        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 4 * 4, 0);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
        gl.enableVertexAttribArray(1);

        return voa;
    }

    render(gl, textShader) {
        textShader.loadUniform1i(textShader.uniforms.texture, this._textureID);

        gl.bindVertexArray(this._voa);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4 * this._content.length);
    }
};

export { Text, initRendering, renderingInitialized };
