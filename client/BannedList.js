const GameModes = require('./GameModes');

const bannedList = {
    version: '15',
    cards: {
        'stronghold': [
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
        ],
        'jade-edict': [
            'ikoma-tsanuri-2',
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
            'policy-debate',
            'lost-papers',
            'city-of-the-rich-frog',
            'the-imperial-palace',
            'proving-grounds',
            'shameful-display',
            'rebuild',
            'common-cause',
            'kakita-toshimoko',
            'daidoji-netsu',
            'daidoji-uji-2',
            'the-wealth-of-the-crane',
            'shoshi-ni-kie',
            'logistics',
            'tactical-ingenuity',
            'display-of-power',
            'consumed-by-five-fires',
            'duty',
            'cunning-magistrate',
            'dispatch-to-nowhere',
            'governor-s-spy',
            'talisman-of-the-sun',
            'scouted-terrain',
            'festival-for-the-fortunes',
            'enlightenment',
            'calling-the-storm',
            'force-of-the-river',
            'accursed-summoning,
            'dance-of-chikusho-do',
            'centered-breath'
        ]
    }
};

class BannedList {
    validate(cards, gameMode) {
        let cardsOnBannedList = cards.filter(card => bannedList.cards[gameMode].includes(card.id));

        let errors = [];

        if(cardsOnBannedList.length > 0) {
            if(gameMode === GameModes.JadeEdict) {
                errors.push(`Contains a card on the Jade Edict banned list: ${cardsOnBannedList.map(card => card.name).join(', ')}`);
            } else {
                errors.push(`Contains a card on the FAQ v${bannedList.version} banned list: ${cardsOnBannedList.map(card => card.name).join(', ')}`);
            }
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
