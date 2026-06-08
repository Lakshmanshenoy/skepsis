#!/usr/bin/env node
/**
 * test.js — Skepsis Validation Suite
 * 
 * Usage:
 *   node scripts/test.js --required-sections
 *   node scripts/test.js --methodology-freeze
 *   node scripts/test.js --fire-drill
 *   node scripts/test.js --schema
 *   node scripts/test.js --all
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");
const TESTS = path.join(ROOT, "tests");
const SCHEMA = path.join(ROOT, "schema");

function extractHeadings(filePath, level = 2) {
  const content = fs.readFileSync(filePath, "utf8");
  const regex = new RegExp(`^#{${level}}\\s+(.+)$`, "gm");
  const matches = [];
  let m;
  while ((m = regex.exec(content)) !== null) {
    matches.push(m[1].trim());
  }
  return matches;
}

function extractAllSections(content) {
  const matches = content.match(/^#{1,4}\s+.+$/gm) || [];
  return matches.map((s) => s.replace(/^#+\s+/, "").trim());
}

function testRequiredSections() {
  console.log("\n🔍 Test: Required Sections\n");

  const required = [
    "MODE SELECTION",
    "CLAIM FAILURE TAXONOMY",
    "MECHANISM ≠ OUTCOME RULE",
    "COUNTERFACTUAL CHALLENGE",
    "SOURCE CREDIBILITY SCORE + APPLICABILITY SCORE",
    "EVIDENCE DECAY TRACKER",
    "GRADE CERTAINTY OF EVIDENCE",
    "EVIDENCE ARBITRATION RULE",
    "PRIOR PLAUSIBILITY ASSESSMENT",
    "DOMAIN REPRODUCIBILITY MODIFIER",
    "EVIDENCE INDEPENDENCE AUDIT",
    "POSTERIOR CONFIDENCE FRAMEWORK + CONFIDENCE CEILING RULE",
    "CALIBRATION AUDIT",
    "MARKETING LEAP INDEX",
    "ACTIONABILITY ASSESSMENT",
    "UNKNOWN UNKNOWNS CHECK",
    "VERDICT STABILITY TEST",
  ];

  let failed = false;
  const files = {
    system: "Universal-Debunking-System-Prompt.md",
    user: "Universal-Debunking-User-Prompt.md",
    article: "Universal-Debunking-Article-Prompt.md",
  };

  const articlePath = path.join(SRC, "Universal-Debunking-Article-Prompt.md");
  const articleContent = fs.readFileSync(articlePath, "utf8");
  console.log(`  article:`);
  for (const section of required) {
    const found = articleContent.includes(section);
    const icon = found ? "✅" : "❌";
    console.log(`    ${icon} ${section}`);
    if (!found) failed = true;
  }

  // System prompt should have most sections
  const systemPath = path.join(SRC, "Universal-Debunking-System-Prompt.md");
  const systemContent = fs.readFileSync(systemPath, "utf8");
  console.log(`  system:`);
  for (const section of required) {
    const found = systemContent.includes(section);
    const icon = found ? "✅" : "❌";
    console.log(`    ${icon} ${section}`);
    if (!found) failed = true;
  }

  // User prompt references sections but doesn't define all of them
  const userPath = path.join(SRC, "Universal-Debunking-User-Prompt.md");
  const userContent = fs.readFileSync(userPath, "utf8");
  const userRequired = ["MODE SELECTION", "EVIDENCE ARBITRATION", "UNKNOWN UNKNOWNS", "ACTIONABILITY"];
  console.log(`  user (references):`);
  for (const section of userRequired) {
    const found = userContent.toLowerCase().includes(section.toLowerCase());
    const icon = found ? "✅" : "❌";
    console.log(`    ${icon} ${section}`);
    if (!found) failed = true;
  }

  return !failed;
}

function testMethodologyFreeze() {
  console.log("\n🧊 Test: Methodology Freeze Guard\n");

  const forbidden = [
    { pattern: /new scoring system/i, reason: "No new scoring systems allowed (v5.2 freeze)" },
    { pattern: /new evidence hierarchy/i, reason: "No new evidence hierarchies allowed (v5.2 freeze)" },
    { pattern: /new database/i, reason: "No new database requirements allowed (v5.2 freeze)" },
    { pattern: /regulatory compliance module/i, reason: "No new regulatory modules allowed (v5.2 freeze)" },
    { pattern: /legal framework/i, reason: "No new legal frameworks allowed (v5.2 freeze)" },
  ];

  const allowed = [
    { pattern: /Source Credibility Score/, reason: "Pre-existing scoring (v3.0)" },
    { pattern: /Applicability Score/, reason: "Pre-existing scoring (v5.0)" },
    { pattern: /Marketing Leap Index/, reason: "Pre-existing scoring (v4.0)" },
  ];

  let failed = false;
  const files = ["Universal-Debunking-System-Prompt.md", "Universal-Debunking-User-Prompt.md", "Universal-Debunking-Article-Prompt.md"];

  // For methodology freeze, check for sections that introduce NEW scoring/hierarchies
  // by looking for section headers that are scoring systems, not casual mentions
  const scoringSectionPatterns = [
    /^#{2,4}\s+.*Score.*0[-–]\d/i,
    /^#{2,4}\s+.*Index.*0[-–]\d/i,
    /^#{2,4}\s+.*Rating.*0[-–]\d/i,
  ];

  for (const file of files) {
    const content = fs.readFileSync(path.join(SRC, file), "utf8");
    const lines = content.split("\n");
    for (const line of lines) {
      for (const pattern of scoringSectionPatterns) {
        if (pattern.test(line)) {
          const sectionName = line.replace(/^#+\s+/, "").trim();
          // Whitelist pre-existing scoring sections
          const allowedSections = [
            "Source Credibility Score",
            "Credibility Score",
            "Applicability Score",
            "Marketing Leap Index",
          ];
          const isAllowed = allowedSections.some(a => sectionName.includes(a));
          if (!isAllowed) {
            console.log(`  ❌ VIOLATION in ${file}: New scoring section detected: "${sectionName}"`);
            failed = true;
          }
        }
      }
    }
  }

  if (!failed) {
    console.log("  ✅ No methodology bloat detected");
  }

  // Also check section count hasn't exploded
  const articlePath = path.join(SRC, "Universal-Debunking-Article-Prompt.md");
  const sections = extractHeadings(articlePath, 2);
  if (sections.length > 40) {
    console.log(`  ⚠️  Article prompt has ${sections.length} sections (expected <= 40)`);
  } else {
    console.log(`  ✅ Section count: ${sections.length} (within limit)`);
  }

  return !failed;
}

function testHallucinationFireDrill() {
  console.log("\n🪤 Test: Hallucination Fire-Drill\n");

  const trapPath = path.join(TESTS, "hallucination-trap.md");
  if (!fs.existsSync(trapPath)) {
    console.log("  ❌ hallucination-trap.md not found in tests/");
    return false;
  }

  const content = fs.readFileSync(trapPath, "utf8");

  // Check that it contains fabricated citations
  const fabricatedCount = (content.match(/@fabricated/g) || []).length;
  if (fabricatedCount < 3) {
    console.log(`  ❌ Only ${fabricatedCount} fabricated citations found (need >= 3)`);
    return false;
  }
  console.log(`  ✅ ${fabricatedCount} fabricated citations present`);

  // Check that it documents expected detection
  if (!content.toLowerCase().includes("expected detection")) {
    console.log("  ❌ Missing 'Expected detection' section");
    return false;
  }
  console.log("  ✅ Expected detection documented");

  // Check that resolution is described
  if (!content.toLowerCase().includes("resolution")) {
    console.log("  ❌ Missing 'Resolution' section");
    return false;
  }
  console.log("  ✅ Resolution documented");

  return true;
}

function testSchema() {
  console.log("\n📐 Test: JSON Schema Validation\n");

  const schemaPath = path.join(SCHEMA, "investigation.schema.json");
  if (!fs.existsSync(schemaPath)) {
    console.log("  ❌ investigation.schema.json not found");
    return false;
  }

  try {
    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
    if (schema.$schema !== "http://json-schema.org/draft-07/schema#") {
      console.log("  ⚠️  Schema does not use draft-07");
    }
    if (!schema.title) {
      console.log("  ❌ Schema missing title");
      return false;
    }
    console.log(`  ✅ Valid schema: ${schema.title}`);

    // Check required properties
    const required = schema.required || [];
    const expected = ["investigation", "verdict", "actionability", "evidence_summary"];
    for (const prop of expected) {
      if (required.includes(prop)) {
        console.log(`    ✅ requires ${prop}`);
      } else {
        console.log(`    ⚠️  missing required: ${prop}`);
      }
    }

    return true;
  } catch (err) {
    console.log(`  ❌ Invalid JSON: ${err.message}`);
    return false;
  }
}

function runAll() {
  const results = {
    "Required Sections": testRequiredSections(),
    "Methodology Freeze": testMethodologyFreeze(),
    "Hallucination Fire-Drill": testHallucinationFireDrill(),
    "JSON Schema": testSchema(),
  };

  console.log("\n" + "=".repeat(40));
  console.log("Skepsis Test Results");
  console.log("=".repeat(40));

  let allPassed = true;
  for (const [name, passed] of Object.entries(results)) {
    const icon = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${icon}: ${name}`);
    if (!passed) allPassed = false;
  }

  console.log("=".repeat(40));
  process.exit(allPassed ? 0 : 1);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  runAll();
} else if (args.includes("--required-sections")) {
  process.exit(testRequiredSections() ? 0 : 1);
} else if (args.includes("--methodology-freeze")) {
  process.exit(testMethodologyFreeze() ? 0 : 1);
} else if (args.includes("--fire-drill")) {
  process.exit(testHallucinationFireDrill() ? 0 : 1);
} else if (args.includes("--schema")) {
  process.exit(testSchema() ? 0 : 1);
} else if (args.includes("--all")) {
  runAll();
} else {
  console.error("Unknown test flag. Use: --required-sections, --methodology-freeze, --fire-drill, --schema, --all");
  process.exit(1);
}
