# Portality Splat Viewer

This is a WebGL2 implementation of a browser-based renderer for Gaussian Splats, see [3D Gaussian Splatting for Real-Time Radiance Field Rendering](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/). Unlike some previous renderers, this renderer uses a gpu-based bitonic sort algorithm that makes it much faster and eliminates jerky animations. Also, it is fully WebGL 2 compatible, making it available across a wide variety of browsers, including mobile browsers.

## Controls 

The controls are based on the position of the camera and focus point (where the camera is looking at).

Left mouse + drag: Orbit camera around the focus point.
Right mouse + drag: Pan camera by moving focus point around camera's origin.
Mouse wheel: Dolly camera closer/farther from the focus point.

## Examples

The splat format is compatible with the .splat format introduced by https://github.com/antimatter15/splat.

- https://antimatter15.com/splat/?url=plush.splat#[0.95,0.19,-0.23,0,-0.16,0.98,0.12,0,0.24,-0.08,0.97,0,-0.33,-1.52,1.53,1]
- https://antimatter15.com/splat/?url=truck.splat
- https://antimatter15.com/splat/?url=garden.splat
- https://antimatter15.com/splat/?url=treehill.splat
- https://antimatter15.com/splat/?url=stump.splat#[-0.86,-0.23,0.45,0,0.27,0.54,0.8,0,-0.43,0.81,-0.4,0,0.92,-2.02,4.1,1]
- https://antimatter15.com/splat/?url=bicycle.splat
- https://antimatter15.com/splat/?url=https://media.reshot.ai/models/nike_next/model.splat#[0.95,0.16,-0.26,0,-0.16,0.99,0.01,0,0.26,0.03,0.97,0,0.01,-1.96,2.82,1]
