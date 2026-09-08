import { describe, it, expect } from "vitest";

import { storedFormatFor, sourceFormatFor } from "../../server/scripts/fetchdata";

describe("storedFormatFor", () => {
    it("keeps webp sources as webp", () => {
        expect(storedFormatFor("https://emerald-legacy.github.io/emeralddb-images/starless-nights/sln005.webp")).toBe("webp");
        expect(storedFormatFor("https://example.test/a.WEBP")).toBe("webp");
        expect(storedFormatFor("https://example.test/a.webp?v=2")).toBe("webp");
    });

    it("stores everything else as jpg", () => {
        expect(storedFormatFor("http://lcg-cdn.fantasyflightgames.com/l5r/L5C01_110.jpg")).toBe("jpg");
        expect(storedFormatFor("https://gamepedia.cursecdn.com/thumb/Closed_Shell_Castle.png")).toBe("jpg");
        expect(storedFormatFor("https://example.test/no-extension")).toBe("jpg");
    });
});

describe("sourceFormatFor", () => {
    it("reads the format from the url, normalising jpeg", () => {
        expect(sourceFormatFor("https://example.test/a.jpg")).toBe("jpg");
        expect(sourceFormatFor("https://example.test/a.jpeg")).toBe("jpg");
        expect(sourceFormatFor("https://example.test/a.PNG")).toBe("png");
        expect(sourceFormatFor("https://example.test/a.webp?v=1")).toBe("webp");
    });

    it("assumes jpg when the url carries no known extension", () => {
        expect(sourceFormatFor("https://example.test/image")).toBe("jpg");
    });
});

describe("the pair together", () => {
    it("only ever re-encodes png, never webp", () => {
        for(const url of ["a.webp", "a.jpg", "a.jpeg", "a.png", "a"]) {
            const source = sourceFormatFor(url);
            const stored = storedFormatFor(url);
            const reEncoded = source !== stored;
            expect(reEncoded).toBe(source === "png");
            expect(stored === "webp" ? source : "webp").not.toBe("png");
        }
    });
});
