import chai from 'chai';
import { launch } from 'puppeteer';
import * as fs from 'fs';
import path from 'path';

const { expect } = chai;

describe('Group-level ordering', () => {
    let browser;
    let page;

    before(async () => {
        browser = await launch({ headless: "new" });
        page = await browser.newPage();
        var contentHtml = fs.readFileSync('./test/browser/kernel-test.html', 'utf8');
        await page.setContent(contentHtml);

        await page.addScriptTag({ path: path.join('./lib/kernels/shader.js')});
        await page.addScriptTag({ path: path.join('./lib/kernels/to-array.js')});
        await page.addScriptTag({ path: path.join('./lib/kernels/to-texture.js')});
        await page.addScriptTag({ path: path.join('./lib/kernels/ordering-encode.js')});
        await page.addScriptTag({ path: path.join('./lib/kernels/ordering-decode.js')});
        
    });

    after(async () => {
        await browser.close();
    });

    it('Should encode and decode ordering correctly.', async() => {
        const result8 = await page.evaluate(() => {
            return orderingSimpleEncDec(8, 3);
        });

        expect(result8.inputs[0]).to.equal(0);
        expect(result8.inputTex[0]).to.equal(0);
        expect(result8.inputEnc[0]).to.equal(0);
        expect(result8.inputDec[0]).to.equal(0);

        expect(result8.inputs[1]).to.equal(1);
        expect(result8.inputTex[1]).to.equal(1);
        expect(result8.inputEnc[1]).to.closeTo(1.0000001, 0.0000002);
        expect(result8.inputDec[1]).to.equal(1);
        
        expect(result8.inputs[2]).to.equal(2);
        expect(result8.inputTex[2]).to.equal(2);
        expect(result8.inputEnc[2]).to.closeTo(2.0000005, 0.000001);
        expect(result8.inputDec[2]).to.equal(2);

        expect(result8.inputs[7]).to.equal(7);
        expect(result8.inputTex[7]).to.equal(7);
        expect(result8.inputEnc[7]).to.closeTo(7.0000033, 0.000007);
        expect(result8.inputDec[7]).to.equal(7);

        expect(result8.inputs[8]).to.equal(8);
        expect(result8.inputTex[8]).to.equal(8);
        expect(result8.inputEnc[8]).to.equal(8);
        expect(result8.inputDec[8]).to.equal(0);

        expect(result8.inputs[17]).to.equal(17);
        expect(result8.inputTex[17]).to.equal(17);
        expect(result8.inputEnc[17]).to.closeTo(17.000002, 0.000005);
        expect(result8.inputDec[17]).to.equal(1);

        const result32 = await page.evaluate(() => {
            return orderingSimpleEncDec(32, 2);
        });

        expect(result32.inputs[0]).to.equal(0);
        expect(result32.inputTex[0]).to.equal(0);
        expect(result32.inputEnc[0]).to.equal(0);
        expect(result32.inputDec[0]).to.equal(0);

        expect(result32.inputs[1]).to.equal(1);
        expect(result32.inputTex[1]).to.equal(1);
        expect(result32.inputEnc[1]).to.closeTo(1.0000001, 0.0000002);
        expect(result32.inputDec[1]).to.equal(1);
        
        expect(result32.inputs[2]).to.equal(2);
        expect(result32.inputTex[2]).to.equal(2);
        expect(result32.inputEnc[2]).to.closeTo(2.0000005, 0.000001);
        expect(result32.inputDec[2]).to.equal(2);

        expect(result32.inputs[31]).to.equal(31);
        expect(result32.inputTex[31]).to.equal(31);
        expect(result32.inputEnc[31]).to.closeTo(31.00006, 0.0001);
        expect(result32.inputDec[31]).to.equal(31);

        expect(result32.inputs[32]).to.equal(32);
        expect(result32.inputTex[32]).to.equal(32);
        expect(result32.inputEnc[32]).to.equal(32);
        expect(result32.inputDec[32]).to.equal(0);

        expect(result32.inputs[33]).to.equal(33);
        expect(result32.inputTex[33]).to.equal(33);
        expect(result32.inputEnc[33]).to.closeTo(33.000004, 0.00001);
        expect(result32.inputDec[33]).to.equal(1);
    });
});

