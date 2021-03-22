const GameModes = require('./GameModes');

const restrictedList = {
    version: '14',
    cards: {
        'stronghold': [
            'rebuild',
            'mirumoto-s-fury',
            'duty',
            'embrace-the-void',
            'pathfinder-s-blade',
            'the-imperial-palace',
            'consumed-by-five-fires',
            'cunning-magistrate',
            'a-fate-worse-than-death',
            'mark-of-shame',
            'kakita-toshimoko',
            'keeper-initiate',
            'display-of-power',
            'tactical-ingenuity',
            'iron-mine',
            'kuni-laboratory',
            'bayushi-shoju-2',
            'contested-countryside',
            'ikoma-tsanuri-2',
            'common-cause',
            'doji-diplomat',
            'bayushi-kachiko-2'
        ],
        'skirmish': [],
        'jade-edict': [
            'keeper-initiate',
            'kaiu-envoy',
            'kuni-laboratory',
            'way-of-the-crab',
            'reprieve',
            'sacred-sanctuary',
            'seal-of-the-dragon',
            'mirumoto-s-fury',
            'spectral-visitation',
            'exposed-courtyard',
            'chronicler-of-conquests',
            'sanpuku-seido',
            'bayushi-shoju-2',
            'shadow-step',
            'mark-of-shame',
            'a-fate-worse-than-death',
            'khanbulak-benefactor',
            'utaku-tetsuko',
            'shinjo-yasamura',
            'scouted-terrain',
            'alibi-artist',
            'contested-countryside'
        ]
    }
};

class RestrictedList {
    validate(cards, gameMode) {
        let cardsOnRestrictedList = cards.filter(card => restrictedList.cards[gameMode].includes(card.id));

        let errors = [];

        if(cardsOnRestrictedList.length > 1) {
            if(gameMode === GameModes.JadeEdict) {
                errors.push(`Contains more than 1 card on the Jade Edict restricted list: ${cardsOnRestrictedList.map(card => card.name).join(', ')}`);
            } else {
                errors.push(`Contains more than 1 card on the FAQ v${restrictedList.version} restricted list: ${cardsOnRestrictedList.map(card => card.name).join(', ')}`);
            }
        }

        return {
            version: restrictedList.version,
            valid: errors.length === 0,
            errors: errors,
            restrictedCards: cardsOnRestrictedList
        };
    }
}

module.exports = RestrictedList;
