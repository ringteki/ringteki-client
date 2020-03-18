export function deckStatusLabel(status) {
    if(!status.basicRules) {
        return 'Invalid';
    }
    const category = 'Valid';

    if(!status.faqRestrictedList || !status.noUnreleasedCards || !status.noBannedCards) {
        return `${category} (Casual)`;
    }

    return `${category} (Legal)`;
}
