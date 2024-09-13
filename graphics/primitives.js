import { app } from "../services";


export class TriangleStrip {
    constructor(coords) {
        this._valuesPerVertex = 2;
        this._vertexCount = coords.length / this._valuesPerVertex;

        this.vao = this._init_vao(coords);
    }

    _init_vao(coords) {
        const gl = app.gl;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        const arrayBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, this._valuesPerVertex, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(null);

        gl.bindVertexArray(null);
        return vao;
    }

    render = () => {
        app.gl.bindVertexArray(this.vao);
        app.gl.drawArrays(app.gl.TRIANGLE_STRIP, 0, this._vertexCount);
        app.gl.bindVertexArray(null);
    }
}
