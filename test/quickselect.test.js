// test/quickselect.test.js

import { expect } from 'chai'

import quickselect from "../lib/quickselect.js";

describe("Quickselect", function() {
  it("should return the median element of a sorted array", function() {
    const array = [1, 7, 5, 3, 9];
    const idx   = [0, 1, 2, 3, 4];
    
    var median = quickselect(array, idx, 0);
    expect(median).to.equal(1);

    median = quickselect(array, idx, 1);
    expect(median).to.equal(3);

    median = quickselect(array, idx, 3);
    expect(median).to.equal(7);

  });

  it("should handle empty and single-element arrays", function() {
    expect(quickselect([], [], 0)).to.equal(undefined);
    expect(quickselect([5], [0], 0)).to.equal(5);
  });

  it("should throw an error if the kth element index is out of bounds", function() {
    const array = [1, 3, 5, 7, 9];
    const idx   = [0, 1, 2, 3, 4];

    expect(() => quickselect(array, idx, -1)).to.throw();
    expect(() => quickselect(array, idx, 5)).to.throw();
  });
});