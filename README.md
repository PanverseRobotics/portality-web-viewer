# Portality Splat Viewer

This is a WebGL2 implementation of a browser-based renderer for Gaussian Splats, see [3D Gaussian Splatting for Real-Time Radiance Field Rendering](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/). Unlike some previous renderers, this renderer uses a gpu-based bitonic sort algorithm that makes it much faster and eliminates jerky animations. Also, it is fully WebGL 2 compatible, making it available across a wide variety of browsers, including mobile browsers.

This can be hosted locally using a webserver pointing to this folder or it can be accessed at [https://anj1.github.io/research/splat-viewer/](https://anj1.github.io/research/splat-viewer/?camera=-1.4896482414801953%2C3.390495575032005%2C-0.7877998849693162&lookAt=-0.39199591430028635%2C1.6863556266639323%2C1.3527185719665666&up=-0.02041277475655079%2C-0.7872545123100281%2C-0.6162927746772766&download=true&url=https://anj1-splats.s3.us-east-1.amazonaws.com/nike.splat)

Join our discord server: [Panverse Robotics](https://discord.gg/kmFUXWw5Um), or contact us at the email: portality at panverserobotics.com or here on github for feedback and suggestions.

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
https://anj1.github.io/research/splat-viewer/index.html?quality=high
```

and 

quality=fast
```
https://anj1.github.io/research/splat-viewer/index.html?quality=fast
```


## Setting default camera params

The camera parameters on startup, such as camera position, the location where the camera is looking, and the up vector, can be specified as parameters, e.g.

```
https://anj1.github.io/research/splat-viewer/index.html?camera=5.0,0.0,0.0&lookAt=0.1,0.0,0.08&up=0.0,-1.0,0.0
```

## Examples

The splat format is compatible with the .splat format introduced by https://github.com/antimatter15/splat.

To load from a URL, specify the link as a `url` argument, e.g. https://anj1.github.io/research/splat-viewer/?url=...

## Selected Demo Scenes
Small- and medium-sized scenes are suited to mobile viewing

- [Nike (Small)](https://anj1.github.io/research/splat-viewer/?camera=-1.4896482414801953%2C3.390495575032005%2C-0.7877998849693162&lookAt=-0.39199591430028635%2C1.6863556266639323%2C1.3527185719665666&up=-0.02041277475655079%2C-0.7872545123100281%2C-0.6162927746772766&download=true&url=https://anj1-splats.s3.us-east-1.amazonaws.com/nike.splat)
- [Bread (Small)](https://anj1.github.io/research/splat-viewer/?camera=-0.5217419720692142%2C0.08381370203699756%2C-0.006185839046739305&lookAt=-0.13837573820475715%2C0.1527030879514597%2C-0.4022625733969345&up=0.7144755721092224%2C0.04016752541065216%2C0.6985304951667786&url=https%3A%2F%2Fanj1-splats.s3.us-east-1.amazonaws.com%2Fbread.splat)
<!-- - [Plush (Small)]() -->
- [Chess (Small)](https://anj1.github.io/research/splat-viewer/?camera=1.0791208253019446%2C3.0959993382319606%2C-1.1840614891643058&lookAt=0.3718318514897351%2C0.48511337896742135%2C1.6929692567777628&up=-0.05236946791410446%2C-0.7330717444419861%2C-0.678132176399231&download=true&url=https://anj1-splats.s3.us-east-1.amazonaws.com/chess.splat)
<!-- - [Train (Small)]() -->
<!-- - [Truck (Medium)]() -->
- [DomeGreenhouse (Medium)](https://anj1.github.io/research/splat-viewer/?camera=-3.5806928884435965%2C0.8933851880858525%2C-1.6083174733309864&lookAt=0.8558180672183671%2C-0.05253012660170886%2C0.5930712310114736&up=0.26420512795448303%2C-0.570544958114624%2C-0.7776140570640564&url=https://anj1-splats.s3.us-east-1.amazonaws.com/domegreenhouse.splat)
<!-- - [Dumpster (Large)]() -->
<!-- - [Bicycle (Large)]() -->
<!-- - [Garden (Large)]() -->
- [Sign (Medium)](https://anj1.github.io/research/splat-viewer/?camera=0.5812611100579854%2C-0.4065892115856926%2C-0.06994901789264213&lookAt=0.37263789529882624%2C-0.275321325133846%2C-0.12338956492352113&up=-0.18550071120262146%2C0.1030282974243164%2C0.9772324562072754&url=https%3A%2F%2Fanj1-splats.s3.us-east-1.amazonaws.com%2Fsign.splat)


## 3rd party code

This code uses [interactjs](https://github.com/taye/interact.js) for touch gestures. Attribution for interactjs goes to Taye Ademi.
