
class Item {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
};

class OrderedItemList {
    constructor(items) {
        this.items = items;
        this._recalculateItemIndexMap;
    }

    addItem(item) {
        let newIndex = 0;
        let foundPlacement = false;
        while (newIndex < this.items.length && !foundPlacement) {
            const nextItem = this.items[newIndex];
            foundPlacement = item.name < nextItem.name;

            if (!foundPlacement) newIndex += 1;
        }

        this.items.splice(newIndex, 0, item);
        this._recalculateItemIndexMap();
    }

    removeItem(itemId) {
        
    }

    _recalculateItemIndexMap() {
        this.itemIndexMap = {};
        this.items.forEach((item, index) => this.itemIndexMap[item.id] = index);
    }
};


export { Item, OrderedItemList };
