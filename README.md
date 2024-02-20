# Portality Splat Viewer

This is a WebGL2 implementation of a browser-based renderer for Gaussian Splats, see [3D Gaussian Splatting for Real-Time Radiance Field Rendering](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/). Unlike some previous renderers, this renderer uses a gpu-based bitonic sort algorithm that makes it much faster and eliminates jerky animations. Also, it is fully WebGL 2 compatible, making it available across a wide variety of browsers, including mobile browsers.

This can be hosted locally using a webserver pointing to this folder or it can be accessed at [https://viewer.portality.ai](https://viewer.portality.ai/index.html?url=https%3A%2F%2Fhuggingface.co%2Fcakewalk%2Fsplat-data%2Fresolve%2Fmain%2Fnike.splat%3Fdownload%3Dtrue&camera=-1.121157395017384%2C4.563588392281623%2C-2.6709851487313996&lookAt=-0.39177264539051626%2C1.6856062297498278%2C1.352100303898281&up=0.1489333540847141%2C-0.9887845148632137%2C-0.011137289068537223)

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

- [Nike (Small)](https://viewer.portality.ai/?url=https%3A%2F%2Fhuggingface.co%2Fcakewalk%2Fsplat-data%2Fresolve%2Fmain%2Fnike.splat%3Fdownload%3Dtrue&camera=-1.5872351406947818%2C4.4812448755272305%2C-2.6171910666812073&lookAt=-0.39177264539051626%2C1.6856062297498278%2C1.352100303898281&up=0.1489333540847141%2C-0.9887845148632137%2C-0.011137289068537223&azimuth=-1.8633333333333337&elevation=0.5933333333333334)
- [Plush (Small)](https://viewer.portality.ai/?url=https%3A%2F%2Fhuggingface.co%2Fcakewalk%2Fsplat-data%2Fresolve%2Fmain%2Fplush.splat%3Fdownload%3Dtrue&camera=0.7052974358222084%2C3.4564940002769733%2C-3.47218552631978&lookAt=0.40215844801269296%2C1.8362788583026326%2C1.2483027585705533&up=-0.1056619024411947%2C-0.9921357976545737%2C-0.06709784933088611&azimuth=-1.5066666666666668&elevation=0.3299999999999999)
- [Chess (Small)](https://viewer.portality.ai/?url=https%3A%2F%2Fd3c617x64bvo7w.cloudfront.net%2Fchess.splat&camera=3.571514317448939%2C3.483368581677844%2C-0.7088307264649021&lookAt=0.3713940803025764%2C0.48468165080590997%2C1.690420648115129&up=-0.44%2C-0.58%2C-0.69&azimuth=-0.6433333333333326&elevation=0.6433333333333338)
- [Train (Small)](https://viewer.portality.ai/?url=https%3A%2F%2Fhuggingface.co%2Fcakewalk%2Fsplat-data%2Fresolve%2Fmain%2Ftrain.splat%3Fdownload%3Dtrue&camera=-3.6104202974635893%2C-0.3587947864371728%2C4.142247438321119&lookAt=-0.5577770447765091%2C0.04077868340869148%2C0.20248726617620044&up=0%2C-1%2C0&azimuth=2.2300000000000004&elevation=-0.08000000000000021)
- [Truck (Medium)](https://viewer.portality.ai/?url=https%3A%2F%2Fhuggingface.co%2Fcakewalk%2Fsplat-data%2Fresolve%2Fmain%2Ftruck.splat%3Fdownload%3Dtrue&camera=-0.013217124229712107%2C0.3366287590328669%2C-4.501360521910549&lookAt=-0.13385304728791692%2C0.3532953948353532%2C0.4971561778033703&up=0%2C-1%2C0&azimuth=-1.5466666666666655&elevation=-0.0033333333333333483)
- [DomeGreenhouse (Medium)](https://viewer.portality.ai/?url=https%3A%2F%2Fd3c617x64bvo7w.cloudfront.net%2Fdomegreenhouse.splat&camera=-2.854791863856144%2C2.220196406236423%2C-1.4676408517376869&lookAt=0.64%2C-0.52%2C0.83&up=0.33%2C-0.51%2C-0.79&azimuth=-2.560000000000001&elevation=0.5800000000000004)
- [Dumpster (Large)](https://viewer.portality.ai/?url=https%3A%2F%2Fd3c617x64bvo7w.cloudfront.net%2Fdumpster.splat&camera=-2.34023624103839%2C-2.3692070946343566%2C4.053651325551423&lookAt=0.9057882952011743%2C0.44023401973367104%2C1.4903789375619527&up=-0.3599863376395386%2C-0.8809172912309015%2C-0.3072369813731473&azimuth=-3.8100000000000014&elevation=-0.5966666666666665)
- [Bicycle (Large)](https://viewer.portality.ai/?url=https%3A%2F%2Fhuggingface.co%2Fcakewalk%2Fsplat-data%2Fresolve%2Fmain%2Fbicycle.splat%3Fdownload%3Dtrue&camera=-4.366361091126787%2C0.5345713934921558%2C-0.8398459142083867&lookAt=0.21298291343198386%2C0.7178636493399926%2C1.159156946434346&up=0.11243918156352482%2C-0.9758978697391626%2C-0.1870314900969603&azimuth=-2.729999999999999&elevation=-0.03666666666666668)
- [Garden (Large)](https://viewer.portality.ai/?url=https%3A%2F%2Fhuggingface.co%2Fcakewalk%2Fsplat-data%2Fresolve%2Fmain%2Fgarden.splat%3Fdownload%3Dtrue&camera=-1.4758369908647406%2C2.510837853035692%2C-3.0442375737624556&lookAt=0.02552765364825771%2C0.7811866636358719%2C1.3987581461560485&up=-0.18%2C-0.86%2C-0.49&azimuth=-1.8966666666666665&elevation=0.35333333333333344)



## 3rd party code

This code uses [interactjs](https://github.com/taye/interact.js) for touch gestures. Attribution for interactjs goes to Taye Ademi.