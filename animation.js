
let registeredAnimations = [];


class LoopingAnimation {
    constructor(animationStates) {
        this._animationTime = 0;
        this._animationStates = animationStates;
        this._currentStateIndex = 0;

        addAnimation(this);
        this._callCurrentState();
    }

    tick(deltaTime) {
        this._animationTime += deltaTime;
        let currentState = this._animationStates[this._currentStateIndex];
        let currentHoldTime = currentState[1];

        if (this._animationTime >= currentHoldTime) {
            this._animationTime = 0;
            this._incrementStateIndex();
            this._callCurrentState();
        }
    }

    _incrementStateIndex() {
        this._currentStateIndex += 1;
        if (this._currentStateIndex >= this._animationStates.length) {
            this._currentStateIndex = 0;
        }
    }

    _callCurrentState() {
        const currentState = this._animationStates[this._currentStateIndex];
        const animationCallback = currentState[0];
        animationCallback();
    }
};


class OnetimeIncrementalAnimation {
    constructor(callback, timespan) {
        this._animationTime = 0;
        this._timespan = timespan;
        this._callback = callback;
        addAnimation(this);

        this._callback(0);
    }

    tick(deltaTime) {
        this._animationTime += deltaTime;
        const percentTime = this._animationTime / this._timespan;
        if (percentTime >= 1.0) {
            this._callback(1.0);
            removeAnimation(this);
        } else {
            this._callback(percentTime);
        }
    }
}


function addAnimation(animation) {
    registeredAnimations.push(animation);
    console.log("added animation, have " + registeredAnimations.length);
}

function removeAnimation(animation) {
    registeredAnimations = registeredAnimations.filter((a) => a !== animation);
    console.log("removed animation, have " + registeredAnimations.length);
}

function tickAnimations(deltaTime) {
    registeredAnimations.forEach(animation => {
        animation.tick(deltaTime);
    });
}


export { LoopingAnimation, OnetimeIncrementalAnimation, tickAnimations };
