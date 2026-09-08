/*eslint no-console:0 */
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

import db from "../db.js";
import CardService, { type CardRecord } from "../services/CardService.js";
import type { Pack } from "../../client/types/deck.js";

/** One printing of a card, as served by the emeralddb API. */
interface CardVersion {
    pack_id: string;
    image_url?: string;
}

/** Only the fields this script reads; the rest is stored verbatim. */
interface ApiCard {
    id: string;
    name?: string;
    versions?: CardVersion[];
    [key: string]: unknown;
}

interface DownloadResult {
    success: boolean;
    /** True when the source format differed from the one we store. */
    converted?: boolean;
    /** Set when every attempt failed. */
    error?: string;
}

interface DownloadOutcome {
    card: ApiCard;
    filename: string;
    url: string;
    result: DownloadResult;
}

/** Formats we store. A source in any other format is re-encoded to jpg. */
type StoredFormat = "webp" | "jpg";

const REQUEST_TIMEOUT_MS = 30000;
const DOWNLOAD_CONCURRENCY = 10;
const MAX_RETRIES = 3;
const JPEG_QUALITY = 90;
const MAX_FAILURES_LISTED = 20;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Project root: works for both source (server/scripts/) and compiled (build/server/scripts/)
const projectRoot = path.resolve(__dirname, "..", "..", fs.existsSync(path.join(__dirname, "..", "..", "views")) ? "" : "..");
const imageDir = path.join(projectRoot, "public", "img", "cards");

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

interface Options {
    env: "live" | "playtest";
    force: boolean;
    cycle: string | null;
    packs: Set<string> | null;
}

function usage(): never {
    console.error("Must pass parameter with valid environment. The options are `live` or `playtest`");
    console.error("Usage: node fetchdata.js <live|playtest> [--force] [--cycle cycle-id] [--packs pack1,pack2,...]");
    console.error("  --force, -f: Re-download existing images");
    console.error("  --cycle: Only download images for packs in this cycle (e.g. emerald-legacy)");
    console.error("  --packs: Only download images for these pack IDs (comma-separated)");
    process.exit(1);
}

function parseOptions(argv: string[]): Options {
    const env = argv[0];
    if(env !== "live" && env !== "playtest") {
        usage();
    }

    const flagValue = (flag: string): string | null => {
        const index = argv.indexOf(flag);
        return index !== -1 && argv[index + 1] ? argv[index + 1] : null;
    };

    const packs = flagValue("--packs");
    return {
        env: env,
        force: argv.includes("--force") || argv.includes("-f"),
        cycle: flagValue("--cycle"),
        packs: packs ? new Set(packs.split(",")) : null
    };
}

function apiUrlFor(env: Options["env"]): string {
    return env === "playtest"
        ? "https://beta-emeralddb.herokuapp.com/api/"
        : "https://www.emeralddb.org/api/";
}

async function apiRequest<T>(baseUrl: string, apiPath: string): Promise<T> {
    const response = await fetch(baseUrl + apiPath);
    if(!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json() as T;
}

async function downloadFile(url: string, destPath: string): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(url, { signal: controller.signal });
        if(!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        if(!response.body) {
            throw new Error("Response had no body");
        }

        await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(destPath));
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * The stored format mirrors the source so nothing downstream has to predict it: webp and
 * jpg are kept as-is, and anything else (png) is re-encoded to jpg.
 */
export function storedFormatFor(imageUrl: string): StoredFormat {
    return /\.webp(?:\?|$)/i.test(imageUrl) ? "webp" : "jpg";
}

export function sourceFormatFor(imageUrl: string): string {
    const matched = imageUrl.toLowerCase().match(/\.(jpe?g|png|webp)(?:\?|$)/);
    return (matched ? matched[1] : "jpg").replace("jpeg", "jpg");
}

function removeIfPresent(filePath: string): void {
    try {
        fs.rmSync(filePath, { force: true });
    } catch{ /* a file we cannot remove is not worth failing the run over */ }
}

async function downloadImage(url: string, filename: string): Promise<DownloadResult> {
    const sourceFormat = sourceFormatFor(url);
    const storedFormat = path.extname(filename).slice(1);
    const needsConversion = sourceFormat !== storedFormat;

    const finalPath = path.join(imageDir, filename);
    const tempPath = needsConversion
        ? path.join(imageDir, `${path.basename(filename, `.${storedFormat}`)}.${sourceFormat}`)
        : finalPath;

    for(let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            await downloadFile(url, tempPath);

            if(needsConversion) {
                await sharp(tempPath).jpeg({ quality: JPEG_QUALITY }).toFile(finalPath);
                removeIfPresent(tempPath);
            }

            return { success: true, converted: needsConversion };
        } catch(error) {
            removeIfPresent(tempPath);

            if(attempt === MAX_RETRIES) {
                return { success: false, error: errorMessage(error) };
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }

    // Unreachable: the final attempt always returns.
    return { success: false, error: "No download attempt was made" };
}

async function runWithConcurrency<T>(tasks: Array<() => Promise<T>>, concurrency: number): Promise<T[]> {
    const results: T[] = [];
    let next = 0;

    const worker = async (): Promise<void> => {
        while(next < tasks.length) {
            const index = next++;
            results[index] = await tasks[index]();
        }
    };

    await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
    return results;
}

/** Packs whose images should be downloaded, or null for all of them. */
function resolvePackFilter(options: Options, packs: Pack[]): Set<string> | null {
    const filter = options.packs ? new Set(options.packs) : null;

    if(!options.cycle) {
        if(filter) {
            console.log("Pack filter active - only downloading images for:", [...filter].join(", "));
        }
        return filter;
    }

    const cyclePacks = packs.filter(pack => pack.cycle_id === options.cycle);
    if(cyclePacks.length === 0) {
        console.warn(`Warning: no packs found for cycle "${options.cycle}"`);
        if(filter) {
            console.log("Pack filter active - only downloading images for:", [...filter].join(", "));
        }
        return filter;
    }

    const withCycle = filter ?? new Set<string>();
    for(const pack of cyclePacks) {
        if(pack.id) {
            withCycle.add(pack.id);
        }
    }
    console.log(`Cycle "${options.cycle}" resolved to ${cyclePacks.length} packs: ${cyclePacks.map(pack => pack.id).join(", ")}`);
    console.log("Pack filter active - only downloading images for:", [...withCycle].join(", "));
    return withCycle;
}

interface PlannedDownload {
    card: ApiCard;
    url: string;
    filename: string;
}

/** Every version we should fetch, plus a count of the ones we are not fetching. */
function planDownloads(cards: ApiCard[], options: Options, packFilter: Set<string> | null) {
    const planned: PlannedDownload[] = [];
    let totalVersions = 0;
    let skipped = 0;

    for(const card of cards) {
        for(const version of card.versions ?? []) {
            totalVersions++;

            const url = version.image_url;
            if(!url || (packFilter && !packFilter.has(version.pack_id))) {
                skipped++;
                continue;
            }

            const filename = `${card.id}-${version.pack_id}.${storedFormatFor(url)}`;
            if(!options.force && fs.existsSync(path.join(imageDir, filename))) {
                skipped++;
                continue;
            }

            planned.push({ card: card, url: url, filename: filename });
        }
        if(!card.versions || card.versions.length === 0) {
            skipped++;
        }
    }

    return { planned: planned, totalVersions: totalVersions, skipped: skipped };
}

function reportSummary(cards: ApiCard[], totalVersions: number, skipped: number, outcomes: DownloadOutcome[]): void {
    const reEncoded: string[] = [];
    const failures: string[] = [];
    let downloaded = 0;

    for(const { filename, card, result } of outcomes) {
        if(!result.success) {
            failures.push(`${filename} (${card.name}): ${result.error}`);
            continue;
        }
        downloaded++;
        if(result.converted) {
            reEncoded.push(`${filename} - ${card.name}`);
        }
    }

    console.log("\n=== Download Summary ===");
    console.log(`Total cards: ${cards.length}`);
    console.log(`Total versions: ${totalVersions}`);
    console.log(`Downloaded: ${downloaded}`);
    console.log(`Re-encoded to jpg: ${reEncoded.length}`);
    console.log(`Skipped (already exist or no image): ${skipped}`);
    console.log(`Failed: ${failures.length}`);

    if(reEncoded.length > 0) {
        console.log("\n=== Re-encoded ===");
        reEncoded.forEach(line => console.log(line));
    }

    if(failures.length > 0) {
        console.log("\n=== Failed Downloads ===");
        failures.slice(0, MAX_FAILURES_LISTED).forEach(line => console.log(line));
        if(failures.length > MAX_FAILURES_LISTED) {
            console.log(`... and ${failures.length - MAX_FAILURES_LISTED} more`);
        }
    }
}

async function downloadImages(cards: ApiCard[], options: Options, packFilter: Set<string> | null): Promise<void> {
    fs.mkdirSync(imageDir, { recursive: true });

    const { planned, totalVersions, skipped } = planDownloads(cards, options, packFilter);
    console.log(`Skipping ${skipped} cards (already exist or no image)`);
    console.log(`Downloading ${planned.length} images (${DOWNLOAD_CONCURRENCY} parallel)...`);

    let completed = 0;
    const tasks = planned.map(({ card, url, filename }) => async (): Promise<DownloadOutcome> => {
        const result = await downloadImage(url, filename);
        if(result.success) {
            // Earlier runs stored every source format under a .jpg name; drop the
            // other-extension sibling so the server cannot resolve the stale one.
            const stem = filename.replace(/\.[a-z]+$/, "");
            removeIfPresent(path.join(imageDir, `${stem}.${filename.endsWith(".webp") ? "jpg" : "webp"}`));

            completed++;
            if(completed % 50 === 0) {
                console.log(`Downloaded ${completed}/${planned.length} images...`);
            }
        }
        return { card: card, filename: filename, url: url, result: result };
    });

    const outcomes = await runWithConcurrency(tasks, DOWNLOAD_CONCURRENCY);
    reportSummary(cards, totalVersions, skipped, outcomes);

    // Cache-busting stamp, read by the lobby at startup
    const version = { timestamp: Date.now() };
    fs.writeFileSync(path.join(imageDir, "version.json"), JSON.stringify(version));
    console.log("Wrote image version file:", version.timestamp);
}

async function main(): Promise<void> {
    const options = parseOptions(process.argv.slice(2));
    if(options.force) {
        console.log("Force download enabled - will re-download existing images");
    }

    const baseUrl = apiUrlFor(options.env);
    await db.connect(process.env.DB_PATH || "mongodb://127.0.0.1:27017/jigoku");
    const cardService = new CardService(db.getDb());

    // One packs request serves both the cycle filter and the stored pack list.
    const packs = await apiRequest<Pack[]>(baseUrl, "packs");
    const packFilter = resolvePackFilter(options, packs);

    try {
        const cards = await apiRequest<ApiCard[]>(baseUrl, "cards");
        await cardService.replaceCards(cards as CardRecord[]);
        console.info(cards.length + " cards fetched");
        await downloadImages(cards, options, packFilter);
    } catch(error) {
        console.error("Unable to fetch cards:", errorMessage(error));
    }

    try {
        await cardService.replacePacks(packs);
        console.info(packs.length + " packs fetched");
    } catch(error) {
        console.error("Unable to fetch packs:", errorMessage(error));
    }

    await db.close();
}

// Only run when invoked as a script, so the helpers above can be imported by tests.
if(process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch(error => {
        console.error("Fatal error:", error);
        db.close();
        process.exit(1);
    });
}
