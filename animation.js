
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
    constructor(callback, timespan, startValue = 0, endValue = 1, onComplete = undefined) {
        this._animationTime = 0;
        this._timespan = timespan;
        this._callback = callback;
        this._start = startValue;
        this._end = endValue;
        this._valueRange = (this._end - this._start);
        addAnimation(this);

        this._callback(this._start);

        this._onComplete = onComplete;
    }

    tick(deltaTime) {
        this._animationTime += deltaTime;
        const percentTime = this._animationTime / this._timespan;
        const newValue = this._start + (percentTime * this._valueRange);
        if (percentTime >= 1.0) {
            this._callback(this._end);
            if (this._onComplete !== undefined) this._onComplete();
            removeAnimation(this);
        } else {
            this._callback(newValue);
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
