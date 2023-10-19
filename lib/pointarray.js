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
