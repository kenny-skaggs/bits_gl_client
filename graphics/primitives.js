

export class TriangleStrip {
    constructor(glContext, coords) {
        this.glContext = glContext;
        this._valuesPerVertex = 2;
        this._vertexCount = coords.length / this._valuesPerVertex;

        this.arrayBuffer = null;
        this._init_buffer(coords);
    }

    _init_buffer(coords) {
        const gl = this.glContext;
        this.arrayBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.arrayBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, this._valuesPerVertex, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
    }

    render = () => {
        this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this.arrayBuffer);
        this.glContext.drawArrays(this.glContext.TRIANGLE_STRIP, 0, this._vertexCount);
    }
}
