/**
 * Sorts an array of length nSort using the bitonic sort algorithm.
 * @param {Kernel} ker - A webgl kernel that sorts an array of length n.
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

    var c = 1;
    var result = ker[c](inp, 1, 2);
    
    for (var k = 4; k < (nSort<<1); k <<= 1)
    {
        for (var j = k>>1; j > 0; j >>= 1)
        {
            c = (c + 1) % 2;
            result = ker[c](result, j, k); 
        }
    }

    return result;
}

function sortSteps(nSort)
{
    var steps = [];
    
    if (nSort < 2) {
        return steps;
    }
    
    for (var k = 2; k < (nSort<<1); k <<= 1)
    {
        steps.push([k-1, k]);
        for (var j = k>>1; j > 0; j >>= 1)
        {
            steps.push([j, k]);
        }
    }

    return steps;
}

function applySteps(ker, inp, steps, startStep, stopStep)
{
    var c = (startStep + 1) % 2;

    var result = ker[c](inp, steps[startStep][0], steps[startStep][1]);

    for (var i=startStep+1; i<stopStep; i++)
    {
        c = (c + 1) % 2;
        result = ker[c](result, steps[i][0], steps[i][1]);
    }
    return result;
}

export default bitonicSort;
export { sortSteps, applySteps };