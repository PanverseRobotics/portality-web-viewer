//import { GPU, ArrayTexture } from 'gpu.js';
import gpujs from 'gpu.js'

const { GPU, Texture, ArrayTexture } = gpujs;

const gpu = new GPU({
    //canvas: canvas,
    mode: 'gpu'
});

/**
 * Creates a kernel for sorting an array of length n.
 * @param {number} n - Length of the array to be sorted.
 * @returns {Kernel} - A GPU.js kernel that sorts an array of length n.
 */
export function createSortKernel(n)
{
    const bitonicKer = gpu.createKernel(function(x, j, k)
    {
        const idx = this.thread.x;

        const l = idx ^ j;
        const idxk = idx & k;
        const ik = (idxk < 1) && (idxk > -1); // stupid ==0 comparison

        const islow = l > idx;

        const xl = x[l];
        const xi = x[idx];

        const isorder = xi > xl; 

        const swap = (ik && isorder) || !(ik || isorder);
        return islow==swap ? xl : xi; 
    }).setPipeline(true).setOutput([n]);
    bitonicKer.immutable = true; 
    return bitonicKer;
}

/**
 * Sorts an array of length nSort using the bitonic sort algorithm.
 * @param {Kernel} ker - A GPU.js kernel that sorts an array of length n.
 * @param {Array} inp - The input array to be sorted.
 * @param {number} nSort - Length of the array to be sorted.
 * @returns {Array} - The sorted array.
 */
export default function bitonicSort(ker, inp, nSort)
{
    if (nSort < 2)
    {
        return inp;
    }

    var result1 = ker(inp, 1, 2);
    var c = 0;
    for (var k = 4; k <= nSort; k *= 2)
    {
        for (var j = k/2; j > 0; j = (j/2)|0)
        {
            if (c==0) {
                var result2 = ker(result1, j, k); 
                result1.delete();
            } else {
                var result1 = ker(result2, j, k); 
                result2.delete();
            }
            c = (c + 1) % 2;
        }
    }

    //return c==0 ? result1.toArray() : result2.toArray();
    return c==0 ? result1 : result2;
}

