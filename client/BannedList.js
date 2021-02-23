const GameModes = require("./GameModes");

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
        ],
        'jade-edict': [
            'recalled-defenses',
            'akodo-reserve-company',
            'a-season-of-war',
            'butcher-of-the-fallen',
            'cunning-negotiator',
            'daidoji-marketplace',
            'twiight-rider',
            'student-of-the-tao',
            'scholar-of-old-rempet',
            'veteran-of-toshi-ranbo',
            'stoic-rival',
            'hidden-mountain-pass',
            'ikoma-tsanuri-2',
            'celebrated-renown',
            'shadow-stalker',
            'open-window',
            'ride-at-dawn',
            'mercenary-company',
            'pious-guardian',
            'master-of-many-lifetimes',
            'honored-veterans',
            'beautiful-entertainer',
            'contested-countryside',
            'shiba-pureheart',
            'sudden-tempest',
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
            'ki-alignment',
            'shoshi-ni-kie',
            'logistics',
            'tactical-ingenuity',
            'embrace-the-void',
            'display-of-power',
            'consumed-by-five-fires',
            'duty',
            'cunning-magistrate',
            'dispatch-to-nowhere',
            'shadowed-village',
            'alibi-artist',
            'governor-s-spy',
            'talisman-of-the-sun'
        ]
    }
};

class BannedList {
    validate(cards, gameMode) {
        console.log(gameMode);
        let cardsOnBannedList = cards.filter(card => bannedList.cards[gameMode].includes(card.id));

        let errors = [];

        if(cardsOnBannedList.length > 0) {
            if (gameMode === GameModes.JadeEdict) {
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
