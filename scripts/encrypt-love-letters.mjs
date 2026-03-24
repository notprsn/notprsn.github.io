import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pbkdf2Sync, randomBytes, createCipheriv } from "node:crypto";

const DEFAULT_INPUT = "private/love-letters.json";
const DEFAULT_OUTPUT = "data/love-letters.enc.json";
const ITERATIONS = 600000;

async function main() {
    const inputPath = resolve(process.argv[2] || DEFAULT_INPUT);
    const outputPath = resolve(process.argv[3] || DEFAULT_OUTPUT);
    const passphrase = process.env.LOVE_LETTERS_PASSWORD;

    if (!passphrase) {
        throw new Error("Set LOVE_LETTERS_PASSWORD in the environment before running this script.");
    }

    const plaintext = await readArchive(inputPath);
    const parsed = JSON.parse(plaintext);
    validateArchive(parsed);

    const salt = randomBytes(16);
    const iv = randomBytes(12);
    const key = pbkdf2Sync(passphrase, salt, ITERATIONS, 32, "sha256");
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    const bundle = {
        version: 1,
        configured: true,
        generatedAt: new Date().toISOString(),
        kdf: {
            name: "PBKDF2",
            hash: "SHA-256",
            iterations: ITERATIONS,
            salt: salt.toString("base64"),
        },
        cipher: {
            name: "AES-GCM",
            iv: iv.toString("base64"),
            tagLength: 128,
        },
        ciphertext: Buffer.concat([encrypted, tag]).toString("base64"),
    };

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
    console.log(`Wrote encrypted archive to ${outputPath}`);
}

async function readArchive(inputPath) {
    try {
        return await readFile(inputPath, "utf8");
    } catch (error) {
        if (error && error.code === "ENOENT") {
            throw new Error(
                `Missing ${inputPath}. Copy private/love-letters.template.json to private/love-letters.json and replace the example text first.`
            );
        }
        throw error;
    }
}

function validateArchive(archive) {
    if (!archive || typeof archive !== "object") {
        throw new Error("Archive JSON must be an object.");
    }

    if (!Array.isArray(archive.letters)) {
        throw new Error("Archive JSON must include a letters array.");
    }

    archive.letters.forEach((letter, index) => {
        if (!letter || typeof letter !== "object") {
            throw new Error(`Letter ${index + 1} must be an object.`);
        }

        if (typeof letter.title !== "string" || !letter.title.trim()) {
            throw new Error(`Letter ${index + 1} is missing a non-empty title.`);
        }

        if (typeof letter.body !== "string" && !Array.isArray(letter.body)) {
            throw new Error(`Letter ${index + 1} must include a body string or array of paragraphs.`);
        }
    });
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
