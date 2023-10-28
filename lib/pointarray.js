/**
 * A class representing an array of indexed points.
 * @class IndexedPointArray
 */
export default class IndexedPointArray {
    /**
     * Creates an instance of IndexedPointArray.
     * @constructor
     * @param {Array} x - The x-coordinates of the points.
     * @param {Array} y - The y-coordinates of the points.
     * @param {Array} z - The z-coordinates of the points.
     */
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

export function permutePointArray(iparr, perm){
    let n = iparr.idx.length;

    let x = new Float32Array(n);
    let y = new Float32Array(n);
    let z = new Float32Array(n);
    let idx = new Uint32Array(n);
 
    for (var i=0; i<n; ++i) {
        x[i] = iparr.x[perm[i]];
        y[i] = iparr.y[perm[i]];
        z[i] = iparr.z[perm[i]];
        idx[i] = i;
    }

    return new IndexedPointArray(x, y, z, idx);
}