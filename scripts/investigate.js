#!/usr/bin/env node
/**
 * investigate.js — Skepsis API Integration Harness
 * 
 * Usage:
 *   node scripts/investigate.js --topic "A2 Ghee" --mode core --backend anthropic
 *   node scripts/investigate.js --topic "Ozempic" --mode full-audit --backend openai --dry-run
 *   
 * Environment:
 *   ANTHROPIC_API_KEY  — required for --backend anthropic
 *   OPENAI_API_KEY     — required for --backend openai
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");
const INVESTIGATIONS = path.join(ROOT, "investigations");

// Token estimation: ~4 chars per token (rough heuristic)
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

function formatCurrency(usd) {
  return `$${usd.toFixed(4)}`;
}

function formatTokens(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
}

function pretty(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rs = s % 60;
  if (m > 0) return `${m}m ${rs}s`;
  return `${rs}s`;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function loadPrompts(topic, mode) {
  const systemPath = path.join(SRC, "Universal-Debunking-System-Prompt.md");
  const userPath = path.join(SRC, "Universal-Debunking-User-Prompt.md");

  let system = fs.readFileSync(systemPath, "utf8");
  let user = fs.readFileSync(userPath, "utf8");

  // Replace topic placeholders in user prompt
  user = user.replace(/\[Insert topic here\]/g, topic);
  user = user.replace(/\[Insert topic here\. Be specific[^\]]*\]/g, topic);

  // Fix mode selection in user prompt
  user = user.replace(/\[CORE \/ FULL AUDIT\]/g, mode.toUpperCase());
  user = user.replace(/\[Why this mode\?[^\]]*\]/g, mode === "core" ? "Time-constrained routine review" : "High-stakes publication-quality investigation");
  user = user.replace(/\[List of skipped Phase 2 advanced sections\]/g, mode === "core" ? "Red Team, Verdict Stability, Unknown Unknowns, Missing Evidence Audit, Advanced sections" : "None — all sections active");

  return { system, user };
}

function estimateCost(backend, model, inputTokens, outputTokensEstimate) {
  // Pricing per 1M tokens (as of June 2026 — verify current rates)
  const pricing = {
    anthropic: {
      "claude-sonnet-4-20250514": { input: 3.00, output: 15.00 },
      "claude-sonnet-4": { input: 3.00, output: 15.00 },
      "claude-opus-4": { input: 15.00, output: 75.00 },
      "claude-haiku-4": { input: 0.25, output: 1.25 },
    },
    openai: {
      "gpt-4o": { input: 2.50, output: 10.00 },
      "gpt-4o-mini": { input: 0.15, output: 0.60 },
      "gpt-4.1": { input: 2.00, output: 8.00 },
    },
  };

  const rates = pricing[backend]?.[model];
  if (!rates) return { inputCost: 0, outputCost: 0, total: 0, unknown: true };

  const inputCost = (inputTokens / 1_000_000) * rates.input;
  const outputCost = (outputTokensEstimate / 1_000_000) * rates.output;
  return { inputCost, outputCost, total: inputCost + outputCost, unknown: false };
}

async function askConfirm(text) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${text} (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase().startsWith("y"));
    });
  });
}

async function streamAnthropic({ model, system, userContent, maxTokens, outputPath }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userContent }],
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${error}`);
  }

  const writer = fs.createWriteStream(outputPath);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      if (data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === "content_block_delta" && parsed.delta?.text) {
          const text = parsed.delta.text;
          fullText += text;
          writer.write(text);
          process.stdout.write(text);
        }
        if (parsed.type === "message_stop") break;
      } catch (e) {
        // Skip malformed SSE lines
      }
    }
  }

  writer.end();
  return fullText;
}

async function streamOpenAI({ model, system, userContent, maxTokens, outputPath }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
      max_tokens: maxTokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${error}`);
  }

  const writer = fs.createWriteStream(outputPath);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      if (data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data);
        const text = parsed.choices?.[0]?.delta?.content || "";
        if (text) {
          fullText += text;
          writer.write(text);
          process.stdout.write(text);
        }
      } catch (e) {
        // Skip malformed SSE lines
      }
    }
  }

  writer.end();
  return fullText;
}

async function main() {
  const args = process.argv.slice(2);
  const topicIdx = args.indexOf("--topic");
  const modeIdx = args.indexOf("--mode");
  const backendIdx = args.indexOf("--backend");
  const modelIdx = args.indexOf("--model");
  const maxTokensIdx = args.indexOf("--max-tokens");
  const dryRun = args.includes("--dry-run");
  const noApi = args.includes("--no-api");
  const noConfirm = args.includes("--yes");

  if (topicIdx === -1 || !args[topicIdx + 1]) {
    console.error(`
Usage: node investigate.js --topic "Your Topic" [options]

Options:
  --topic <text>          Investigation topic (required)
  --mode core|full-audit  Audit mode (default: core)
  --backend anthropic|openai  API provider (default: anthropic)
  --model <model-id>      Specific model (default: claude-sonnet-4 / gpt-4o)
  --max-tokens <n>        Max output tokens (default: 16000)
  --dry-run               Estimate cost without sending
  --no-api                Assemble prompt and save to file without calling any API
  --yes                   Skip cost confirmation

Environment:
  ANTHROPIC_API_KEY       Required for --backend anthropic
  OPENAI_API_KEY          Required for --backend openai

Examples:
  node investigate.js --topic "A2 Ghee" --mode full-audit
  node investigate.js --topic "Ozempic" --mode core --backend openai --dry-run
`);
    process.exit(1);
  }

  const topic = args[topicIdx + 1];
  const mode = (modeIdx !== -1 ? args[modeIdx + 1] : "core").toLowerCase();
  const backend = (backendIdx !== -1 ? args[backendIdx + 1] : "anthropic").toLowerCase();
  const defaultModels = { anthropic: "claude-sonnet-4-20250514", openai: "gpt-4o" };
  const model = modelIdx !== -1 ? args[modelIdx + 1] : defaultModels[backend];
  const maxTokens = maxTokensIdx !== -1 ? parseInt(args[maxTokensIdx + 1]) : 16000;

  if (!["core", "full-audit"].includes(mode)) {
    console.error(`Invalid mode: ${mode}. Use: core or full-audit`);
    process.exit(1);
  }
  if (!["anthropic", "openai"].includes(backend)) {
    console.error(`Invalid backend: ${backend}. Use: anthropic or openai`);
    process.exit(1);
  }

  console.log(`\n🔬 Skepsis Investigation`);
  console.log(`   Topic: ${topic}`);
  console.log(`   Mode: ${mode.toUpperCase()}`);
  console.log(`   Backend: ${backend}`);
  console.log(`   Model: ${model}`);
  console.log("");

  // Load prompts
  const { system, user } = await loadPrompts(topic, mode);
  const combined = `${system}\n\n---\n\n${user}`;
  const inputTokens = estimateTokens(combined);
  const outputTokensEstimate = maxTokens;

  // Cost estimation
  const cost = estimateCost(backend, model, inputTokens, outputTokensEstimate);

  console.log(`📊 Token Estimate`);
  console.log(`   System prompt: ${formatTokens(estimateTokens(system))}`);
  console.log(`   User prompt:   ${formatTokens(estimateTokens(user))}`);
  console.log(`   Combined:      ${formatTokens(inputTokens)}`);
  console.log(`   Max output:    ${formatTokens(outputTokensEstimate)}`);
  console.log("");

  if (cost.unknown) {
    console.log(`⚠️  Unknown pricing for ${backend}/${model}. Cannot estimate cost.`);
  } else {
    console.log(`💰 Cost Estimate (per 1M token rates)`);
    console.log(`   Input:  ${formatCurrency(cost.inputCost)} (${formatTokens(inputTokens)} tokens)`);
    console.log(`   Output: ${formatCurrency(cost.outputCost)} (up to ${formatTokens(outputTokensEstimate)} tokens)`);
    console.log(`   Total:  ${formatCurrency(cost.total)}`);
  }
  console.log("");

  // Setup investigation directory
  const slug = slugify(topic);
  const investigationDir = path.join(INVESTIGATIONS, slug);
  const outputPath = path.join(investigationDir, "article.md");

  if (!fs.existsSync(investigationDir)) {
    fs.mkdirSync(investigationDir, { recursive: true });
    fs.mkdirSync(path.join(investigationDir, "evidence"), { recursive: true });
    console.log(`📁 Created: investigations/${slug}/`);
  }

  // Save assembled prompt for manual use (regardless of API mode)
  const assembledPromptPath = path.join(investigationDir, "prompt.md");
  fs.writeFileSync(assembledPromptPath, combined);
  console.log(`📄 Assembled prompt saved: ${assembledPromptPath}`);
  console.log(`   Tokens: ${formatTokens(inputTokens)} | Size: ${(combined.length / 1024).toFixed(1)} KB`);
  console.log("");

  if (dryRun) {
    console.log("🛑 Dry run — no API call made.");
    console.log("   Prompt is ready at investigations/<slug>/prompt.md");
    console.log("   Use without --dry-run to execute via API, or --no-api to stay offline.");
    process.exit(0);
  }

  if (noApi) {
    console.log("✅ Prompt assembled. No API call made.");
    console.log("\nManual workflow:");
    console.log(`  1. Open: ${assembledPromptPath}`);
    console.log(`  2. Copy the entire prompt`);
    console.log(`  3. Paste into Kimchi / Claude / ChatGPT / etc.`);
    console.log(`  4. Save the AI output as investigations/${slug}/article.md`);
    console.log(`  5. Run: node scripts/evolve.js --lesson "What you learned"`);
    process.exit(0);
  }

  // Confirmation
  if (!noConfirm) {
    const confirmed = await askConfirm(cost.unknown ? "Proceed with investigation (cost unknown)?" : `Proceed with investigation (estimated ${formatCurrency(cost.total)})?`);
    if (!confirmed) {
      console.log("❌ Cancelled.");
      process.exit(0);
    }
  }

  console.log(`\n⏳ Streaming to ${outputPath}...\n`);
  const startTime = Date.now();

  try {
    let fullText = "";
    if (backend === "anthropic") {
      fullText = await streamAnthropic({ model, system, userContent: user, maxTokens, outputPath });
    } else {
      fullText = await streamOpenAI({ model, system, userContent: user, maxTokens, outputPath });
    }

    const elapsed = Date.now() - startTime;
    const actualOutputTokens = estimateTokens(fullText);
    const actualCost = cost.unknown ? null : estimateCost(backend, model, inputTokens, actualOutputTokens);

    console.log(`\n\n✅ Investigation complete in ${pretty(elapsed)}`);
    console.log(`   Output: ${formatTokens(actualOutputTokens)} tokens`);
    if (actualCost) {
      console.log(`   Actual cost: ${formatCurrency(actualCost.total)}`);
    }
    console.log(`   Saved to: ${outputPath}`);
    console.log("\nNext steps:");
    console.log(`  1. Review investigations/${slug}/article.md`);
    console.log(`  2. Run: node scripts/evolve.js --lesson "What worked/didn't" --section "Section Name"`);

  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    process.exit(1);
  }
}

main();
