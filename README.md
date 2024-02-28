# Portality Splat Viewer

This is a WebGL2 implementation of a browser-based renderer for Gaussian Splats, see [3D Gaussian Splatting for Real-Time Radiance Field Rendering](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/). Unlike some previous renderers, this renderer uses a gpu-based bitonic sort algorithm that makes it much faster and eliminates jerky animations. Also, it is fully WebGL 2 compatible, making it available across a wide variety of browsers, including mobile browsers.

This can be hosted locally using a webserver pointing to this folder or it can be accessed at [https://viewer.portality.ai](https://viewer.portality.ai/?url=https%3A%2F%2Fhuggingface.co%2Fcakewalk%2Fsplat-data%2Fresolve%2Fmain%2Fnike.splat%3Fdownload%3Dtrue&camera=-1.4896482414801953%2C3.390495575032005%2C-0.7877998849693162&lookAt=-0.39199591430028635%2C1.6863556266639323%2C1.3527185719665666&up=-0.02041277475655079%2C-0.7872545123100281%2C-0.6162927746772766)

Coming soon on our product website at [https://portality.ai](https://portality.ai) is a way to learn these splats easily with your data, and much more.  Join our discord server: [Panverse Robotics](https://discord.gg/kmFUXWw5Um), or contact us at the email: portality at panverserobotics.com or here on github for feedback and suggestions.

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

- [Nike (Small)](https://viewer.portality.ai/?url=https%3A%2F%2Fhuggingface.co%2Fcakewalk%2Fsplat-data%2Fresolve%2Fmain%2Fnike.splat%3Fdownload%3Dtrue&camera=-1.4896482414801953%2C3.390495575032005%2C-0.7877998849693162&lookAt=-0.39199591430028635%2C1.6863556266639323%2C1.3527185719665666&up=-0.02041277475655079%2C-0.7872545123100281%2C-0.6162927746772766)
- [Plush (Small)](https://viewer.portality.ai/?url=https%3A%2F%2Fhuggingface.co%2Fcakewalk%2Fsplat-data%2Fresolve%2Fmain%2Fplush.splat%3Fdownload%3Dtrue&camera=0.5565675836106072%2C2.667193492722922%2C-1.9308635603699218&lookAt=0.4023664948021303%2C1.8369706127766905%2C1.2489360953059658&up=-0.17141437530517578%2C-0.9511821866035461%2C-0.2566594183444977)
- [Chess (Small)](https://viewer.portality.ai/?url=https%3A%2F%2Fd3c617x64bvo7w.cloudfront.net%2Fchess.splat&camera=1.0791208253019446%2C3.0959993382319606%2C-1.1840614891643058&lookAt=0.3718318514897351%2C0.48511337896742135%2C1.6929692567777628&up=-0.05236946791410446%2C-0.7330717444419861%2C-0.678132176399231)
- [Train (Small)](https://viewer.portality.ai/?url=https%3A%2F%2Fhuggingface.co%2Fcakewalk%2Fsplat-data%2Fresolve%2Fmain%2Ftrain.splat%3Fdownload%3Dtrue&camera=-2.1270068327473646%2C0.16104565057569387%2C2.809400294222233&lookAt=-0.5589713026570335%2C0.0409163255285586%2C0.203083103813528&up=0.008334717713296413%2C-0.9986659288406372%2C0.05104399472475052)
- [Truck (Medium)](https://viewer.portality.ai/?url=https%3A%2F%2Fhuggingface.co%2Fcakewalk%2Fsplat-data%2Fresolve%2Fmain%2Ftruck.splat%3Fdownload%3Dtrue&camera=0.8299992664605993%2C0.7349339491049119%2C-3.401283966294055&lookAt=-0.13387062965327384%2C0.3533649188647336%2C0.4972497243969419&up=0.03285346180200577%2C-0.9954638481140137%2C-0.08930841088294983)
- [DomeGreenhouse (Medium)](https://viewer.portality.ai/?url=https%3A%2F%2Fd3c617x64bvo7w.cloudfront.net%2Fdomegreenhouse.splat&camera=-3.5806928884435965%2C0.8933851880858525%2C-1.6083174733309864&lookAt=0.8558180672183671%2C-0.05253012660170886%2C0.5930712310114736&up=0.26420512795448303%2C-0.570544958114624%2C-0.7776140570640564)
- [Dumpster (Large)](https://viewer.portality.ai/?url=https%3A%2F%2Fd3c617x64bvo7w.cloudfront.net%2Fdumpster.splat&camera=-3.151375547361921%2C-2.016319888117259%2C3.0729341535122643&lookAt=0.9058803055535136%2C0.4402297148762391%2C1.490492734170797&up=0.16068656742572784%2C-0.7082292437553406%2C-0.6874526739120483)
- [Bicycle (Large)](https://viewer.portality.ai/?url=https%3A%2F%2Fhuggingface.co%2Fcakewalk%2Fsplat-data%2Fresolve%2Fmain%2Fbicycle.splat%3Fdownload%3Dtrue&camera=-2.8849047698183004%2C0.9222252267609595%2C-0.7220571605742392&lookAt=0.521883814175611%2C0.8171271406869649%2C0.44293577341433193&up=0.04069226235151291%2C-0.9774585962295532%2C-0.20717640221118927)
- [Garden (Large)](https://viewer.portality.ai/?url=https%3A%2F%2Fhuggingface.co%2Fcakewalk%2Fsplat-data%2Fresolve%2Fmain%2Fgarden.splat%3Fdownload%3Dtrue&camera=-2.053353162001457%2C2.286297111737985%2C-2.890513076551497&lookAt=0.02551149613996362%2C0.7813343402799947%2C1.3989496256153457&up=0.07344545423984528%2C-0.9294056296348572%2C-0.36167794466018677)



## 3rd party code

This code uses [interactjs](https://github.com/taye/interact.js) for touch gestures. Attribution for interactjs goes to Taye Ademi.
