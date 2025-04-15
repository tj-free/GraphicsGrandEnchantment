import PerlinNoise from "../Math/Noises.js"


export default class FogData {
    constructor() {
        this._dims = [64, 64, 64]; // the dimension is 64x64x64
        this._sizes = [2, 2, 2];      // the voxel size is 2x2x2
    }


    async init() {
        this._perlinNoise = new PerlinNoise(); // create an object for generating perline noise
        this._data = Array(this._dims[0] * this._dims[1] * this._dims[2]).fill(0); // init values to 0s
        // Then fill it the volume data with noise
        for (let z = 0; z < this._dims[2]; ++z) {
            for (let y = 0; y < this._dims[1]; ++y) {
                for (let x = 0; x < this._dims[0]; ++x) {
                    let noise = (this._perlinNoise.noise3d(x, y, z) + 2) / 4; // remap to [0, 1]
                    this._data[z * (this._dims[0] * this._dims[1]) + y * this._dims[0] + x] = noise;
                }
            }
        }
    }
}


