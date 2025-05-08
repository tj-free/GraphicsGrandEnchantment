export default class Input {
    static weatherLightValues = [2, 1.2, 0.7];
    static currWeather = 1;
    // pointer lock event listeners for mouse movement to look around
    static deltaX = 0;
    static deltaY = 0;
    static right = 0;
    static left = 0;
    static forward = 0;
    static backward = 0;
    static jump = 0;
    static break = 0;
    static weather = 0;



    constructor(canvasTag) {
        this._break = 0;
        this._weather = 0;
        document.addEventListener("pointerlockchange", this.lockChangeAlert, false);
        // this._canvasTag = document.getElementById("canvas");
        this._canvasTag = canvasTag;
        this._timer = 0;
        const delay = 200; // Delay in milliseconds


    }


    // Convenient setters for general movement types
    static setRight(val) {
        Input.right = Math.max(Math.min(val, 1), 0)

    }

    static setLeft(val) {
        Input.left = Math.max(Math.min(val, 1), 0)
    }

    static setForward(val) {
        Input.forward = Math.max(Math.min(val, 1), 0)
    }

    static setBackward(val) {
        Input.backward = Math.max(Math.min(val, 1), 0)
    }

    static setJump(val) {
        Input.jump = Math.max(Math.min(val, 1), 0)
    }

    static setBreak(val) {
        this._break = Math.max(Math.min(val, 1), 0)
    }

    static setWeather(val) {
        this._weather = Math.max(Math.min(val, 1), 0)
    }

    static normalizeVec2(vec2) {
        var len = Math.sqrt(Math.pow(vec2[0], 2) + Math.pow(vec2[1], 2))
        if (len == 0) {
            return [0, 0]
        }
        return [vec2[0] / len, vec2[1] / len]
    }

    // Convenient getters for general movement types
    static getMovement() {
        return Input.normalizeVec2([Input.right - Input.left, Input.forward - Input.backward]);
    }

    static getJump() {
        return Input.jump;
    }

    static getBreak() {
        return this._break;
    }

    static getWeather(tracerObj, directionalLight) {

        directionalLight._intensity[0] = Input.weatherLightValues[Input.currWeather]
        directionalLight._intensity[1] = Input.weatherLightValues[Input.currWeather]
        directionalLight._intensity[2] = Input.weatherLightValues[Input.currWeather]

        Input.currWeather = (Input.currWeather + 1) % 3; // cycle through values
        tracerObj.updateLight(directionalLight);


        // return this._weather;
    }

    updatePosition(e) {
        // const sensitivity = 0.05; // tune this based on feel
        if (Input.deltaX == e.movementX) {
            Input.deltaX = 0;
        }
        else {
            Input.deltaX = e.movementX;
        }
        if (Input.deltaY == e.movementY) {
            Input.deltaY = 0;
        }
        else {
            Input.deltaY = e.movementY;
        }

    }

    lockChangeAlert() {
        if (document.pointerLockElement === Input.canvasTag) {
              document.addEventListener("mousemove", this.updatePosition);
        } else {
              document.removeEventListener("mousemove", this.updatePosition);
        }
    }

    static getMouseMovement() {
        return [Input.deltaX, Input.deltaY];
    }


}