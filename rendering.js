import { app } from "./services";
import { tickAnimations } from "./animation";

const Renderer = {
    projectionMatrix: undefined,
    _renderableObjects: [],
    lastTime: 0,
    addRenderable(object) {
        this._renderableObjects.push(object);
    },
    startRenderLoop() {
        requestAnimationFrame((now) => this._animationCallback(now));
    },
    _animationCallback(now) {
        now *= 0.001;
        const deltaTime = now - this.lastTime;
        this.lastTime = now;

        this._renderFrame();
        tickAnimations(deltaTime);

        requestAnimationFrame((now) => this._animationCallback(now));
    },
    _renderFrame() {
        const gl = app.gl;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let projectionMatrix = glMatrix.mat4.create();
        glMatrix.mat4.ortho(
            projectionMatrix, 
            0.0, app.view.width, 
            0.0, app.view.height, 
            0.0, -100.0
        );

        app.shaderProgram.use();
        app.shaderProgram.loadUniformMatrix4fv(
            app.shaderProgram.uniforms.projectionMatrix, projectionMatrix
        );
        app.shaderProgram.loadUniformMatrix4fv(
            app.shaderProgram.uniforms.modelViewMatrix, glMatrix.mat4.create()
        );
    
        app.textureProgram.use();
        app.textureProgram.loadUniformMatrix4fv(
            app.textureProgram.uniforms.projectionMatrix, projectionMatrix
        );
        app.textureProgram.loadUniformMatrix4fv(
            app.textureProgram.uniforms.modelViewMatrix, glMatrix.mat4.create()
        );

        app.shaderProgram.use();
        this._renderableObjects.forEach(renderable => {
            renderable.render();
        });
    }
}

export { Renderer };
