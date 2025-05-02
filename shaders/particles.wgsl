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

// TODO 3: Define a struct to store a particle
struct Particle {
  positions: vec2f,
  initPos: vec2f,
  velocity: vec2f,
  initVel: vec2f,
  lifespan: vec2f
};

// TODO 4: Write the bind group spells here using array<Particle>
// name the binded variables particlesIn and particlesOut
@group(0) @binding(0) var<storage> particlesIn: array<Particle>;
@group(0) @binding(1) var<storage,read_write> particlesOut: array<Particle>;
@group(0) @binding(2) var<uniform> time: f32;

struct VertexOutput {
  @builtin(position) pos: vec4f,
  @location(0) dist: f32,
}

@vertex
fn vertexMain(@builtin(instance_index) idx: u32, @builtin(vertex_index) vIdx: u32) -> VertexOutput {
  // TODO 5: Revise the vertex shader to draw circle to visualize the particles
  let particle = particlesIn[idx].positions;
  
  var dist = length(particle - vec2f(0,-1)) * 512; // address
  if (dist > 255) {
    dist = 255;
  }
  let size = 0.0125 * (255 - dist) / 255;

  let currLife = particlesIn[idx].lifespan[0];
  let maxLife = particlesIn[idx].lifespan[1];
  //let size = 0.0125 * (currLife/maxLife);
  let pi = 3.14159265;
  let theta = 2. * pi / 8 * f32(vIdx);
  let x = cos(theta) * size;
  let y = sin(theta) * size;
  var out: VertexOutput;
  out.pos = vec4f(vec2f(x + particle[0], y + particle[1]), 0, 1);
  out.dist = dist;
  return out;
}

@fragment
fn fragmentMain(@location(0) dist: f32) -> @location(0) vec4f {
    let center = vec4f(253./255,207./255,88./255, 1.);
    let mid = vec4f(242./255,125./255,12./255, 1.);
    let edge = vec4f(128./255,9./255,9./255, 1.);
    // dist is between 0 and 255
    if (dist > 128.) {
      let t = (dist - 128.) / (255. - 128.);
      return edge * t + mid * (1 - t);
    }
    else {
      let t = (128. - dist) / 128.;
    return center * t + mid * (1 - t);
  } 

  //return vec4f(238.f/255, 118.f/255, 35.f/255, 1); // (R, G, B, A)
}


fn generateWind(time: f32, frequency: f32, strength: f32) -> vec2f {
  let angle = sin(time * frequency) * 3.14159265;
  return vec2f(cos(angle), sin(angle)) * strength;
}

fn rand(offset: f32) -> f32 {
  return fract(sin(time + offset) * 43758.5453);
}

@compute @workgroup_size(256)
fn computeMain(@builtin(global_invocation_id) global_id: vec3u) {
  // TODO 6: Revise the compute shader to update the particles using the velocity
  let idx = global_id.x;

  if (idx < arrayLength(&particlesIn)) {
    // Get particle data
    let oldPos = particlesIn[idx].positions;
    let initPos = particlesIn[idx].initPos;
    let oldVel = particlesIn[idx].velocity;
    let initVel = particlesIn[idx].initVel;
    let currLife = particlesIn[idx].lifespan[0];
    let maxLife = particlesIn[idx].lifespan[1];
    let pSpeed = 0.01;

    // define constants
    let gravity = -0.0001;
    let wind = 0.0; //generateWind(f32(oldPos[1]), 1.5, 0.00005); //Wind effect based on y position

    // calculate new values
    let newPos = oldPos + oldVel;
    let newLife = currLife - 1;
    let newVel = vec2f(oldVel[0],oldVel[1] + gravity) - wind;

    // TODO 7: Add boundary checking and respawn the particle when it is offscreen
    let offscreen = abs(newPos[0]) > 1 || abs(newPos[1]) > 1;
    let dead = (currLife <= 0);
    if (offscreen || dead) {
      particlesOut[idx].positions = initPos;
      particlesOut[idx].lifespan[0] = maxLife;
      particlesOut[idx].velocity = vec2f((rand(oldVel[0])*pSpeed) - (pSpeed/2),rand(oldVel[1])*pSpeed);
    } else {
      // lock in positions
      particlesOut[idx].positions = newPos;
      particlesOut[idx].lifespan[0] = newLife;
      particlesOut[idx].velocity = newVel;
      // pull it back to the center
      particlesOut[idx].positions[0] += (0 - oldPos[0]/10) * 0.15;
      // damp the x velocity
      particlesOut[idx].velocity[0] *= 0.98;
    }

    
    
    // fill the remaining values
    particlesOut[idx].lifespan[1] = maxLife;
    particlesOut[idx].initPos = initPos;
    particlesOut[idx].initVel = initVel;
  }
}