/*!
 * Copyright (c) 2025 SingChun LEE @ Bucknell University. CC BY-NC 4.0.
 * 
 * This code is provided mainly for educational and research purposes at Bucknell University.
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
 *                 and indicate if changes were made.
 *  - NonCommerical: You may not use the material for commercial purposes.
 *  - No additional restrictions: You may not apply legal terms or technological 
 *                                measures that legally restrict others from doing
 *                                anything the license permits.
 */
  
export default class ThreeDGrid {
    constructor(mesh, grid_size = 128, max_tri = 32) {
      this._mesh = mesh;
      this._grid_size = grid_size;
      this._max_tri = max_tri;
      if (Math.floor(this._grid_size) != this._grid_size || this._grid_size < 1) throw new Error("ThreeDGrid grid size must be an integer greater than 0.");
    }
    
    // A function to initialize the cells
    initCells() {
      // first, for each cell, we find vertices that are in the cell
      // then, we find a set of faces containing one of this vertices
      // This gives us the partitioning of triangles into a voxel grid
      // init the cells (3D array). Each cell has its own bounding box and initially has no triangle indices in it.
      this._cells = Array.from({ length: this._grid_size }, () => Array.from({ length: this._grid_size }, () => Array.from({ length: this._grid_size}, () => [[], new Set()] )));
      // compute the cell's bounding boxes
      this._dx = (this._boundingBox[3] - this._boundingBox[0]) / this._grid_size;
      this._dy = (this._boundingBox[4] - this._boundingBox[1]) / this._grid_size;
      this._dz = (this._boundingBox[5] - this._boundingBox[2]) / this._grid_size;
      // now loop each cell
      for (let z = 0; z < this._grid_size; ++z) {
        const z0 = this._boundingBox[2] + z * this._dz;
        const z1 = z0 + this._dz;
        for (let y = 0; y < this._grid_size; ++y) {
          const y0 = this._boundingBox[1] + y * this._dy;
          const y1 = y0 + this._dy;
          for (let x = 0; x < this._grid_size; ++x) {
            const x0 = this._boundingBox[0] + x * this._dx;
            const x1 = x0 + this._dx;
            this._cells[z][y][x][0] = [x0, y0, z0, x1, y1, z1];
          }
        }
      }
    }
    
    // A helper function to convert a point to cell index - by rounding down to the grid cells
    getCellIdx(p) {
      const [minx, miny, minz, maxx, maxy, maxz] = this._boundingBox;
      if (minx < p[0] && p[0] < maxx && miny < p[1] && p[1] < maxy && minz < p[2] && p[2] < maxz) { // bounding box checking
        // round down to get the cell x, y index
        return [Math.floor((p[0] - minx) / this._dx), Math.floor((p[1] - miny) / this._dy), Math.floor((p[2] - minz) / this._dz)];
      }
      else return [-1, -1, -1]; // out of bound
    }
    
    // A function to compute the hit points of the six planes of a cell
    getCellHitPoints(c, st, dir) {
      const [minx, miny, minz, maxx, maxy, maxz] = c[0];
      const xt0 = (minx - st[0]) / dir[0];
      const xt1 = (maxx - st[0]) / dir[0];
      const yt0 = (miny - st[1]) / dir[1];
      const yt1 = (maxy - st[1]) / dir[1];
      const zt0 = (miny - st[2]) / dir[2];
      const zt1 = (maxy - st[2]) / dir[2];
      return [xt0, xt1, yt0, yt1, zt0, zt1];
    }
    
    // An important function to partition the triangles into cells
    partitionTriangles() {
      this._maxNumTriangles = 0;
      for (let tIdx = 0; tIdx < this._mesh._numT; ++tIdx) {
        let tri = this._mesh._triangles[tIdx];
        
        // Get triangle vertex positions
        let v0 = this._mesh._vertices[tri[0]];
        let v1 = this._mesh._vertices[tri[1]];
        let v2 = this._mesh._vertices[tri[2]];
  
        // Compute triangle bounding box cell index
        const [sx, sy, sz] = this.getCellIdx([
            Math.min(v0[0], v1[0], v2[0]),
            Math.min(v0[1], v1[1], v2[1]),
            Math.min(v0[2], v1[2], v2[2])
        ]);
        const [ex, ey, ez] = this.getCellIdx([
            Math.max(v0[0], v1[0], v2[0]),
            Math.max(v0[1], v1[1], v2[1]),
            Math.max(v0[2], v1[2], v2[2])
        ]);
        
        // iterate over all grid cells inside the bounding box and see which one the triangle intersects
        for (let iz = sz; iz <= ez; ++iz) {
          for (let iy = sy; iy <= ey; ++iy) {
            for (let ix = sx; ix <= ex; ++ix) {
              // Get cell bounding box
              const c = this._cells[iz][iy][ix];
              // Get triangle normal
              const n = this._mesh._faceNormal[tIdx];
              // check the the cell bounding box intersects the triangle plane
              // TODO: make it more efficient - bonus points
              
              // TODO: projected planes overlapping check
              // add the triangle to the cell
              c[1].add(tIdx);
              this._maxNumTriangles = Math.max(this._maxNumTriangles, c[1].size);
            }
          }
        }
      }
      if (this._maxNumTriangles > this._max_tri) {
        throw("Max triangles in a cell exceeds the limit (", this._max_tri ,"). Try to increase the grid size. Current:", this._maxNumTriangles);
      }
    }
    
    async init() {
      // Compute the bounding box
      let minx = Number.MAX_VALUE;
      let miny = Number.MAX_VALUE;
      let minz = Number.MAX_VALUE;
      let maxx = -Number.MAX_VALUE;
      let maxy = -Number.MAX_VALUE;
      let maxz = -Number.MAX_VALUE;
      for (let i = 0; i < this._mesh._numV; ++i) {
        let v = this._mesh._vertices[i];
        minx = Math.min(minx, v[0]);
        miny = Math.min(miny, v[1]);
        minz = Math.min(minz, v[2]);
        maxx = Math.max(maxx, v[0]);
        maxy = Math.max(maxy, v[1]);
        maxz = Math.max(maxz, v[2]);
      }
      // Define an epsilon
      this.EPSILON = Math.min((maxx - minx) / this._grid_size, (maxy - miny) / this._grid_size, (maxz - minz) / this._grid_size ) * 1e-4;
      this._boundingBox = [minx - this.EPSILON, miny - this.EPSILON, minz - this.EPSILON, maxx + this.EPSILON, maxy + this.EPSILON, maxz + this.EPSILON]; // add epsilon to the bounding box
      this.initCells(); // this function will init the grid cells by cutting polygon edges into line segments
      this.partitionTriangles();
    }
  }