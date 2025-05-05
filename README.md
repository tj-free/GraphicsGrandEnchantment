# GraphicsGrandEnchantment
For the Final Project, we are reproducing Minecraft via Ray Tracing in VR. 

Our project aims to implement ray tracing in a Minecraft-inspired environment by generating a 2D height map using Octave Perlin Noise. This height map defines the terrain, which is enclosed within a larger cube to simulate the sky. We map textures onto the terrain based on the different heights, allowing for varied surface appearances like grass, stone, or snow. The surrounding cube is textured with an environment map to replicate realistic sky conditions. Weather effects are incorporated through toggleable weather modes to be sunny, rainy, or snowy—which influence both particle systems and lighting. Snow and rain particles fall onto the terrain, and the intensity of the directional light changes to simulate the selected weather and changing with the wind. We also intended to add basic physics to the camera, including gravity and collision detection, enabling realistic movement and interaction with the terrain in which we have been able to accomplish most of the what we intended to do.

For VR aspect of our project, we had to do a lot of research to figure out how we are able to project the scene onto the VR headset and even once we did, we were concerned about the hardware of the headset struggling to be able to render our project especially with the rendering of the particles. We also noticed that once we were able to project the scene, we needed an additonal camera which, after a long period of arduous testing of adjusting eye rotations, we were finally able to render the left and right cameras accurately on both eyes. We were able to drastically increase our FPS from ~5 to ~70 FPS by switching to a much stronger GPU which we were relieved about. The last obstacle we had to face with the VR was figuring out how we are able to map the controls from the controllers to the event listener, but after we finished the VR, we were so proud of ourselves. 

Some areas where we failed we accomplish due to the constraints of time were: implementing clouds, applying textures to particles, applying breaking textures when we break blocks. We also wanted to create trees on the surface as well as adding leave particles that flow with the wind, however, we decided that it would both take too much time to be able to render several trees onto the surface and both texture and animate the leaves. Additonally, while we did research with BVH, however, we decided that it was not worth it because since we were able to render at ~70 FPS. We abandoned game pad controls because since we went directly to using the VR gamepad, we no longer saw the need to use a map a standard gamepad. The last task that we attempted, but ultimately gave up on are applying wind to the textures, because adding the wind caused a lot of issues. 



Individual Reflections:
Kevin Duong- 
  This project was a lot of work filled with a ton of struggles. We set the bar quite high for ourselves and to be honest, I was more than satisfied with the progress we've made across these past 4 weeks. While it was difficult and we had a lot of questions, it was incredibly rewarding to see the rendered scene as we complete each function. If we had more time, I believe we could've reached the goal we set out to do. While I personally struggled a lot to comprehend the different parts of the projects, as I had a lot of time to really look at the code, I got a much better understanding that on how the CPU and GPU communicate with eachother and how to navigate though the shader that I never fully understood from the quests because I was working on them back to back to get them in on time. Overall, I more than enjoyed the outcome of the project especially with the time spent with my friends and the trouble we went through together to figure out the project.

Timothy Julian Freeman-

Clea Ramos-

Jackson Rubiano-


Kevin was here
