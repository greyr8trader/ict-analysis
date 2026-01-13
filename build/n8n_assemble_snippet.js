/**
 * n8n_assemble_snippet.js
 *
 * Purpose:
 * - Assemble the final LLM prompt deterministically from repo layers.
 * - Output { system, user, symbol, templateMode } for the OpenAI node.
 *
 * IMPORTANT:
 * - This file is documentation/code reference stored in GitHub.
 * - In n8n, place this logic in a Code node.
 *
 * Compile Order (User Message):
 * 1) INSTRUMENT
 * 2) PREVIOUS ANALYSIS (memory, context only)
 * 3) LOGIC (analysis_flow, gates, invalidation)
 * 4) OUTPUT TEMPLATE (telegram OR compact_invalid)
 * 5) RULEBOOK (merged in numeric order)
 * 6) CURRENT OHLC DATA
 */

// ---------------------------
// Helpers
// ---------------------------

// Safely unwrap common GitHub/file nodes that return { data: "..." } or raw strings
function unwrapText(x) {
  if (x == null) return "";
  if (typeof x === "string") return x;
  if (typeof x === "object") {
    if (typeof x.data === "string") return x.data;
    // some nodes store text in other keys; fall back to JSON
    return JSON.stringify(x, null, 2);
  }
  return String(x);
}

function prettyJSON(obj) {
  try {
    return JSON.stringify(obj ?? {}, null, 2);
  } catch (e) {
    return String(obj);
  }
}

// ---------------------------
// 1) INPUTS (replace to match your flow)
// ---------------------------

// Instrument (replace this line to match your symbol source)
const symbol =
  $json.symbol ||
  $node["Define Symbol"]?.json?.symbol ||
  "XAUUSD";

// Repo layers (replace node names to match your GitHub fetch nodes)
const systemText = unwrapText($node["GitHub - system/system.txt"]?.json);

const logicFlow = unwrapText($node["GitHub - logic/analysis_flow.md"]?.json);
const logicGates = unwrapText($node["GitHub - logic/gates.md"]?.json);
const logicInvalidation = unwrapText($node["GitHub - logic/invalidation.md"]?.json);

const templateTelegram = unwrapText($node["GitHub - templates/telegram_template.md"]?.json);
const templateCompactInvalid = unwrapText($node["GitHub - templates/compact_invalid_template.md"]?.json);

// Rulebook (either already merged upstream or merged here)
const rulebookCombined =
  unwrapText($json.rulebookCombined) ||
  unwrapText($node["Rulebook - combined"]?.json);

// Current OHLC payload (replace to match your data structure)
const ohlc =
  $json.ohlc ||
  $json.timeframes ||
  $json.marketData ||
  {};

// Previous analysis memory (safe, summarized; replace if you store elsewhere)
const prev = $json.previousAnalysis || {};

// ---------------------------
// 2) MEMORY BLOCK (context only)
// ---------------------------

const prevBlock = `
PREVIOUS ANALYSIS (FOR CONTEXT ONLY — NOT AUTHORITATIVE):
Date: ${prev.date ?? ""}
Instrument: ${prev.symbol ?? symbol}

Prior HTF Bias: ${prev.htfBias ?? ""}
Prior Liquidity Draw (BSL/SSL): ${prev.liquidityDraw ?? ""}

Prior M15 Status: ${prev.m15Status ?? ""}
Prior State: ${prev.state ?? ""}

Prior Invalidation Level: ${prev.invalidation ?? ""}

RULES FOR USING MEMORY:
- Memory is context only.
- Current price action overrides all prior analysis.
- If current conditions conflict with memory, ignore memory.
- Do NOT force bias alignment with prior analysis.
`.trim();

// ---------------------------
// 3) TEMPLATE SELECTION
// ---------------------------
// NOTE: In a single-pass flow, you typically do NOT know M15 validity yet.
// Recommended patterns:
//
// A) Single-pass (simple):
//    Always use telegram_template.md.
//    Model collapses output if M15 invalid (per system + logic).
//
// B) Two-pass (best):
//    Pass 1: quick M15 gate → sets $json.m15Status
//    Pass 2: full analysis → chooses template accordingly.
//
// This snippet supports both: if m15Status exists and is invalid, use compact template.
// Otherwise default to full telegram template.

const m15Status = String($json.m15Status || prev.m15Status || "").toLowerCase();
const useCompact = m15Status.includes("invalid");
const chosenTemplate = useCompact ? templateCompactInvalid : templateTelegram;

// ---------------------------
// 4) COMPILE USER PROMPT (STRICT ORDER)
// ---------------------------

const userPrompt = `
INSTRUMENT: ${symbol}

${prevBlock}

LOGIC (how to reason, obey strictly):
${logicFlow}

${logicGates}

${logicInvalidation}

OUTPUT TEMPLATE (follow exactly):
${chosenTemplate}

RULEBOOK (authoritative definitions — overrides logic/template on definitions):
${rulebookCombined}

CURRENT OHLC DATA (D, H1, M15, M5):
${prettyJSON(ohlc)}
`.trim();

// ---------------------------
// 5) OUTPUT (map these into your OpenAI node)
// ---------------------------

return [{
  json: {
    system: systemText,
    user: userPrompt,
    symbol,
    templateMode: useCompact ? "compact_invalid" : "telegram",
  }
}];
