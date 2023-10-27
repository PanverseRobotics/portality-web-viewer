import chai from 'chai';
import { launch } from 'puppeteer';
import * as fs from 'fs';
import path from 'path';

const { expect } = chai;

describe('Depth calculation', () => {
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
        await page.addScriptTag({ path: path.join('./lib/kernels/depth.js')});
    });

    after(async () => {
        await browser.close();
    });

    it('Depths should be calculated correctly', async() => {
        const result = await page.evaluate(() => {
            return depthBasic(8, 8);
        });

        for (var i=0; i<64; ++i)
        {
            expect(2.5*result.input[3*i+2]).to.be.closeTo(result.output[i], 0.00001);
        }
    });
});

