
/**
 * Returns the kth smallest element of an array.
 * The input `idx` is an array of indices before rearranging the array `arr`,
 * and after rearranging, `arr[idx[k]]` contains the kth smallest element,
 * and the array is rearranged such that all elements `arr[idx[i]]` where i < k are smaller than the kth smallest element.
 * @param {Array} arr The input array.
 * @param {Array} idx The array of indices before rearranging the array arr.
 * @param {number} k The index of the kth smallest element.
 * @param {number} left The leftmost index of the subarray to be sorted.
 * @param {number} right The rightmost index of the subarray to be sorted.
 * @param {function} compare The comparison function used to sort the array.
 * @returns {*} The kth smallest element of the array.
 */
export default function quickselect(arr, idx, k, left, right, compare) {
    return quickselectStep(arr, idx, k, left || 0, right || (arr.length - 1), compare || defaultCompare);
}

/**
 * Helper function that recursively finds the kth smallest element of an array.
 * @param {Array} arr The input array.
 * @param {Array} idx The array of indices before rearranging the array arr.
 * @param {number} k The index of the kth smallest element.
 * @param {number} left The leftmost index of the subarray to be sorted.
 * @param {number} right The rightmost index of the subarray to be sorted.
 * @param {function} compare The comparison function used to sort the array.
 * @returns {*} The kth smallest element of the array.
 */
function quickselectStep(arr, idx, k, left, right, compare)
{
    if (idx.length == 0)
    {
        return undefined;
    }
    if ((k < 0) || (k >= idx.length))
    {
        throw new Error(`kth element index out of bounds: ${k}`);
    }

    while (right > left) {
        if (right - left > 600) {
            var n = right - left + 1;
            var m = k - left + 1;
            var z = Math.log(n);
            var s = 0.5 * Math.exp(2 * z / 3);
            var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
            var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
            var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
            quickselectStep(arr, idx, k, newLeft, newRight, compare);
        }

        var t = arr[idx[k]];
        var i = left;
        var j = right;

        swap(idx, left, k);
        if (compare(arr[idx[right]], t) > 0) swap(idx, left, right);

        while (i < j) {
            swap(idx, i, j);
            i++;
            j--;
            while (compare(arr[idx[i]], t) < 0) i++;
            while (compare(arr[idx[j]], t) > 0) j--;
        }

        if (compare(arr[idx[left]], t) === 0) swap(idx, left, j);
        else {
            j++;
            swap(idx, j, right);
        }

        if (j <= k) left = j + 1;
        if (k <= j) right = j - 1;
    }

    return arr[idx[k]];
}

function swap(idx, i, j) {
    var tmp = idx[i];
    idx[i] = idx[j];
    idx[j] = tmp;
}

function defaultCompare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}
