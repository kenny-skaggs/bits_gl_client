import { InputManager } from "../services";
import { TriangleStrip } from "./primitives";
import { Text } from "./text";
import { LoopingAnimation } from "../animation";
import { app } from "../services";

class Button {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = [1.0, 0.0, 0.0, 1.0];
        this.onClick = undefined;

        this.triangleStrip = new TriangleStrip([
            x        ,          y,
            x        , y + height,
            x + width,          y,
            x + width, y + height
        ]);

        InputManager.getInstance().addMouseMoveListeners(this);
        InputManager.getInstance().addMouseClickListeners(this);
    }

    render() {
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
        this.cursorColor = [0.0, 0.0, 0.0, 1.0];
        this.value = "ou";
        this.padding = {
            x: 0.1, y: 0.15
        };
        this.onSubmit = undefined;

        this._textVisual = new Text(
            this.value,
            x + this.padding.x, y + this.padding.y,
            width, height / 1.4
        );
        this._backgroundVisual = new TriangleStrip([
            0    ,      0,
            0    , height,
            width,      0,
            width, height
        ]);

        let cursorWidth = 0.05;
        let cursory = this.padding.y, cursorHeight = height - this.padding.y * 2;
        this._cursorVisual = new TriangleStrip([
            0,           cursory,
            0,           cursory + cursorHeight,
            cursorWidth, cursory,
            cursorWidth, cursory + cursorHeight
        ]);
        this._cursorIndex = this.value.length;
        this._cursorPaddingX = 0.06;
        this._cursorOffsetX = this._findCursorOffsetX();

        this._modelMatrix = glMatrix.mat4.create();
        glMatrix.mat4.translate(this._modelMatrix, this._modelMatrix, [x, y, 0.0]);

        InputManager.getInstance().addKeydownListener(this);

        this._displayCursor = false;
        this._cursorAnimation = new LoopingAnimation([
            [() => this._displayCursor = true, 0.8],
            [() => this._displayCursor = false, 0.8],
        ]);
    }

    _findCursorOffsetX() {
        let offset = 0;
        for (let index = 0; index < this._cursorIndex; index++) {
            offset += this._textVisual.characterWidths[index];
        }
        return offset + this.padding.x + this._cursorPaddingX;
    }

    getValue() {
        return this.value;
    }

    setValue(value) {
        this.value = value;
        this._textVisual.setContent(this.value);
        this._cursorIndex = this.value.length;
        this._cursorOffsetX = this._findCursorOffsetX();
    }

    render() {
        app.shaderProgram.loadUniformMatrix4fv(
            app.shaderProgram.uniforms.modelViewMatrix,
            this._modelMatrix
        );

        app.shaderProgram.loadUniformVec4v(app.shaderProgram.uniforms.color, this.backgroundColor);
        this._backgroundVisual.render();

        app.textureProgram.use();
        app.textureProgram.loadUniformVec4v(app.textureProgram.uniforms.color, this.textColor);
        this._textVisual.render();

        app.shaderProgram.use();

        if (this._displayCursor) {
            let cursorMatrix = glMatrix.mat4.create();
            glMatrix.mat4.translate(cursorMatrix, this._modelMatrix, [this._cursorOffsetX, 0, 0]);
            app.shaderProgram.loadUniformMatrix4fv(
                app.shaderProgram.uniforms.modelViewMatrix,
                cursorMatrix
            );
            app.shaderProgram.loadUniformVec4v(app.shaderProgram.uniforms.color, this.cursorColor);
            this._cursorVisual.render();
        }

        app.shaderProgram.loadUniformMatrix4fv(
            app.shaderProgram.uniforms.modelViewMatrix,
            glMatrix.mat4.create()
        );  // reset the model matrix until all that's refactored
    }

    onKeydown(char, keycode) {
        let didUpdateDisplay = false;
        if (keycode == 8) {  // backspace
            if (this._cursorIndex == 0) return;

            this.value = (
                this.value.substring(0, this._cursorIndex - 1)
                + this.value.substring(this._cursorIndex, this.value.length)
            );
            this._textVisual.setContent(this.value);
            this._cursorIndex -= 1;
            this._cursorOffsetX = this._findCursorOffsetX();

            didUpdateDisplay = true;
        } else if (keycode == 13) {
            if (this.onSubmit !== undefined) this.onSubmit();
        } else if (keycode < 32 || keycode > 126) {
            return;
        } else if (keycode == 37) {  // left arrow
            if (this._cursorIndex > 0) {
                this._cursorIndex -= 1;
                this._cursorOffsetX = this._findCursorOffsetX();
            }

            didUpdateDisplay = true;
        } else if (keycode == 39) {  // right arrow
            if (this._cursorIndex < this.value.length) {
                this._cursorIndex += 1;
                this._cursorOffsetX = this._findCursorOffsetX();
            }

            didUpdateDisplay = true;
        } else {
            this.value = (
                this.value.substring(0, this._cursorIndex)
                + char
                + this.value.substring(this._cursorIndex, this.value.length)
            );
            this._textVisual.setContent(this.value);
            this._cursorIndex += 1;
            this._cursorOffsetX = this._findCursorOffsetX();

            didUpdateDisplay = true;
        }

        if (didUpdateDisplay) this._displayCursor = true;
    }
}

export { Button, TextInput };
