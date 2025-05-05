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
- VR projection with a single eye
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
- Implementing a second camera for the second eye on the VR headset

---

## Individual Reflections

### Kevin Duong

This project was a lot of work filled with a ton of struggles. We set the bar quite high for ourselves, and to be honest, I was more than satisfied with the progress we've made over these past 4 weeks. While it was difficult and we had a lot of questions, it was incredibly rewarding to see the rendered scene as we completed each function. I personally struggled to comprehend the different parts of the project at first. But as I spent more time with the code, I gained a much better understanding of how the CPU and GPU communicate and how to navigate shaders—something I didn't fully grasp during the earlier quests because I rushed through them. Overall, I really enjoyed the outcome, especially the time spent with my friends and the challenges we overcame together.

---

### Timothy Julian Freeman  

---

### Clea Ramos  

---

### Jackson Rubiano  

---

