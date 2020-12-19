const bannedList = {
    version: '15',
    cards: {
        'standard': [
            'guest-of-honor',
            'spyglass',
            'charge',
            'isawa-tadaka',
            'karada-district',
            'master-of-gisei-toshi',
            'kanjo-district',
            'jurojin-s-curse',
            'hidden-moon-dojo',
            'mirumoto-daisho',
            'gateway-to-meido',
            'forged-edict',
            'magistrate-station',
            'bayushi-liar',
            'policy-debate',
            'lost-papers'
        ],
        'skirmish': [
            'guest-of-honor',
            'spyglass',
            'charge',
            'windswept-yurt',
            'karada-district',
            'the-imperial-palace',
            'way-of-the-chrysanthemum',
            'master-of-gisei-toshi',
            'kanjo-district',
            'alibi-artist',
            'hidden-moon-dojo',
            'mirumoto-daisho',
            'prayers-to-ebisu',
            'chronicler-of-conquests',
            'lost-papers'
        ]
    }
};

class BannedList {
    validate(cards, skirmishMode) {
        let gameType = skirmishMode ? 'skirmish' : 'standard';
        let cardsOnBannedList = cards.filter(card => bannedList.cards[gameType].includes(card.id));

        let errors = [];

        if(cardsOnBannedList.length > 0) {
            errors.push(`Contains a card on the FAQ v${bannedList.version} banned list: ${cardsOnBannedList.map(card => card.name).join(', ')}`);
        }

        return {
            version: bannedList.version,
            valid: errors.length === 0,
            errors: errors,
            restrictedCards: cardsOnBannedList
        };
    }
}

module.exports = BannedList;
