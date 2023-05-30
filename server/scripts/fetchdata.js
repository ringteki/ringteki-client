/*eslint no-console:0 */
const already = require('already');
const download = require('download');
const fs = require('fs');
const mkdirp = require('mkdirp');
const monk = require('monk');
const path = require('path');
const request = require('request');

const CardService = require('../services/CardService.js');

const [, , env] = process.argv;

if(env !== 'live' && env !== 'playtest') {
    console.error(
        'Must pass parameter with valid environment. The options are `live` or `playtest`'
    );
    process.exit(1);
}

const apiUrl =
    env === 'playtest'
        ? 'https://beta-emeralddb.herokuapp.com/api/'
        : 'https://www.emeralddb.org/api/';

function apiRequest(path) {
    return new Promise((resolve, reject) => {
        request.get(apiUrl + path, function (error, res, body) {
            if(error) {
                return reject(error);
            }

            resolve(JSON.parse(body));
        });
    });
}

const db = monk('mongodb://127.0.0.1:27017/ringteki');
const cardService = new CardService(db);

const fetchCards = apiRequest('cards')
    .then((cards) => cardService.replaceCards(cards))
    .then((cards) => {
        console.info(cards.length + ' cards fetched');

        const imageDir = path.join(
            __dirname,
            '..',
            '..',
            'public',
            'img',
            'cards'
        );
        mkdirp(imageDir);

        return already.map(cards, { concurrency: 10 }, (card) => {
            const firstCardWithImageUrl = card.versions.find(
                (card) => card.image_url
            );
            if(!firstCardWithImageUrl) {
                return;
            }

            const imageSrc = firstCardWithImageUrl.image_url;
            const ext = path.extname(imageSrc);
            var imagePath = path.format({
                dir: imageDir,
                name: card.id,
                ext: ext
            });
            var filename = path.format({ name: card.id, ext: ext });
            if(imageSrc && !fs.existsSync(imagePath)) {
                return download(imageSrc, imageDir, { filename: filename });
            }
        });
    })
    .catch(() => {
        console.error('Unable to fetch cards');
    });

const fetchPacks = apiRequest('packs')
    .then((packs) => cardService.replacePacks(packs))
    .then((packs) => {
        console.info(packs.length + ' packs fetched');
    })
    .catch(() => {
        console.error('Unable to fetch packs');
    });

Promise.all([fetchCards, fetchPacks])
    .then(() => db.close())
    .catch(() => db.close());
