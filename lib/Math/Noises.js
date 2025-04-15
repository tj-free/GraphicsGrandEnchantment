/*!
 * Copyright (c) 2025 SingChun LEE @ Bucknell University. CC BY-NC 4.0.
 *
 * This code is provided mainly for educational purposes at Bucknell University.
 *
 * This code is licensed under the Creative Commons Attribution-NonCommerical 4.0
 * International License. To view a copy of the license, visit
 *   https://creativecommons.org/licenses/by-nc/4.0/
 * or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
 *
 * You are free to:
 *  - Share: copy and redistribute the material in any medium or format.
 *  - Adapt: remix, transform, and build upon the material.
 *
 * Under the following terms:
 *  - Attribution: You must give appropriate credit, provide a link to the license,
 *                 and indicate if changes where made.
 *  - NonCommerical: You may not use the material for commerical purposes.
 *  - No additional restrictions: You may not apply legal terms or technological
 *                                measures that legally restrict others from doing
 *                                anything the license permits.
 */
 
export default class PerlinNoise {
  constructor() {
    // ref: https://en.wikipedia.org/wiki/Perlin_noise
    // implementation ref: // ref: https://mrl.cs.nyu.edu/~perlin/noise/
    // Perlin Noise depends on a gradient permutation table
    this.gradientPermutation();
  }
 
  // a function to generate the gradient permutation table
  gradientPermutation() {
    // ref: https://en.wikipedia.org/wiki/Perlin_noise
    // instead of a hard-coded table, we generate one
    // we can regenerate it if needed
    // first, we start with an array of [0, 1, 2, ..., 255]
    this._permutation = Array.from( {length: 256}, (_, i) => i );
    // then, we shuffle the array using the Fisher-Yates shuffle algorithm
    for (let i = this._permutation.length - 1; i > 0; --i) { // it starts from the end of the array
      const j = Math.floor(Math.random() * (i + 1)); // it randomly pick one that is not shuffled yet
      [this._permutation[i], this._permutation[j]] = [this._permutation[j], this._permutation[i]]; // this is how JS can swap elements using references
    }
  }
  
  // a function to return a graident based on the hashed value
  gradient(hashvalue, x, y = 0, z = 0) {
    // ref: https://mrl.cs.nyu.edu/~perlin/noise/
    switch (hashvalue & 15) { // only use the lower 4 bits  
      // convert to the 12 gradient directions
      case 0: case 12: return  x + y; // the last four are repeated
      case 1: case 13: return -x + y;
      case 2: case 14: return  x - y;
      case 3: case 15: return -x - y;
      case 4:  return  x + z;
      case 5:  return -x + z;
      case 6:  return  x - z;
      case 7:  return -x - z;
      case 8:  return  y + z;
      case 9:  return -y + z;
      case 10: return  y - z;
      case 11: return -y - z;
    }
  }
 
  // 1D Perlin Noise
  noise1d(x) {
    // implementation ref: // ref: https://mrl.cs.nyu.edu/~perlin/noise/
    // a fade function for smoother interpolation - you can pick any cubic function
    const fade = (t) => { return t * t * t * (t * (t * 6 - 15) + 10)} ;
    // a linear interpolation function
    const interpolate = (src, dst, t) => { return src * t + dst * (1 - t) };
    // noise generation
    const ix = Math.floor(x) & 255; // for an input x, compute an index within [0, 255]
    const ixx = (ix + 1) & 255; // get the next index
    x -= Math.floor(x); // clamp the coordiantes to the cell
    let t = fade(x); // comptue the fade curve for weighted sum
    let src = this._permutation[ix]; // get the src hash value
    let dst = this._permutation[ixx]; // get the dst hash value
    let srcGrad = this.gradient(src, x); // get the src gradient value
    let dstGrad = this.gradient(dst, x - 1); // get the dst gradient value, note here, shift the value by 1
    return interpolate(srcGrad, dstGrad, t); // intepolate using the fade value
  }
 
  // 2D Perlin Noise
  noise2d(x, y) {
    // implementation ref: // ref: https://mrl.cs.nyu.edu/~perlin/noise/
    // a fade function for smoother interpolation - you can pick any cubic function
    const fade = (t) => { return t * t * t * (t * (t * 6 - 15) + 10)} ;
    // a linear interpolation function
    const interpolate = (src, dst, t) => { return src * t + dst * (1 - t) };
    // noise generation
    const ix = Math.floor(x); // for an input x, compute an index within [0, 255]
    const iy = Math.floor(y); // for an input y, compute an index within [0, 255]
    const ixx = (ix + 1); // get the next x index
    const iyy = (iy + 1); // get the next y index
    x -= Math.floor(x); // clamp the coordiantes to the cell
    y -= Math.floor(y); // clamp the coordiantes to the cell
    let u = fade(x); // comptue the fade curve for weighted sum
    let v = fade(y); // comptue the fade curve for weighted sum


    let AA = this._permutation[ix]+iy;
    let AB = this._permutation[ix]+iyy;
    let BA = this._permutation[ixx]+iy;
    let BB = this._permutation[ixx]+iyy;


    return interpolate(interpolate(this.gradient(this._permutation[this._permutation[ix]+iy], x, y), this.gradient(this._permutation[this._permutation[ixx]+iyy], x-1, y), u),
                     interpolate(this.gradient(this._permutation[iy], x, y-1), this.gradient(this._permutation[iyy], x-1, y-1), u), v);
  }
 
  // 3D Perlin Noise
  noise3d(x, y, z) {
    // implementation ref: // ref: https://mrl.cs.nyu.edu/~perlin/noise/
    // a fade function for smoother interpolation - you can pick any cubic function
    const fade = (t) => { return t * t * t * (t * (t * 6 - 15) + 10)} ;
    // a linear interpolation function
    const interpolate = (src, dst, t) => { return src * t + dst * (1 - t) };
    // noise generation
    const ix = Math.floor(x) & 255; // for an input x, compute an index within [0, 255]
    const iy = Math.floor(y) & 255; // for an input y, compute an index within [0, 255]
    const iz = Math.floor(z) & 255; // for an input z, compute an index within [0, 255]
    const ixx = (ix + 1) & 255; // get the next x index
    const iyy = (iy + 1) & 255; // get the next y index
    const izz = (iz + 1) & 255; // get the next z index
    x -= Math.floor(x); // clamp the coordiantes to the cell
    y -= Math.floor(y); // clamp the coordiantes to the cell
    z -= Math.floor(z); // clamp the coordiantes to the cell
    let u = fade(x); // comptue the fade curve for weighted sum
    let v = fade(y); // comptue the fade curve for weighted sum
    let w = fade(z); // comptue the fade curve for weighted sum


    let AA = this._permutation[this._permutation[ix]+iy]+iz;
    let AB = this._permutation[this._permutation[ix]+iyy]+iz;
    let BA = this._permutation[this._permutation[ixx]+iy]+iz;
    let BB = this._permutation[this._permutation[ixx]+iyy]+iz;


    return interpolate(interpolate(interpolate(this.gradient(this._permutation[AA], x, y, z), this.gradient(this._permutation[BA], x-1, y, z), u),
                     interpolate(this.gradient(this._permutation[AB], x, y-1, z), this.gradient(this._permutation[BB], x-1, y-1, z), u), v),
                interpolate(interpolate(this.gradient(this._permutation[AA+1], x, y, z-1), this.gradient(this._permutation[BA+1], x-1, y, z-1), u),
                     interpolate(this.gradient(this._permutation[AB+1], x, y-1, z-1), this.gradient(this._permutation[BB+1], x-1, y-1, z-1), u), v), w);
  }
 
  // 2D Octave Perlin Noise
  octaveNoise2d(x, y, freq = 0.005, A = 1, H = 0.99, octaves = 4, lacunarity = 2) {
    // ref: https://miquelvir.medium.com/procedural-fractal-terrains-how-does-minecraft-generate-infinite-maps-776103e180ee
    let noise = 0;
    let maxVal = 0;
    for (let i = 0; i < octaves - 1; i++) {
      let gain = Math.pow(freq, -H * i);
      A *= gain;
      maxVal += A;
      noise += this.noise2d(x * freq, y * freq) * A;
      freq *= lacunarity;
    }


    noise = noise / maxVal


    return noise;
  }
}
