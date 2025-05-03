import PerlinNoise from "../Math/Noises.js"


export default class TerrainData {
    constructor() {
        this._dims = [256,256,256];
        // this._dims = [4,4,4];
        this._sizes = [1,1,1];
    }


    async init() {
        this._perlinNoise = new PerlinNoise(); // create an object for generating perline noise
        this._data = Array(this._dims[0] * this._dims[1] * this._dims[2] * 64).fill(0); // init values to 0s
        for (let x = 0; x < this._dims[0]; ++x) {
            for (let z = 0; z < this._dims[2]; ++z) {
                let noise = (this._perlinNoise.octaveNoise2d(x, z, 0.001, 1, 0.99, 5, 1.9) + 2) / 4; // remap to [0, 1]

                let height = noise * this._dims[1]
                
                for (let y = 0; y < this._dims[1]; ++y) {
                    let index = (z * (this._dims[0] * this._dims[1]) + (this._dims[1] - y - 1) * this._dims[0] + x) * 64;
                    
                    if (y < height) {
                        this._data[index] = (this._dims[1] - y - 1);
                    }
                    for (var i = 2; i < 64; i++) {
                        this._data[index + i] = -1; 
                    }
                    
                    /*for (var i = 0; i < 64; ++i) {
                        this._data[index + i] = 2;
                    }*/
                }
               
            }
        }
    }
}
