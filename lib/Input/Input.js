export default class Input {
    constructor() {
        this._right = 0;
        this._left = 0;
        this._forward = 0;
        this._backward = 0;
        this._jump = 0;
        this._break = 0;
        this._weather = 0;
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

    static getWeather() {
        return this._weather;
    }
}