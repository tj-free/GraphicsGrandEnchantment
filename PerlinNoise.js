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


// Check your browser supports: https://github.com/gpuweb/gpuweb/wiki/Implementation-Status#implementation-status
// Need to enable experimental flags chrome://flags/
// Chrome & Edge 113+ : Enable Vulkan, Default ANGLE Vulkan, Vulkan from ANGLE, Unsafe WebGPU Support, and WebGPU Developer Features (if exsits)
// Firefox Nightly: sudo snap install firefox --channel=latext/edge or download from https://www.mozilla.org/en-US/firefox/channel/desktop/


import VRRayTracer from './lib/Viz/VRRayTracer.js'
import StandardTextObject from './lib/DSViz/StandardTextObject.js'
import VolumeRenderingSimpleObject from './lib/DSViz/VolumeRenderingSimpleObject.js'
import Camera from './lib/Viz/3DCamera.js'
import Input from './lib/Input/Input.js'
import VRInput from './lib/Input/VRInput.js';
import MassParticleSystem from './lib/DSViz/MassParticleSystem.js'
import Renderer from './lib/Viz/2DRenderer.js'
import ParticleSystemObject from './lib/DSViz/ParticleSystemObject.js'
import DirectionalLight from './lib/Viz/DirectionalLight.js'
import PGA3D from './lib/Math/PGA3D.js'


async function init() {
  // Create a canvas tag
  const canvasTag = document.createElement('canvas');
  canvasTag.id = "renderCanvas";
  document.body.appendChild(canvasTag);

  const xrButton = document.createElement('button');
  xrButton.id = "xr-button";
  document.body.appendChild(xrButton);

  // Create a ray tracer
  var leftCamera = new Camera();
  var rightCamera = new Camera();
  const tracer = new VRRayTracer(canvasTag);
  await tracer.init();
  // Create a 3D Camera
  // Create an object to trace
  var blockTextures= [ "./assets/textures/blocks/dirt.png","./assets/textures/blocks/grass_carried.png", "./assets/textures/blocks/grass_side_carried.png", "./assets/textures/blocks/grass_side_snowed.png","./assets/textures/blocks/snow.png","./assets/textures/blocks/stone.png"]
  var particleTextures=["./assets/textures/particles/pale_oak_leaves_atlas.png","./assets/textures/particles/particles.png","./assets/textures/Lycksele/bluecloud_ft.jpg","./assets/textures/Lycksele/bluecloud_bk.jpg", "./assets/textures/Lycksele/bluecloud_lf.jpg", "./assets/textures/Lycksele/bluecloud_rt.jpg", "./assets/textures/Lycksele/bluecloud_up.jpg", "./assets/textures/Lycksele/bluecloud_dn.jpg"]

  var tracerObj= new VolumeRenderingSimpleObject(tracer._device, tracer._canvasFormat,
  [leftCamera, rightCamera], true, blockTextures.concat(particleTextures));

  
  var vrInput = new VRInput();
  var input = new Input(canvasTag);

  await tracer.setTracerObject(tracerObj);

  // leftCamera.moveZ(-2);
  leftCamera.moveY(-.5);
  // leftCamera.moveZ(-5);
  // NOTE: cameras need to be rotated?
  // How do humans see
  // leftCamera.moveX(0.0298200368);
  leftCamera.moveX(-0.000);
  // leftCamera.rotateY(5);
  // rightCamera.moveZ(-2);
  rightCamera.moveY(-.5);
  // rightCamera.moveX(-0.0298200368);
  rightCamera.moveX(.1);
  rightCamera.rotateY(-5);

  var directionalLight= new DirectionalLight();
  tracerObj.updateLight(directionalLight);

  
  
  let toggleMovement=true;
  
  let fps = '??';
  var fpsText = new StandardTextObject('VR FPS: ' + 100 + '\n' + 'FPS: ' + 100);
  fpsText._textCanvas.style.left="1000px";
  const infoText = new StandardTextObject('WS: Move Forward\n' +
                                          'AD: Move Left/Right\n' +
                                          'Space: Jump\n' +
                                          'Mouse: Look Around\n' +
                                          '1: Toggle Weather\n' +
                                          '2: Break Block\n' +
                                          '3: Place Block');
  var movespeed = 0.005;
  var jumpspeed = 0.03;

  var moveX = 0;
  var moveY = 0;
  var moveZ = 0;

  document.addEventListener('keydown', async (e) => {
    switch (e.key) {
      case 'g':
        tracer.switchCamera(0)
        break;
      case 'h':
        tracer.switchCamera(1)
        break;
      case 'w': case 'W':
        moveZ += movespeed;
        break;
      case 'a': case 'A':
        moveX -= movespeed;
        break;
      case 's': case 'S':
        moveZ -= movespeed;
        break;
      case 'd': case 'D':
        moveX += movespeed;
        break;
      case ' ':
        moveY -= jumpspeed;
        break;
      case "1": 
        Input.getWeather(tracerObj, directionalLight);
        tracerObj.updateLight(directionalLight);

        tracerObj.cycleWeather()
        //console.log(tracerObj._weather)
        break;
      case "2": 
        await tracerObj.breakBlock();
        break;
      case "3": 
        await tracerObj.placeBlock();
        break;

  }
  });




  var rotX = 0;
  var rotY = 0;
 
    // Rotate camera horizontally (Y-axis) and vertically (X-axis)
    document.addEventListener("mousemove", (event) => {
      canvasTag.requestPointerLock();

      let dir = Math.atan(event.movementY / event.movementX);
      let moved = Input.getMouseMovement()
      const sensitivity = 0.05; // tune this based on feel
      rotY -= event.movementX * sensitivity;
      rotX += event.movementY * sensitivity;
    });

    //Weather Event Listener
    document.addEventListener('weatherEvent', (button) => {
      console.log("weather event")
      VRInput.setWeather(1)
      
      Input.getWeather(tracerObj, directionalLight); //change lighting
      tracerObj.updateLight(directionalLight);

      tracerObj.cycleWeather();
    });



    //break Event Listener
    document.addEventListener('breakEvent', (button) => {
      //console.log("break event recieved")
     //TODO: call break function here
     
    });

    //jump Event Listener
    document.addEventListener('jumpEvent', (button) => {
      moveY += -jumpspeed
    });

    document.addEventListener('moveJoystick', (event) => {
      const { a, b } = event.detail;
      moveX +=b*0.005
      moveZ += a*0.0025
    });

    document.addEventListener('rotateJoystick', (event) => {
      const { a, b } = event.detail;
      rotX += -a*0.5
      rotY += -b*0.5
    });

    
  
    document.addEventListener("updateCameraPose", (e) => {
      if (e.detail.pose.length == 48) {
        //leftCamera.moveY(0.02);
        leftCamera._pose.set(e.detail.pose.slice(0,16));
        leftCamera.moveX(moveX);
        leftCamera.moveY(moveY);
        leftCamera.moveZ(moveZ);
        leftCamera.rotateX(rotX);
        leftCamera.rotateY(rotY);
        rightCamera._pose.set(e.detail.pose.slice(20, 36));
        rightCamera.moveX(moveX);
        rightCamera.moveY(moveY);
        rightCamera.moveZ(moveZ);
        rightCamera.rotateX(rotX);
        rightCamera.rotateY(rotY);
        tracerObj.updateCameraPose();
        
        moveX = 0;
        moveY = 0;
        moveZ = 0;
        rotX = 0;
        rotY = 0;
      }
    })

  setInterval(async () => {
    tracerObj.getRaycastChecks();
  }, 10)

  // Update FPS text
  setInterval(() => {
    fpsText.updateText('VR FPS: ' + tracer._VRFps + '\n' + 'FPS: ' + tracer._fps);
  }, 1000); // call every 1000 ms
  return tracer;
}
init().then( ret => {
  //console.log(ret);
}).catch( error => {
  const pTag = document.createElement('p');
  pTag.innerHTML = navigator.userAgent + "</br>" + error.message;
  document.body.appendChild(pTag);
  document.getElementById("renderCanvas").remove();
});
