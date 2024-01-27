# Portality Splat Viewer

This is a WebGL2 implementation of a browser-based renderer for Gaussian Splats, see [3D Gaussian Splatting for Real-Time Radiance Field Rendering](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/). Unlike some previous renderers, this renderer uses a gpu-based bitonic sort algorithm that makes it much faster and eliminates jerky animations. Also, it is fully WebGL 2 compatible, making it available across a wide variety of browsers, including mobile browsers.

This can be hosted locally using a webserver pointing to this folder or it can be accessed at [https://viewer.portality.ai]([https://viewer.portality.ai](https://viewer.portality.ai/index.html?url=https%3A%2F%2Fhuggingface.co%2Fcakewalk%2Fsplat-data%2Fresolve%2Fmain%2Fnike.splat%3Fdownload%3Dtrue&camera=-1.121157395017384%2C4.563588392281623%2C-2.6709851487313996&lookAt=-0.39177264539051626%2C1.6856062297498278%2C1.352100303898281&up=0.1489333540847141%2C-0.9887845148632137%2C-0.011137289068537223))

Coming soon on our product website at [https://portality.ai](https://portality.ai) is a way to learn these splats easily with your data, and much more.  Contact us at the email: portality at panverserobotics.com or here on github for feedback and suggestions.

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

- [Nike (Small)](https://viewer.portality.ai/?url=https%3A%2F%2Fhuggingface.co%2Fcakewalk%2Fsplat-data%2Fresolve%2Fmain%2Fnike.splat%3Fdownload%3Dtrue&camera=-1.121157395017384%2C4.563588392281623%2C-2.6709851487313996&lookAt=-0.39177264539051626%2C1.6856062297498278%2C1.352100303898281&up=0.1489333540847141%2C-0.9887845148632137%2C-0.011137289068537223)
- [Plush (Small)](https://viewer.portality.ai/?url=https://huggingface.co/cakewalk/splat-data/resolve/main/plush.splat?download=true&camera=1.351354312542493%2C2.364996233810519%2C-0.8300492817799272&lookAt=-0.06348554241382653%2C0.3566753476187289%2C3.524818730331691&up=0%2C-1%2C0)
- [Chess (Small)](https://viewer.portality.ai/?url=https://d3c617x64bvo7w.cloudfront.net/chess.splat&camera=-3.28,-3.28,2.05&lookAt=0.76,-0.49,1.11&up=-0.44,-0.58,-0.69)
- [Train (Small)](https://viewer.portality.ai/?url=https%3A%2F%2Fhuggingface.co%2Fcakewalk%2Fsplat-data%2Fresolve%2Fmain%2Ftrain.splat%3Fdownload%3Dtrue&camera=0.5618383688141906%2C-1.0299536294326785%2C-2.2620414235248365&lookAt=-1.7152198471608104%2C0.4635614403200746%2C1.9313365247982288&up=0%2C-1%2C0)
- [Truck (Medium)](https://viewer.portality.ai/?url=https%3A%2F%2Fhuggingface.co%2Fcakewalk%2Fsplat-data%2Fresolve%2Fmain%2Ftruck.splat%3Fdownload%3Dtrue&camera=0.9015777991436947%2C0.4698942592262387%2C-3.3625573268093705&lookAt=-0.07841267219036885%2C0.2532953948353532%2C1.5356774172631333&up=0%2C-1%2C0)
- [DomeGreenhouse (Medium)](https://viewer.portality.ai/?url=https://d3c617x64bvo7w.cloudfront.net/domegreenhouse.splat&camera=-4.14,0.69,0.00&lookAt=0.64,-0.52,0.83&up=0.33,-0.51,-0.79)
- [Dumpster (Large)](https://viewer.portality.ai/?url=https%3A%2F%2Fd3c617x64bvo7w.cloudfront.net%2Fdumpster.splat&camera=-1.3925814411217798%2C-1.0924251450014777%2C3.3732281067801195&lookAt=1.9556633999269635%2C1.333901814088985%2C0.5621439792625356&up=-0.3599863376395386%2C-0.8809172912309015%2C-0.3072369813731473)
- [Bicycle (Large)](https://viewer.portality.ai/?url=https%3A%2F%2Fhuggingface.co%2Fcakewalk%2Fsplat-data%2Fresolve%2Fmain%2Fbicycle.splat%3Fdownload%3Dtrue&camera=-1.7495482027810154%2C0.7203255031223299%2C-0.9116998716853598&lookAt=2.5433595285704826%2C0.4038704915334661%2C1.6320767371666853&up=0.11243918156352482%2C-0.9758978697391626%2C-0.1870314900969603)
- [Garden (Large)](https://viewer.portality.ai/?url=https://huggingface.co/cakewalk/splat-data/resolve/main/garden.splat?download=true&camera=2.98,0.82,0.81&lookAt=-2.00,0.98,0.41&up=-0.18,-0.86,-0.49)


