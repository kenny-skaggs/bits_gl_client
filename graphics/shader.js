
class ShaderProgram {
    constructor(glContext, vertexSource, fragmentSource, uniforms) {
        this.glContext = glContext;

        const vertexShader = this._loadShader(glContext, glContext.VERTEX_SHADER, vertexSource);
        const fragmentShader = this._loadShader(glContext, glContext.FRAGMENT_SHADER, fragmentSource);

        this.glProgram = glContext.createProgram();
        glContext.attachShader(this.glProgram, vertexShader);
        glContext.attachShader(this.glProgram, fragmentShader);
        glContext.linkProgram(this.glProgram);

        if (!glContext.getProgramParameter(this.glProgram, glContext.LINK_STATUS)) {
            alert("error linking shader program");
            console.log(glContext.getProgramInfoLog(this.glProgram));
        }

        this.uniforms = {}
        uniforms.forEach(uniformName => {
            const shaderName = `u${uniformName.charAt(0).toUpperCase()}${uniformName.slice(1)}`;
            this.uniforms[uniformName] = glContext.getUniformLocation(this.glProgram, shaderName);
        });
    }

    _loadShader(glContext, type, source) {
        const shader = glContext.createShader(type);
        glContext.shaderSource(shader, source);
        glContext.compileShader(shader);

        if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
            alert("error compiling shader!");
            console.log(glContext.getShaderInfoLog(shader));
            glContext.deleteShader(shader);
        }

        return shader;
    }

    use() {
        this.glContext.useProgram(this.glProgram);
    }

    loadUniformMatrix4fv(uniformLocation, value) {
        this.glContext.uniformMatrix4fv(uniformLocation, false, value);
    }

    loadUniformVec4v(uniformLocation, value) {
        this.glContext.uniform4fv(uniformLocation, value);
    }

    loadUniform1i(uniformLocation, value) {
        this.glContext.uniform1i(uniformLocation, value);
    }
}

export { ShaderProgram };
