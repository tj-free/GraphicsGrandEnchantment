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
 
import PGA3D from '../Math/PGA3D.js'
 
export default class Camera {
  constructor(width=0, height=0, _isProjective=false, focal=[1,1]) {
    this._pose = new Float32Array(Array(16).fill(0));
    this._pose[0] = 1;
    this._focal = new Float32Array(Array(2).fill(0));
    this._focal[0]=focal[0];
    this._focal[1]=focal[1];
    this._resolutions = new Float32Array([width, height]);
    this._isProjective= _isProjective;
  }
  
  resetPose() {
    this._pose[0] = 1;
    for (let i = 1; i < 16; ++i) this._pose[i] = 0;
    this._focal[0] = 1;
    this._focal[1] = 1;
  }
  
  updatePose(newpose) {
    for (let i = 0; i < 16; ++i) this._pose[i] = newpose[i];
  }
  
  updateSize(width, height) {
    this._resolutions[0] = width;
    this._resolutions[1] = height;
  }

  normalizeVec2(vec2) {
    var len = Math.sqrt(Math.pow(vec2[0], 2) + Math.pow(vec2[1], 2))
    if (len == 0) {
      return [0, 0]
    }
    return [vec2[0] / len / 1000, vec2[1] / len / 1000]
  }

  moveX(d) {
    let rot_d = [...PGA3D.applyMotorToPoint([d, 0, 0], PGA3D.extractRotor(this._pose))]
    let normDir = this.normalizeVec2([rot_d[0], rot_d[2]]);
    let dt = PGA3D.createTranslator(normDir[0], 0, normDir[1]);
    let newpose = PGA3D.geometricProduct(dt, this._pose)
    this.updatePose(newpose);
  }

  moveY(d) {
    let dt = PGA3D.createTranslator(0, d, 0);
    let newpose = PGA3D.geometricProduct(dt, this._pose);
    this.updatePose(newpose);
  }

  moveZ(d) {
    let rot_d = [...PGA3D.applyMotorToPoint([0, 0, d], PGA3D.extractRotor(this._pose))]
    let normDir = this.normalizeVec2([rot_d[0], rot_d[2]]);
    let dt = PGA3D.createTranslator(normDir[0], 0, normDir[1]);
    let newpose = PGA3D.geometricProduct(dt, this._pose);
    this.updatePose(newpose);
  }

  rotateX(d, p) {
    let rot_pos=[...PGA3D.applyMotorToPoint([0.0 * p, 0, 0], this._pose)]
    let rot_d = [...PGA3D.applyMotorToDir([1, 0, 0], this._pose)]
    let dr = PGA3D.createRotor(d * Math.PI / 90, rot_d[0], rot_d[1], rot_d[2], rot_pos[0], rot_pos[1], rot_pos[2]);

    let newpose = PGA3D.geometricProduct(dr, this._pose);
    this.updatePose(newpose);    
  }
  
  rotateY(d, p) {
    let rot_pos=[...PGA3D.applyMotorToPoint([0.0 * p, 0, 0], this._pose)]
    let dr = PGA3D.createRotor(d * Math.PI / 90, 0, 1, 0,rot_pos[0],rot_pos[1],rot_pos[2]);
    let newpose = PGA3D.geometricProduct(dr, this._pose);
    this.updatePose(newpose);    
  }
  
  rotateZ(d, p) {
    let rot_pos=[...PGA3D.applyMotorToPoint([0.0 * p, 0, 0], this._pose)]
    let rot_d = [...PGA3D.applyMotorToDir([0, 0, 1], this._pose)]
    let dr = PGA3D.createRotor(d / 2, rot_d[0], rot_d[1], rot_d[2], rot_pos[0], rot_pos[1], rot_pos[2]);
    let newpose = PGA3D.geometricProduct(dr, this._pose);
    this.updatePose(newpose);   
  }
}