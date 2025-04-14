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
import UnitCube from "../DS/UnitCube.js"
import SmallUnitCube from "../DS/UnitCube2.js";

export default class RayTracingBoxLightObject extends RayTracingObject {
  constructor(device, canvasFormat, camera, showTexture = true, imgPath) {
    super(device, canvasFormat);
    // this._box = new UnitCube();
    // this._secondBox= new SmallUnitCube();
    this._box=[new UnitCube(), new SmallUnitCube()];
    this._camera = camera;
    this._showTexture = showTexture;
    this._textList=[]
    for (let i=0; i< imgPath.length; i+=1){
      var someRandomVar=new Image();
      someRandomVar.src=imgPath[i];
      this._textList.push(someRandomVar);
    }
    this._currModel=new Uint32Array([0,0,0,0]);
  }
  async createGeometry() {
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
    // 
    // Create box buffer to store the box in GPU
    // Note, here we combine all the information in one buffer
    this._boxBuffer = this._device.createBuffer({
      label: "Box " + this.getName(),
      size: 2*(this._box[0]._pose.byteLength + this._box[0]._scales.byteLength + this._box[0]._top.byteLength * 6),
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // this._secondBoxBuffer = this._device.createBuffer({
    //   label: "Box " + this.getName(),
    //   size: this._secondBox._pose.byteLength + this._secondBox._scales.byteLength + this._secondBox._top.byteLength * 6,
    //   usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    // });
    // Copy from CPU to GPU
    // Note, here we make use of the offset to copy them over one by one
    let offset = 0;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box[0]._pose);
    offset += this._box[0]._pose.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box[0]._scales);
    offset += this._box[0]._scales.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box[0]._front);
    offset += this._box[0]._front.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box[0]._back);
    offset += this._box[0]._back.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box[0]._left);
    offset += this._box[0]._left.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box[0]._right);
    offset += this._box[0]._right.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box[0]._top);
    offset += this._box[0]._top.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box[0]._down);
    offset += this._box[0]._top.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box[1]._pose);
    offset += this._box[1]._pose.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box[1]._scales);
    offset += this._box[1]._scales.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box[1]._front);
    offset += this._box[1]._front.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box[1]._back);
    offset += this._box[1]._back.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box[1]._left);
    offset += this._box[1]._left.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box[1]._right);
    offset += this._box[1]._right.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box[1]._top);
    offset += this._box[1]._top.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box[1]._down);

    // Create light buffer to store the light in GPU
    // Note: our light has a common memory layout - check the abstract light class
    this._lightBuffer = this._device.createBuffer({
      label: "Light " + this.getName(),
      size: 24 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    }); 
    // await this._img.decode();
    // this._bitmap= await createImageBitmap(this._img)
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
  
  updateBoxPose() {
    this._device.queue.writeBuffer(this._box[0]._poseBuffer, 0, this._box[0]._pose);
    this._device.queue.writeBuffer(this._box[1]._poseBuffer, 0, this._box[1]._pose);
  }
  
  updateBoxScales() {
    this._device.queue.writeBuffer(this._boxBuffer, this._box[0]._pose.byteLength, this._box[0]._scales);
    this._device.queue.writeBuffer(this._boxBuffer, this._box[1]._pose.byteLength, this._box[1]._scales);
  }

  
  updateCameraPose() {
    this._device.queue.writeBuffer(this._cameraBuffer, 0, this._camera._pose);
  }
  
  updateCameraFocal() {
    this._device.queue.writeBuffer(this._cameraBuffer, this._camera._pose.byteLength, this._camera._focal);
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

  async createShaders() {
    let shaderCode = await this.loadShader("./shaders/traceboxlight.wgsl");
    this._shaderModule = this._device.createShaderModule({
      label: " Shader " + this.getName(),
      code: shaderCode,
    });
    // Create the bind group layout
    this._bindGroupLayout = this._device.createBindGroupLayout({
      label: "Ray Trace Box Layout " + this.getName(),
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {} // Camera uniform buffer
      }, {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {} // Box uniform buffer
      }, {
        binding: 2,
        visibility: GPUShaderStage.COMPUTE, 
        storageTexture: { format: this._canvasFormat } // texture
      }, {
        binding: 3,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {} // Light uniform buffer
      }, {
        binding: 4,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // xd4
      }, {
        binding: 5,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // xd5
      }, {
        binding: 6,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // negx
      }, {
        binding: 7,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // negy
      }, {
        binding: 8,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // negz
      }, {
        binding: 9,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // posx
      }, {
        binding: 10,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // posy
      }, {
        binding: 11,
        visibility: GPUShaderStage.COMPUTE,
        texture: {} // posz
      }]
    });
    this._pipelineLayout = this._device.createPipelineLayout({
      label: "Ray Trace Box Pipeline Layout",
      bindGroupLayouts: [ this._bindGroupLayout ],
    });
  }
  
  async createComputePipeline() {
    // Create a compute pipeline that updates the image.
    this._computePipeline = this._device.createComputePipeline({
      label: "Ray Trace Box Orthogonal Pipeline " + this.getName(),
      layout: this._pipelineLayout,
      compute: {
        module: this._shaderModule,
        entryPoint: "computeOrthogonalMain",
      }
    });
    // Create a compute pipeline that updates the image.
    this._computeProjectivePipeline = this._device.createComputePipeline({
      label: "Ray Trace Box Projective Pipeline " + this.getName(),
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
      label: "Ray Trace Box Bind Group",
      layout: this._computePipeline.getBindGroupLayout(0),
      entries: [
      {
        binding: 0,
        resource: { buffer: this._cameraBuffer }
      },
      {
        binding: 1,
        resource: { buffer: this._boxBuffer }
      },
      {
        binding: 2,
        resource: outTexture.createView()
      },
      {
        binding: 3,
        resource: { buffer: this._lightBuffer }
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
        resource: this._textureBufferList[3].createView()
      },
      {
        binding: 7,
        resource: this._textureBufferList[4].createView()
      },
      {
        binding: 8,
        resource: this._textureBufferList[5].createView()
      },
      {
        binding: 9,
        resource: this._textureBufferList[6].createView()
      },
      {
        binding: 10,
        resource: this._textureBufferList[7].createView()
      },
      {
        binding: 11,
        resource: this._textureBufferList[8].createView()
      }
      ],
    });
    this._wgWidth = Math.ceil(outTexture.width);
    this._wgHeight = Math.ceil(outTexture.height);
  }
  
  changeModel(){
    this._currModel[0]=(this._currModel[0]+1)%4;
  }
  changeLight(){
    this._currModel[1]=(this._currModel[1]+1)%3;
  }

  compute(pass) {
    // add to compute pass
    if (this._camera?._isProjective) {
      // console.log("P")
      pass.setPipeline(this._computeProjectivePipeline);        // set the compute projective pipeline
    }
    else {
      // console.log("O")
      pass.setPipeline(this._computePipeline);                 // set the compute orthogonal pipeline
    }
    pass.setBindGroup(0, this._bindGroup);                  // bind the buffer
    pass.dispatchWorkgroups(Math.ceil(this._wgWidth / 16), Math.ceil(this._wgHeight / 16)); // dispatch
  }
}
