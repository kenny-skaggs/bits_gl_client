import { InputManager } from "../services";
import { TriangleStrip } from "./primitives";
import { Text } from "./text";

class Button {
    constructor(glContext, x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = [1.0, 0.0, 0.0, 1.0];
        this.onClick = undefined;

        this.triangleStrip = new TriangleStrip(
            glContext,
            [
                x        ,          y,
                x        , y + height,
                x + width,          y,
                x + width, y + height
            ]
        );

        InputManager.getInstance().addMouseMoveListeners(this);
        InputManager.getInstance().addMouseClickListeners(this);
    }

    render(app) {
        app.shaderProgram.loadUniformVec4v(app.shaderProgram.uniforms.color, this.color);
        this.triangleStrip.render();
    }

    containsPoint(x, y) {
        return (
               x > this.x && x < this.x + this.width
            && y > this.y && y < this.y + this.height
        );
    }

    setIsHovered(isHovered) {
        if (isHovered)  this.color = [0.0, 0.5, 0.7, 1.0];
        else            this.color = [0.0, 0.5, 0.5, 1.0];
    }

    onMouseMove(x, y) {
        this.setIsHovered(this.containsPoint(x, y));
    }

    onMouseClick(x, y) {
        if (this.onClick === undefined) return;

        if (this.containsPoint(x, y)) {
            this.onClick();
        }
    }
}

class TextInput {
    constructor(gl, x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.backgroundColor = [1.0, 1.0, 1.0, 1.0];
        this.textColor = [0.2, 0.2, 0.2, 1.0];
        this.value = "a";

        this._textVisual = new Text(this.value, gl, x + 0.1, y + 0.15, width, height / 1.4);
        this._backgroundVisual = new TriangleStrip(
            gl,
            [
                x        ,          y,
                x        , y + height,
                x + width,          y,
                x + width, y + height
            ]
        );
    }

    render(app) {
        app.shaderProgram.loadUniformVec4v(app.shaderProgram.uniforms.color, this.backgroundColor);
        this._backgroundVisual.render();

        app.textureProgram.use();
        app.textureProgram.loadUniformVec4v(app.textureProgram.uniforms.color, this.textColor);
        this._textVisual.render(app.glContext, app.textureProgram);

        app.shaderProgram.use();
    }
}

export { Button, TextInput };
