STATE ENGINE (RETURN EXACTLY ONE STATE)

Valid STATES:
- NO TRADE
- WAIT
- READY

General Rules:
- If required data is missing or unclear, default to NO TRADE.
- Current price action overrides previous analysis memory.
- M15 validity is a hard gate:
  - If M15 is INVALID, STATE must be NO TRADE.

────────────────────────────────────────
STATE: NO TRADE
────────────────────────────────────────
Return NO TRADE if ANY of the following are true:
- Any required timeframe data (D, H1, M15, M5) is missing or unusable.
- HTF context cannot be determined (dealing range / liquidity draw unclear).
- M15 is INVALID (no aligned MSS + displacement).
- Market is non-directional / choppy around equilibrium with no clear draw.
- Conditions required by the RULEBOOK for valid participation are not present.

Output requirement when NO TRADE:
- Provide a brief reason.
- Do not produce an execution model.

────────────────────────────────────────
STATE: WAIT
────────────────────────────────────────
Return WAIT if ALL are true:
- HTF bias is defined and non-conflicting, AND
- M15 is VALID, BUT
- Execution prerequisites are incomplete, such as:
  - price not at the intended location (premium/discount + relevant PD array),
  - liquidity event not yet occurred (raid/sweep/inducement as per RULEBOOK),
  - M5 MSS + displacement not yet formed,
  - no clean PD-array retracement opportunity yet.

Output requirement when WAIT:
- List the missing prerequisites as “What I need next”.
- Do not imply entries or signals.

────────────────────────────────────────
STATE: READY
────────────────────────────────────────
Return READY if ALL are true:
- HTF bias is defined and non-conflicting, AND
- M15 is VALID, AND
- A qualifying liquidity event has occurred (per RULEBOOK), AND
- M5 shows aligned MSS + displacement creating imbalance (FVG), AND
- A logical PD-array retracement area exists for conceptual participation, AND
- A single clear invalidation condition can be stated.

Output requirement when READY:
- Provide a checklist-style execution model (conceptual).
- Provide one invalidation and liquidity-based objectives.
- Do not provide entries, sizing, or RR.
