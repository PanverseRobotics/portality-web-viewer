//import { GPU, ArrayTexture } from 'gpu.js';
import {performance} from 'perf_hooks'

/**
 * Creates a kernel for sorting an array of length n.
 * @param {number} n - Length of the array to be sorted.
 * @returns {Kernel} - GPU.js kernels that sorts an array of length n.
 */
export function createSortKernel(device, n)
{
    const ker1 = createSortKernelSingl(device,n );
    const ker2 = createSortKernelSingl(device, n);
    return [ker1, ker2];
}

export function createSortKernelSingl(device, n)
{
    const bitonicKer = device.createKernel(function(x, j, k)
    {
        const idx = this.thread.x;

        const l = idx ^ j;
        let idxk = idx & k;
        var ik = true; // needed for gpu.js silly type inference to work
        ik = idxk==0;

        var islow = true;
        islow = l > idx;

        const xl = x[l];
        const xi = x[idx];

        var isorder = true;
        isorder = xi > xl; 

        var swap = true;
        swap = (ik && isorder) || !(ik || isorder);
        return islow==swap ? xl : xi; 
    })
    .setPipeline(true)
    .setPrecision('unsigned')
    .setStrictIntegers(true)
    .setTactic('speed')
    .setOutput([n]);
    bitonicKer.immutable = false; 
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

    var result = ker[1](inp, 1, 2);

    var c = 0;
    for (var k = 4; k <= nSort; k <<= 1)
    {
        for (var j = k>>1; j > 0; j >>= 1)
        {
            result = ker[c](result, j, k); 
            c = (c + 1) % 2;
        }
    }

    return result;
}

