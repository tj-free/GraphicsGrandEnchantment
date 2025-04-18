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
  
export default class BVH {
    constructor(mesh, max_depth = 13, max_tri = 64) {
      this._mesh = mesh;
      this._max_depth = max_depth;
      this._max_tri = max_tri;
      if (Math.floor(this._max_depth) != this._max_depth || this._max_depth < 1) throw new Error("BVH max depth must be an integer greater than 0.");
    }
    
    // A function to compute the bounding box of a set of triangles
    computeAABB(triangles) {
      // Compute the bounding box
      let minx = Number.MAX_VALUE;
      let miny = Number.MAX_VALUE;
      let minz = Number.MAX_VALUE;
      let maxx = -Number.MAX_VALUE;
      let maxy = -Number.MAX_VALUE;
      let maxz = -Number.MAX_VALUE;
      triangles.forEach((tIdx) => {
        let tri = this._mesh._triangles[tIdx];
        for (let j = 0; j < 3; ++j) {
          let v = this._mesh._vertices[tri[j]];
          minx = Math.min(minx, v[0]);
          miny = Math.min(miny, v[1]);
          minz = Math.min(minz, v[2]);
          maxx = Math.max(maxx, v[0]);
          maxy = Math.max(maxy, v[1]);
          maxz = Math.max(maxz, v[2]);
        }
      });
      return [minx, miny, minz, maxx, maxy, maxz];
    }
    
    // A function to initialize the nodes
    initNodes() {
      // init the binary tree - each node store the bounding box and a set of triangles
      // for empty node, the first element - the bounding box will be empty. The first element also stores splitting information
      // the second element is a set of triangle indices contained in the node's bounding box
      this._nodes = Array.from({ length: Math.pow(2, this._max_depth) - 1 }, () => [[], new Set()]);
      // init the root node
      // add all triangles to the root node
      for (let i = 0; i < this._mesh._numT; ++i) {
        this._nodes[0][1].add(i);
      }
      this._boundingBox = this.computeAABB(this._nodes[0][1]);
      this._nodes[0][0] = this._boundingBox;
    }
    
    // A helper function to get left child index
    getLeftChildIdx(pIdx) {
      return 2 * pIdx + 1;
    }
    
    // A helper function to get right child index
    getRightChildIdx(pIdx) {
      return 2 * pIdx + 2;
    }
    
    // A function to compute the surface area of a bounding box
    surfaceArea(aabb) {
      const [minx, miny, minz, maxx, maxy, maxz] = aabb;
      let d = [maxx - minx, maxy - miny, maxz - minz]; // compute the difference
      return 2 * (d[0] * d[1] + d[1] * d[2] + d[2] * d[0]); // compute the sum of six face areas
    }
    
    // A function to count how many triangles after spliting at val at axis
    splitTriangles(triangles, val, axis) {
      var left = new Set();
      var right = new Set();
      triangles.forEach((tIdx) => {
        let tri = this._mesh._triangles[tIdx];
        for (let j = 0; j < 3; ++j) {
          let v = this._mesh._vertices[tri[j]];
          if (v[axis] < val) {
            left.add(tIdx);
          }
          else {
            right.add(tIdx);
          }
        }
      });
      return [left, right];
    }
    
    // A function to compute the best split using surface area heuristic
    findBestSplitSAH(curAABB, triangles) {
      // assume t_trav is constant and assume t_insect is constant, so we only rely on the probabilty
      // i.e. number of triangles of the left and on the right and the bounding box surface area
      
      // the input bounding box surface area
      let sA = this.surfaceArea(curAABB); 
      
      // Try splitting along x, y, z at the centroid
      let bestCost = Infinity;  // use to track the lowest cost
      let bestLeft = null;
      let bestRight = null;
      let bestLeftAABB = null;
      let bestRightAABB = null;
      let bestAxis = -1;
      let bestValue = -1;
  
      for (let axis = 0; axis < 3; ++axis) {
        // split the triangle set
        let delta = (curAABB[axis + 3] - curAABB[axis]) / 20; // divide by intervals
        for (let val = curAABB[axis]; val < curAABB[axis + 3]; val += delta) {
          let [l, r] = this.splitTriangles(triangles, val, axis); 
          // compute the new bounding boxes
          let lAABB = this.computeAABB(l);
          let rAABB = this.computeAABB(r);
          // compute the SAH cost
          let cost = (l.size * this.surfaceArea(lAABB) + r.size * this.surfaceArea(rAABB)) / sA;
          // keep the lower one
          if (cost < bestCost) {
            bestCost = cost;
            bestLeft = l;
            bestLeftAABB = lAABB;
            bestRight = r;
            bestRightAABB = rAABB;
            bestAxis = axis;
            bestValue = val;
          }       
        }        
      }
      return [bestLeft, bestLeftAABB, bestRight, bestRightAABB, bestAxis, bestValue];
    }
    
    // An important function to subdivide the space
    subdivide(pIdx) {
      let parentNode = this._nodes[pIdx];
      let leftIdx = this.getLeftChildIdx(pIdx);
      let rightIdx = this.getRightChildIdx(pIdx);
      if (rightIdx < this._nodes.length && parentNode[1].size > this._max_tri) { // if not exceeding max depth and still more than max triangles
        // use Surface Area Heuristic to find the best division among the three axis splits
        // each split we try to balance the left and right child's number of triangles
        // find the best split using SAH
        const [l, lAABB, r, rAABB, axis, val] = this.findBestSplitSAH(parentNode[0], parentNode[1]);
        if (l && l.size < parentNode[1].size && r && r.size < parentNode[1].size) { // if we find a better split
          // set split information
          this._nodes[pIdx][0].push(axis, val);
          // set the children information
          this._nodes[leftIdx][0] = lAABB;
          this._nodes[leftIdx][1] = l;
          this._nodes[rightIdx][0] = rAABB;
          this._nodes[rightIdx][1] = r;
          // recursively subdivide
          this.subdivide(leftIdx); 
          this.subdivide(rightIdx);
        }
        else {
          this._maxNumTriangles = Math.max(this._maxNumTriangles, parentNode[1].size);
        }
      }
      else {
        this._maxNumTriangles = Math.max(this._maxNumTriangles, parentNode[1].size);
      }
    }
    
    async init() {
      this.initNodes(); // this function will init the nodes
      this._maxNumTriangles = 0;
      this.subdivide(0); // recursively subdivide the root node
      if (this._maxNumTriangles > this._max_tri) {
        console.log("Max triangles in a cell exceeds the limit (", this._max_tri ,"). Try to increase the tree depth. Current:", this._maxNumTriangles);
      }
    }
  }