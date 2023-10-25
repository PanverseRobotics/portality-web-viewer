import chai from 'chai';
const { expect } = chai;

import bitonicSort, {createSortKernel} from '../lib/bitonic.js';

import gpujs from 'gpu.js'
const { GPU } = gpujs;
export const gpu = new GPU({
    //canvas: canvas,
    mode: 'gpu'
});

describe('bitonicSort', () => {
  it('should produce sorted output', () => {

        const n = 64;

        var inp = new Float32Array(n);
        for (var i=0; i<n; ++i)
        {
            inp[i] = Math.random();
        }

        var ker = createSortKernel(gpu, n);

        const resultTexture = bitonicSort(ker, inp, 32);
        const resultArray = resultTexture.toArray();

        // First 32 elements should be sorted in increasing order.
        for (var i=1; i<32; ++i)
        {
            expect(resultArray[i]).to.be.at.least(resultArray[i-1]);
        }

        // Next 32 elements should be sorted in decreasing order.
        for (var i=33; i<64; ++i)
        {
            expect(resultArray[i]).to.be.at.most(resultArray[i-1]);
        }
    });

});
