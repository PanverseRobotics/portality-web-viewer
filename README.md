# Portality Splat Viewer

This is a WebGL2 implementation of a browser-based renderer for Gaussian Splats, see [3D Gaussian Splatting for Real-Time Radiance Field Rendering](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/). Unlike some previous renderers, this renderer uses a gpu-based bitonic sort algorithm that makes it much faster and eliminates jerky animations. Also, it is fully WebGL 2 compatible, making it available across a wide variety of browsers, including mobile browsers.

This can be hosted locally using a webserver pointing to this folder or it can be accessed at [https://viewer.portality.ai](https://viewer.portality.ai)

Coming soon on our product website at [https://portality.ai](https://portality.ai) is a way to learn these splats easily with your data.  Contact us at the email: portality at panverserobotics.com or here on github for feedback and suggestions.

## Controls 

The controls are based on the position of the camera and focus point (where the camera is looking at).

Left mouse + drag: Orbit camera around the focus point.
Right mouse + drag: Pan camera by moving focus point around camera's origin.
Mouse wheel: Dolly camera closer/farther from the focus point.

## Quality Configuration

Our implementation has two different gpu-based sorting methods, which can be controlled by a parameter on the url.  The default is a global bitonic sort which introduces minimal artifacts but can be slightly slower than a tiled bitonic sort that uses kd-trees internally, which introduces artifacts along the tiling boundaries.  Expect about a ~2x difference in fps between the sort configurations from our testing.

To switch between them use the query parameter like so:

quality=high, default
```
https://viewer.portality.ai/index.html?quality=high
```

and 

quality=fast
```
https://viewer.portality.ai/index.html?quality=fast
```


## Setting default camera params

The camera parameters on startup, such as camera position, the location where the camera is looking, and the up vector, can be specified as parameters, e.g.

```
https://viewer.portality.ai/index.html?camera=5.0,0.0,0.0&lookAt=0.1,0.0,0.08&up=0.0,-1.0,0.0
```

## Examples

The splat format is compatible with the .splat format introduced by https://github.com/antimatter15/splat.

To load from a URL, specify the link as a `url` argument, e.g. https://viewer.portality.ai/index.html?url=...

## Selected Demo Scenes
Small- and medium-sized scenes are suited to mobile viewing

- [Nike (Small)](https://viewer.portality.ai/?url=https://huggingface.co/cakewalk/splat-data/resolve/main/nike.splat?download=true)
- [Plush (Small)](https://viewer.portality.ai/?url=https://huggingface.co/cakewalk/splat-data/resolve/main/plush.splat?download=true)
- [Chess (Small)](https://viewer.portality.ai/?url=https://d3c617x64bvo7w.cloudfront.net/chess.splat)
- [Train (Small)](https://viewer.portality.ai/?url=https://d3c617x64bvo7w.cloudfront.net/train.splat)
- [Truck (Medium)](https://viewer.portality.ai/?url=https://huggingface.co/cakewalk/splat-data/resolve/main/truck.splat?download=true)
- [DomeGreenhouse (Medium)](https://viewer.portality.ai/?url=https://d3c617x64bvo7w.cloudfront.net/domegreenhouse.splat)
- [Dumpster (Large)](https://viewer.portality.ai/?url=https://d3c617x64bvo7w.cloudfront.net/dumpster.splat)
- [Bicycle (Large)](https://viewer.portality.ai/?url=https://d3c617x64bvo7w.cloudfront.net/bicycle.splat)
- [Garden (Large)](https://viewer.portality.ai/?url=https://d3c617x64bvo7w.cloudfront.net/garden.splat)


