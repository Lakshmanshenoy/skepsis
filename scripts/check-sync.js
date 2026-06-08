#!/usr/bin/env node
/**
 * check-sync.js
 * Detects drift across the three prompt files by comparing versions, sections, and changelogs.
 */

const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "src");

function extractSections(content) {
  // Find all ## headings
  const matches = content.match(/^##[^#].*/gm) || [];
  return matches.map((s) => s.trim().replace(/^#+\s*/, ""));
}

function extractVersion(content) {
  const match = content.match(/Version (\d+\.\d+)/);
  return match ? match[1] : null;
}

function extractChangelog(content) {
  const match = content.match(/## CHANGELOG[\s\S]*?(?=##|$)/);
  return match ? match[0].trim() : "";
}

function main() {
  const files = {
    system: "Universal-Debunking-System-Prompt.md",
    user: "Universal-Debunking-User-Prompt.md",
    article: "Universal-Debunking-Article-Prompt.md",
  };

  const data = {};
  for (const [key, file] of Object.entries(files)) {
    const p = path.join(SRC, file);
    const content = fs.readFileSync(p, "utf8");
    data[key] = {
      version: extractVersion(content),
      sections: extractSections(content),
      changelog: extractChangelog(content),
    };
  }

  console.log("=== Universal Debunking Framework — Sync Report ===\n");

  // Version check
  const versions = Object.values(data).map((d) => d.version);
  const uniqueVersions = [...new Set(versions)];
  if (uniqueVersions.length === 1) {
    console.log(`✅ All files at v${uniqueVersions[0]}`);
  } else {
    console.log(`❌ VERSION MISMATCH:`);
    for (const [k, v] of Object.entries(data)) {
      console.log(`   ${k}: v${v.version}`);
    }
  }

  // Section count check
  console.log("\n📊 Section counts:");
  for (const [k, v] of Object.entries(data)) {
    console.log(`   ${k}: ${v.sections.length} sections`);
  }

  // CORE section presence check
  const coreSections = data.article.sections.filter((s) => s.includes("[CORE]"));
  const systemCore = data.system.sections.filter((s) => s.includes("[CORE]"));
  const userCore = data.user.sections.filter((s) => s.includes("[CORE]"));

  console.log(`\n🏷️  CORE-tagged sections:`);
  console.log(`   article: ${coreSections.length}`);
  console.log(`   system:  ${systemCore.length}`);
  console.log(`   user:    ${userCore.length}`);

  if (coreSections.length !== systemCore.length || coreSections.length !== userCore.length) {
    console.log(`⚠️  CORE section count mismatch — check that all [CORE] sections propagate to all three files.`);
  }

  // NEW in v5.2 checks
  const v52Checks = [
    "Evidence Arbitration Rule",
    "Unknown Unknowns Check",
    "Domain Reproducibility Modifier",
    "Actionability Assessment",
  ];

  console.log("\n🔍 v5.2 Feature Presence:");
  for (const feature of v52Checks) {
    const present = {};
    for (const [k, v] of Object.entries(data)) {
      present[k] = v.sections.some((s) => s.includes(feature));
    }
    const allPresent = Object.values(present).every(Boolean);
    const icon = allPresent ? "✅" : "❌";
    console.log(`   ${icon} ${feature}`);
    if (!allPresent) {
      for (const [k, v] of Object.entries(present)) {
        if (!v) console.log(`      Missing in: ${k}`);
      }
    }
  }

  // Changelog sync check
  console.log("\n📝 Changelog sync:");
  const clArticle = data.article.changelog;
  const clSystem = data.system.changelog;
  const clUser = data.user.changelog;

  if (clArticle === clSystem && clSystem === clUser) {
    console.log("✅ Changelogs identical");
  } else {
    console.log("❌ Changelogs differ — run manual sync");
  }

  console.log("\n=== End Report ===");
}

main();
