const restrictedList = {
    version: '13',
    cards: {
        'standard': [
            'city-of-the-open-hand',
            'rebuild',
            'mirumoto-s-fury',
            'forged-edict',
            'duty',
            'embrace-the-void',
            'pathfinder-s-blade',
            'policy-debate',
            'the-imperial-palace',
            'consumed-by-five-fires',
            'cunning-magistrate',
            'a-fate-worse-than-death',
            'mark-of-shame',
            'magistrate-station',
            'kakita-toshimoko',
            'keeper-initiate',
            'display-of-power',
            'tactical-ingenuity',
            'iron-mine',
            'kuni-laboratory',
            'bayushi-shoju-2'
        ],
        'skirmish': []
    }
};

class RestrictedList {
    validate(cards, skirmishMode) {
        let gameType = skirmishMode ? 'skirmish' : 'standard';
        let cardsOnRestrictedList = cards.filter(card => restrictedList.cards[gameType].includes(card.id));

        let errors = [];

        if(cardsOnRestrictedList.length > 1) {
            errors.push(`Contains more than 1 card on the FAQ v${restrictedList.version} restricted list: ${cardsOnRestrictedList.map(card => card.name).join(', ')}`);
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
