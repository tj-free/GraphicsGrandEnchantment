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

import PGA3D from "../Math/PGA3D.js";
import Renderer from "./2DRenderer.js"

export default class RayTracer extends Renderer {
  constructor(canvas, camera) {
    super(canvas);
    this._tracer = null;
    this._xrButton = document.getElementById("xr-button");
    this._VRFps = 0;
    this._fps = 0;
    this._lastRenderedVR = Date.now();
    this._lastRendered = Date.now();
    this._camera = camera;
    this._lastRotation = null;
  }

  async init() {
    await this.initXR();
  }

  // Initializes the XR pipeline
  async initXR() {
    // Check if it supports WebGPU
    if (!navigator.gpu) {
      throw Error("WebGPU is not supported in this browser.");
    }
    
    await this.initWebGPU();
    requestAnimationFrame(this.onFrame.bind(this));

    // Check if it supports WebXR
    if (!navigator.xr) {
      throw Error("WebXR is not supported on this device.");
    }

    // Check if WebXR/WebGPU is supporteed
    if (!('XRGPUBinding' in window)) {
      this._xrButton.textContent = 'WebXR/WebGPU interop not supported';
      return;
    }

    // Check if we can do immersive VR
    const supported = await navigator.xr.isSessionSupported('immersive-vr');
    if (!supported) {
      this._xrButton.textContent = 'Immersive VR not supported';
      return;
    }

    this._xrButton.addEventListener("click", this.onButtonClicked.bind(this));
    this._xrButton.textContent = "Enter VR";
    this._xrButton.disabled = false;
  }
  
  // Initializes
  async initWebGPU() {
    if (!this._device) {
      // Create WebGPU adapter and device to render with
      // Make sure they are compatible with the XRDisplay
      const adapter = await navigator.gpu.requestAdapter({
        xrCompatible: true
      });
      if (!adapter) {
        throw Error("Couldn't request WebGPU adapter.");
      }

      // Get a GPU device
      this._device = await adapter.requestDevice();

      // Get and set the context
      this._context = this._canvas.getContext("webgpu");
      // this._canvasFormat = navigator.gpu.getPreferredCanvasFormat();
      this._canvasFormat = "rgba8unorm";
      this._context.configure({
        device: this._device,
        format: this._canvasFormat,
      });
      
      // Create the ray tracer shader 
      this._shaderModule = this._device.createShaderModule({
        label: "Ray Tracer Shader",
        code: `
        @vertex
        fn vertexMain(@builtin(vertex_index) vIdx: u32) -> @builtin(position) vec4f {
          var pos = array<vec2f, 6>(
            vec2f(-1, -1), vec2f(1, -1), vec2f(-1, 1),
            vec2f(-1, 1), vec2f(1, -1), vec2f(1, 1)
          );
          return vec4f(pos[vIdx], 0, 1);
        }
        
        @group(0) @binding(0) var inTexture: texture_2d<f32>;
        @group(0) @binding(1) var inSampler: sampler;
        @group(0) @binding(2) var<uniform> imgSize: vec2f;
        
        @fragment
        fn fragmentMain(@builtin(position) fragCoord: vec4f) -> @location(0) vec4f {
          let uv = fragCoord.xy / imgSize; // vec2f(textureDimensions(inTexture, 0));
          return textureSample(inTexture, inSampler, uv);
        }
        `
      });
      // Create camera buffer to store the camera pose and scale in GPU
      this._outputSizeBuffer = this._device.createBuffer({
        label: "Ray Tracer output size buffer",
        size: 8,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      // create the pipeline to render the result on the canvas
      this._pipeline = this._device.createRenderPipeline({
        label: "Ray Tracer Pipeline",
        layout: "auto",
        vertex: {
          module: this._shaderModule,
          entryPoint: "vertexMain",
        },
        // depthStencil: {
        //   format: "depth24plus",
        //   depthWriteEnabled: true,
        //   depthCompare: "less-equal",
        // },
        fragment: {
          module: this._shaderModule,
          entryPoint: "fragmentMain",
          targets: [{
            format: this._canvasFormat,
          }]
        }
      });
      this._sampler = this._device.createSampler({
        label: "Ray Tracer Sampler",
        magFilter: "linear",
        minFilter: "linear"
      });
      this.resizeCanvas();
      window.addEventListener('resize', this.resizeCanvas.bind(this));
    }
  }

  // Called when the VR button is pressed
  async onButtonClicked() {
    if (!this._xrSession) {
      // Initialize WebXR
      this._xrSession = await navigator.xr.requestSession("immersive-vr", {
        requiredFeatures: ["webgpu"],
      });
      let t = this.onSessionStarted.bind(this);
      await t();
    }
    else {
      this._xrSession.end();
    }
  }

  // Called when XR session is acquired. Sets up the necessary states and starts the frame loop
  async onSessionStarted() {
    this._xrButton.textContent = "Exit VR";

    // Listen for when the session ends via the user or any other reason
    this._xrSession.addEventListener("end", this.onSessionEnded.bind(this));

    // Associate GPU annd XRSession
    this._xrGpuBinding = new XRGPUBinding(this._xrSession, this._device);

    // Rebuild the pipeline
    await this.initWebGPU();

    // Rendering scene that follows user vision
    this._projectionLayer = this._xrGpuBinding.createProjectionLayer({
      // colorFormat: this._xrGpuBinding.getPreferredColorFormat(),
      colorFormat: "rgba8unorm",
      // depthStencilFormat: 'depth24plus',
    });

    // Get a reference space, which is required for querying poses. In this
    // case an 'local' reference space means that all poses will be relative
    // to the location where the XR device was first detected.
    this._xrSession.requestReferenceSpace('local').then((refSpace) => {
      this._xrRefSpace = refSpace;

      // Inform the session that we're ready to begin drawing.
      this._xrSession.requestAnimationFrame(this.onXRFrame.bind(this));
    });

    // Update the render layers, given as a stack
    this._xrSession.updateRenderState({layers: [this._projectionLayer]});
  }

  // Called when the session ends for whatever reason
  async onSessionEnded() {
    this._xrSession = null;
    this._xrGpuBinding = null;
    this._xrButton.textContent = "Enter VR";

    // Rebuild the pipeline
    await this.initWebGPU();

    requestAnimationFrame(this.onFrame.bind(this));
  }

  resizeCanvas() {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = window.innerWidth * devicePixelRatio;
    const height = window.innerHeight * devicePixelRatio;
    const ratio = width/height;
    // NOTE: if yours is too slow, chante the target height here, e.g. 512
    const tgtHeight = height; 
    let imgSize = { width: tgtHeight * ratio, height: tgtHeight};
    // resize screen images
    this._offScreenTexture = this._device.createTexture({
      size: imgSize,
      format: this._canvasFormat,
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
    });
    if (this._tracer) {
      this._tracer._imgWidth = this._offScreenTexture.width;
      this._tracer._imgHeight = this._offScreenTexture.height;
      this._tracer.updateGeometry();
      this._tracer.createBindGroup(this._offScreenTexture);
    }
    this._bindGroup = this._device.createBindGroup({
      label: "Ray Tracer Renderer Bind Group",
      layout: this._pipeline.getBindGroupLayout(0),
      entries: [{
        binding: 0,
        resource: this._offScreenTexture.createView()
      }, 
      {
        binding: 1,
        resource: this._sampler
      },
      {
        binding: 2,
        resource: { buffer: this._outputSizeBuffer }
      }],
    });
    super.resizeCanvas();
    // update the image size in the Shader
    this._device.queue.writeBuffer(this._outputSizeBuffer, 0, new Float32Array([width, height]));
  }
  
  async setTracerObject(obj) {
    await obj.init();
    obj._imgWidth = this._offScreenTexture.width;
    obj._imgHeight = this._offScreenTexture.height;
    obj.updateGeometry();
    this._tracer = obj;
    this._tracer.createBindGroup(this._offScreenTexture);
  }
  
  onFrame(time) {
    // Update FPS
    let elapsed = Date.now() - this._lastRendered;
    this._fps = 1000 / elapsed;
    this._lastRendered = Date.now();

    // Frame loop
    requestAnimationFrame(this.onFrame.bind(this));

    // Ray tracing compute pass
    if (this._tracer) {
      let encoder = this._device.createCommandEncoder();
      const computePass = encoder.beginComputePass();
      this._tracer.compute(computePass);
      computePass.end(); // end the pass
      this._device.queue.submit([encoder.finish()]);
    }

    // Attach the output view to see the result on the canvas
    // Rendering pass using ray traced results
    let encoder = this._device.createCommandEncoder();
    const renderPass = encoder.beginRenderPass({
      colorAttachments: [{
        view: this._context.getCurrentTexture().createView(),
        clearValue: this._clearColor,
        loadOp: "clear",
        storeOp: "store",
      }],
    });

    renderPass.setPipeline(this._pipeline);
    renderPass.setBindGroup(0, this._bindGroup);
    renderPass.draw(6); // Draw a quad with two triangles
    renderPass.end()
    
    this._device.queue.submit([encoder.finish()]);
  }

  onXRFrame(time, frame) {
    // Update FPS
    let elapsedVR = Date.now() - this._lastRenderedVR;
    this._VRFps = 1000 / elapsedVR;
    this._lastRenderedVR = Date.now();

    let session = frame.session;


    for (const source of session.inputSources) {
      const gamepad = source.gamepad;
      // console.log(gamepad);
      if (gamepad) {
        if (gamepad.buttons[2].pressed) {
          console.log("pressed")
        }
      }
    }


    // Frame loop
    session.requestAnimationFrame(this.onXRFrame.bind(this));

    // Get the XRDevice pose relative to the reference space
    let pose = frame.getViewerPose(this._xrRefSpace);

    // Ensure that we actually got a pose, otherwise stop rendering
    if (pose) {
      for (let viewIndex = 0; viewIndex < pose.views.length; ++viewIndex) {
        const view = pose.views[viewIndex];
        const subImage = this._xrGpuBinding.getViewSubImage(this._projectionLayer, view);

        // ray tracking compute commands
        if (this._tracer) {
          // this._camera._pose = view.transform.velocity;
          // console.log(this._camera._pose);
          // throw new Error("L");
          // this._tracer.updateCameraPose();
          this._lastRotation = view.transform.orientation

          let encoder = this._device.createCommandEncoder();
          const computePass = encoder.beginComputePass();
          this._tracer.compute(computePass);
          computePass.end(); // end the pass
          this._device.queue.submit([encoder.finish()]);
        }

        // Attach the output view to see the result on the canvas
        // rendering commands
        let encoder = this._device.createCommandEncoder();
        const renderPass = encoder.beginRenderPass({
          colorAttachments: [{
            view: subImage.colorTexture.createView(subImage.getViewDescriptor()),
            clearValue: this._clearColor,
            loadOp: "clear",
            storeOp: "store",
          }]
        });

        // Set the viewport and render the view
        let vp = subImage.viewport;
        renderPass.setViewport(vp.x, vp.y, vp.width, vp.height, 0.0, 1.0);
        renderPass.setPipeline(this._pipeline);
        renderPass.setBindGroup(0, this._bindGroup);
        renderPass.draw(6); // Draw a quad with two triangles
        renderPass.end()
        this._device.queue.submit([encoder.finish()]);
      }
    }
  }
}
