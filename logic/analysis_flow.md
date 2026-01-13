ANALYSIS FLOW (STRICT ORDER — DO NOT SKIP STEPS)

General Principles:
- Current price action always overrides previous analysis memory.
- If current conditions conflict with previous analysis, previous analysis must be ignored.
- All concepts and definitions must be interpreted strictly per the RULEBOOK.

────────────────────────────────────────
1) HIGHER-TIMEFRAME CONTEXT (D → H1 → M15)
────────────────────────────────────────
- Using the provided OHLC data, define the active dealing range.
- Identify the dominant external liquidity draw:
  - Buy-side liquidity (BSL), or
  - Sell-side liquidity (SSL).
- Determine whether price is trading in premium or discount
  relative to the active dealing range.
- Form a directional bias ONLY if the above align.
- If HTF context is unclear or conflicting, do not force a bias.

────────────────────────────────────────
2) LIQUIDITY EVALUATION
────────────────────────────────────────
- Identify relevant internal and external BSL/SSL pools.
- Note any clear liquidity raids or failures to raid.
- Liquidity interpretation must follow RULEBOOK definitions only.

────────────────────────────────────────
3) M15 VALIDATION GATE
────────────────────────────────────────
- Evaluate whether M15 shows:
  - a valid Market Structure Shift (MSS), AND
  - clear displacement,
  aligned with the HTF bias.

IF M15 IS INVALID:
- Mark M15 as INVALID.
- Do NOT evaluate killzones.
- Do NOT evaluate M5 execution.
- Force final STATE = NO TRADE.
- End analysis.

IF M15 IS VALID:
- Mark M15 as VALID.
- Permit continuation to lower-timeframe evaluation.

────────────────────────────────────────
4) KILLZONE CONTEXT (ONLY IF M15 VALID)
────────────────────────────────────────
- Assess whether current conditions align with
  the London and/or New York killzone.
- Killzones provide timing context only and do not
  override structure or liquidity conditions.

────────────────────────────────────────
5) M5 EXECUTION MODEL (ONLY IF M15 VALID)
────────────────────────────────────────
- Define what must occur for execution consideration:
  - M5 MSS aligned with HTF bias,
  - displacement creating imbalance (FVG),
  - and a logical PD-array retracement area.
- Define execution conceptually; do NOT provide entries.
- Identify liquidity-based objectives and a single invalidation condition.

End of analysis flow.
