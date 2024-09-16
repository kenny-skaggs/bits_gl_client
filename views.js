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
        this._itemPadding = 0.3;
        this._animationTime = 0.2;

        this._textLineHeight = 20;
        this._nextLineY = this.y + this.height - this.padding.y - this._textLineHeight;
        this._initTextVisuals();
    }

    addItem(name) {
        let newIndex = 0;
        let foundPosition = false;
        while (newIndex < this._listItems.length && !foundPosition) {
            const nextItem = this._listItems[newIndex];
            foundPosition = name < nextItem.name;

            if (!foundPosition) newIndex += 1;
        }

        const itemY = this.y + this.height - this.padding.y - this._textLineHeight - (newIndex * (this._textLineHeight + this._itemPadding));
        const text = new Text(
            name,
            this.x + this.padding.x, itemY,
            this.width, this._textLineHeight
        );
        new OnetimeIncrementalAnimation(
            (percent) => text.setTextColor([0, 0, 0, percent]),
            this._animationTime
        );

        this._listItems.splice(
            newIndex,
            0,
            {
                name: name,
                visual: text
            }
        );
        for (let index = newIndex + 1; index < this._listItems.length; index++) {
            const item = this._listItems[index];

            new OnetimeIncrementalAnimation(
                (value) => item.visual.dimensions.y = value,
                this._animationTime,
                item.visual.dimensions.y,
                this.y + this.height - this.padding.y - this._textLineHeight - (index * (this._textLineHeight + this._itemPadding))
            );
        }
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
            this.width, this._textLineHeight
        );

        this._listItems.push({
            name: itemName,
            visual: text
        });
        this._nextLineY -= this._itemPadding;
    }

    render() {
        app.shaderProgram.loadUniformVec4v(
            app.shaderProgram.uniforms.color,
            this.backgroundColor
        );
        this._background.render();


        app.textureProgram.use();
        this._listItems.forEach(item => {
            item.visual.render();
        });

        app.shaderProgram.use();
    }
};



export { HomeListView };
