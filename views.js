import { OnetimeIncrementalAnimation } from "./animation";
import { TriangleStrip } from "./graphics/primitives";
import { Button } from "./graphics/components";
import { Text } from "./graphics/text";
import { app } from "./services";
import { Item, OrderedItemList } from "./utilities";

class HomeListView {
    constructor(x, y, width, height) {
        this._background = new TriangleStrip([
            x        ,          y,
            x        , y + height,
            x + width,          y,
            x + width, y + height
        ]);
        this.backgroundColor = [0, 0.2, 0.4, 1];
        this.textColor = [0, 0, 0];
        this.padding = {
            x: 10, y: 20
        };
        this.x = x; this.y = y;
        this.width = width; this.height = height;

        this._orderedItems = new OrderedItemList([]);
        this._itemGraphicMap = {};
        this._itemPadding = 0.3;
        this._animationTime = 0.2;

        this._textLineHeight = 32;
        this._nextLineY = this.y + this.height - this.padding.y - this._textLineHeight;
    }

    addItem(item) {
        console.log('adding ', item);
        this._orderedItems.addItem(item);

        const newIndex = this._orderedItems.itemIndexMap[item.id];
        const itemY = this.y + this.height - this.padding.y - this._textLineHeight - (newIndex * (this._textLineHeight + this._itemPadding));
        const text = new Text(
            item.name,
            this.x + this.padding.x, itemY,
            this.width, this._textLineHeight
        );
        new OnetimeIncrementalAnimation(
            (percent) => text.setTextColor([...this.textColor, percent]),
            this._animationTime
        );
        this._itemGraphicMap[item.id] = text;

        for (let index = newIndex + 1; index < this._orderedItems.items.length; index++) {
            const item = this._orderedItems.items[index];
            const visual = this._itemGraphicMap[item.id];

            new OnetimeIncrementalAnimation(
                (value) => visual.dimensions.y = value,
                this._animationTime,
                visual.dimensions.y,
                this.y + this.height - this.padding.y - this._textLineHeight - (index * (this._textLineHeight + this._itemPadding))
            );
        }
    }

    render() {
        app.shaderProgram.loadUniformVec4v(
            app.shaderProgram.uniforms.color,
            this.backgroundColor
        );
        this._background.render();


        app.textureProgram.use();
        this._orderedItems.items.forEach(item => {
            const visual = this._itemGraphicMap[item.id];
            visual.render();
        });

        app.shaderProgram.use();
    }
};

class SearchResultsView {
    constructor(x, y, width, height) {
        this._background = new TriangleStrip([
                0,      0,
                0, height,
            width,      0,
            width, height
        ]);
        this.backgroundColor = [0.4, 0, 0.7, 1];
        this.padding = {
            x: 5, y: 10
        };
        this.x = x; this.y = y;
        this.width = width; this.height = height;

        this._listItems = [];
        this._itemPadding = 5;
        this._textLineHeight = 18;
        this._animationTime = 0.2;

        this._modelMatrix = glMatrix.mat4.create();
        this._textVisuals = [];

        this._showResults = false;
        this._exiting = false;
    }

    showResults(results) {
        this._listItems = results;
        this._resetTextVisuals();

        if (this._showResults) return;

        this._showResults = true;
        new OnetimeIncrementalAnimation(
            (newY) => this._setAnimationPosition(newY),
            0.1,
            this.y - this.height,
            this.y
        );
    }

    hideResults() {
        if (!this._showResults || this._exiting) return;

        this._exiting = true;
        new OnetimeIncrementalAnimation(
            (newY) => this._setAnimationPosition(newY),
            0.1,
            this.y,
            this.y - this.height,
            () => {
                this._exiting = false;
                this._showResults = false;
                this._destroyResultDisplays();
            }
        );
    }

    _setAnimationPosition(newY) {
        glMatrix.mat4.translate(this._modelMatrix, glMatrix.mat4.create(), [this.x, newY, 0]);
    }

    _resetTextVisuals() {
        this._destroyResultDisplays();

        let itemY = this.height - this.padding.y - this._textLineHeight;
        this._listItems.forEach((item) => {
            let button = new Button(
                this.padding.x, itemY,
                this.width - 2 * this.padding.x, this._textLineHeight,
                item.name, this
            );
            button.backgroundColor = [0.4, 0, 0.7, 1];
            button.hoveredColor = [0.4, 0, 0.9, 1];
            button.onClick = () => this.onItemSelected(item);
            this._textVisuals.push(button);
            // this._textVisuals.push(
            //     new Text(
            //         item.name,
            //         this.x + this.padding.x, itemY,
            //         this.width, this._textLineHeight,
            //         this
            //     )
            // );
            itemY -= this._textLineHeight + this._itemPadding;
        });
    }
    
    _destroyResultDisplays() {
        this._textVisuals.forEach((button) => {
            button.destroy();
        });
        this._textVisuals = [];
    }

    getModelMatrix() {
        const response = glMatrix.mat4.create();
        glMatrix.mat4.copy(response, this._modelMatrix);
        return response;
    }

    getPosition() {
        return {x: this.x, y: this.y};
    }

    render() {
        if (!this._showResults) return;

        app.shaderProgram.loadUniformVec4v(
            app.shaderProgram.uniforms.color,
            this.backgroundColor
        );
        app.shaderProgram.loadUniformMatrix4fv(
            app.shaderProgram.uniforms.modelViewMatrix, this._modelMatrix
        );
        this._background.render();

        /* todo:
            use model matrix to position child elements (background and text)
            update model matrix when animating (when sliding up and down)
            maybe maintain "sliding" visibility by only display text that would
                be visible (is far enough up) (rather than shrinking/expanding the
                whole panel)
        */

        this._textVisuals.forEach((text) => text.render());


        app.shaderProgram.loadUniformMatrix4fv(
            app.shaderProgram.uniforms.modelViewMatrix, glMatrix.mat4.create()
        );
    }
}


export { HomeListView, SearchResultsView };
