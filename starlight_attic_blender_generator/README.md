# My Little Library — Blender Starlight Attic

This package creates an **editable stylized 3D attic**. It is a richer Blender model, not a guaranteed photorealistic render.

## Run
1. Extract this zip to a folder, keeping `textures/` beside the `.py` file.
2. Open Blender (recommended 4.x or 5.x) → **Scripting** → Text Editor → **Open** → `create_starlight_attic.py`.
3. Open a **new empty Blender scene**. The script deletes existing objects in the current scene.
4. Click **Run Script** (Alt+P).
5. Check `<unzipped folder>/output/starlight_attic.blend` and `starlight_attic.glb`.

The model is designed at **floor height zero**, in local coordinates, using Blender Z-up, and exported as glTF Y-up. Dimensions are approximately **8.4 × 13.4 units** with a **6.35-unit roof ridge**. It includes a genuine hole in the roof surface with glazing, woodgrain texture maps, rafters, books, a telescope, cinema screen/projector, chalkboard, beanbags, and blankets.

## Integrate into My Little Library (after checking output)
1. Copy `starlight_attic.glb` into `BIBLIOTHEQUE/public/models/` (create folder if needed).
2. The runtime component is `src/AtticGLB.jsx`, rendered by `src/ArchiveScene.jsx`.
3. The current runtime origin is `ATTIC_ORIGIN` in `src/navigation.js` (`[-15.6, 8.45, 0]`). `src/AtticGLB.jsx` replaces the east wall with a stair doorway. Preserve this opening when exporting a replacement model.
4. Run `npm.cmd run build`, then verify entry, exit, camera and furniture collisions in the browser.
5. Commit/push both the GLB and any source changes after review.

## Limitations
- Blender is not available in the file-generation environment, so actual Blender execution/export and browser rendering could not be validated here.
- This is a detailed stylized modeling starter, not fully rigged or physics-enabled geometry.
- The script's geometry names allow manual editing, but PBR look in Blender and glTF can differ slightly. Textures are packed into `.blend` and embedded in GLB upon export when supported.
- The current character controller uses a fixed attic floor level and rectangular collision bounds; the room model does **not** provide per-furniture physics collision. For that, add simplified collider meshes or use `@react-three/rapier` later.
- If you see an issue with the Blender script, share the Blender Console or System Console error and your Blender version.
