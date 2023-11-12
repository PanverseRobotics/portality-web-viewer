import chai from 'chai';
import kdTree, { viewDepthSort, depthFirstCollect } from '../lib/kd-tree.js';
import IndexedPointArray, { permutePointArray } from '../lib/pointarray.js';

const { expect } = chai;

describe('kdTree', () => {
    it('should create a tree correctly', () => {
        const iparr = new IndexedPointArray(
            new Float32Array([23.0, 12.5,  3.0,  3.5,  3.0,  1.0, 21.7,  4.0]),
            new Float32Array([17.2,  0.5, 24.0,  2.0, 10.5,  2.5, 19.5,  4.5]),
            new Float32Array([13.0, 11.0, 13.0, 12.5, 19.7,  1.8, 24.5, 20.0]),
        );

        const tree = kdTree(iparr, 2);

        expect(iparr.idx.find((x)=>(x==2)) <= 4);
        expect(iparr.idx.find((x)=>(x==3)) <= 4);
        expect(iparr.idx.find((x)=>(x==4)) <= 4);
        expect(iparr.idx.find((x)=>(x==5)) <= 4);

        expect(tree.d).to.equal(0);
        expect(tree.val).to.equal(3.5);
        expect(tree.cleft.d).to.equal(1);
        expect(tree.cleft.val).to.equal(2.5);
        expect(tree.cleft.cleft.range).to.deep.equal([0, 2]);
        expect(tree.cleft.cright.range).to.deep.equal([2, 4]);
        expect(tree.cright.d).to.equal(1);
        expect(tree.cright.val).to.equal(4.5);
        expect(tree.cright.cleft.range).to.deep.equal([4, 6]);
        expect(tree.cright.cright.range).to.deep.equal([6, 8]);
    });

    it('should create an unbalanced tree correctly', () => {
        const iparr = new IndexedPointArray(
            new Float32Array([23.0, 12.5,  3.0,  3.5,  3.0,  1.0]),
            new Float32Array([17.2,  0.5, 24.0,  2.0, 10.5,  2.5]),
            new Float32Array([13.0, 11.0, 13.0, 12.5, 19.7,  1.8]),
        );

        const tree = kdTree(iparr, 2);

        expect(tree.d).to.equal(0);
        expect(tree.val).to.equal(3);
        expect(tree.cleft.range).to.deep.equal([0, 2]);
        expect(tree.cright.d).to.equal(1);
        expect(tree.cright.val).to.equal(2.0);
        expect(tree.cright.cleft.range).to.deep.equal([2, 4]);
        expect(tree.cright.cright.range).to.deep.equal([4, 6]);
    });


    it.skip('should add a new batch of points to the kdtree correctly.', () => {
        const iparr = new IndexedPointArray(
            new Float32Array([23.0, 12.5,  3.0,  3.5,  3.0,  1.0, 21.7,  4.0]),
            new Float32Array([17.2,  0.5, 24.0,  2.0, 10.5,  2.5, 19.5,  4.5]),
            new Float32Array([13.0, 11.0, 13.0, 12.5, 19.7,  1.8, 24.5, 20.0]),
        );
        const tree = kdTree(iparr, 2);

        // TODO
    });


    it('should sort the tree by reverse depth correctly', () => {
        const iparr = new IndexedPointArray(
            new Float32Array([23.0, 12.5,  3.0,  3.5,  3.0,  1.0, 21.7,  4.0]),
            new Float32Array([17.2,  0.5, 24.0,  2.0, 10.5,  2.5, 19.5,  4.5]),
            new Float32Array([13.0, 11.0, 13.0, 12.5, 19.7,  1.8, 24.5, 20.0]),
        );
        const tree = kdTree(iparr, 2);

        let idx = viewDepthSort(tree, {x: 3, y: -3, z: -3}, 'reverse');

        expect(idx[0]).to.deep.equal([6, 8]);
        expect(idx[1]).to.deep.equal([4, 6]);
        expect(idx[2]).to.deep.equal([2, 4]);
        expect(idx[3]).to.deep.equal([0, 2]);
    });

    it('should sort the tree by depth correctly', () => {
        const iparr = new IndexedPointArray(
            new Float32Array([23.0, 12.5,  3.0,  3.5,  3.0,  1.0, 21.7,  4.0]),
            new Float32Array([17.2,  0.5, 24.0,  2.0, 10.5,  2.5, 19.5,  4.5]),
            new Float32Array([13.0, 11.0, 13.0, 12.5, 19.7,  1.8, 24.5, 20.0]),
        );
        const tree = kdTree(iparr, 2);

        let idx = viewDepthSort(tree, {x: 3, y: -3, z: -3});

        expect(idx[0]).to.deep.equal([0, 2]);
        expect(idx[1]).to.deep.equal([2, 4]);
        expect(idx[2]).to.deep.equal([4, 6]);
        expect(idx[3]).to.deep.equal([6, 8]);
    });    

    it('should sort an unbalanced tree by depth correctly', () => {
        const iparr = new IndexedPointArray(
            new Float32Array([23.0, 12.5,  3.0,  3.5,  3.0,  1.0]),
            new Float32Array([17.2,  0.5, 24.0,  2.0, 10.5,  2.5]),
            new Float32Array([13.0, 11.0, 13.0, 12.5, 19.7,  1.8]),
        );
        const tree = kdTree(iparr, 2);

        let idx = viewDepthSort(tree, {x: 3, y: -3, z: -3});

        expect(idx[0]).to.deep.equal([0, 2]);
        expect(idx[1]).to.deep.equal([2, 4]);
        expect(idx[2]).to.deep.equal([4, 6]);
    });
});
