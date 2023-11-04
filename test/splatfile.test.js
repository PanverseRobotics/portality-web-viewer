import fs from 'fs'
import { Buffer } from 'buffer'
import { expect } from 'chai'
import { loadSplatData, rotorsToCov3D } from '../lib/splatfile.js';

describe("Splat File", function () {
    it("should load the splat file and parse it correctly", function () {

        function loadFileIntoBuffer(filePath) {
            const fileContents = fs.readFileSync(filePath);
            const buffer = Buffer.from(fileContents);

            return buffer;
        }

        // Load the file "test.splat" into a buffer.
        const buffer = loadFileIntoBuffer('./test/assets/test.splat');

        let data = loadSplatData(buffer);

        expect(data.positions.length).to.equal(3*128);
        expect(data.colors.length).to.equal(4*128);
        expect(data.scales.length).to.equal(3*128);
        expect(data.rotors.length).to.equal(4*128);

        expect(data.positions[4]).to.be.closeTo(1.517803907, 1e-5);
        expect(data.colors[4]).to.be.closeTo(1, 1e-5);
    });

    it("should process splat format to 3d covariance matrices", function () {

        function loadFileIntoBuffer(filePath) {
            const fileContents = fs.readFileSync(filePath);
            const buffer = Buffer.from(fileContents);

            return buffer;
        }

        // Load the file "test.splat" into a buffer.
        const buffer = loadFileIntoBuffer('./test/assets/test.splat');

        let data = loadSplatData(buffer);

        let cov3d = rotorsToCov3D(data.scales, data.rotors);

        // TODO: insert the 'right' output tests here
    });

});