/**
 * Test LLM API connectivity.
 * Run: node test/test-llm.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "../user-config.json");

// Load user-config.json
const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));

const baseURL = cfg.llmBaseUrl;
const apiKey  = cfg.llmApiKey;
const model   = cfg.generalModel ?? cfg.llmModel;

console.log("╔══════════════════════════════════╗");
console.log("║      LLM Connection Test         ║");
console.log("╚══════════════════════════════════╝");
console.log(`  Provider : ${cfg.llmProvider ?? "unknown"}`);
console.log(`  Base URL : ${baseURL}`);
console.log(`  Model    : ${model}`);
console.log(`  API Key  : ${apiKey ? apiKey.slice(0, 8) + "..." : "(not set)"}`);
console.log();

if (!baseURL || !apiKey || !model) {
  console.error("❌ Missing llmBaseUrl, llmApiKey, or model in user-config.json");
  process.exit(1);
}

const client = new OpenAI({ apiKey, baseURL });

try {
  console.log("⏳ Sending test request...");
  const start = Date.now();

  const res = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: "Reply with exactly: OK" }],
    max_tokens: 10,
    temperature: 0,
  });

  const elapsed = Date.now() - start;
  const reply = res.choices[0]?.message?.content?.trim();

  console.log(`✅ Connected! Response: "${reply}" (${elapsed}ms)`);
  console.log(`   Model used : ${res.model ?? model}`);
  console.log(`   Tokens used: ${res.usage?.total_tokens ?? "?"}`);
} catch (err) {
  console.error("❌ Connection failed!");
  console.error(`   Status : ${err.status ?? "N/A"}`);
  console.error(`   Message: ${err.message}`);
  if (err.error) console.error(`   Detail : ${JSON.stringify(err.error)}`);
  process.exit(1);
}
