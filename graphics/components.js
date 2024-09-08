import { InputManager } from "../services";
import { TriangleStrip } from "./primitives";

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

export { Button };
