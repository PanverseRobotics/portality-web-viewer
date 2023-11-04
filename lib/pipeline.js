import toTexture from "./kernels/to-texture.js";
import { createEncodeKernel, createDecodeKernel } from "./kernels/ordering.js";
import createDepthKernel from "./kernels/depth.js";
import createBitonicKernel from "./kernels/bitonic.js";
import createPermuteKernel from "./kernels/permute.js";

import kdTree, { viewDepthSort, depthFirstCollect } from './kd-tree.js';
import IndexedPointArray, { permutePointArray, permuteArray } from './pointarray.js';
import bitonicSort from './bitonic.js';

function idxPointArrayFromVerts(verts) {
    const n = Math.floor(verts.length/3);
    let x = new Float32Array(n);
    let y = new Float32Array(n);
    let z = new Float32Array(n);
    for (var i=0; i<n; ++i){
        x[i] = verts[3*i+0];
        y[i] = verts[3*i+1];
        z[i] = verts[3*i+2];
    }
    return new IndexedPointArray(x, y, z);
}

function vertsFromIdxPointArray(iparr) {
    const n = iparr.idx.length;
    let verts = new Float32Array(3*n);
    for (var i=0; i<n; ++i){
        verts[3*i+0] = iparr.x[i];
        verts[3*i+1] = iparr.y[i];
        verts[3*i+2] = iparr.z[i];
    }
    return verts;
}

function verts4FromIdxPointArray(iparr) {
    const n = iparr.idx.length;
    let verts = new Float32Array(4*n);
    for (var i=0; i<n; ++i){
        verts[4*i+0] = iparr.x[i];
        verts[4*i+1] = iparr.y[i];
        verts[4*i+2] = iparr.z[i];
        verts[4*i+3] = 0.0;
    }
    return verts;
}

function createPipeline(gl, verts, n_groups, group_size){
    // Prep work 
    let pipeline = {
        n_groups: n_groups,
        group_size: group_size
    };

    let iparr = idxPointArrayFromVerts(verts);

    // Create kd tree
    pipeline.tree = kdTree(iparr, group_size);

    // Collect vertices such that all vertices in the same leaf node are consecutive.
    let perm = depthFirstCollect(pipeline.tree, iparr.idx, 0);
    pipeline.perm = perm;
    let iparr_new = permutePointArray(iparr, perm);

    pipeline.verts = verts4FromIdxPointArray(iparr_new); // TODO: is this possible with 3d verts?

    pipeline.depthKer = createDepthKernel(gl, group_size, n_groups);

    // Only need to do this once.
    pipeline.coordsx = toTexture(gl, pipeline.verts, group_size, n_groups, 'float', 4);

    // Create index encoding/decoding kernels
    pipeline.encKer = createEncodeKernel(gl, group_size, n_groups);
    pipeline.decKer = createDecodeKernel(gl, group_size, n_groups);

    // Create bitonic sort kernel
    pipeline.bitKer = [
        createBitonicKernel(gl, group_size, n_groups, 'reverse'),
        createBitonicKernel(gl, group_size, n_groups, 'reverse')
    ];

    // Create permutation kernel
    pipeline.permKer = createPermuteKernel(gl, group_size, n_groups, true);

    return pipeline
}

function applyPipeline(gl, pipeline, cameraPos, viewMat){
    gl.viewport(0, 0, pipeline.group_size, pipeline.n_groups); // TODO: is this necessary?

    // compute depths
    let depths = pipeline.depthKer(pipeline.coordsx, viewMat);
    
    // (optional) subtract to put in range 1-2
    // TODO 

    // add encoding 
    let encDepths = pipeline.encKer(depths);

    // sort 
    let encDepthSorted = bitonicSort(pipeline.bitKer, encDepths, pipeline.group_size);

    // decode to get indices
    let indices = pipeline.decKer(encDepthSorted);

    // (in parallel, on cpu) sort kdtree to get perm
    let groupPerm = viewDepthSort(pipeline.tree, {x: cameraPos[0], y: cameraPos[1], z: cameraPos[2]}, 'reverse');
    let groupPerm_arr = new Uint32Array(pipeline.n_groups);
    for (var i=0; i<pipeline.n_groups; ++i){
        groupPerm_arr[i] = Math.floor(groupPerm[i]/pipeline.group_size);
    }
    
    // transfer perm to texture
    let permx = toTexture(gl, groupPerm_arr, 1, pipeline.n_groups, 'unsigned'); // TODO: see if integer indexing works

    // with indices and perm, create new array(s) of vertex data,
    // sorted in view/depth order.
    // TODO 
    let idxList = pipeline.permKer(indices, permx);

    return idxList;
}

export {
    createPipeline,
    applyPipeline,
    toTexture,
    createBitonicKernel,
    bitonicSort
};
