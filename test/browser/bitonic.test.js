import chai from 'chai';
import { launch } from 'puppeteer';
import * as fs from 'fs';
import path from 'path';

const { expect } = chai;

describe('Bitonic sort', () => {
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
        await page.addScriptTag({ path: path.join('./lib/kernels/bitonic.js')});
        await page.addScriptTag({ path: path.join('./lib/bitonic.js')});
    });

    after(async () => {
        await browser.close();
    });

    it('Output should be sorted', async() => {
        const result1 = await page.evaluate(() => {
            return sortingBasic(8, 8);
        });

        for (var i=1; i<64; ++i)
        {
            expect(result1.output[i]).to.be.at.least(result1.output[i-1] + 0.5);
        }

        const result2 = await page.evaluate(() => {
            return sortingRandom(32, 4);
        });

        for (var i=0; i<128; ++i)
        {
            if ((i%32)!=0){
                expect(result2.output[i]).to.be.at.least(result2.output[i-1]);
            }
        }
    });

    it('Output should be reverse sorted', async() => {
        const result1 = await page.evaluate(() => {
            return sortingBasic(8, 8, order='reverse');
        });

        for (var i=1; i<64; ++i)
        {
            if ((i%8)!=0){
                expect(result1.output[i]).to.be.at.most(result1.output[i-1] - 0.5);
            }
        }

        const result2 = await page.evaluate(() => {
            return sortingRandom(32, 4, order='reverse');
        });

        for (var i=0; i<128; ++i)
        {
            if ((i%32)!=0){
                expect(result2.output[i]).to.be.at.most(result2.output[i-1]);
            }
        }
    });
});

