import quickselect from './quickselect.js';

/**
 * A function to perform quickselect on a dimension of an indexed point array.
 * @function
 * @param {IndexedPointArray} iparr - The indexed point array to perform quickselect on.
 * @param {number} k - The index of the element to select.
 * @param {number} left - The left index of the subarray to perform quickselect on.
 * @param {number} right - The right index of the subarray to perform quickselect on.
 * @param {number} dim - The dimension to perform quickselect on.
 */
function quickselectDim(iparr, k, left, right, dim)
{
    var floats = dim == 0 ? iparr.x : (dim == 1 ? iparr.y : iparr.z);

    quickselect(floats, iparr.idx, k, left, right);
}

/**
 * A function to get a coordinate of a point in an indexed point array.
 * @function
 * @param {IndexedPointArray} iparr - The indexed point array to get a coordinate from.
 * @param {number} i - The index of the point in the indexed point array.
 * @param {number} dim - The dimension of the coordinate to get.
 */
function getPointDim(iparr, i, dim)
{
    const k = iparr.idx[i];
    return dim == 0 ? iparr.x[k] : (dim == 1 ? iparr.y[k] : iparr.z[k]);
}

/**
 * A function to construct a kd-tree from an indexed point array.
 * @function
 * @param {IndexedPointArray} iparr - The indexed point array to construct a kd-tree from.
 * @param {number} max_len - The maximum length of a leaf node in the kd-tree.
 */
export default function kdTree(iparr, max_len)
{
    return kdTreeStep(iparr, 0, iparr.idx.length-1, 0, max_len);
}

/**
 * A recursive helper function to construct a kd-tree from an indexed point array.
 * @function
 * @param {IndexedPointArray} iparr - The indexed point array to construct a kd-tree from.
 * @param {number} left - The left index of the subarray to construct a kd-tree from.
 * @param {number} right - The right index of the subarray to construct a kd-tree from.
 * @param {number} dim - The current dimension of partitioning in constructing a kd-tree.
 * @param {number} max_len - The maximum length of a leaf node in the kd-tree.
 */
function kdTreeStep(iparr, left, right, dim, max_len)
{
    const l = right - left; 
    if (l <= max_len)
    {
        return {
            range: [left, right+1]
        };
    }

    const k = (l / 2) | 0;
    quickselectDim(iparr, left+k, left, right, dim);
    const part_val = getPointDim(iparr, left+k, dim);

    const next_dim = (dim+1) % 3;

    const cleft  = kdTreeStep(iparr, left,     left+k, next_dim, max_len);
    const cright = kdTreeStep(iparr, left+k+1, right,  next_dim, max_len);

    return {
        d: dim,
        val: part_val,
        cleft,
        cright
    };
}

/**
 * A function to rearrange the branches of a kd-tree such that traversing the tree, one encounters points sorted by distance to a specified point. This is done by rearranging such that the specified point is on the 'left' side of each dividing plane.
 * @function
 * @param {Object} kdt - The kd-tree to rearrange.
 * @param {Point} p - The point based on which to sort distance from.
 * @param {String} order - Distance sorting direction, either 'forward' or 'reverse'
 * @throws {Error} If an unknown node type is encountered.
 */
export function viewDepthSort(kdt, p, order='forward')
{
    let orderFlag = {'forward': false, 'reverse': true}[order];
    return viewDepthSortStep(kdt, p, 0, orderFlag);
}

function viewDepthSortStep(kdt, p, dim, orderFlag=false) {
    if (kdt == null) {
        return [];
    }

    if (kdt.hasOwnProperty('range')) {
        return [kdt.range];
    }

    if (kdt.hasOwnProperty('val')) {
        const left = kdt.cleft;
        const right = kdt.cright;

        const p_dim = dim == 0 ? p.x : (dim == 1 ? p.y : p.z);
        const dist = kdt.val - p_dim; 

        let rl = viewDepthSortStep(kdt.cleft, p, (dim+1)%3, orderFlag);
        let rr = viewDepthSortStep(kdt.cright, p, (dim+1)%3, orderFlag);

        if ((dist>=0 && !orderFlag) || (dist<=0 && orderFlag)) {
            return rl.concat(rr);
        } else {
            return rr.concat(rl);
        }


        
    }

    throw new Error(`Unknown node type.`);
}

export function depthFirstCollect(kdt, indices, groupIdx) {
    if (kdt == null) {
        return [];
    }

    if (kdt.hasOwnProperty('range')) {
        let thisIdx = new Array(kdt.range[1]-kdt.range[0]);

        for (var i=kdt.range[0]; i<kdt.range[1]; ++i){
            thisIdx[i-kdt.range[0]] = indices[i];
        }

        kdt.range = groupIdx;

        return thisIdx;
    }

    if (kdt.hasOwnProperty('val')) {
        let leftIdx = depthFirstCollect(kdt.cleft, indices, groupIdx);
        let rightIdx = depthFirstCollect(kdt.cright, indices, groupIdx+leftIdx.length);
        return leftIdx.concat(rightIdx);
    }
}