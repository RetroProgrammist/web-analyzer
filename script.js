import path from 'path';
import * as fs from 'fs';

import {parse} from 'csv-parse';
import Wappalyzer from 'wappalyzer';
import normalizeUrl from 'normalize-url';
import punycode from 'punycode/punycode.js';

let analyze = async function (inFilePath, outFilePath) {

    let pos = 0;
    let urls = [];
    const options = {
        maxWait: 5000,
    };
    const wappalyzer = new Wappalyzer(options);

    try {
        const parser = parse({delimiter: ';'}, function (err, data) {
            data.forEach((val, index) => {
                if (index === 0) {
                    val.every((v, i) => {
                        if (v === 'url') {
                            pos = i;
                            return false;
                        }
                        return true;
                    });
                    return;
                }
                urls.push(normalizeUrl(val[pos]));
            });
        });
        parser.on('end', async function() {
            console.log(urls);
            await wappalyzer.init()

            const results = await Promise.all(
                urls.map(async (url) => ({
                    url,
                    results: await wappalyzer.open(url).analyze()
                }))
            )

            let format = path.parse(inFilePath);
            let fPath = path.normalize(outFilePath+format.name+'.json');
            !fs.existsSync(outFilePath) && fs.mkdirSync(outFilePath);

            fs.appendFileSync(fPath, JSON.stringify(results, null, 2))
            console.log("THE END");
            await wappalyzer.destroy()
        });


        fs.createReadStream(inFilePath).pipe(parser);
    } catch (error) {
        console.error(error)
    }
};

const inDirPath = path.normalize('./files/');
const outDirPath = path.normalize('./results/');

if (fs.existsSync(outDirPath)) {
    fs.rmSync(outDirPath, {
        recursive: true,
    })
}

const files = fs.readdirSync(inDirPath, {withFileTypes: true});
files.forEach((value)=>{
    if(value.isFile() && path.extname(value.name) === '.csv') {
        let fPath = path.join(inDirPath, value.name);
        if(fs.existsSync(fPath)) {
            analyze(fPath, outDirPath);
        }
    }
});

