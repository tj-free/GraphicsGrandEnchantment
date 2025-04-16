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

import SceneObject from '/lib/DSViz/SceneObject.js'

export default class ParticleSystemObject extends SceneObject {
  constructor(device, canvasFormat, canvasTag, camera) {
    super(device, canvasFormat);
    this._numParticles = numParticles;
    this._step = 0;
    this._canvasTag = canvasTag;
    this.camera = camera;

    // rain and snow
    this._numWeatherParticles = 51200;

    // leaves per tree
    this._leavesPerTree = 10;

    // TODO find number of trees in 
    this._numLeafParticles = 0;

    // fragments per block break
    this._numFragParticles = 25 * 5;

    this._numParticles = this._numWeatherParticles + this._numLeafParticles + this._numFragParticles;
  }

  

  
  async createGeometry() { 
    await this.createParticleGeometry();

  }

  async cycleWeather() {
    // cycle the weather, loop back around if needed
    this._weather += 1;
    if (this._weather > 2) this._weather = 0;

    // update buffer
    this._device.queue.writeBuffer(this._weatherBuffer, 0, this._weather);
  }

  

  async generateLeaves(tree) {
    // add leaf particles beneath the leaf blocks
    // define the bottom of the leaves as a plane
  }

  async generateFragments(block) {
    // add fragment particles at the center of the block
  }
  
  async createParticleGeometry() {
    // create time buffer
    this._timeBuffer = this._device.createBuffer({
      label: "Time",
      size: 4, // 32 bits, 4 bytes in a float
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this._weather = 0; // sunny
    // Copy from CPU to GPU
    this._device.queue.writeBuffer(this._weatherBuffer, 0, this._weather);

    // create weather buffer
    this._weatherBuffer = this._device.createBuffer({
      label: "Weather",
      size: 4, // 32 bits, 4 bytes in a float
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const time = performance.now()/1000;
    // Copy from CPU to GPU
    this._device.queue.writeBuffer(this._timeBuffer, 0, new Float32Array([time]));

    // Create particles
    this._particles = new Float32Array(this._numParticles * 32); // [x, y, ix, iy, vx, vy, ls, ils]
    // TODO 1 - create ping-pong buffers to store and update the particles in GPU
    // name the ping-pong buffers _particleBuffers
    
    // Create a storage ping-pong-buffer to hold the particle.
    this._particleBuffers = [
      this._device.createBuffer({
        label: "Grid status Buffer 1 " + this.getName(),
        size: this._particles.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      }),
      this._device.createBuffer({
        label: "Grid status Buffer 2 " + this.getName(),
        size: this._particles.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      })
    ];
    
    // calling the resetParticles function to reset the particle buffers
    this.resetParticles();
  }
    
  resetParticles() {
    // each particle contains:
    // type
    // (x,y,z)
    // (x,y,z) init
    // (x,y,z) speed
    // (x,y,z) init speed
    // gravity
    // wind
    // lifetime - how long the particle has been alive
    // range - how far away the particle can spawn in x,z direction

    const prtSpd = 0.01;
    const vars = 16;
    for (let i = 0; i < this._numParticles; ++i) {
      // type 
      if (i >= this._numWeatherParticles + this._numLeafParticles) {
        this._particles[vars * i + 0] = 4; // fragment
      } else if (i >= this._numWeatherParticles) {
        this._particles[vars * i + 0] = 3; // leaf
      } else {
        this._particles[vars * i + 0] = 0; // weather (0 for no type, 1 for rain, 2 for snow)
      }

      // x position
      this._particles[vars * i + 1] = (Math.random() * 0.5); // [-1, 1] 
      this._particles[vars * i + 2] = 0.75; //(Math.random() * 2 - 1);

      // y position
      this._particles[vars * i + 3] = (Math.random() * 0.5); // [-1, 1] 
      this._particles[vars * i + 4] = 0.75; //(Math.random() * 2 - 1);

      // z position
      this._particles[vars * i + 5] = (Math.random() * 0.5); // [-1, 1] 
      this._particles[vars * i + 6] = 0.75; //(Math.random() * 2 - 1);

      // init positions
      // x init position
      this._particles[vars * i + 7] = this._particles[vars * i + 1];
      this._particles[vars * i + 8] = this._particles[vars * i + 2];
      // y init position
      this._particles[vars * i + 9] = this._particles[vars * i + 3];
      this._particles[vars * i + 10] = this._particles[vars * i + 4];
      // z init position
      this._particles[vars * i + 11] = this._particles[vars * i + 5];
      this._particles[vars * i + 12] = this._particles[vars * i + 6];

      // x vel
      let random = Math.floor(Math.random() * (1 - 0.5 + 1)) + 1;
      this._particles[vars * i + 13] = (0.75) * 0.001;//(Math.random() * prtSpd - prtSpd/2);
      this._particles[vars * i + 14] = (Math.random() * -prtSpd);

      // y vel
      this._particles[vars * i + 15] = (0.75) * 0.001;//(Math.random() * prtSpd - prtSpd/2);
      this._particles[vars * i + 16] = (Math.random() * -prtSpd);

      // z vel
      this._particles[vars * i + 17] = (0.75) * 0.001;//(Math.random() * prtSpd - prtSpd/2);
      this._particles[vars * i + 18] = (Math.random() * -prtSpd);

      // init velocities
      // x init vel
      this._particles[vars * i + 19] = this._particles[vars * i + 13];
      this._particles[vars * i + 20] = this._particles[vars * i + 14];
      // y init vel
      this._particles[vars * i + 21] = this._particles[vars * i + 15];
      this._particles[vars * i + 22] = this._particles[vars * i + 16];
      // z init vel
      this._particles[vars * i + 23] = this._particles[vars * i + 17];
      this._particles[vars * i + 24] = this._particles[vars * i + 18];

      // gravity
      this._particles[vars * i + 25] = 0.0;

      // wind
      this._particles[vars * i + 26] = 0.0;

      // lifetime
      this._particles[vars * i + 27] = 0.0;

      // range
      this._particles[vars * i + 27] = 64.0;

      //dummies
      this._particles[vars * i + 28] = 0;
      this._particles[vars * i + 29] = 0;
      this._particles[vars * i + 30] = 0;
      this._particles[vars * i + 31] = 0;
    }
    
    // Copy from CPU to GPU
    this._step = 0;
    this._device.queue.writeBuffer(this._particleBuffers[this._step % 2], 0, this._particles);
  }
  
  updateGeometry() { }
  
  async createShaders() {
    let shaderCode = await this.loadShader("/shaders/particles.wgsl");
    this._shaderModule = this._device.createShaderModule({
      label: "Particles Shader " + this.getName(),
      code: shaderCode,
    });
    // TODO 2 - Create the bind group layout for using the ping-pong buffers in the GPU
    // name the bind group layout _bindGroupLayout
    this._bindGroupLayout = this._device.createBindGroupLayout({
      label: "Grid Bind Group Layout " + this.getName(),
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
        buffer: { type: "read-only-storage"} // Cell status input buffer
      }, {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: "storage"} // Cell status output buffer
      }, {
        binding: 2,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {} // uniform buffer
      }, {
        binding: 3,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {}
      }]
    });
    
    
    
    // create the pipeline layout using the bind group layout
    this._pipelineLayout = this._device.createPipelineLayout({
      label: "Particles Pipeline Layout",
      bindGroupLayouts: [ this._bindGroupLayout ],
    });
  }
  
  async createRenderPipeline() { 
    await this.createParticlePipeline();
  }
  
  async createParticlePipeline() {
    this._particlePipeline = this._device.createRenderPipeline({
      label: "Particles Render Pipeline " + this.getName(),
      layout: this._pipelineLayout,
      vertex: {
        module: this._shaderModule, 
        entryPoint: "vertexMain",
      },
      fragment: {
        module: this._shaderModule,
        entryPoint: "fragmentMain",
        targets: [{
          format: this._canvasFormat,
          blend: {
            color: {
                srcFactor: 'one',
                dstFactor: 'one-minus-src-alpha',
                operator: 'add',
            },
            alpha: {
              srcFactor: 'one',
              dstFactor: 'one-minus-src-alpha',
              operator: 'add',
            },
          },
        }]
      }
    }); 
    // Create bind group to bind the particle buffers
    this._bindGroups = [
      this._device.createBindGroup({
        layout: this._particlePipeline.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: { buffer: this._particleBuffers[0] }
          },
          {
            binding: 1,
            resource: { buffer: this._particleBuffers[1] }
          },
          {
            binding: 2,
            resource: { buffer: this._timeBuffer }
          },
          {
            binding: 3,
            resource: { buffer: this._weatherBuffer }
          }
        ],
      }),
      this._device.createBindGroup({
        layout: this._particlePipeline.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: { buffer: this._particleBuffers[1] }
          },
          {
            binding: 1,
            resource: { buffer: this._particleBuffers[0] }
          },
          {
            binding: 2,
            resource: { buffer: this._timeBuffer }
          },
          {
            binding: 3,
            resource: { buffer: this._weatherBuffer }
          }
        ],
      })
    ];
  }
  
  render(pass) { 
    pass.setPipeline(this._particlePipeline); 
    pass.setBindGroup(0, this._bindGroups[this._step % 2]);
    pass.draw(128, this._numParticles);
  }
  
  async createComputePipeline() { 
    this._computePipeline = this._device.createComputePipeline({
      label: "Particles Compute Pipeline " + this.getName(),
      layout: this._pipelineLayout,
      compute: {
        module: this._shaderModule,
        entryPoint: "computeMain",
      }
    });
  }
  
  compute(pass) { 
    pass.setPipeline(this._computePipeline);
    pass.setBindGroup(0, this._bindGroups[this._step % 2]);
    pass.dispatchWorkgroups(Math.ceil(this._numParticles / 256));
    ++this._step
    const time = performance.now()/1000;
    this._device.queue.writeBuffer(this._timeBuffer, 0, new Float32Array([time]));

    
    
  }
}