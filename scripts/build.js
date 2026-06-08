#!/usr/bin/env node
/**
 * build.js
 * Copies the three source prompts to dist/ and validates they compile cleanly.
 */

const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "src");
const DIST = path.join(__dirname, "..", "dist");

const files = [
  "Universal-Debunking-System-Prompt.md",
  "Universal-Debunking-User-Prompt.md",
  "Universal-Debunking-Article-Prompt.md",
];

function validate(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const issues = [];

  // 1. Version must exist
  const versionMatch = content.match(/Version (\d+\.\d+)/);
  if (!versionMatch) issues.push("Missing version tag");

  // 2. Changelog must exist
  if (!content.includes("CHANGELOG")) issues.push("Missing CHANGELOG section");

  // 3. Core markers must exist
  if (!content.includes("[CORE]")) issues.push("No [CORE] markers found");

  // 4. Article Prompt must have ALL CORE sections
  const isArticle = filePath.includes("Article");
  if (isArticle) {
    const required = [
      "Claim Failure Taxonomy",
      "Evidence Arbitration Rule",
      "Domain Reproducibility Modifier",
      "Actionability Assessment",
      "Unknown Unknowns Check",
    ];
    for (const section of required) {
      if (!content.includes(section)) issues.push(`Missing required section: ${section}`);
    }
  }

  return { version: versionMatch ? versionMatch[1] : null, issues };
}

function main() {
  if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

  let exitCode = 0;
  const versions = [];

  for (const file of files) {
    const srcPath = path.join(SRC, file);
    if (!fs.existsSync(srcPath)) {
      console.error(`❌ Missing source: ${file}`);
      exitCode = 1;
      continue;
    }

    const { version, issues } = validate(srcPath);
    if (issues.length > 0) {
      console.error(`❌ ${file} (v${version}) has issues:`);
      for (const issue of issues) console.error(`   - ${issue}`);
      exitCode = 1;
      continue;
    }

    versions.push(version);

    // Copy to dist with shorter names
    const outName = file
      .replace("Universal-Debunking-", "")
      .toLowerCase()
      .replace("prompt.md", "prompt-v" + version + ".md");
    const distPath = path.join(DIST, outName);
    fs.copyFileSync(srcPath, distPath);
    console.log(`✅ ${file} → dist/${outName}`);
  }

  // Version sync check
  const unique = [...new Set(versions)];
  if (unique.length > 1) {
    console.error(`❌ VERSION MISMATCH: ${unique.join(" vs ")}`);
    exitCode = 1;
  } else if (unique.length === 1) {
    console.log(`\n🎯 All prompts synced to v${unique[0]}`);
  }

  process.exit(exitCode);
}

main();
