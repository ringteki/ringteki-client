const _ = require('underscore');

const DrawCard = require('./drawcard.js');
const ProvinceCard = require('./provincecard.js');
const StrongholdCard = require('./strongholdcard.js');
const RoleCard = require('./rolecard.js');
const { Locations, CardTypes } = require('./Constants');

class Deck {
    constructor(data) {
        this.data = data;
    }

    prepare(player) {
    }

    eachRepeatedCard(cards, func) {
        _.each(cards, cardEntry => {
            for(var i = 0; i < cardEntry.count; i++) {
                func(cardEntry.card);
            }
        });
    }
}

module.exports = Deck;
