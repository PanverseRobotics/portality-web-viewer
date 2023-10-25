import chai from 'chai';
import { launch } from 'puppeteer';
import * as fs from 'fs';
import path from 'path';

const { expect } = chai;

describe('Local page', () => {
    let browser;
    let page;

    before(async () => {
        browser = await launch();
        page = await browser.newPage();
        var contentHtml = fs.readFileSync('./test/kernel-test.html', 'utf8');
        await page.setContent(contentHtml);

        await page.addScriptTag({ path: path.join('./lib/kernels/shader.js')});
        await page.addScriptTag({ path: path.join('./lib/kernels/to-array.js')});
        await page.addScriptTag({ path: path.join('./lib/kernels/to-texture.js')});
        await page.addScriptTag({ path: path.join('./lib/kernels/bitonic.js')});
        await page.addScriptTag({ path: path.join('./lib/bitonic.js')});
    });

    after(async () => {
        await browser.close();
    });

    it('Output should be sorted..', async() => {
        const result = await page.evaluate(() => {
            return sortingBasic(32, 2);
        });

        // First 32 elements should be sorted in increasing order.
        for (var i=1; i<32*2; ++i)
        {
            expect(result.output[i]).to.be.at.least(result.output[i-1]);
        }
    });
});

