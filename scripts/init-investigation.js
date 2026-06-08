#!/usr/bin/env node
/**
 * init-investigation.js — Skepsis Investigation Scaffold
 * 
 * Usage: node scripts/init-investigation.js --topic "MyTopic" --mode core|full-audit
 * 
 * Creates: investigations/<slug>/ with investigation.md, evidence/, and sources.md
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const INVESTIGATIONS = path.join(ROOT, "investigations");
const TEMPLATE = path.join(ROOT, "src", "Universal-Debunking-User-Prompt.md");

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function main() {
  const args = process.argv.slice(2);
  const topicIdx = args.indexOf("--topic");
  const modeIdx = args.indexOf("--mode");

  if (topicIdx === -1 || !args[topicIdx + 1]) {
    console.error("Usage: node init-investigation.js --topic \"My Topic\" [--mode core|full-audit]");
    process.exit(1);
  }

  const topic = args[topicIdx + 1];
  const mode = (modeIdx !== -1 ? args[modeIdx + 1] : "core").toLowerCase();
  const validModes = ["core", "full-audit"];
  if (!validModes.includes(mode)) {
    console.error(`Invalid mode: ${mode}. Use: core or full-audit`);
    process.exit(1);
  }

  const slug = slugify(topic);
  const dir = path.join(INVESTIGATIONS, slug);

  if (fs.existsSync(dir)) {
    console.error(`❌ Investigation already exists: ${dir}`);
    process.exit(1);
  }

  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(path.join(dir, "evidence"), { recursive: true });

  // Write investigation.md from template
  let template = "";
  if (fs.existsSync(TEMPLATE)) {
    template = fs.readFileSync(TEMPLATE, "utf8");
  }

  const investigationMd = `---
topic: "${topic}"
mode: ${mode}
date: ${new Date().toISOString().split("T")[0]}
status: draft
framework: skepsis-v5.2
---

# Investigation: ${topic}

## Mode: ${mode.toUpperCase()}

> **Execution Mode:** ${mode.toUpperCase()}  
> **Rationale:** ${mode === "core" ? "Routine review, time-constrained" : "Major investigation, publication quality"}  
> **Framework:** Skepsis v5.2

---

${template}
`;

  fs.writeFileSync(path.join(dir, "investigation.md"), investigationMd);

  // Write sources.md
  const sourcesMd = `# Sources: ${topic}

| # | Citation | Score | GRADE | Type | Status |
|---|---|---|---|---|---|
| 1 | — | — | — | — | — |

## Notes

<!-- Add source notes here -->
`;
  fs.writeFileSync(path.join(dir, "sources.md"), sourcesMd);

  // Write evidence/README
  const evidenceReadme = `# Evidence: ${topic}

Place screenshots, PDFs, and raw data extracts here.

## File naming convention
- \`YYYYMMDD-author-short-title.ext\`
- Example: \`20260608-patil-fatty-acids.pdf\`
`;
  fs.writeFileSync(path.join(dir, "evidence", "README.md"), evidenceReadme);

  console.log(`✅ Investigation scaffolded: ${dir}`);
  console.log(`   📄 investigation.md`);
  console.log(`   📄 sources.md`);
  console.log(`   📁 evidence/`);
  console.log("\nNext steps:");
  console.log(`  1. Edit investigations/${slug}/investigation.md`);
  console.log(`  2. Paste into your AI assistant with the Skepsis System Prompt`);
  console.log(`  3. Run: node scripts/evolve.js --lesson "What you learned from this investigation"`);
}

main();
