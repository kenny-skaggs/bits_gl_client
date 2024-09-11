

export class TriangleStrip {
    constructor(glContext, coords) {
        this.glContext = glContext;
        this._valuesPerVertex = 2;
        this._vertexCount = coords.length / this._valuesPerVertex;

        this.vao = this._init_vao(coords);
    }

    _init_vao(coords) {
        const gl = this.glContext;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        const arrayBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, this._valuesPerVertex, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        return vao;
    }

    render = () => {
        this.glContext.bindVertexArray(this.vao);
        this.glContext.drawArrays(this.glContext.TRIANGLE_STRIP, 0, this._vertexCount);
    }
}
