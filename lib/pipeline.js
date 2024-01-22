import toTexture from "./kernels/to-texture.js";
import createGetChannelKernel from "./kernels/get-channel.js";
import { createEncodeKernel, createDecodeKernel } from "./kernels/ordering.js";
import { createDepthKernel, createDepthIndexedKernel } from "./kernels/depth.js";
import { createBitonicKernel, createFullBitonicKernel } from "./kernels/bitonic.js";

import kdTree, { viewDepthSort, depthFirstCollect } from './kd-tree.js';
import IndexedPointArray, { permutePointArray, permuteArray } from './pointarray.js';
import bitonicSort from './bitonic.js';

function idxPointArrayFromVerts(verts, n_verts) {
    let x = new Float32Array(n_verts);
    let y = new Float32Array(n_verts);
    let z = new Float32Array(n_verts);
    for (var i=0; i<n_verts; ++i){
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

function createPipeline(gl, verts, group_size, n_groups){
    // Prep work 
    let pipeline = {
        n_groups: n_groups,
        group_size: group_size
    };

    let iparr = idxPointArrayFromVerts(verts, group_size*n_groups);

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

    return pipeline
}

function applyPipeline(gl, pipeline, cameraPos, viewMat){
    gl.viewport(0, 0, pipeline.group_size, pipeline.n_groups);

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

    return {
        inner: indices,
        outer: permx
    }
}

function createFullSortPipeline(gl, verts, group_size, n_groups){
    // Prep work 
    let pipeline = {
        n_groups: n_groups,
        group_size: group_size
    };

    let iparr = idxPointArrayFromVerts(verts, group_size*n_groups);

    pipeline.verts = verts4FromIdxPointArray(iparr); // TODO: is this possible with 3d verts?

    pipeline.depthIdxKer = createDepthIndexedKernel(gl, group_size, n_groups);

    // Only need to do this once.
    pipeline.coordsx = toTexture(gl, pipeline.verts, group_size, n_groups, 'float', 4);

    // Create bitonic sort kernel
    pipeline.bitKer = [
        createFullBitonicKernel(gl, group_size, n_groups, 'reverse'),
        createFullBitonicKernel(gl, group_size, n_groups, 'reverse')
    ];

    pipeline.getChannelKer = createGetChannelKernel(gl, group_size, n_groups, 1);

    return pipeline
}

function applyFullSortPipeline(gl, pipeline, viewMat){
    gl.viewport(0, 0, pipeline.group_size, pipeline.n_groups); // TODO: is this necessary?

    // compute depths
    let depthsIndexed = pipeline.depthIdxKer(pipeline.coordsx, viewMat);
    
    // (optional) subtract to put in range 1-2
    // TODO 

    // sort 
    let depthIndexedSorted = bitonicSort(pipeline.bitKer, depthsIndexed, pipeline.group_size*pipeline.n_groups);

    let indices = pipeline.getChannelKer(depthIndexedSorted);

    return indices;
}

export {
    createPipeline,
    applyPipeline,
    createFullSortPipeline,
    applyFullSortPipeline,
    toTexture,
    createGetChannelKernel,
    createBitonicKernel,
    createFullBitonicKernel,
    bitonicSort
};
