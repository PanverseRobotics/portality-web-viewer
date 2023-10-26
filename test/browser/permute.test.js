import chai from 'chai';
import { launch } from 'puppeteer';
import * as fs from 'fs';
import path from 'path';

const { expect } = chai;

describe('Permute groups', () => {
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
        await page.addScriptTag({ path: path.join('./lib/kernels/permute.js')});
    });

    after(async () => {
        await browser.close();
    });

    it('Groups should be permuted', async() => {
        const result = await page.evaluate(() => {
            return permuteBasic(8);
        });

        var i;
        for(i=0; i<8; ++i){
            expect(result.input[i]).to.equal(result.output[i+8]);
        }
        for(i=0; i<8; ++i){
            expect(result.input[i+8]).to.equal(result.output[i+16]);
        }
        for(i=0; i<8; ++i){
            expect(result.input[i+16]).to.equal(result.output[i]);
        }
    });
});