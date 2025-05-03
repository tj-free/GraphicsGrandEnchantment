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

import RayTracingObject from "./RayTracingObject.js"
import TerrainData from "../DS/TerrainData.js"

export default class VolumeRenderingSimpleObject extends RayTracingObject {
  constructor(device, canvasFormat, cameras, showTexture = true, imgPath) {
    super(device, canvasFormat);
    this._volume= new TerrainData();
    this._showTexture = showTexture;
    this._cameras = cameras;
    this._textList=[]
    for (let i=0; i< imgPath.length; i+=1){
      var someRandomVar=new Image();
      someRandomVar.src=imgPath[i];
      this._textList.push(someRandomVar);
    }
    this._currModel=new Uint32Array([0,0,0,0]);
    this._step = 0;
    this.initParticles();
  }
  
  async createGeometry() {
    await this._volume.init();
    // Create camera buffer to store the camera pose and scale in GPU
    this._step = 0;
    this._cameraBuffers = [
      this._device.createBuffer({
        label: "Camera Buffer 1 " + this.getName(),
        size: (Math.ceil(this._cameras[0]._pose.byteLength / 16) * 16 +
        Math.ceil(this._cameras[0]._focal.byteLength / 16) * 16 +
        Math.ceil(this._cameras[0]._resolutions.byteLength / 16) * 16) * this._cameras.length,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      }),
      this._device.createBuffer({
        label: "Camera Buffer 2 " + this.getName(),
        size: (Math.ceil(this._cameras[0]._pose.byteLength / 16) * 16 +
        Math.ceil(this._cameras[0]._focal.byteLength / 16) * 16 +
        Math.ceil(this._cameras[0]._resolutions.byteLength / 16) * 16) * this._cameras.length,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      }),
    ]
    // Copy from CPU to GPU - both pose and scales
    var offset = 0;
    for (let i = 0; i < this._cameras.length; i++) {
      this._device.queue.writeBuffer(this._cameraBuffers[this._step % 2], offset, this._cameras[i]._pose);
      this._device.queue.writeBuffer(this._cameraBuffers[this._step % 2], this._cameras[i]._pose.byteLength + offset, this._cameras[i]._focal);
      this._device.queue.writeBuffer(this._cameraBuffers[this._step % 2], this._cameras[i]._pose.byteLength + this._cameras[i]._focal.byteLength + offset, this._cameras[i]._resolutions);
      offset += this._cameras[i]._pose.byteLength + this._cameras[i]._focal.byteLength + this._cameras[i]._resolutions.byteLength
    }
    // Create uniform buffer to store the volume dimensions and voxel sizes in GPU
    this._volumeBuffer = this._device.createBuffer({
      label: "Volume " + this.getName(),
      size: (this._volume._dims.length + this._volume._sizes.length + 2) * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    }); 
    // Copy from CPU to GPU - both dims and sizes
    this._device.queue.writeBuffer(this._volumeBuffer, 0, new Float32Array([... this._volume._dims, 0, ...this._volume._sizes, 0]));
    
    
    // Create data buffer to store the volume data in GPU
    this._dataBuffer = this._device.createBuffer({
      label: "Data " + this.getName(),
      size: this._volume._data.length * Int32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    // Copy from CPU to GPU
    // Note, here we make use of the offset to copy them over one by one
    this._device.queue.writeBuffer(this._dataBuffer, 0, new Int32Array(this._volume._data));

     // Create light buffer to store the light in GPU
    // Note: our light has a common memory layout - check the abstract light class
    this._lightBuffer = this._device.createBuffer({
      label: "Light " + this.getName(),
      size: 24 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    }); 

    this._bitmapList=[];
    this._textureBufferList=[];
    for (let i=0; i< this._textList.length; i+=1){
      await this._textList[i].decode();
      var bitmap= await createImageBitmap(this._textList[i]);
      this._bitmapList.push(bitmap);

      var textureBuffer=this._device.createTexture({
        label: "Texture " + this.getName(),
        size: [this._bitmapList[i].width, this._bitmapList[i].height, 1],
        format: "rgba8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      }); 
      this._textureBufferList.push(textureBuffer);
      this._device.queue.copyExternalImageToTexture({source: this._bitmapList[i]}, {texture: this._textureBufferList[i]},[this._bitmapList[i].width, this._bitmapList[i].height]);
    }

    // create a texture sampler
    this._sampler = this._device.createSampler({
      magFilter: "linear",
      minFilter: "linear"
    });

    await this.createParticleGeometry();
  }
  
  updateGeometry() {
    // update the image size of the camera
    var offset = this._cameras[0]._pose.byteLength + this._cameras[0]._focal.byteLength;
    for (let i = 0; i < this._cameras.length; i++) {
      this._cameras[i].updateSize(this._imgWidth, this._imgHeight);
      this._device.queue.writeBuffer(this._cameraBuffers[this._step % 2], offset, this._cameras[i]._resolutions);
      offset += this._cameras[i]._pose.byteLength + this._cameras[i]._focal.byteLength + this._cameras[i]._resolutions.byteLength;
    }
  }

  updateCameraPose() {
    var offset = 0;
    for (let i = 0; i < this._cameras.length; i++) {
      this._device.queue.writeBuffer(this._cameraBuffers[this._step % 2], offset, this._cameras[i]._pose);
      offset += this._cameras[i]._pose.byteLength + this._cameras[i]._focal.byteLength + this._cameras[i]._resolutions.byteLength;
    }
  }
  
  updateCameraFocal() {
    var offset = this._cameras[0]._pose.byteLength;
    for (let i = 0; i < this._cameras.length; i++) {
      this._device.queue.writeBuffer(this._cameraBuffers[this._step % 2], offset, this._cameras[i]._focal);
      offset += this._cameras[i]._pose.byteLength + this._cameras[i]._focal.byteLength + this._cameras[i]._resolutions.byteLength;
    }
  }

  updateLight(light) {
    // this function update the light buffer
    let offset = 0;
    this._device.queue.writeBuffer(this._lightBuffer, offset, light._intensity);
    offset += light._intensity.byteLength;
    this._device.queue.writeBuffer(this._lightBuffer, offset, light._position);
    offset += light._position.byteLength;
    this._device.queue.writeBuffer(this._lightBuffer, offset, light._direction);
    offset += light._direction.byteLength;
    this._device.queue.writeBuffer(this._lightBuffer, offset, light._attenuation);
    offset += light._attenuation.byteLength;
    this._device.queue.writeBuffer(this._lightBuffer, offset, light._params);
    offset += light._params.byteLength;
    this._device.queue.writeBuffer(this._lightBuffer, offset, this._currModel);
  }

  // iterateWeatherLight(directionalLight, weatherLightValues, currWeather){
  //   directionalLight._intensity[0]= weatherLightValues[currWeather]
  //   directionalLight._intensity[1]=  weatherLightValues[currWeather]
  //   directionalLight._intensity[2]=  weatherLightValues[currWeather]
  // }

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
  
  initParticles() {
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

  async createParticleGeometry() {
    // create time buffer
    this._timeBuffer = this._device.createBuffer({
      label: "Time",
      size: 4, // 32 bits, 4 bytes in a float
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const time = performance.now()/1000;
    // Copy from CPU to GPU
    this._device.queue.writeBuffer(this._timeBuffer, 0, new Float32Array([time]));

    // create weather buffer
    this._weatherBuffer = this._device.createBuffer({
      label: "Weather",
      size: 4, // 32 bits, 4 bytes in a float
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this._weather = 0; // sunny
    // Copy from CPU to GPU
    this._device.queue.writeBuffer(this._weatherBuffer, 0, new Float32Array([this._weather]));
    
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
      // x position
      this._particles[vars * i + 0] = (Math.random() * 0.5); // [-1, 1] 
      // y position
      this._particles[vars * i + 1] = (Math.random() * 0.5); // [-1, 1] 
      // z position
      this._particles[vars * i + 2] = (Math.random() * 0.5); // [-1, 1] 
      // dummy for vector
      this._particles[vars * i + 3] = 0; 

      // init positions
      // x init position
      this._particles[vars * i + 4] = this._particles[vars * i + 1];
      // y init position
      this._particles[vars * i + 5] = this._particles[vars * i + 2];
      // z init position
      this._particles[vars * i + 6] = this._particles[vars * i + 3];
      // dummy for vector4f
      this._particles[vars * i + 7] = 0;


      // x vel
      let random = Math.floor(Math.random() * (1 - 0.5 + 1)) + 1;
      this._particles[vars * i + 8] = (Math.random() * -prtSpd);
      // y vel
      this._particles[vars * i + 9] = (Math.random() * -prtSpd);
      // z vel
      this._particles[vars * i + 10] = (Math.random() * -prtSpd);
      // dummy for vector4f
      this._particles[vars * i + 11] = 0;

      // init velocities
      // x init vel
      this._particles[vars * i + 12] = this._particles[vars * i + 7];
      // y init vel
      this._particles[vars * i + 13] = this._particles[vars * i + 8];
      // z init vel
      this._particles[vars * i + 14] = this._particles[vars * i + 9];
      // dummy for vector4f
      this._particles[vars * i + 15] = 0;

      // type 
      if (i >= this._numWeatherParticles + this._numLeafParticles) {
        this._particles[vars * i + 16] = 4; // fragment
      } else if (i >= this._numWeatherParticles) {
        this._particles[vars * i + 16] = 3; // leaf
      } else {
        this._particles[vars * i + 16] = 0; // weather (0 for no type, 1 for rain, 2 for snow)
      }

      // gravity
      this._particles[vars * i + 17] = 0.0;

      // wind
      this._particles[vars * i + 18] = 0.0;

      // lifetime
      this._particles[vars * i + 19] = 0.0;

      // range
      this._particles[vars * i + 20] = 64.0;

      //dummies
      this._particles[vars * i + 21] = 0;
      this._particles[vars * i + 22] = 0;
      this._particles[vars * i + 23] = 0;
      this._particles[vars * i + 24] = 0;
      this._particles[vars * i + 25] = 0;
      this._particles[vars * i + 26] = 0;
      this._particles[vars * i + 27] = 0;
      this._particles[vars * i + 28] = 0;
      this._particles[vars * i + 29] = 0;
      this._particles[vars * i + 30] = 0;
      this._particles[vars * i + 31] = 0;
    }
    
    // Copy from CPU to GPU
    this._step = 0;
    this._device.queue.writeBuffer(this._particleBuffers[this._step % 2], 0, this._particles);
  }



  async createShaders() {
    let shaderCode = await this.loadShader("./shaders/traceParticles.wgsl");
    this._shaderModule = this._device.createShaderModule({
      label: " Shader " + this.getName(),
      code: shaderCode,
    });
    // Create the bind group layout
    this._bindGroupLayout = this._device.createBindGroupLayout({
      label: "Ray Trace Volume Layout " + this.getName(),
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: "read-only-storage" } // Camera buffer
      }, {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: "storage" } // Camera buffer
      },{
        binding: 2,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {type: "storage"} // Data storage buffer
      }, {
        binding: 3,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: "read-only-storage" } // Data storage buffer
      }, {
        binding: 4,
        visibility: GPUShaderStage.COMPUTE,
        storageTexture: { format: this._canvasFormat } // Texture for the basic volume
      }, {
        binding: 5,
        visibility: GPUShaderStage.COMPUTE,
        storageTexture: { format: this._canvasFormat } // Texture for the basic volume
      }, {
        binding: 6,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Leaves
      }, {
        binding: 7,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Bottom of Dirt Block
      }, {
        binding: 8,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Top of Grass Block
      }, {
        binding: 9,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Side of Grass Block
      }, {
        binding: 10,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Side of Snow Grass Block
      }, {
        binding: 11,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Top & Bottom of Oak Log Block
      }, {
        binding: 12,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Sides of Oak Log Block
      }, {
        binding: 13,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Top Snow Texture
      }, {
        binding: 14,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Stone Texture
      }, {
        binding: 15,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Gray Scale Leaves Texture
      }, {
        binding: 16,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Texture Sheet
      },
      {
        binding: 17,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {} // Light uniform buffer
      }, {
        binding: 18,
        visibility: GPUShaderStage.COMPUTE,
        sampler: {}
      },{
        binding: 19,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
        buffer: { type: "read-only-storage"} // Cell status input buffer
      }, {
        binding: 20,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: "storage"} // Cell status output buffer
      }, {
        binding: 21,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {} // uniform buffer
      }, {
        binding: 22,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {}
      }
    ]
    });
    this._pipelineLayout = this._device.createPipelineLayout({
      label: "Ray Trace Volume Pipeline Layout",
      bindGroupLayouts: [ this._bindGroupLayout ],
    });
  }
  
  async createComputePipeline() {
    // Create a compute pipeline that updates the image.
    this._computePipeline = this._device.createComputePipeline({
      label: "Ray Trace Volume Projective Pipeline " + this.getName(),
      layout: this._pipelineLayout,
      compute: {
        module: this._shaderModule,
        entryPoint: "computeProjectiveMain",
      }
    });
    await this.createResetPipeline();
    await this.createUpdatePipeline();
  }

  async createResetPipeline() {
    // Create a compute pipeline that resets the particles
    this._resetPipeline = this._device.createComputePipeline({
      label: "Cell Reset Pipeline" + this.getName(),
      layout: this._pipelineLayout,
      compute: {
        module: this._shaderModule,
        entryPoint: "resetCellInfo",
      }
    });
  }

  async createUpdatePipeline() {
    // Create a compute pipeline that updates particles
    this._updatePipeline = this._device.createComputePipeline({
      label: "Particle Update Pipeline" + this.getName(),
      layout: this._pipelineLayout,
      compute: {
        module: this._shaderModule,
        entryPoint: "updateParticle",
      }
    });
  }

  createBindGroup(outTextureLeft, outTextureRight) {
    this._bindGroups = [
      this._device.createBindGroup({
        layout: this._computePipeline.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: { buffer: this._cameraBuffers[0] }
          },
          {
            binding: 1,
            resource: { buffer: this._cameraBuffers[1] }
          },
          {
            binding: 2,
            resource: { buffer: this._volumeBuffer }
          },
          {
            binding: 3,
            resource: { buffer: this._dataBuffer }
          },
          {
            binding: 3,
            resource: outTextureLeft.createView()
          },
          {
            binding: 4,
            resource: outTextureRight.createView()
          },
          {
            binding: 5,
            resource: this._textureBufferList[0].createView()
          },
          {
            binding: 6,
            resource: this._textureBufferList[1].createView()
          },
          {
            binding: 7,
            resource: this._textureBufferList[2].createView()
          },
          {
            binding: 8,
            resource: this._textureBufferList[3].createView()
          },
          {
            binding: 9,
            resource: this._textureBufferList[4].createView()
          },
          {
            binding: 10,
            resource: this._textureBufferList[5].createView()
          },
          {
            binding: 11,
            resource: this._textureBufferList[6].createView()
          },
          {
            binding: 12,
            resource: this._textureBufferList[7].createView()
          },
          {
            binding: 13,
            resource: this._textureBufferList[8].createView()
          },
          {
            binding: 14,
            resource: this._textureBufferList[9].createView()
          },
          {
            binding: 15,
            resource: this._textureBufferList[10].createView()
          },
          {
            binding: 16,
            resource: { buffer: this._particleBuffers[0] }
          },
          {
            binding: 17,
            resource: { buffer: this._particleBuffers[1] }
          },
          {
            binding: 18,
            resource: { buffer: this._timeBuffer }
          },
          {
            binding: 19,
            resource: { buffer: this._weatherBuffer }
          }
          ],
      }),
      this._device.createBindGroup({
        layout: this._computePipeline.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: { buffer: this._cameraBuffers[1] }
          },
          {
            binding: 1,
            resource: { buffer: this._cameraBuffers[2] }
          },
          {
            binding: 1,
            resource: { buffer: this._volumeBuffer }
          },
          {
            binding: 2,
            resource: { buffer: this._dataBuffer }
          },
          {
            binding: 3,
            resource: outTextureLeft.createView()
          },
          {
            binding: 4,
            resource: outTextureRight.createView()
          },
          {
            binding: 5,
            resource: this._textureBufferList[0].createView()
          },
          {
            binding: 6,
            resource: this._textureBufferList[1].createView()
          },
          {
            binding: 7,
            resource: this._textureBufferList[2].createView()
          },
          {
            binding: 8,
            resource: this._textureBufferList[3].createView()
          },
          {
            binding: 9,
            resource: this._textureBufferList[4].createView()
          },
          {
            binding: 10,
            resource: this._textureBufferList[5].createView()
          },
          {
            binding: 11,
            resource: this._textureBufferList[6].createView()
          },
          {
            binding: 12,
            resource: this._textureBufferList[7].createView()
          },
          {
            binding: 13,
            resource: this._textureBufferList[8].createView()
          },
          {
            binding: 14,
            resource: this._textureBufferList[9].createView()
          },
          {
            binding: 15,
            resource: this._textureBufferList[10].createView()
          },
          {
            binding: 16,
            resource: { buffer: this._particleBuffers[1] }
          },
          {
            binding: 16,
            resource: { buffer: this._particleBuffers[1] }
          },
          {
            binding: 17,
            resource: { buffer: this._particleBuffers[0] }
          },
          {
            binding: 18,
            resource: { buffer: this._timeBuffer }
          },
          {
            binding: 19,
            resource: { buffer: this._weatherBuffer }
          }
        ],
      })
    ];
    this._wgWidth = Math.ceil(outTextureLeft.width);
    this._wgHeight = Math.ceil(outTextureLeft.height);
  }
  
  compute(pass) {
    pass.setBindGroup(0, this._bindGroups[this._step % 2]);

    // first, there should be a compute pass to clear the acc structure
    pass.setPipeline(this._resetPipeline);
    const numCells = this._volume._dims[0] * this._volume._dims[1] * this._volume._dims[2];
    pass.dispatchWorkgroups(Math.ceil(numCells / 64));

    // second, add update particles compute pass
    pass.setPipeline(this._updatePipeline);
    pass.dispatchWorkgroups(Math.ceil(this._numParticles / 256));
    
    // last, add rendering compute pass
    pass.setPipeline(this._computePipeline);        // set the compute projective pipeline
    pass.setBindGroup(0, this._bindGroup);                  // bind the buffer
    pass.dispatchWorkgroups(16, 16, 2); // dispatch
    ++this._step
    const time = performance.now()/1000;
    this._device.queue.writeBuffer(this._timeBuffer, 0, new Float32Array([time]));
    //console.log("Called");
  }
}
