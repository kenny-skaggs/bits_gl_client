import { OnetimeIncrementalAnimation } from "./animation";
import { TriangleStrip } from "./graphics/primitives";
import { Text } from "./graphics/text";
import { app } from "./services";

class HomeListView {
    constructor(x, y, width, height) {
        this._background = new TriangleStrip([
            x        ,          y,
            x        , y + height,
            x + width,          y,
            x + width, y + height
        ]);
        this.backgroundColor = [0, 0.8, 0.8, 1];
        this.padding = {
            x: 0.1, y: 0.15
        };
        this.x = x; this.y = y;
        this.width = width; this.height = height;

        this._listItems = [];
        this._textVisuals = [];
        this._itemPadding = 0.3;

        this._nextLineY = this.y + this.height - this.padding.y - 0.4;
        this._initTextVisuals();
    }

    addItem(name) {
        this._listItems.push(name);
        this._generateNewTextVisual(name);
    }

    _initTextVisuals() {
        this._textVisuals = [];
        // todo: release gl buffers

        this._listItems.forEach((item) => this._generateNewTextVisual(item));
    }

    _generateNewTextVisual(itemName) {
        const text = new Text(
            itemName,
            this.x + this.padding.x, this._nextLineY,
            this.width, 0.4
        );
        new OnetimeIncrementalAnimation(
            (percent) => text.setTextColor([0, 0, 0, percent]),
            0.2
        );
        this._textVisuals.push(text);
        this._nextLineY -= this._itemPadding;
    }

    render() {
        app.shaderProgram.loadUniformVec4v(
            app.shaderProgram.uniforms.color,
            this.backgroundColor
        );
        this._background.render();


        app.textureProgram.use();
        this._textVisuals.forEach(text => {
            text.render();
        });

        app.shaderProgram.use();
    }
};

export { HomeListView };
