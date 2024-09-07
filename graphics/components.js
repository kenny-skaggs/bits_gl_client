import { TriangleStrip } from "./primitives";

class Button {
    constructor(glContext, x, y, width, height) {
        this.triangleStrip = new TriangleStrip(
            glContext,
            [
                x        ,          y,
                x        , y + height,
                x + width,          y,
                x + width, y + height
            ]
        );
    }

    render() {
        this.triangleStrip.render();
    }
}

export { Button };
