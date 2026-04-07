#!/usr/bin/env bun
// Usage: bun run release [patch|minor|major]  (default: patch)

import { $ } from "bun";
import pkg from "./package.json";

const bump = (Bun.argv[2] ?? "patch") as "patch" | "minor" | "major";
const [major, minor, patch] = pkg.version.split(".").map(Number);

let next: string;
if (bump === "major") next = `${major + 1}.0.0`;
else if (bump === "minor") next = `${major}.${minor + 1}.0`;
else next = `${major}.${minor}.${patch + 1}`;

console.log(`Releasing ${pkg.version} → ${next}`);

// Bump version in package.json
const text = await Bun.file("package.json").text();
await Bun.write("package.json", text.replace(`"version": "${pkg.version}"`, `"version": "${next}"`));

await $`git add package.json`;
await $`git commit -m "Release ${next}"`;
await $`git tag ${next}`;
await $`git push && git push --tags`;
await $`npm publish --access public`;

console.log(`Published @onmyway133/ccview@${next}`);
