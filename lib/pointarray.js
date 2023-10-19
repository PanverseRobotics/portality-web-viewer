export default class IndexedPointArray {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.idx = new Uint32Array(x.length);
        for (var i=0; i<this.idx.length; ++i){
            this.idx[i]=i;
        }
    }
}
