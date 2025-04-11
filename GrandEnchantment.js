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

import RayTracer from './lib/Viz/RayTracer.js'
import StandardTextObject from './lib/DSViz/StandardTextObject.js'
import RayTracingBoxLightObject from './lib/DSViz/RayTracingBoxLightObject.js'
import Camera from './lib/Viz/3DCamera.js'
import PointLight from './lib/Viz/PointLight.js'
import DirectionalLight from './lib/Viz/DirectionalLight.js'
import SpotlightLight from './lib/Viz/SpotLight.js'

async function init() {
  // Create a canvas tag
  const canvasTag = document.createElement('canvas');
  canvasTag.id = "renderCanvas";
  document.body.appendChild(canvasTag);
  // Create a ray tracer
  const tracer = new RayTracer(canvasTag);
  await tracer.init();
  // Create a 3D Camera
  var camera = new Camera();
  // set a fixed pose for the starter code demo
  // camera._pose[2] = 0.5;
  // camera._pose[3] = 0.5;
  // Create an object to trace
  // var list=["./assets/woodfloor_c.jpg","./assets/woodfloor_n.png","./assets/woodfloor_s_z.png"]
  var list= ["./assets/T_Tile_Sandstone_02_4096_D.png","./assets/T_Tile_Sandstone_02_4096_N.png", "./assets/T_Tile_Sandstone_02_4096_S.png", "./assets/Yokohama3/negx.jpg" ,"./assets/Yokohama3/negy.jpg", "./assets/Yokohama3/negz.jpg", "./assets/Yokohama3/posx.jpg" ,"./assets/Yokohama3/posy.jpg", "./assets/Yokohama3/posz.jpg"]
  var tracerObj = new RayTracingBoxLightObject(tracer._device, tracer._canvasFormat, camera, true, list);
  await tracer.setTracerObject(tracerObj);
  // Create a light object and set it to our box light object
  // if you want to change light, you just need to change this object and upload it to the GPU by calling traceObje.updateLight(light)
  var pointLight = new PointLight();
  var directionalLight= new DirectionalLight();
  var spotLight= new SpotlightLight([1, 1, 1], [0, -0.5, 0]);
  var currModel=0;
  var currLight=0;
  var lightModels=[pointLight, directionalLight, spotLight]
  tracerObj.updateLight(lightModels[currLight]);
  let toggleMovement=true;
  let shadings=["Lambertian", "Phong", "Toon", "Blinn-Phong"];
  let models=["Point", "Directional", "Spot"];

  
  let fps = '??';
  var fpsText = new StandardTextObject('fps: ' + fps);
  fpsText._textCanvas.style.left="1460px";
  var infoText = new StandardTextObject('WS: Move in Z\n' +
                                        'AD: Move in X\n' +
                                        'Space/Shift: Move in Y\n' +
                                        'QE: Rotate in Z\n' +
                                        'Up/Down: Rotate in X\n' +
                                        'Left/Right: Rotate in Y\n' +
                                        'T: Change Camera Mode\n' +
                                        '-=: Change Camera Focal X\n' +
                                        '[]: Change Camera Focal Y\n'+
                                        'U: Toggle Camera/Object\n'+
                                        'M: Change Light Shading: '+ shadings[tracerObj._currModel[0]]+"\n"+
                                        'N: Change Light Model: ' + models[tracerObj._currModel[1]]);
  var rotatespeed = 2;
  var movespeed= 0.05;
  var focalXSpeed = 0.1;
  var focalYSpeed = 0.1;
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'w': case 'W':
        camera.moveZ(movespeed);
        tracerObj.updateCameraPose();
        break;
      case 'a': case 'A':
        camera.moveX(-movespeed);
        tracerObj.updateCameraPose();
        break;
      case 's': case 'S':
        camera.moveZ(-movespeed);
        tracerObj.updateCameraPose();
        break;
      case 'd': case 'D':
        camera.moveX(movespeed);
        tracerObj.updateCameraPose();
        break;
      case ' ':
        camera.moveY(-movespeed);
        tracerObj.updateCameraPose();
        break;
      case 'Shift':
        camera.moveY(movespeed);
        tracerObj.updateCameraPose();
        break;
      case 'q': case 'Q':
        camera.rotateZ(rotatespeed);
        tracerObj.updateCameraPose();
        break;
      case 'e': case'E':
        camera.rotateZ(-rotatespeed);
        tracerObj.updateCameraPose();
        break;
      case 'ArrowUp':
        camera.rotateX(-rotatespeed);
        tracerObj.updateCameraPose();
        break;
      case 'ArrowLeft':
        camera.rotateY(rotatespeed);
        tracerObj.updateCameraPose();
        break;
      case 'ArrowDown':
        camera.rotateX(rotatespeed);
        tracerObj.updateCameraPose();
        break;
      case 'ArrowRight':
        camera.rotateY(-rotatespeed);
        tracerObj.updateCameraPose();
        break;
      case 't': case 'T':
        console.log("Button Press")
        camera.toggleProjective();
        break;
      case '-':
        camera.changeFocalX(focalXSpeed);
        tracerObj.updateCameraFocal();
        break;
      case '=':
        camera.changeFocalX(-focalXSpeed);
        tracerObj.updateCameraFocal();
        break;
      case '[':
        camera.changeFocalY(focalYSpeed);
        tracerObj.updateCameraFocal();
        break;
      case ']':
        camera.changeFocalY(-focalYSpeed);
        tracerObj.updateCameraFocal();
        break;
      case "u": case "U":
        toggleMovement= !toggleMovement;
        break;
      case "m": case "M":
        tracerObj.changeModel();
        currLight=(currLight+1)%3
        tracerObj.updateLight(lightModels[currLight]);
        infoText.updateText('WS: Move in Z\n' +
          'AD: Move in X\n' +
          'Space/Shift: Move in Y\n' +
          'QE: Rotate in Z\n' +
          'Up/Down: Rotate in X\n' +
          'Left/Right: Rotate in Y\n' +
          'T: Change Camera Mode\n' +
          '-=: Change Camera Focal X\n' +
          '[]: Change Camera Focal Y\n'+
          'U: Toggle Camera/Object\n'+
          'M: Change Light Shading: '+ shadings[tracerObj._currModel[0]]+"\n"+
          'N: Change Light Model: ' + models[tracerObj._currModel[1]]);
          break;
      case "n": case "N":
        tracerObj.changeLight();
        currModel=(currModel+1)%3
        tracerObj.updateLight(lightModels[currModel]);
        infoText.updateText('WS: Move in Z\n' +
          'AD: Move in X\n' +
          'Space/Shift: Move in Y\n' +
          'QE: Rotate in Z\n' +
          'Up/Down: Rotate in X\n' +
          'Left/Right: Rotate in Y\n' +
          'T: Change Camera Mode\n' +
          '-=: Change Camera Focal X\n' +
          '[]: Change Camera Focal Y\n'+
          'U: Toggle Camera/Object\n'+
          'M: Change Light Shading: '+ shadings[tracerObj._currModel[0]]+"\n"+
          'N: Change Light Model: ' + models[tracerObj._currModel[1]]);
          break;
      }
  });
  
  // run animation at 60 fps
  var frameCnt = 0;
  var tgtFPS = 60;
  var secPerFrame = 1. / tgtFPS;
  var frameInterval = secPerFrame * 1000;
  var lastCalled;
  let renderFrame = () => {
    let elapsed = Date.now() - lastCalled;
    if (elapsed > frameInterval) {
      ++frameCnt;
      lastCalled = Date.now() - (elapsed % frameInterval);
      tracer.render();
    }
    requestAnimationFrame(renderFrame);
  };
  lastCalled = Date.now();
  renderFrame();
  setInterval(() => { 
    fpsText.updateText('fps: ' + frameCnt);
    frameCnt = 0;
  }, 1000); // call every 1000 ms
  return tracer;
}

init().then( ret => {
  console.log(ret);
}).catch( error => {
  const pTag = document.createElement('p');
  pTag.innerHTML = navigator.userAgent + "</br>" + error.message;
  document.body.appendChild(pTag);
  document.getElementById("renderCanvas").remove();
});
