import path from 'path';
import * as fs from 'fs';

import {parse} from 'csv-parse';
import Wappalyzer from 'wappalyzer';
import normalizeUrl from 'normalize-url';

let analyze = async function (inFilePath, outFilePath) {

    const bitrix = '1c-bitrix',
        laravel = 'laravel',
        opencart = 'opencart',
        yii = 'yii';

    let pos = 0;
    let urls = [];
    const options = {
        maxDepth: 3,
        maxUrls: 15,
        maxWait: 10000,
        recursive: true,
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
        parser.on('end', async function () {
           /* urls = [ //test data
                'http://profildoors-usa.com', //bitrix
                'https://www.penny-arcade.com/',//Yii
                'http://shop.montrochelle.virgin.com/',//OpenCart
            ];*/
            console.log(urls);

            !fs.existsSync(outFilePath) && fs.mkdirSync(outFilePath);

            await wappalyzer.init()

            const results = await Promise.all(
                urls.map(async (url) => {
                    let d = {
                        url,
                        results: await wappalyzer.open(url).analyze()
                    };

                    d.results.technologies.forEach((tech) => {
                        if (tech.slug === bitrix) {
                            fs.appendFileSync(path.normalize(outFilePath + '/bitrix.txt'), url + '\n')
                        }

                        if (tech.slug === laravel) {
                            fs.appendFileSync(path.normalize(outFilePath + '/laravel.txt'), url + '\n')
                        }

                        if (tech.slug === opencart) {
                            fs.appendFileSync(path.normalize(outFilePath + '/opencart.txt'), url + '\n')
                        }

                        if (tech.slug === yii) {
                            fs.appendFileSync(path.normalize(outFilePath + '/yii.txt'), url + '\n')
                        }
                    });
                    return d;
                })
            )

            let format = path.parse(inFilePath);
            let fPath = path.normalize(outFilePath + format.name + '.json');

            fs.appendFileSync(fPath, JSON.stringify(results, null, 2));
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
files.forEach((value) => {
    if (value.isFile() && path.extname(value.name) === '.csv') {
        let fPath = path.join(inDirPath, value.name);
        if (fs.existsSync(fPath)) {
            analyze(fPath, outDirPath);
        }
    }
});

