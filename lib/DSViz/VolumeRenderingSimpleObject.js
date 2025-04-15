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
import UnitCube from "../DS/UnitCube.js";

export default class VolumeRenderingSimpleObject extends RayTracingObject {
  constructor(device, canvasFormat, camera, showTexture = true, imgPath) {
    super(device, canvasFormat);
    this._volume= new TerrainData();
    this._showTexture = showTexture;
    this._camera = camera;
    this._textList=[]
    for (let i=0; i< imgPath.length; i+=1){
      var someRandomVar=new Image();
      someRandomVar.src=imgPath[i];
      this._textList.push(someRandomVar);
    }
    this._currModel=new Uint32Array([0,0,0,0]);
  }
  
  async createGeometry() {
    await this._volume.init();
    // Create camera buffer to store the camera pose and scale in GPU
    this._cameraBuffer = this._device.createBuffer({
      label: "Camera " + this.getName(),
      size: this._camera._pose.byteLength + this._camera._focal.byteLength + this._camera._resolutions.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    }); 
    // Copy from CPU to GPU - both pose and scales
    this._device.queue.writeBuffer(this._cameraBuffer, 0, this._camera._pose);
    this._device.queue.writeBuffer(this._cameraBuffer, this._camera._pose.byteLength, this._camera._focal);
    this._device.queue.writeBuffer(this._cameraBuffer, this._camera._pose.byteLength + this._camera._focal.byteLength, this._camera._resolutions);
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
      size: this._volume._data.length * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    // Copy from CPU to GPU
    // Note, here we make use of the offset to copy them over one by one
    this._device.queue.writeBuffer(this._dataBuffer, 0, new Float32Array(this._volume._data));


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
  }
  
  updateGeometry() {
    // update the image size of the camera
    this._camera.updateSize(this._imgWidth, this._imgHeight);
    this._device.queue.writeBuffer(this._cameraBuffer, this._camera._pose.byteLength + this._camera._focal.byteLength, this._camera._resolutions);
  }

  updateCameraPose() {
    this._device.queue.writeBuffer(this._cameraBuffer, 0, this._camera._pose);
  }
  
  updateCameraFocal() {
    this._device.queue.writeBuffer(this._cameraBuffer, this._camera._pose.byteLength, this._camera._focal);
  }

  async createShaders() {
    let shaderCode = await this.loadShader("./shaders/tracevolumesimple.wgsl");
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
        buffer: {} // Camera buffer
      }, {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {} // Volume buffer
      }, {
        binding: 2,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: "read-only-storage" } // Data storage buffer
      }, {
        binding: 3,
        visibility: GPUShaderStage.COMPUTE,
        storageTexture: { format: this._canvasFormat } // Texture for the basic volume
      }, {
        binding: 4,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Leaves
      }, {
        binding: 5,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Bottom of Dirt Block
      }, {
        binding: 6,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Top of Grass Block
      }, {
        binding: 7,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Side of Grass Block
      }, {
        binding: 8,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Side of Snow Grass Block
      }, {
        binding: 9,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Top & Bottom of Oak Log Block
      }, {
        binding: 10,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Sides of Oak Log Block
      }, {
        binding: 11,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Top Snow Texture
      }, {
        binding: 12,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Stone Texture
      }, {
        binding: 13,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Gray Scale Leaves Texture
      }, {
        binding: 14,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // Texture Sheet
      }]
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
  }

  createBindGroup(outTexture) {
    // Create a bind group
    this._bindGroup = this._device.createBindGroup({
      label: "Ray Trace Volume Bind Group",
      layout: this._computePipeline.getBindGroupLayout(0),
      entries: [
      {
        binding: 0,
        resource: { buffer: this._cameraBuffer }
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
        resource: outTexture.createView()
      },
      {
        binding: 4,
        resource: this._textureBufferList[0].createView()
      },
      {
        binding: 5,
        resource: this._textureBufferList[1].createView()
      },
      {
        binding: 6,
        resource: this._textureBufferList[2].createView()
      },
      {
        binding: 7,
        resource: this._textureBufferList[3].createView()
      },
      {
        binding: 8,
        resource: this._textureBufferList[4].createView()
      },
      {
        binding: 9,
        resource: this._textureBufferList[5].createView()
      },
      {
        binding: 10,
        resource: this._textureBufferList[6].createView()
      },
      {
        binding: 11,
        resource: this._textureBufferList[7].createView()
      },
      {
        binding: 12,
        resource: this._textureBufferList[8].createView()
      },
      {
        binding: 13,
        resource: this._textureBufferList[9].createView()
      },
      {
        binding: 14,
        resource: this._textureBufferList[10].createView()
      }
      ],
    });
    this._wgWidth = Math.ceil(outTexture.width);
    this._wgHeight = Math.ceil(outTexture.height);
  }
  
  compute(pass) {
    // add to compute pass
    pass.setPipeline(this._computePipeline);        // set the compute projective pipeline
    pass.setBindGroup(0, this._bindGroup);                  // bind the buffer
    pass.dispatchWorkgroups(Math.ceil(this._wgWidth / 16), Math.ceil(this._wgHeight / 16)); // dispatch
  }
}
