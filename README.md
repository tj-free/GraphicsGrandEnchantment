# GraphicsGrandEnchantment

## Final Project: Minecraft-Inspired Ray Tracing in VR

Our project aimed to recreate a Minecraft-style environment using ray tracing in virtual reality. We achieved this by generating a 2D height map using Octave Perlin Noise to define the terrain. This terrain is enclosed in a large cube to simulate the skybox. Textures are mapped based on elevation—providing variation like grass, stone, or snow.

The skybox is textured with an environment map to emulate realistic sky conditions. Weather effects are included with toggleable modes: sunny, rainy, or snowy. These weather modes impact particle systems (like falling rain/snow) and lighting conditions, with directional light intensity adapting to match the environment. Wind also affects the direction of falling particles.

We implemented basic physics for the VR camera, including gravity and collision detection, enabling immersive movement and interaction with the terrain. Most of our initial goals were successfully implemented.

---

## VR Implementation

The VR portion of the project required significant research and problem-solving:

- **Scene Projection**: Initially, projecting the scene to the VR headset was difficult. Once resolved, we realized an additional camera was needed to render scenes independently for each eye.
- **Eye Rotation Adjustments**: After extensive testing and tweaking of eye rotations, we successfully rendered left and right views.
- **Performance Boost**: Rendering particles severely impacted frame rate (~5 FPS). Upgrading to a much more powerful GPU raised this to ~70 FPS.
- **Controller Mapping**: Mapping VR controller inputs to event listeners was the final hurdle, which we were proud to overcome.

---

## Features Implemented

- Procedural terrain via Octave Perlin Noise
- Terrain texturing by elevation (e.g., grass, stone, snow)
- Environment-mapped skybox
- Toggleable weather (sunny, rain, snow)
- Particle systems for rain and snow
- Directional lighting affected by weather and wind
- Basic camera physics: gravity and collision
- VR projection with dual-camera rendering
- VR controller input mapping

---

## Challenges & Features Not Implemented

Despite our progress, we were unable to complete the following due to time constraints:

- Cloud implementation
- Texturing particles (e.g., snowflakes, raindrops)
- Breaking block animations and textures
- Procedural tree generation and leaf animations
- Wind affecting terrain textures
- Bounding Volume Hierarchy (BVH): researched, but performance was already sufficient (~70 FPS)
- Gamepad controls: abandoned in favor of direct VR controller integration

---

## Individual Reflections

### Kevin Duong

This project was a lot of work filled with a ton of struggles. We set the bar quite high for ourselves, and to be honest, I was more than satisfied with the progress we've made over these past 4 weeks. While it was difficult and we had a lot of questions, it was incredibly rewarding to see the rendered scene as we completed each function. I personally struggled to comprehend the different parts of the project at first. But as I spent more time with the code, I gained a much better understanding of how the CPU and GPU communicate and how to navigate shaders—something I didn't fully grasp during the earlier quests because I rushed through them. Overall, I really enjoyed the outcome, especially the time spent with my friends and the challenges we overcame together.

---

### TJ Freeman  
My responsibilities for this project were to set up the 3D particle system and handle breaking/placing blocks. The former was much more difficult than I anticipated, and I spent nearly all of my time on this project attempting to figure it out. The plan was originally to ray-trace 2-D quads, then map textures onto them, but in the interest of time, I had to settle for rendering colored cubes, instead. If I had managed to figure out the particles earlier, I would’ve liked to have been able to map textures to them and focus some more on the physics and collision. Still, I’m glad that we were able to get the particle behaviors working properly. As for breaking and placing blocks, those functions were much easier to implement once we could already ray trace the rest of the scene. It was satisfying to have a bit more of an understanding of how ray-tracing works in a 3D space such that I could simply apply what I learned from rendering particles and blocks to breaking and placing them. I also had the opportunity to learn more methods for handling data and processing between the CPU and GPU—for instance, which data was best to keep in CPU vs GPU, and what shortcuts could be made to optimize that processing and storage.


---

### Clea Ramos  
My contributions to this project consisted of implementing VR controls, assisting with eye rendering, and incorporating behavior and change in weather conditions. One of the most challenging components was the VR eye rendering, which Jackson and I worked on. After many attempts of trial and error of testing and calibrating camera positions and rotations we were able to get the VR view close, but not perfectly aligned between the camera/eye positions. I.also enjoyed implementing the VR controls as it was satisfying to see the external outputs like the joysticks being turned into movements. Overall, we were ambitious with the functionality we wanted to achieve and we underestimated the time it would take to complete certain function points, such as VR eye rendering, or the 3D weather particle system. Furthermore, some function points took longer than expected due to time needed to learn new concepts and debug unforeseen issues such as setting up the headset. This project allowed me to gain more practice implementing the interaction between all the components between the GPU and CPU and to create different effects in 3D. I now have a better understanding of how bindings pass values to the shader, and the mathematical techniques to implement gravity and effects on particles. I also became more comfortable with creating listener events to handle numerous inputs. Something that I would do differently is be more involved in the particle system components or racing volumes as I am not as familiar with those topics. I also wish I had more time to implement wind or more complex particle movement for the weather effects such as wind or random swaying movement for snow. Overall, I learned a lot and enjoyed this project as we had challenging, but fun times problem solving and creating together!
---

### Jackson Rubiano  

For our project, my primary contribution was getting VR rendering up and working. Aside from this, I also handled the player physics and wrote some base code for the user inputs. I also helped with some odd jobs here and there. As a whole, we underestimated the time required for some of our goals by a fairly large margin; in my mind, the function points assigned to me, as well as the other members of the team, at the start of this project were far lower than they were in reality. Having now finished this project, however, I feel I have a quite strong grasp of WebGPU as well as WebXR/WebGPU bindings. Throughout the four weeks that we worked on this project, I became very comfortable dealing with both the JavaScript side used to setup the bindings and pass data to the GPU as well as how to perform raytracing computations using compute shaders. If I were to do this project again, I think I would want to more evenly disperse my time spent on the project because it varied heavily between the first and last weeks. Aside from general time management, I would have liked to have spent more time finetuning the VR experience.

---

