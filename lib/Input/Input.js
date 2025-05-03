export default class Input {
    static weatherLightValues = [2, 1.2, 0.7];
    static currWeather=1;
    // pointer lock event listeners for mouse movement to look around
    static deltaX = 0;
    static deltaY = 0;


    
    constructor(canvasTag) {
        this._right = 0;
        this._left = 0;
        this._forward = 0;
        this._backward = 0;
        this._jump = 0;
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
        this._right = Math.max(Math.min(val, 1), 0)
     
    }

    static setLeft(val) {
        this._left = Math.max(Math.min(val, 1), 0)
    }
    
    static setForward(val) {
        this._forward = Math.max(Math.min(val, 1), 0)
    }
    
    static setBackward(val) {
        this._backward = Math.max(Math.min(val, 1), 0)
    }
    
    static setJump(val) {
        this._jump -= Math.max(Math.min(val, 1), 0)
    }

    static setBreak(val) {
        this._break = Math.max(Math.min(val, 1), 0)
    }

    static setWeather(val) {
        this._weather = Math.max(Math.min(val, 1), 0)
    }

    // Convenient getters for general movement types
    static getMovement() {
        return [this._right - this._left, this._forward - this._backward];
    }

    static getJump() {
        return this._jump;
    }

    static getBreak() {
        return this._break;
    }

    static getWeather(tracerObj, directionalLight) {
       
        directionalLight._intensity[0]= Input.weatherLightValues[Input.currWeather]
        directionalLight._intensity[1]= Input.weatherLightValues[Input.currWeather]
        directionalLight._intensity[2]= Input.weatherLightValues[Input.currWeather]
          
        Input.currWeather = (Input.currWeather + 1) %3; // cycle through values
        tracerObj.updateLight(directionalLight);


        // return this._weather;
    }

    updatePosition(e) {
        // const sensitivity = 0.05; // tune this based on feel
        if (Input.deltaX == e.movementX) {
            Input.deltaX = 0;
        }
        else{
            Input.deltaX = e.movementX;
        }
        if (Input.deltaY == e.movementY) {
            Input.deltaY = 0;
        }
        else{
            Input.deltaY = e.movementY;
        }
        console.log(e.movementX);
        console.log(e.movementY);

    }

    lockChangeAlert() {

        console.log("lockChangeAlert");
        if (document.pointerLockElement === Input.canvasTag) {
          console.log("The pointer lock status is now locked");
        //   document.addEventListener("mousemove", this.updatePosition);
        } else {
          console.log("The pointer lock status is now unlocked");
        //   document.removeEventListener("mousemove", this.updatePosition);
        }
      }

    static getMouseMovement(){
        return [Input.deltaX, Input.deltaY];
    }
      
    
}