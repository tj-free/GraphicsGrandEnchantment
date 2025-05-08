/* 
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

// struct to sture 3D PGA multivector
struct MultiVector {
  s: f32, 
  exey: f32, 
  exez: f32, 
  eyez: f32, 
  eoex: f32, 
  eoey: f32, 
  eoez: f32, 
  exeyez: f32, 
  eoexey: f32, 
  eoexez: f32, 
  eoeyez: f32,
  ex: f32, 
  ey: f32, 
  ez: f32, 
  eo: f32,
  eoexeyez: f32
}

// the geometric product 
fn geometricProduct(a: MultiVector, b: MultiVector) -> MultiVector { 
  // The geometric product rules are:
  //   1. eoeo = 0, exex = 1 and eyey = 1, ezez = 1
  //   2. eoex + exeo = 0, eoey + eyeo = 0, eoez + ezeo = 0
  //   3. exey + eyex = 0, exez + ezex = 0, eyez + ezey = 0
  // This results in the following product table:
  var r: MultiVector;
  r.s = a.s * b.s - a.exey * b.exey - a.exez * b.exez - a.eyez * b.eyez - a.exeyez * b.exeyez + a.ex * b.ex + a.ey * b.ey + a.ez * b.ez; // scalar
  r.exey = a.s * b.exey + a.exey * b.s - a.exez * b.eyez + a.eyez * b.exez + a.exeyez * b.ez + a.ex * b.ey - a.ey * b.ex + a.ez * b.exeyez; // exey
  r.exez = a.s * b.exez + a.exey * b.eyez + a.exez * b.s - a.eyez * b.exey - a.exeyez * b.ey + a.ex * b.ez - a.ey * b.exeyez - a.ez * b.ex; // exez
  r.eyez = a.s * b.eyez - a.exey * b.exez + a.exez * b.exey + a.eyez * b.s + a.exeyez * b.ex + a.ex * b.exeyez + a.ey * b.ez - a.ez * b.ey; // eyez
  r.eoex = a.s * b.eoex + a.exey * b.eoey + a.exez * b.eoez - a.eyez * b.eoexeyez + a.eoex * b.s - a.eoey * b.exey - a.eoez * b.exez + a.exeyez * b.eoeyez + a.eoexey * b.ey + a.eoexez * b.ez - a.eoeyez * b.exeyez - a.ex * b.eo + a.ey * b.eoexey + a.ez * b.eoexez + a.eo * b.ex - a.eoexeyez * b.eyez; // eoex
  r.eoey = a.s * b.eoey - a.exey * b.eoex + a.exez * b.eoexeyez + a.eyez * b.eoez + a.eoex * b.exey + a.eoey * b.s - a.eoez * b.eyez - a.exeyez * b.eoexez - a.eoexey * b.ex + a.eoexez * b.exeyez + a.eoeyez * b.ey - a.ex * b.eoexey - a.ey * b.eo + a.ez * b.eoeyez + a.eo * b.ey + a.eoexeyez * b.exez; // eoey
  r.eoez = a.s * b.eoez - a.exey * b.eoexeyez - a.exez * b.eoex - a.eyez * b.eoey + a.eoex * b.exez + a.eoey * b.eyez + a.eoez * b.s + a.exeyez * b.eoexey - a.eoexey * b.exeyez - a.eoexez * b.ex - a.eoeyez * b.ey - a.ex * b.eoexez - a.ey * b.eoeyez - a.ez * b.eo + a.eo * b.ez - a.eoexeyez * b.exey; // eoez
  r.exeyez = a.s * b.exeyez + a.exey * b.ez - a.exez * b.ey + a.eyez * b.ex + a.exeyez * b.s + a.ex * b.eyez - a.ey * b.exez + a.ez * b.exey; // exeyez
  r.eoexey = a.s * b.eoexey + a.exey * b.eo - a.exez * b.eoeyez + a.eyez * b.eoexez + a.eoex * b.ey - a.eoey * b.ex + a.eoez * b.exeyez - a.exeyez * b.eoez + a.eoexey * b.s - a.eoexez * b.eyez + a.eoeyez * b.exez - a.ex * b.eoey + a.ey * b.eoex - a.ez * b.eoexeyez + a.eo * b.exey + a.eoexeyez * b.ez; // eoexey
  r.eoexez = a.s * b.eoexez + a.exey * b.eoeyez + a.exez * b.eo - a.eyez * b.eoexey + a.eoex * b.ez - a.eoey * b.exeyez - a.eoez * b.ex + a.exeyez * b.eoey + a.eoexey * b.eyez + a.eoexez * b.s - a.eoeyez * b.exey - a.ex * b.eoez + a.ey * b.eoexeyez + a.ez * b.eoex + a.eo * b.exez - a.eoexeyez * b.ey; // eoexez
  r.eoeyez = a.s * b.eoeyez - a.exey * b.eoexez + a.exez * b.eoexey + a.eyez * b.eo + a.eoex * b.exeyez + a.eoey * b.ez - a.eoez * b.ey - a.exeyez * b.eoex - a.eoexey * b.exez + a.eoexez * b.exey + a.eoeyez * b.s - a.ex * b.eoexeyez - a.ey * b.eoez + a.ez * b.eoey + a.eo * b.eyez + a.eoexeyez * b.ex; // eoeyez
  r.ex = a.s * b.ex + a.exey * b.ey + a.exez * b.ez - a.eyez * b.exeyez - a.exeyez * b.eyez + a.ex * b.s - a.ey * b.exey - a.ez * b.exez; // ex
  r.ey = a.s * b.ey - a.exey * b.ex + a.exez * b.exeyez + a.eyez * b.ez + a.exeyez * b.exez + a.ex * b.exey + a.ey * b.s - a.ez * b.eyez; // ey
  r.ez = a.s * b.ez - a.exey * b.exeyez - a.exez * b.ex - a.eyez * b.ey - a.exeyez * b.exey + a.ex * b.exez + a.ey * b.eyez + a.ez * b.s; // ez
  r.eo = a.s * b.eo - a.exey * b.eoexey - a.exez * b.eoexez - a.eyez * b.eoeyez + a.eoex * b.ex + a.eoey * b.ey + a.eoez * b.ez + a.exeyez * b.eoexeyez - a.eoexey * b.exey - a.eoexez * b.exez - a.eoeyez * b.eyez - a.ex * b.eoex - a.ey * b.eoey - a.ez * b.eoez + a.eo * b.s - a.eoexeyez * b.exeyez; // eo
  r.eoexeyez = a.s * b.eoexeyez + a.exey * b.eoez - a.exez * b.eoey + a.eyez * b.eoex + a.eoex * b.eyez - a.eoey * b.exez + a.eoez * b.exey - a.exeyez * b.eo + a.eoexey * b.ez - a.eoexez * b.ey + a.eoeyez * b.ex - a.ex * b.eoeyez + a.ey * b.eoexez - a.ez * b.eoexey + a.eo * b.exeyez + a.eoexeyez * b.s; // eoexeyez
  return r;
}

// the reverse of a Multivector
fn reverse(a: MultiVector) -> MultiVector {
  // The reverse is the reverse order of the basis elements
  //  the reverse of a scalar is the scalar
  //  the reverse of exey is eyex = -exey
  //  the reverse of exez is ezex = -exez
  //  the reverse of eyez is ezey = -eyez
  //  the reverse of eoex is exeo = -eoex
  //  the reverse of eoey is eyeo = -eoey
  //  the reverse of eoez is ezeo = -eoez
  //  the reverse of exeyez is ezeyex = exezey = -exeyez
  //  the reverse of eoexey is eyexeo = eoeyex = -eoexey
  //  the reverse of eoexez is ezexeo = eoezex = -eoexez
  //  the reverse of eoeyez is ezeyeo = eoezey = -eoeyez
  //  the reverse of ex, ey, ez, eo are ex, ey, ez, eo
  //  the reverse of eoexeyez is ezeyexeo = -eoezeyex = -eoexezey = eoexeyez
  // So, for [s, exey, exez, eyez, eoex, eoey, eoez, exeyez, eoexey, eoexez, eoeyez, ex, ey, ez, eo, eoexeyez],
  // Its reverse is [s, -exey, -exez, eyez, -eoex, -eoey, -eoez, -exeyez, -eoexey, -eoexez, -eoeyez, ex, ey, ez, eo, eoexeyez].
  return MultiVector(a.s, -a.exey, -a.exez, -a.eyez, -a.eoex, -a.eoey, -a.eoez, -a.exeyez, -a.eoexey, -a.eoexez, -a.eoeyez, a.ex, a.ey, a.ez, a.eo, a.eoexeyez);
}

fn applyMotor(p: MultiVector, m: MultiVector) -> MultiVector {
  // To apply a motor to a point, we use the sandwich operation
  // The formula is m * p * reverse of m
  // Here * is the geometric product
  return geometricProduct(m, geometricProduct(p, reverse(m)));
}

fn motorNorm(m: MultiVector) -> f32 {
  // The norm of a motor is square root of the sum of square of the terms:
  // we have
  var sum = 0.;
  sum += m.s * m.s;
  sum += m.exey * m.exey;
  sum += m.exez * m.exez;
  sum += m.eyez * m.eyez;
  sum += m.eoex * m.eoex;
  sum += m.eoey * m.eoey;
  sum += m.eoez * m.eoez;
  sum += m.exeyez * m.exeyez;
  sum += m.eoexey * m.eoexey;
  sum += m.eoexez * m.eoexez;
  sum += m.eoeyez * m.eoeyez;
  sum += m.ex * m.ex;
  sum += m.ey * m.ey;
  sum += m.ez * m.ez;
  sum += m.eo * m.eo;
  sum += m.eoexeyez * m.eoexeyez;
  return sqrt(sum);
}

fn createTranslator(d: vec3f) -> MultiVector {
  // Given dx and dy describing the moveming in the x and y directions,
  // the translator is given by 1 + dx/2 exeo + dy/2 eyeo + dz/2 ezeo
  // In code, we always store the coefficents of
  //    scalar, exey, exez, eyez, eoex, eoey, eoez, exeyez, eoexey, eoexez, eoeyez, ex, ey, ez, eo, eoexeyez
  // Hence the implementation is as below
  return MultiVector(1, 0, 0, 0, -d.x / 2, -d.y / 2, -d.z / 2, 0, 0, 0, 0, 0, 0, 0, 0, 0);
}

fn extractTranslator(m: MultiVector) -> MultiVector {
  // Given a general motor, we can extract the translator part
  return MultiVector(1, 0, 0, 0, m.eoex, m.eoey, m.eoez, 0, 0, 0, 0, 0, 0, 0, 0, 0);
}

fn createDir(d: vec3f) -> MultiVector {
  // A direction is given by dx eyez + dy ezex + dz exey
  //    scalar, exey, exez, eyez, eoex, eoey, eoez, exeyez, eoexey, eoexez, eoeyez, ex, ey, ez, eo, eoexeyez
  return MultiVector(0, d.z, -d.y, d.x, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
}

fn createLine(s: vec3f, d: vec3f) -> MultiVector {
  // A line is given by a starting point (sx, sy, sz) and a direction (dx, dy, dz)
  //  in this form: dx eyez + dy ezex + dz exey + (dy * sz - dz * sy) exeo + (dz * sx - dx * sz) eyeo + (dx * sy - dy * sx) ezeo
  let n = createDir(d); // represent the input direction in PGA
  let dir = normalizeMotor(n); // normalize the direction to make sure it is a unit direction
  // Note dir.exey = dz, dir.exez = -dy, dir.eyez = dx
  return MultiVector(0, dir.exey, dir.exez, dir.eyez, -(-dir.exez * s.z - dir.exey * s.y), -(dir.exey * s.x - dir.eyez * s.z), -(dir.eyez * s.y + dir.exez * s.x), 0, 0, 0, 0, 0, 0, 0, 0, 0);
}

fn createRotor(angle: f32, d: vec3f, spt: vec3f) -> MultiVector {
  // Given an angle and a rotation axis direction (dx, dy, dz) and a start point of the rotation axis,
  // the rotor is given by cos(angle / 2 ) + sin(angle / 2 ) L
  //  where L is the line in 3D PGA formed by the direction and the start point
  let c = cos(angle / 2);
  let s = sin(angle / 2);
  let L = createLine(spt, d);
  return MultiVector(c, s * L.exey, s * L.exez, s * L.eyez, s * L.eoex, s * L.eoey, s * L.eoez, 0, 0, 0, 0, 0, 0, 0, 0, 0);
}

fn extractRotor(m: MultiVector) -> MultiVector {
  // Given a general motor, we can extract the rotor part
  return MultiVector(m.s, m.exey, m.exez, m.eyez, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
}

fn createPoint(p: vec3f) -> MultiVector {
  // Given a point in 3D with coordinates (x, y, z)
  // A point in PGA is given by exeyez + x eoezey + y eoexez + z eoeyex
  // In code, we always store the coefficents of 
  //    scalar, exey, exez, eyez, eoex, eoey, eoez, exeyez, eoexey, eoexez, eoeyez, ex, ey, ez, eo, eoexeyez
  return MultiVector(0, 0, 0, 0, 0, 0, 0, 1, -p.z, p.y, -p.x, 0, 0, 0, 0, 0);
}

fn extractPoint(p: MultiVector) -> vec3f {
  // to extract the 3d point from a exeyez + b eoezey + c eoexez + d eoeyex
  // we have x = -b/a and y = c/a and z = -d/a
  return vec3f(-p.eoeyez / p.exeyez, p.eoexez / p.exeyez, -p.eoexey / p.exeyez);
}

fn createPlane(n: vec3f, d: f32) -> MultiVector {
  // Given a plane in 3D with normal (nx, ny, nz) and distance from the origin d
  // A plane in PGA is given by nx ex + ny ey + nz ez - deo
  // In code, we always store the coefficents of 
  //    scalar, exey, exez, eyez, eoex, eoey, eoez, exeyez, eoexey, eoexez, eoeyez, ex, ey, ez, eo, eoexeyez
  return MultiVector(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, n.x, n.y, n.z, -d, 0);
}

fn createPlaneFromPoints(p1: vec3f, p2: vec3f, p3: vec3f) -> MultiVector {
  // Given three poitns (x1, y1, z1), (x2, y2, z2), (x3, y3, z3)
  // A plane in PGA is given by 
  //        ((y2 * z3 - y3 * z2) -      (y1 * z3 - y3 * z1) +      (y1 * z2 - y2 * z1)) ex 
  // -      ((x2 * z3 - x3 * z2) -      (x1 * z3 - x3 * z1) +      (x1 * z2 - x2 * z1)) ey 
  // +      ((x2 * y3 - x3 * y2) -      (x1 * y3 - x3 * y1) +      (x1 * y2 - x2 * y1)) ez 
  // + (x1 * (y2 * z3 - y3 * z2) - x2 * (y1 * z3 - y3 * z1) + x3 * (y1 * z2 - y2 * z1)) eo
  let nx =          (p2[1] * p3[2] - p3[1] * p2[2]) -         (p1[1] * p3[2] - p3[1] * p1[2]) +         (p1[1] * p2[2] - p2[1] * p1[2]);
  let ny =          (p2[0] * p3[2] - p3[0] * p2[2]) -         (p1[0] * p3[2] - p3[0] * p1[2]) +         (p1[0] * p2[2] - p2[0] * p1[2]);
  let nz =          (p2[0] * p3[1] - p3[0] * p2[1]) -         (p1[0] * p3[1] - p3[0] * p1[1]) +         (p1[0] * p2[1] - p2[0] * p1[1]);
  let d = (p1[0] * (p2[1] * p3[2] - p3[1] * p2[2]) - p2[0] * (p1[1] * p3[2] - p3[1] * p1[2]) + p3[0] * (p1[1] * p2[2] - p2[1] * p1[2]));
  return createPlane(vec3f(nx, -ny, nz), d);
}

// define a constant
const EPSILON : f32 = 0.00000001;

// a structure to store the hit information
struct HitInfo {
  p: vec3f,      // where it hits
  hit: bool,     // if it hits
  inPlane: bool, // if it does not hit, is it in the plane?
}

fn linePlaneIntersection(L: MultiVector, P: MultiVector) -> HitInfo {
  // In PGA, the intersection point is simply embedded in the geometric product betwen them
  let new_p = geometricProduct(L, P);
  var hitInfo: HitInfo;
  hitInfo.p = extractPoint(new_p);
  hitInfo.hit = !(abs(new_p.exeyez) <= EPSILON);
  hitInfo.inPlane = hitInfo.hit && abs(new_p.eoexey) <= EPSILON && abs(new_p.eoexez) <= EPSILON && abs(new_p.eoeyez) <= EPSILON;
  return hitInfo;
}

fn normalizeMotor(m: MultiVector) -> MultiVector {
  // To normalize a motor, we divide each coefficient by its norm
  let mnorm = motorNorm(m);
  if (mnorm == 0.0) {
    return MultiVector(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
  return MultiVector(m.s / mnorm, m.exey / mnorm, m.exez / mnorm, m.eyez / mnorm, m.eoex / mnorm, m.eoey / mnorm, m.eoez / mnorm, m.exeyez / mnorm, m.eoexey / mnorm, m.eoexez / mnorm, m.eoeyez / mnorm, m.ex / mnorm, m.ey / mnorm, m.ez / mnorm, m.eo / mnorm, m.eoexeyez / mnorm);
}

fn applyMotorToPoint(p: vec3f, m: MultiVector) -> vec3f {
  // apply the motor m to transform the point p
  // this code covert the 3d point p into PGA and apply the motor to transform it
  // then extra the result from PGA
  let new_p = applyMotor(createPoint(p), m);
  return extractPoint(new_p);
};

fn applyMotorToDir(d: vec3f, m: MultiVector) -> vec3f {
  // apply the motor m to transform the direction d
  // this code convert the 3d direction d into PGA, then extract the rotor from the motor
  // and transform the direction using the rotor
  // last, extra the result from PGA
  let r = extractRotor(m);
  let new_d = applyMotor(createPoint(d), r);
  return extractPoint(new_d);
}

// struct to store 3D PGA pose
struct Camera {
  motor: MultiVector,
  focal: vec2f,
  res: vec2f,
}
struct Quad {
  ll: vec4f, // lower left
  lr: vec4f, // lower right
  ur: vec4f, // upper right
  rl: vec4f, // upper left
}
struct Box {
  motor: MultiVector,     // the model pose of the box
  scale: vec4f,           // the scale of the box
  faces: array<Quad, 6>,  // six faces: front, back, left, right, top, down
}
// struct to store the volume info
struct VolInfo {
  dims: vec4f, // volume dimension
  sizes: vec4f, // voxel sizes
}

struct CellInfo { // this is packed in 64
  terrainType: i32, // the terrain type
  numOfParticles: atomic<i32>, // the total number of particles in the cell
  particleIndices: array<i32, 62>, // the particles in this cell
}

struct Particle {
  p: vec4f,
  pInit: vec4f,
  v: vec4f,
  vInit: vec4f,
  pType: f32,
  gravity: f32,
  wind: f32,
  lifetime: f32,
  range: f32,
  
  dummy1: f32,
  dummy2: vec2f,
  dummy3: vec4f,
  dummy4: vec4f,
}

// struct to store the light
struct Light {
  intensity: vec4f,   // the light intensity
  position: vec4f,    // where the light is
  direction: vec4f,   // the light direction
  attenuation: vec4f, // the attenuation factors
  params: vec4f,      // other parameters such as cut-off, drop off, area width/height, and radius etc.
  model: vec4u,
}

// a structure to store the computed light information
struct LightInfo {
  intensity: vec4f, // the final light intensity
  lightdir: vec3f, // the final light direction
  dist: f32, // the final light dist
}

// make an atomic array to store all of the particles that need to be loaded

// binding the camera pose
@group(0) @binding(0) var<storage> cameraPoseIn: array<Camera, 2>;
@group(0) @binding(1) var<storage, read_write> cameraPoseOut: array<Camera, 2>;
// binding the volume info
@group(0) @binding(2) var<storage> volInfo: VolInfo;
// binding the volume data
@group(0) @binding(3) var<storage, read_write> volData: array<CellInfo>;
// binding the output texture to store the ray tracing results
@group(0) @binding(4) var outTextureLeft: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(5) var outTextureRight: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(6) var dirtTexture: texture_2d<f32>;
@group(0) @binding(7) var grassTopTexture: texture_2d<f32>;
@group(0) @binding(8) var grassSideTexture: texture_2d<f32>;
@group(0) @binding(9) var snowySideTexture: texture_2d<f32>;
@group(0) @binding(10) var snowyTopTexture: texture_2d<f32>;
@group(0) @binding(11) var stoneTexture: texture_2d<f32>;
@group(0) @binding(12) var leafParticleTexture: texture_2d<f32>;
@group(0) @binding(13) var particleSheet: texture_2d<f32>;
@group(0) @binding(14) var<uniform> light: Light;
@group(0) @binding(15) var inSampler: sampler; // texture sampler
@group(0) @binding(16) var<storage> particlesIn: array<Particle>;
@group(0) @binding(17) var<storage,read_write> particlesOut: array<Particle>;
@group(0) @binding(18) var<uniform> time: f32;
@group(0) @binding(19) var<uniform> weather: f32;
@group(0) @binding(20) var<uniform> breakBlock: f32;
@group(0) @binding(21) var<uniform> box: Box;
@group(0) @binding(22) var skyFront: texture_2d<f32>;
@group(0) @binding(23) var skyBack: texture_2d<f32>;
@group(0) @binding(24) var skyLeft: texture_2d<f32>;
@group(0) @binding(25) var skyRight: texture_2d<f32>;
@group(0) @binding(26) var skyUp: texture_2d<f32>;
@group(0) @binding(27) var skyDown: texture_2d<f32>;



/////////////////////////////////////

// a helper function to get the hit point of a ray to a quad
fn quadRayHitCheck(s: vec3f, d: vec3f, q: Quad, ct: f32) -> vec2f {
  // Note, the quad is axis aligned
  // we assume the ray is transfomred using the poses to the model coordiantes
  // Step 1: Construct the ray as a line in PGA
  let L = createLine(s, d);
  // Step 2: Construct the plane in PGA
  let P = createPlaneFromPoints(q.ll.xyz, q.lr.xyz, q.ur.xyz); // we only need three points to define a plane
  // Step 3: Compute the intersection info
  var hitInfo = linePlaneIntersection(L, P);
  if (hitInfo.hit) {
    // Step 4: Check if the hit point within the face
    if (abs(q.ll.z - q.ur.z) <= EPSILON) { // z is 0, i.e. front or back face
      hitInfo.hit = (q.ll.x <= hitInfo.p.x && hitInfo.p.x <= q.ur.x) && (q.ll.y <= hitInfo.p.y && hitInfo.p.y <= q.ur.y);
    }
    else if (abs(q.ll.y - q.ur.y) <= EPSILON) { // y is 0, i.e. top or down face
      hitInfo.hit = (q.ll.x <= hitInfo.p.x && hitInfo.p.x <= q.ur.x) && (q.ll.z <= hitInfo.p.z && hitInfo.p.z <= q.ur.z);
    }
    else if (abs(q.ll.x - q.ur.x) <= EPSILON) { // x is 0, i.e. left or right face
      hitInfo.hit = (q.ll.y <= hitInfo.p.y && hitInfo.p.y <= q.ur.y) && (q.ll.z <= hitInfo.p.z && hitInfo.p.z <= q.ur.z);
    }
    // Step 5: Compute the new hit (t) value i.e. hitPt = s + t * d
    if (hitInfo.hit) {
      var nt: f32 = -1.;
      // pick one axis to compute the t value
      if (d.x > EPSILON) {
        nt = (hitInfo.p.x - s.x) / d.x;
      }
      else if (d.y > EPSILON) {
        nt = (hitInfo.p.y - s.y) / d.y;
      }
      else {
        nt = (hitInfo.p.z - s.z) / d.z;
      }
      // return the hit cases
      if (nt < 0) {
        return vec2f(ct, -1); // Case 1: the ray has already passed the face, no hit
      }
      else if (ct < 0) {
        return vec2f(nt, 1.); // Case 2: the first hit is nt, and say it hits the new face
      }
      else {
        if (nt < ct) {
          return vec2f(nt, 1.); // Case 3: the closer is nt, and say it hits the new face first
        }
        else {
          return vec2f(ct, -1.); // Case 4: the closer is ct, and say it hits the old face first
        }
      }
    }
  }
  return vec2f(ct, -1.); // Default Case: no hit
}

// a function to transform the direction to the model coordiantes
fn transformBoxDir(d: vec3f, cameraID: u32) -> vec3f {
  // transform the direction using the camera pose
  var out = applyMotorToDir(d, cameraPoseIn[cameraID].motor);
  // transform it using the object pose
  out = applyMotorToDir(out, reverse(box.motor));
  out /= box.scale.xyz;
  return out;
}

// a function to transform the start pt to the model coordiantes
fn transformBoxPt(pt: vec3f, cameraID: u32) -> vec3f {
  // transform the point using the camera pose
  var out = applyMotorToPoint(pt, cameraPoseIn[cameraID].motor);  // transform it using the object pose
  out = applyMotorToPoint(out, reverse(box.motor));
  out /= box.scale.xyz;
  return out;
}

// a function to transform normal to the world coordiantes
fn transformBoxNormal(n: vec3f) -> vec3f {
  var out = n * box.scale.xyz;
  out = applyMotorToDir(out, box.motor);
  return normalize(out);
}

// a function to transform hit point to the world coordiantes
fn transformBoxHitPoint(pt: vec3f) -> vec3f {
  var out = pt * box.scale.xyz;
  out = applyMotorToPoint(out, box.motor);
  return out;
}

// a function to compute the ray box intersection
fn rayBoxIntersection(s: vec3f, d: vec3f) -> vec2f { // output is (t, idx)
  // t is the hit value, idx is the fact it hits
  // here we have six planes to check and we keep the cloest hit point
  var t = -1.;
  var idx = -1.;
  for (var i = 0; i < 6; i++) {
    let info = quadRayHitCheck(s, d, box.faces[i], t);
    if (info.y > 0) {
      t = info.x;
      idx = f32(i);
    }
  }
  return vec2f(t, idx);
}

/////////////////////////////////////
// a function to transform the direction to the model coordiantes
fn transformDir(d: vec3f, cameraId: u32) -> vec3f {
  // transform the direction using the camera pose
  var out = applyMotorToDir(d, cameraPoseIn[cameraId].motor);
  return out;
}

// a function to transform the start pt to the model coordiantes
fn transformPt(pt: vec3f, cameraId: u32) -> vec3f {
  // transform the point using the camera pose
  var out = applyMotorToPoint(pt, cameraPoseIn[cameraId].motor);
  return out;
}

// a helper function to keep track of the two ray-volume hit values
fn compareVolumeHitValues(curValue: vec3f, t: f32, faceIdx: i32) -> vec3f {
  var result = curValue;
  if (curValue.x < 0) { // no hit value yet
    result.x = t; // update the closest
    result.z = f32(faceIdx); // keep track of which face it htis
  }
  else {
    if (t < curValue.x) { // if find a closer hit value
      result.y = curValue.x; // update the second closest
      result.x = t;          // update the closest
      result.z = f32(faceIdx); // update the face index
    }
    else {
      if (curValue.y < 0) { // no second hit value yet
        result.y = t;
      }
      else if (t < curValue.y) { // if find a second closer
        result.y = t;
      }
    }
  }
  return result;
}

// a helper function to compute the ray-volume hit values
fn getVolumeHitValues(checkval: f32, halfsize: vec2f, pval: f32, dval: f32, p: vec2f, d: vec2f, curT: vec3f, faceIdx: i32) -> vec3f {
  var cur = curT;
  if (abs(dval) > EPSILON) {
    let t = (checkval - pval) / dval; // compute the current hit point to the check value
    if (t > 0) {
      let hPt = p + t * d;
      if (-halfsize.x < hPt.x && hPt.x < halfsize.x && -halfsize.y < hPt.y && hPt.y < halfsize.y) {
        cur = compareVolumeHitValues(cur, t, faceIdx);
      }
    }
  }
  return cur;
}

// a function to compute the start and end t values of the ray hitting the volume
fn rayVolumeIntersection(p: vec3f, d: vec3f) -> vec3f {
  var hitValues = vec3f(-1, -1, -1);
  let halfsize = volInfo.dims * volInfo.sizes * 0.5 / max(max(volInfo.dims.x, volInfo.dims.y), volInfo.dims.z); // 1mm
  hitValues = getVolumeHitValues(halfsize.z, halfsize.xy, p.z, d.z, p.xy, d.xy, hitValues, 1); // z = halfsize.z Back
  hitValues = getVolumeHitValues(-halfsize.z, halfsize.xy, p.z, d.z, p.xy, d.xy, hitValues, 0); // z = -halfsize.z Front
  hitValues = getVolumeHitValues(-halfsize.x, halfsize.yz, p.x, d.x, p.yz, d.yz, hitValues, 2); // x = -halfsize.x Left
  hitValues = getVolumeHitValues(halfsize.x, halfsize.yz, p.x, d.x, p.yz, d.yz, hitValues, 3); // x = halfsize.x Right
  hitValues = getVolumeHitValues(halfsize.y, halfsize.xz, p.y, d.y, p.xz, d.xz, hitValues, 5); // y = halfsize.y Bottom
  hitValues = getVolumeHitValues(-halfsize.y, halfsize.xz, p.y, d.y, p.xz, d.xz, hitValues, 4); // y = -halfsize.y Top 
  return hitValues;
}

// a helper function to get the next hit value
fn getNextHitValue(startT: f32, curT: vec2f, checkval: f32, minCorner: vec2f, maxCorner: vec2f, pval: f32, dval: f32, p: vec2f, d: vec2f, faceIdx: i32) -> vec2f {
  var cur = curT;
  if (abs(dval) > EPSILON) {
    let t = (checkval - pval) / dval; // compute the current hit point to the check value
    let hPt = p + t * d;
    if (minCorner.x < hPt.x && hPt.x < maxCorner.x && minCorner.y < hPt.y && hPt.y < maxCorner.y) {
      if (t > startT && cur.x < t) {
        cur.x = t;
        cur.y = f32(faceIdx);
      }
    }
  }
  return cur;
}

fn faceMapping(viewDir: vec3f)-> i32{
  // idea: use dot product to find which face normal is the most parallel to the current (negative) ray direction [callled it viewDir]
  var mostParallelFace = -1; // Unknown face
  var maxDotValue = -1f;

  var dotValue = dot(viewDir, vec3f(0, 0, -1)); // Front
  if (dotValue > maxDotValue) {
    maxDotValue = dotValue;
    mostParallelFace = 0;
  }

  dotValue = dot(viewDir, vec3f(0, 0, 1)); // Back
  if (dotValue > maxDotValue) {
    maxDotValue = dotValue;
    mostParallelFace = 1;
  }

  dotValue = dot(viewDir, vec3f(-1,0,0)); // Left
  if (dotValue > maxDotValue) {
    maxDotValue = dotValue;
    mostParallelFace = 2;
  }

  dotValue = dot(viewDir, vec3f(1,0,0)); // Right
  if (dotValue > maxDotValue) {
    maxDotValue = dotValue;
    mostParallelFace = 3;
  }

  dotValue = dot(viewDir, vec3f(0,-1,0)); // Top
  if (dotValue > maxDotValue) {
    maxDotValue = dotValue;
    mostParallelFace = 4;
  }
  dotValue = dot(viewDir, vec3f(0,1,0)); // Down
  if (dotValue > maxDotValue) {
    maxDotValue = dotValue;
    mostParallelFace = 5;
  }
  return mostParallelFace;
/*
  if (all(normDir==vec3f(0,0,-1))){ // Front
    return 0;
  }
  else if (all(normDir==vec3f(0,0,1))){ // Back
    return 1;
  }
  else if (all(normDir==vec3f(-1,0,0))){ //Left
    return 2;
  }
  else if (all(normDir==vec3f(1,0,0))){// Right
    return 3;
  }
  else if (all(normDir==vec3f(0,-1,0))){// Top
    return 4;
  }
  else if (all(normDir==vec3f(0,1,0))){ // Down
    return 5;
  }
  else{return 4;} // Else
  */
} 

fn textureMapping(face: i32, hitPoint: vec3f, terrainType: i32) -> vec4f {
    var color: vec4f;
    switch (terrainType) {
        case 0: { // Grass block
            switch (face) {
                case 0, 1: {
                    color = textureSampleLevel(grassSideTexture, inSampler, hitPoint.xy, 0);
                    break;
                }
                case 2, 3: {
                    color = textureSampleLevel(grassSideTexture, inSampler, hitPoint.zy, 0);
                    break;
                }
                case 4: {
                    color = textureSampleLevel(grassTopTexture, inSampler, hitPoint.xz, 0);
                    break;
                }
                case 5: {
                    color = textureSampleLevel(dirtTexture, inSampler, hitPoint.xz, 0);
                    break;
                }
                default: {
                    color = vec4f(0.0, 0.0, 0.0, 1.0); // Black
                    break;
                }
            }
            break;
        }
        case 1: { // Stone block
            switch (face) {
                case 0, 1: {
                    color = textureSampleLevel(stoneTexture, inSampler, hitPoint.xy, 0);
                    break;
                }
                case 2, 3: {
                    color = textureSampleLevel(stoneTexture, inSampler, hitPoint.zy, 0);
                    break;
                }
                case 4, 5: {
                    color = textureSampleLevel(stoneTexture, inSampler, hitPoint.xz, 0);
                    break;
                }
                default: {
                    color = vec4f(0.0, 0.0, 0.0, 1.0); // Black
                    break;
                }
            }
            break;
        }
        case 2: { // Grass block
            switch (face) {
                case 0, 1: {
                    color = textureSampleLevel(snowyTopTexture, inSampler, hitPoint.xy, 0);
                    break;
                }
                case 2, 3: {
                    color = textureSampleLevel(snowyTopTexture, inSampler, hitPoint.zy, 0);
                    break;
                }
                case 4,5: {
                    color = textureSampleLevel(snowyTopTexture, inSampler, hitPoint.xz, 0);
                    break;
                }
                default: {
                    color = vec4f(0.0, 0.0, 0.0, 1.0); // Black
                    break;
                }
            }
            break;
        }
        default: {
            color = vec4f(0.0, 0.0, 0.0, 1.0); // Black for unknown terrainType
            break;
        }
    }
    return color;
  }

// a function to get the box emit color
fn boxEmitColor() -> vec4f {
	return vec4f(0, 0, 0, 1); // my box doesn't emit any color
}

// a function to compute the light intensity and direction
fn getLightInfo(lightPos: vec3f, lightDir: vec3f, hitPoint: vec3f, objectNormal: vec3f) -> LightInfo {
// Note: here I implemented point light - you should modify this function for different light sources

//directional light
  
    // first, get the source intensity
  var intensity = light.intensity; 
  // compute the view direction
  var viewDirection = normalize(lightDir);
  // set the final light info
  var out: LightInfo;
  // the final light intensity depends on the view direction
  out.intensity = intensity * max(dot(viewDirection, -objectNormal), 0);
  // the final light diretion is the current view direction
  out.lightdir = viewDirection;
  out.dist= dot(hitPoint - lightPos,hitPoint - lightPos); 

  return out;
}


// a function to transform hit point to the world coordiantes
fn transformHitPoint(pt: vec3f) -> vec3f {
  var out = pt * volInfo.sizes.xyz;
  //TODO: transform the hit point into the world space - using the voxel motor - MAKE - just transfored
  // out = applyMotorToPoint(out, currBox.motor);
  return out;
}

// a function to transform normal to the world coordiantes
fn transformNormal(n: vec3f) -> vec3f {
  var out = n * volInfo.sizes.xyz;
  //TODO: transform the normal into the world space - using the voxel motor - MAKE - just transfored

  // out = applyMotorToDir(out, currBox.motor);
  return normalize(out);
}

/////////////////////
fn boxDiffuseColor(idx: i32, hitPoint: vec3f) -> vec4f {
  // my box has different colors for each foace
  var color: vec4f;
    switch(idx) {
      case 0: { //front
        let textDim=vec2f(textureDimensions(skyFront,0));
        // color = vec4f(232.f/255, 119.f/255, 34.f/255, 1.); // Bucknell Orange 1
        color=textureLoad(skyFront, vec2i((hitPoint.xy-vec2f(-0.5*box.scale.xy))/box.scale.xy*textDim),0);
        break;
      }
      case 1: { //back
        let textDim=vec2f(textureDimensions(skyBack,0));
        // color = vec4f(232.f/255, 119.f/255, 34.f/255, 1.); // Bucknell Orange 1
        color=textureLoad(skyBack, vec2i((hitPoint.xy-vec2f(-0.5*box.scale.xy))/box.scale.xy*textDim),0);
        break;
      }
      case 2: { //left
        let textDim=vec2f(textureDimensions(skyLeft,0));
        // color = vec4f(232.f/255, 119.f/255, 34.f/255, 1.); // Bucknell Orange 1
        color=textureLoad(skyLeft, vec2i((hitPoint.yz-vec2f(-0.5*box.scale.yz))/box.scale.yz*textDim),0);
        break;
      }
      case 3: { //right
        let textDim=vec2f(textureDimensions(skyRight,0));
        // color = vec4f(232.f/255, 119.f/255, 34.f/255, 1.); // Bucknell Orange 1
        color=textureLoad(skyRight, vec2i((hitPoint.yz-vec2f(-0.5*box.scale.yz))/box.scale.yz*textDim),0);
        break;
      }
      case 4: { //top
        let textDim=vec2f(textureDimensions(skyDown,0));
        // color = vec4f(232.f/255, 119.f/255, 34.f/255, 1.); // Bucknell Orange 1
        color=textureLoad(skyDown, vec2i((hitPoint.xz-vec2f(-0.5*box.scale.xz))/box.scale.xz*textDim),0);
        break;
      }
      case 5: { //down
        let textDim=vec2f(textureDimensions(skyUp,0));
        // color = vec4f(232.f/255, 119.f/255, 34.f/255, 1.); // Bucknell Orange 1
        color=textureLoad(skyUp, vec2i((hitPoint.xz-vec2f(-0.5*box.scale.xz))/box.scale.xz*textDim),0);
        break;
      }
      default: {
        color = vec4f(0.f/255, 255.f/255, 0.f/255, 1.); // Black
        break;
      }
    }
    return color;
  }
/////////////////////
fn traceTerrain(uv: vec2i, p: vec3f, d: vec3f,pBox: vec3f, dBox: vec3f, cameraId: u32) {
  // find camera directions
  var forward = transformDir(vec3f(0, 0, 1), cameraId); // forward
  var right = transformDir(vec3f(1, 0, 0), cameraId); // right
  var up = transformDir(vec3f(0, -1, 0), cameraId); // up

  // find the start and end point
  var hits = rayVolumeIntersection(p, d);
  var delta = 0.001;

  if (hits.y < 0) {
    hits.y = hits.x;
    hits.x = 0;
  }

  var curHit = vec2f(hits.x + delta, hits.z);


  let halfSize: vec3f = volInfo.dims.xyz * volInfo.sizes.xyz * 0.5 / max(max(volInfo.dims.x, volInfo.dims.y), volInfo.dims.z);
  let voxelSize: vec3f = vec3f(1,1,1) * volInfo.sizes.xyz / max(max(volInfo.dims.x, volInfo.dims.y), volInfo.dims.z); // normalized voxel size
  var currHitInfo = rayBoxIntersection(pBox,dBox); ///
  var hitPt = pBox + dBox * currHitInfo.x;
  hitPt = transformBoxHitPoint(hitPt);
  var color = boxDiffuseColor(i32(currHitInfo.y), hitPt); // get the box diffuse property
  var prevPos: vec3f;

  while (curHit.x < hits.y) {
    var curPt: vec3f = p + d * curHit.x + halfSize;
    let vPos = curPt / (voxelSize);
    var minCorner = floor(vPos);
    // var maxCorner = ceil(vPos);
    var maxCorner = minCorner + vec3f(1, 1, 1);

    if (all(vPos >= vec3f(0)) && all(vPos < volInfo.dims.xyz)) {
      let vIdx: i32 = i32(vPos.z) * i32(volInfo.dims.x * volInfo.dims.y)
                      + i32(vPos.y) * i32(volInfo.dims.x)
                      + i32(vPos.x);
      // check which terrain type it is for renderring 
      // TODO: instead of setting, now it should be blending 
      var currFace=faceMapping(vPos-prevPos);
      //color = textureMapping(currFace, curPt);
      
      if (i32(volData[vIdx].terrainType) != 0) {
        var currFace=i32(curHit.y);//faceMapping(-d);
        if (f32(volData[vIdx].terrainType) < volInfo.dims.y * 0.1) {
           // color = vec4f(255.f/255, 250.f/255, 250.f/255, 1.); // Snow
          color = textureMapping(currFace, (vPos - minCorner) / (maxCorner - minCorner), 2);
        }
        else if (f32(volData[vIdx].terrainType) < volInfo.dims.y * 0.35) {
          color = textureMapping(currFace, (vPos - minCorner) / (maxCorner - minCorner), 1); // Mountain
          // color = vec4f(170.f/255, 170.f/255, 0.f/255, 1.); // Grass
        }
        else if (f32(volData[vIdx].terrainType) < volInfo.dims.y * 0.8) {
          color = textureMapping(currFace, (vPos - minCorner) / (maxCorner - minCorner), 0); 
          // color = vec4f(0.f/255, 170.f/255, 0.f/255, 1.); // Grass
        }
        else {
          color = textureMapping(currFace, (vPos - minCorner) / (maxCorner - minCorner), 1);           
          // color = vec4f(96.f/255, 177.f/255, 199.f/255, 0.5); // Water

        }
        //ADDED CODE FROM TRACEBOX LIGHT HERE
        // here, I provide you with the Lambertian shading implementation
        // You need to modify it for other shading model
        // first, get the emit color
        let emit = boxEmitColor(); 
        // then, compute the diffuse color, which depends on the light source
        //   1. get the box diffuse color - i.e. the material property of diffusion on the box
        // var hitPt = spt + rdir * hitInfo.x;
        curPt = transformHitPoint(curPt);
        var diffuse = color; // get the box diffuse property
// ////////////////////////////////////////////////////
//         var startSpt = vec3f(0, 0, 0);
//         var startRDir = normalize(vec3f((f32(uv.x) + 0.5) * psize.x - cameraPoseIn[cameraId].focal.x, (f32(uv.y) + 0.5) * psize.y - cameraPoseIn[cameraId].focal.y, 1));

//         var spt = transformBoxPt(startSpt, cameraId); ///
//         var rdir = transformBoxDir(startRDir,cameraId); ///
//         // compute the intersection to the object
//         var currHitInfo = rayBoxIntersection(currSpt, currRDir); ///

//         var hitPt = spt + rdir * hitInfo.x;
//         hitPt = transformBoxHitPoint(hitPt);
//         // var diffuse = boxDiffuseColor(i32(hitInfo.y), hitPt,goodBox); // get the box diffuse property
//         var diffuse = vec4f(217.f/255, 217.f/255, 214.f/255, 1.);
// ////////////////////////////////////////////////////
        //   2. get the box normal
        var normal = normalize(-vPos+prevPos);
        //   3. transform the normal to the world coordinates
        //   Note: here it is using the box pose/motor and scale. 
        //         you will need to modify this transformation for different objects
        normal = transformNormal(normal);
        //   4. transform the light to the world coordinates
        //   Note: My light is stationary, so Icancel the camera movement to keep it stationary
        // let lightPos = applyMotorToPoint(light.position.xyz, reverse(cameraPose.motor));
        // let lightDir = applyMotorToDir(light.direction.xyz, reverse(cameraPose.motor));
        let lightPos = light.position.xyz;
        let lightDir= light.direction.xyz;
        //   5. transform the hit point to the world coordiantes
        //   Note: the hit point is in the model coordiantes, need to transform back to the world
        //   6. compute the light information
        //   Note: I do the light computation in the world coordiantes because the light intensity depends on the distance and angles in the world coordiantes! If you do it in other coordinate system, make sure you transform them properly back to the world one.
        var lightInfo = getLightInfo(lightPos, lightDir, curPt, normal);
      
        //   7. finally, modulate the diffuse color by the light
        // lightInfo.intensity = toon(lightInfo.intensity, 5);
        diffuse *= saturate(lightInfo.intensity);
        //add
        var ambient = vec4f(0.1, 0.1, 0.1, 1);
        // last, compute the final color. Here Lambertian = emit + diffuse
        color = diffuse + ambient;
        
        break;
      } 
      else {
        // we're hitting air, render particles

        // set the color to the particle color and break the loop
        //render particles based on weather
          // if it is the air, we need to update the hit point, right?
            // If we don't hit anything
        minCorner = minCorner * voxelSize - halfSize;
        maxCorner = minCorner + voxelSize;
        curHit = getNextHitValue(hits.x, curHit, minCorner.z, minCorner.xy, maxCorner.xy, p.z, d.z, p.xy, d.xy, 0); // xy
        curHit = getNextHitValue(hits.x, curHit, maxCorner.z, minCorner.xy, maxCorner.xy, p.z, d.z, p.xy, d.xy, 1);
        curHit = getNextHitValue(hits.x, curHit, minCorner.x, minCorner.yz, maxCorner.yz, p.x, d.x, p.yz, d.yz, 2); // yz
        curHit = getNextHitValue(hits.x, curHit, maxCorner.x, minCorner.yz, maxCorner.yz, p.x, d.x, p.yz, d.yz, 3);
        curHit = getNextHitValue(hits.x, curHit, minCorner.y, minCorner.xz, maxCorner.xz, p.y, d.y, p.xz, d.xz, 5); // xz
        curHit = getNextHitValue(hits.x, curHit, maxCorner.y, minCorner.xz, maxCorner.xz, p.y, d.y, p.xz, d.xz, 4);

        if (weather != 0){

          var isHit = 0;
          var pIdx = -1;
          var numParticles = atomicLoad(&volData[vIdx].numOfParticles);
          for (var i = 0; i < numParticles; i++) {
            pIdx = volData[vIdx].particleIndices[i];
            if (pIdx != -1) {
              var particle = particlesOut[pIdx];
              let t = dot(particle.p.xyz - p, forward) / dot(d, forward);
              let hitPt = p + t * d;

              // determine if hitPt inside the quad centered at the particle using right and up
              let uv = vec2f(dot(right, hitPt - particle.p.xyz), dot(up, hitPt - particle.p.xyz)); 

              let size = 4.;
              if ( ((abs(uv.x)) < size/2) && (abs(uv.y) < size/2) ) {
                if (weather==1){  //rain, blue
                  // color = vec4f(0.,0.,1.,1.);
                  color = vec4f(60.0/256.0,165.0/256.0,207.0/256.0, 0.25);

                }   
                else{
                  color = vec4f(1.,1.,1.,1.);
                }

                //TODO: check weather here to adjust the color for particles
                // see the particle, 
                isHit = 1;
              }
            } else {  
              // reached the end of the loaded indeces, don't need to look for any more
              break;
            }
          }
          if (isHit == 1) { // no need to march if it hits a particle
            break;
          }
        }
      }
      // hit five times q, then five times w, then five times d to see the terrain
    }
    curHit.x += delta;
  }
  // textureStore(outTextureRight, uv, color);
  // TODO: Fix the right texture not texturing
  if (cameraId == 0) {
    textureStore(outTextureLeft, uv, color);
  }
  else {
    textureStore(outTextureRight, uv, color);
  }
}

fn raytrace(p: vec3f, d: vec3f, length: f32, hit: bool) -> f32 {
  // find the start and end point
  var hits = rayVolumeIntersection(p, d);

  var curHit = vec2f(0, hits.z);

  let halfSize: vec3f = volInfo.dims.xyz * volInfo.sizes.xyz * 0.5 / max(max(volInfo.dims.x, volInfo.dims.y), volInfo.dims.z);
  let voxelSize: vec3f = vec3f(1,1,1) * volInfo.sizes.xyz / max(max(volInfo.dims.x, volInfo.dims.y), volInfo.dims.z); // normalized voxel size

  while (curHit.x < length) {
    var curPt: vec3f = p + d * curHit.x + halfSize;
    let vPos = curPt / (voxelSize);
    var minCorner = floor(vPos);
    var maxCorner = ceil(vPos);

    if (all(vPos >= vec3f(0)) && all(vPos < volInfo.dims.xyz)) {
      let vIdx: i32 = i32(vPos.z) * i32(volInfo.dims.x * volInfo.dims.y)
                      + i32(vPos.y) * i32(volInfo.dims.x)
                      + i32(vPos.x);
      if (hit) {
        if (i32(volData[vIdx].terrainType) != 0) {
          return curHit.x;
        }
      }
      else {
        if (i32(volData[vIdx].terrainType) == 0) {
          return curHit.x;
        }
      }
    }
    // If we don't hit anything
    else{
      curHit = getNextHitValue(hits.x, curHit, minCorner.z, minCorner.xy, maxCorner.xy, p.z, d.z, p.xy, d.xy, 1); // xy
      curHit = getNextHitValue(hits.x, curHit, maxCorner.z, minCorner.xy, maxCorner.xy, p.z, d.z, p.xy, d.xy, 0);
      curHit = getNextHitValue(hits.x, curHit, minCorner.x, minCorner.yz, maxCorner.yz, p.x, d.x, p.yz, d.yz, 2); // yz
      curHit = getNextHitValue(hits.x, curHit, maxCorner.x, minCorner.yz, maxCorner.yz, p.x, d.x, p.yz, d.yz, 3);
      curHit = getNextHitValue(hits.x, curHit, minCorner.y, minCorner.xz, maxCorner.xz, p.y, d.y, p.xz, d.xz, 5); // xz
      curHit = getNextHitValue(hits.x, curHit, maxCorner.y, minCorner.xz, maxCorner.xz, p.y, d.y, p.xz, d.xz, 4);
    }
    curHit.x += 0.002;
  }
  return -1;
}


@compute
@workgroup_size(64)
fn resetCellInfo(@builtin(global_invocation_id) global_id: vec3u) {
  let idx = global_id.x;
  if (idx < arrayLength(&volData)) {
    atomicStore(&volData[idx].numOfParticles, 0);
    for (var i = 0; i < 62; i++) {
      volData[idx].particleIndices[i] = -1;
    }
  }
}

@compute
@workgroup_size(256)
fn updateParticle(@builtin(global_invocation_id) global_id: vec3u) {

  let idx = global_id.x;
  // Note: global_id here is the particle index
  if (idx < arrayLength(&particlesIn)) {

    // update everything else
    particlesOut[idx] = particlesIn[idx];

    // do your particle simulation and update (just make them fall for now)
    //adjust weather particle based on fall speed
    if (weather == 1){
      particlesOut[idx].p.y = particlesIn[idx].p.y + 0.005;  //speed of RAIN 
    }
    else if (weather== 2){
      particlesOut[idx].p.y = particlesIn[idx].p.y + 0.0008; //speed of SNOW

    }

    

    // based on the new particle location, put them into a cell
    var p = particlesOut[idx].p.xyz;

    // Compute the cell index based on the volInfo and p
    let voxelSize: vec3f = vec3f(1,1,1) * volInfo.sizes.xyz / max(max(volInfo.dims.x, volInfo.dims.y), volInfo.dims.z); // normalized voxel size
    let vPos = p / (voxelSize);
    let vIdx: i32 = i32(vPos.z) * i32(volInfo.dims.x * volInfo.dims.y)
                      + i32(vPos.y) * i32(volInfo.dims.x)
                      + i32(vPos.x);

    // check the terrain type of the found cell
    let terrain = volData[vIdx].terrainType;
    if (i32(terrain) != 0) {
      // if it is non-air type, destroy the particle/respawn it
      particlesOut[idx].p.y = 1.0;//particlesIn[idx].pInit.y;
    } else {
      // Otherwise, set it to the cell
      // increase the number of particles in the cell
      // Note: because of the atomicAdd, this tgtIdx is unique in each parallized thread
      var tgtIdx = atomicAdd(&volData[vIdx].numOfParticles, 1);
      volData[vIdx].particleIndices[tgtIdx] = i32(idx);
    }
    
  }
}

fn checkBlock(uv: vec2i, p: vec3f, d: vec3f, cameraId: u32) {

  // find the start and end point
  var hits = rayVolumeIntersection(p, d);
  var delta = 0.001;
  var maxLength = 0.075;

  if (hits.y < 0) {
    hits.y = hits.x;
    hits.x = 0;
  }

  var curHit = vec2f(0, hits.z);

  let halfSize: vec3f = volInfo.dims.xyz * volInfo.sizes.xyz * 0.5 / max(max(volInfo.dims.x, volInfo.dims.y), volInfo.dims.z);
  let voxelSize: vec3f = vec3f(1,1,1) * volInfo.sizes.xyz / max(max(volInfo.dims.x, volInfo.dims.y), volInfo.dims.z); // normalized voxel size

  while (curHit.x < maxLength) {
    var curPt: vec3f = p + d * curHit.x + halfSize;
    let vPos = curPt / (voxelSize);
    var minCorner = floor(vPos);
    // var maxCorner = ceil(vPos);
    var maxCorner = minCorner + vec3f(1, 1, 1);

    if (all(vPos >= vec3f(0)) && all(vPos < volInfo.dims.xyz)) {
      let vIdx: i32 = i32(vPos.z) * i32(volInfo.dims.x * volInfo.dims.y)
                      + i32(vPos.y) * i32(volInfo.dims.x)
                      + i32(vPos.x);
      
      if ( (i32(volData[vIdx].terrainType) != 0) ) {
        if (breakBlock > 0.0) {
          volData[vIdx].terrainType = 0;
          break;
        }
      } else {
      curHit = getNextHitValue(hits.x, curHit, minCorner.z, minCorner.xy, maxCorner.xy, p.z, d.z, p.xy, d.xy, 1); // xy
      curHit = getNextHitValue(hits.x, curHit, maxCorner.z, minCorner.xy, maxCorner.xy, p.z, d.z, p.xy, d.xy, 0);
      curHit = getNextHitValue(hits.x, curHit, minCorner.x, minCorner.yz, maxCorner.yz, p.x, d.x, p.yz, d.yz, 2); // yz
      curHit = getNextHitValue(hits.x, curHit, maxCorner.x, minCorner.yz, maxCorner.yz, p.x, d.x, p.yz, d.yz, 3);
      curHit = getNextHitValue(hits.x, curHit, minCorner.y, minCorner.xz, maxCorner.xz, p.y, d.y, p.xz, d.xz, 5); // xz
      curHit = getNextHitValue(hits.x, curHit, maxCorner.y, minCorner.xz, maxCorner.xz, p.y, d.y, p.xz, d.xz, 4);
      }
    }
    curHit.x += delta;
  }
}

fn checkPlace(uv: vec2i, p: vec3f, d: vec3f, cameraId: u32) {

  // find the start and end point
  var hits = rayVolumeIntersection(p, d);
  var delta = 0.001;
  var maxLength = 0.075;
  var minLength = 0.005;
  var prevPos: vec3f;

  if (hits.y < 0) {
    hits.y = hits.x;
    hits.x = 0;
  }

  var curHit = vec2f(0, hits.z);

  let halfSize: vec3f = volInfo.dims.xyz * volInfo.sizes.xyz * 0.5 / max(max(volInfo.dims.x, volInfo.dims.y), volInfo.dims.z);
  let voxelSize: vec3f = vec3f(1,1,1) * volInfo.sizes.xyz / max(max(volInfo.dims.x, volInfo.dims.y), volInfo.dims.z); // normalized voxel size

  while ( (curHit.x < maxLength)  ) {
    var curPt: vec3f = p + d * curHit.x + halfSize;
    let vPos = curPt / (voxelSize);
    var minCorner = floor(vPos);
    // var maxCorner = ceil(vPos);
    var maxCorner = minCorner + vec3f(1, 1, 1);

    if (all(vPos >= vec3f(0)) && all(vPos < volInfo.dims.xyz)) {
      let vIdx: i32 = i32(vPos.z) * i32(volInfo.dims.x * volInfo.dims.y)
                      + i32(vPos.y) * i32(volInfo.dims.x)
                      + i32(vPos.x);
      
      if ( (i32(volData[vIdx].terrainType) != 0) ) {

        let vpIdx: i32 = i32(prevPos.z) * i32(volInfo.dims.x * volInfo.dims.y)
                    + i32(prevPos.y) * i32(volInfo.dims.x)
                    + i32(prevPos.x);
        volData[vpIdx].terrainType = i32(volInfo.dims.y * 0.25);
        break;
        
      } else {
        curHit = getNextHitValue(hits.x, curHit, minCorner.z, minCorner.xy, maxCorner.xy, p.z, d.z, p.xy, d.xy, 1); // xy
        curHit = getNextHitValue(hits.x, curHit, maxCorner.z, minCorner.xy, maxCorner.xy, p.z, d.z, p.xy, d.xy, 0);
        curHit = getNextHitValue(hits.x, curHit, minCorner.x, minCorner.yz, maxCorner.yz, p.x, d.x, p.yz, d.yz, 2); // yz
        curHit = getNextHitValue(hits.x, curHit, maxCorner.x, minCorner.yz, maxCorner.yz, p.x, d.x, p.yz, d.yz, 3);
        curHit = getNextHitValue(hits.x, curHit, minCorner.y, minCorner.xz, maxCorner.xz, p.y, d.y, p.xz, d.xz, 5); // xz
        curHit = getNextHitValue(hits.x, curHit, maxCorner.y, minCorner.xz, maxCorner.xz, p.y, d.y, p.xz, d.xz, 4);
        prevPos = vPos;
      }
    }
    prevPos = vPos;
    curHit.x += delta;
  }
}

@compute
@workgroup_size(1)
fn breakBlocks(@builtin(global_invocation_id) global_id: vec3u, @builtin(workgroup_id) workgroup_id: vec3u)  {
  let cameraId = workgroup_id.z;
  // get the pixel coordiantes
  let uv = vec2i(global_id.xy);
  var texDim: vec2i;
  if (cameraId == 0) {
    texDim = vec2i(textureDimensions(outTextureLeft));
  }
  else {
    texDim = vec2i(textureDimensions(outTextureRight));
  }

  if (uv.x < texDim.x && uv.y < texDim.y) {
    // compute the pixel size
    let psize = vec2f(2, 2) / cameraPoseIn[cameraId].res.xy * cameraPoseIn[cameraId].focal.xy;
    // orthogonal camera ray sent from each pixel center at z = 0
    var spt = vec3f(0, 0, 0);
    var rdir = vec3f(0, 0, 1);

    spt = transformPt(spt, cameraId);
    rdir = transformDir(rdir,cameraId);

    checkBlock(uv, spt, rdir, cameraId);
  }
}

@compute
@workgroup_size(1)
fn placeBlocks(@builtin(global_invocation_id) global_id: vec3u, @builtin(workgroup_id) workgroup_id: vec3u)  {
  let cameraId = workgroup_id.z;
  // get the pixel coordiantes
  let uv = vec2i(global_id.xy);
  var texDim: vec2i;
  if (cameraId == 0) {
    texDim = vec2i(textureDimensions(outTextureLeft));
  }
  else {
    texDim = vec2i(textureDimensions(outTextureRight));
  }

  if (uv.x < texDim.x && uv.y < texDim.y) {
    // compute the pixel size
    let psize = vec2f(2, 2) / cameraPoseIn[cameraId].res.xy * cameraPoseIn[cameraId].focal.xy;
    // orthogonal camera ray sent from each pixel center at z = 0
    var spt = vec3f(0, 0, 0);
    var rdir = vec3f(0, 0, 1);

    spt = transformPt(spt, cameraId);
    rdir = transformDir(rdir,cameraId);

    checkPlace(uv, spt, rdir, cameraId);
  }
}

@compute
@workgroup_size(11, 11, 2)
fn computeProjectiveMain(@builtin(global_invocation_id) global_id: vec3u, @builtin(workgroup_id) workgroup_id: vec3u) {
  let cameraId = workgroup_id.z;
  // get the pixel coordiantes
  let uv = vec2i(global_id.xy);
  var texDim: vec2i;
  if (cameraId == 0) {
    texDim = vec2i(textureDimensions(outTextureLeft));
  }
  else {
    texDim = vec2i(textureDimensions(outTextureRight));
  }
  if (uv.x < texDim.x && uv.y < texDim.y) {
    // compute the pixel size
    let psize = vec2f(2, 2) / cameraPoseIn[cameraId].res.xy * cameraPoseIn[cameraId].focal.xy;
    // orthogonal camera ray sent from each pixel center at z = 0
    var spt = vec3f(0, 0, 0);
    var rdir = vec3f((f32(uv.x) + 0.5) * psize.x - cameraPoseIn[cameraId].focal.x, (f32(uv.y) + 0.5) * psize.y - cameraPoseIn[cameraId].focal.y, 1);
    // apply transformation
    var sptBox = transformBoxPt(spt, cameraId);
    var rdirBox = transformBoxDir(rdir, cameraId);

    spt = transformPt(spt, cameraId);
    rdir = transformDir(rdir, cameraId);
    
    var sptFoot = transformPt(spt, cameraId);

    traceTerrain(uv, spt, rdir, sptBox, rdirBox, cameraId);

    cameraPoseOut[cameraId] = cameraPoseIn[cameraId];
    var newpose = cameraPoseIn[cameraId].motor;
    // TODO: Fix raycasts not working
    if (raytrace(spt, vec3f(0, 1, 0), 0.015, true) < 0) {
      let dt = createTranslator(vec3f(0, 0.0008, 0));
      newpose = geometricProduct(dt, newpose);
    }
    
    var minDir: vec3f;
    var minDist: f32 = 999999;
    var rayDir = vec3f(1, 0, 0);
    var rayDist = raytrace(spt, rayDir, 0.5, false);
    if (rayDist > 0) {
      minDist = rayDist;
      minDir = rayDir;
    }
    rayDir = vec3f(-1, 0, 0);
    rayDist = raytrace(spt, rayDir, 0.5, false);
    if (rayDist < minDist && rayDist > 0) {
      minDist = rayDist;
      minDir = rayDir;
    }
    rayDir = vec3f(0, 0, 1);
    rayDist = raytrace(spt, rayDir, 0.5, false);
    if (rayDist < minDist && rayDist > 0) {
      minDist = rayDist;
      minDir = rayDir;
    }
    rayDir = vec3f(0, 0, -1);
    rayDist = raytrace(spt, rayDir, 0.5, false);
    if (rayDist < minDist && rayDist > 0) {
      minDist = rayDist;
      minDir = rayDir;
    }
    if (minDist > 0) {
      let dt = createTranslator(minDir * minDist);
      newpose = geometricProduct(dt, newpose);
    }
    cameraPoseOut[cameraId].motor = newpose;
  }
}
