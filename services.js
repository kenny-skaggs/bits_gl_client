
const InputManager = {
    init() {
        document.addEventListener("mousemove", this._mouseMoveHandler, false);
        this._mouseMoveListeners = [];

        document.addEventListener("click", this._mouseClickHandler, false);
        this._mouseClickListeners = [];

        document.addEventListener("keydown", this._keydownHandler, false);
        this._keydownListeners = [];

        InputManager._instance = this;
    },
    getInstance() {
        return InputManager._instance;
    },
    _mouseMoveHandler(event) {
        const instance = InputManager.getInstance();
        const coords = instance._convertCoord(event.clientX, event.clientY);

        instance._mouseMoveListeners.forEach(listener => {
            listener.onMouseMove(coords.x, coords.y);
        });
    },
    _mouseClickHandler(event) {
        const instance = InputManager.getInstance();
        const coords = instance._convertCoord(event.clientX, event.clientY);
        instance._mouseClickListeners.forEach(listener => {
            listener.onMouseClick(coords.x, coords.y);
        });
    },
    _keydownHandler(event) {
        event.stopPropagation();
        event.preventDefault();

        if (event.key === "r" && event.ctrlKey) location.reload();

        const instance = InputManager.getInstance();
        instance._keydownListeners.forEach(listener => {
            listener.onKeydown(event.key, event.keyCode);
        });
    },
    addMouseMoveListeners(listener) {
        this._mouseMoveListeners.push(listener);
    },
    addMouseClickListeners(listener) {
        this._mouseClickListeners.push(listener);
    },
    removeClickListener(listener) {
        this._mouseClickListeners = this._mouseClickListeners.filter((l) => l !== listener);
    },
    addKeydownListener(listener) {
        this._keydownListeners.push(listener);
    },
    _convertCoord(eventX, eventY) {

        app.view.width, app.view.height,
        app.canvas.offsetLeft, app.canvas.offsetTop,
        app.canvas.width, app.canvas.height

        const instance = InputManager.getInstance();
        const relativeX = eventX - app.canvas.offsetLeft;
        const relativeY = eventY - app.canvas.offsetTop;
    
        const projectedX = app.view.width * (relativeX / app.canvas.width);
        const projectedY = app.view.height - app.view.height * (relativeY / app.canvas.height);
    
        return {
            x: projectedX,
            y: projectedY
        };
    }
}

const app = {
    gl: undefined,
    view: {
        width: 10.0,
        height: 10.0
    },
    canvas: undefined,
    shaderProgram: undefined,
    textureProgram: undefined
};


const allItems = [
    { id: 2000, name: "butternut squash" },
    { id: 2001, name: "vital wheat gluten" },
    { id: 2002, name: "agar" },
    { id: 2003, name: "navy beans" },
    { id: 2004, name: "soy sauce" },
    { id: 2005, name: "coffee candy" },
    { id: 2006, name: "dish soap" }
];

const Server = {
    search(text) {
        const promise = new Promise((resolve) => {
            const results = allItems.filter((item) => item.name.includes(text));

            setTimeout(() => {
                resolve(results);
            }, 1000);
        });
        
        return promise;
    }
}

export { InputManager, app, Server };
