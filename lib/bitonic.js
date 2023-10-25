/**
 * Sorts an array of length nSort using the bitonic sort algorithm.
 * @param {Kernel} ker - A GPU.js kernel that sorts an array of length n.
 * @param {Array} inp - The input array to be sorted.
 * @param {number} nSort - Length of the array to be sorted.
 * @returns {Array} - The sorted array.
 */
function bitonicSort(ker, inp, nSort)
{
    if (nSort < 2)
    {
        return inp;
    }

    var result = ker(inp, 1, 2);

    var c = 0;
    for (var k = 4; k <= nSort; k <<= 1)
    {
        for (var j = k>>1; j > 0; j >>= 1)
        {
            result = ker(result, j, k); 
            c = (c + 1) % 2;
        }
    }

    return result;
}

