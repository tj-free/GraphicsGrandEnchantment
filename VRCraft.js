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
import DirectionalLight from './lib/Viz/DirectionalLight.js'


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

  
  // var vrInput = new VRInput();
  // var input = new Input(canvasTag);

  await tracer.setTracerObject(tracerObj);

  // leftCamera.moveZ(-2);
  leftCamera.moveY(-.25);
  // leftCamera.moveZ(-5);
  // NOTE: cameras need to be rotated?
  // How do humans see
  // leftCamera.moveX(0.0298200368);
  // leftCamera.moveX(0.01);
  // leftCamera.rotateY(-1);
  // rightCamera.moveZ(-2);
  rightCamera.moveY(-.25);
  // rightCamera.moveX(-0.0298200368);
  // rightCamera.moveX(-0.01);
  // rightCamera.rotateY(1);


  var directionalLight= new DirectionalLight();
  tracerObj.updateLight(directionalLight);
  tracerObj.updateCameraPose();

  
  
  let toggleMovement=true;
  
  let fps = '??';
  var fpsText = new StandardTextObject('VR FPS: ' + 100 + '\n' + 'FPS: ' + 100);
  fpsText._textCanvas.style.left="";
  fpsText._textCanvas.style.right="50px";
  const infoText = new StandardTextObject('WS: Move Forward\n' +
                                          'AD: Move Left/Right\n' +
                                          'Space: Jump\n' +
                                          'Mouse: Look Around\n' +
                                          '1: Toggle Weather\n' +
                                          '2: Break Block\n' +
                                          '3: Place Block');
  var movespeed = 0.02;
  var jumpspeed = 0.03;

  var moveX = 0;
  var moveY = 0;
  var moveZ = 0;

  var jumped = false;

  document.addEventListener('keydown', async (e) => {
    switch (e.key) {
      case 'g':
        tracer.switchCamera(0)
        break;
      case 'h':
        tracer.switchCamera(1)
        break;
      case 'w': case 'W':
        Input.setForward(1);
        // moveZ += movespeed;
        break;
      case 'a': case 'A':
        Input.setLeft(1);
        // moveX -= movespeed;
        break;
      case 's': case 'S':
        Input.setBackward(1);
        // moveZ -= movespeed;
        break;
      case 'd': case 'D':
        Input.setRight(1);
        // moveX += movespeed;
        break;
      case ' ':
        Input.setJump(1);
        jumped = false;
        // moveY -= jumpspeed;
        break;
      case "1": 
        Input.getWeather(tracerObj, directionalLight);
        tracerObj.updateLight(directionalLight);

        tracerObj.cycleWeather()
        break;
      case "2": 
        await tracerObj.breakBlock();
        break;
      case "3": 
        await tracerObj.placeBlock();
        break;

  }
  });

  document.addEventListener('keyup', (e) => {
    switch (e.key) {
      case 'w': case 'W':
        Input.setForward(0);
        // moveZ += movespeed;
        break;
      case 'a': case 'A':
        Input.setLeft(0);
        // moveX -= movespeed;
        break;
      case 's': case 'S':
        Input.setBackward(0);
        // moveZ -= movespeed;
        break;
      case 'd': case 'D':
        Input.setRight(0);
        // moveX += movespeed;
        break;
      case ' ':
        Input.setJump(0);
        // moveY -= jumpspeed;
        break;
    }
  });




  var rotX = 0;
  var rotY = 0;
 
  canvasTag.addEventListener("mousedown", (event) => {
    canvasTag.requestPointerLock();
  });
   
  // Rotate camera horizontally (Y-axis) and vertically (X-axis)
  document.addEventListener("mousemove", (event) => {
    if (document.pointerLockElement) {
      let dir = Math.atan(event.movementY / event.movementX);
      let moved = Input.getMouseMovement()
      const sensitivity = 0.05; // tune this based on feel
      rotY -= event.movementX * sensitivity;
      rotX += event.movementY * sensitivity;
    }
  });

    //Weather Event Listener
    document.addEventListener('weatherEvent', (button) => {
      VRInput.setWeather(1)
      
      Input.getWeather(tracerObj, directionalLight); //change lighting
      tracerObj.updateLight(directionalLight);

      tracerObj.cycleWeather();
    });



    //place Event Listener
    document.addEventListener('placeBlockEvent', (button) => {
      tracerObj.placeBlock();

    });

     //break Event Listener
     document.addEventListener('breakBlockEvent', (button) => {
      tracerObj.breakBlock();
    });

    //jump Event Listener
    document.addEventListener('jumpEvent', (button) => {
      moveY += -jumpspeed
    });

    document.addEventListener('moveJoystick', (event) => {
      const { a, b } = event.detail;
      // Input.setLeft(b);
      // Input.setRight(b);
      // Input.setForward(a);
      // Input.setBackward(a);
      moveX +=b*0.001 //left/right 
      moveZ += a*0.001  //forward/back
      // console.log(Input.getMovement())
    });

    document.addEventListener('rotateJoystick', (event) => {
      const { a, b } = event.detail;
      rotX += -a
      rotY += -b
    });

    
  
    document.addEventListener("updateCameraPose", (e) => {
      var movement = Input.getMovement();
      moveX += (movement[0] * movespeed);
      moveZ += (movement[1] * movespeed);
      if (!jumped) {
        moveY -= (Input.getJump() * jumpspeed);
        jumped = true;
      }

      if (e.detail.pose.length == 48) {
        leftCamera._pose.set(e.detail.pose.slice(0,16));
        leftCamera.moveX(moveX);
        leftCamera.moveY(moveY);
        leftCamera.moveZ(moveZ);
        leftCamera.rotateX(rotX, 1);
        leftCamera.rotateY(rotY, 1);
        rightCamera._pose.set(e.detail.pose.slice(20, 36));
        rightCamera.moveX(moveX);
        rightCamera.moveY(moveY);
        rightCamera.moveZ(moveZ);
        rightCamera.rotateX(rotX, -1);
        rightCamera.rotateY(rotY, -1);
        tracerObj.updateCameraPose();
        
        moveX = 0;
        moveY = 0;
        moveZ = 0;
        rotX = 0;
        rotY = 0;
      }
    })

  setInterval(async () => {
    await tracerObj.getRaycastChecks();
  }, 1)

  // Update FPS text
  setInterval(() => {
    fpsText.updateText('VR FPS: ' + tracer._VRFps + '\n' + 'FPS: ' + tracer._fps);
  }, 1000); // call every 1000 ms
  return tracer;
}
init().then( ret => {
}).catch( error => {
  const pTag = document.createElement('p');
  pTag.innerHTML = navigator.userAgent + "</br>" + error.message;
  document.body.appendChild(pTag);
  document.getElementById("renderCanvas").remove();
});
