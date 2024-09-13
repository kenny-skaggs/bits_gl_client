
const InputManager = {
    init(appWidth, appHeight, canvasLeft, canvasTop, canvasWidth, canvasHeight) {
        this._appWidth = appWidth;
        this._appHeight = appHeight;
        this._canvasLeft = canvasLeft;
        this._canvasTop = canvasTop;
        this._canvasWidth = canvasWidth;
        this._canvasHeight = canvasHeight;
        
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
    addKeydownListener(listener) {
        this._keydownListeners.push(listener);
    },
    _convertCoord(eventX, eventY) {
        const instance = InputManager.getInstance();
        const relativeX = eventX - instance._canvasLeft;
        const relativeY = eventY - instance._canvasTop;
    
        const projectedX = instance._appWidth * (relativeX / instance._canvasWidth);
        const projectedY = instance._appHeight - instance._appHeight * (relativeY / instance._canvasHeight);
    
        return {
            x: projectedX,
            y: projectedY
        };
    }
}

const app = {
    gl: undefined,
    shaderProgram: undefined,
    textureProgram: undefined,
};

export { InputManager, app };
