import { readFile, mkdir, writeFile, copyFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = await readFile(resolve(root, "worker/index.js"), "utf8");
const html = await readFile(resolve(root, "ui.html"), "utf8");
const built = source.replace('const PAGE = "";', `const PAGE = ${JSON.stringify(html)};`);
if (built === source) throw new Error("Page embed marker missing");
await mkdir(resolve(root, "dist/server"), { recursive: true });
await mkdir(resolve(root, "dist/.openai"), { recursive: true });
await writeFile(resolve(root, "dist/server/index.js"), built);
await copyFile(resolve(root, ".openai/hosting.json"), resolve(root, "dist/.openai/hosting.json"));
console.log("Worker artifact built");
