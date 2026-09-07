// Emerald Legacy publishes its own art as webp. Every other printing is jpg: FFG art is
// jpg at source, and fetchdata converts the handful of png sources. Add a pack here when
// Emerald Legacy releases one -- fetchdata and the client both read this, so they cannot
// disagree about what is on disk.
export const webpPackIds: ReadonlySet<string> = new Set([
    "emerald-core-set",
    "restoration-of-balance",
    "shadows-of-doubt",
    "starless-nights",
    "under-the-empress-eyes"
]);

// Token art has no pack and is committed by hand as webp.
export const webpTokenIds: ReadonlySet<string> = new Set([
    "ashigaru-recruit",
    "soldier",
    "spirit-of-the-river",
    "unleashed-hound"
]);

export function cardImageExtension(cardId: string, packId?: string): "webp" | "jpg" {
    const isWebp = packId ? webpPackIds.has(packId) : webpTokenIds.has(cardId);
    return isWebp ? "webp" : "jpg";
}
