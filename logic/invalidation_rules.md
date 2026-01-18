# ICT Invalidation Rules
Version: 1.0
Authority: HARD RULE
Derived strictly from KB constraints

Invalidation overrides all analysis.

────────────────────────────────

## HTF INVALIDATION
(KB: Top-Down Timeframe Bias)

IF:
- HTF bias is Neutral
AND
- No liquidity objective exists
THEN:
- State → NO_TRADE_DAY

────────────────────────────────

## LIQUIDITY INVALIDATION
(KB: Liquidity)

IF:
- Liquidity sweep lacks follow-through
OR
- Occurs outside relevant session
THEN:
- State → LIQUIDITY_RAID_INVALID

────────────────────────────────

## STRUCTURE INVALIDATION
(KB: Market Structure Shift – Intraday)

IF:
- No MSS after raid
OR
- MSS contradicts HTF bias
THEN:
- State → M15_INVALID

────────────────────────────────

## DISPLACEMENT INVALIDATION
(KB: Market Efficiency Paradigm)

IF:
- No displacement candle
OR
- No FVG formed
THEN:
- Execution is disallowed

────────────────────────────────

## PREMIUM / DISCOUNT INVALIDATION
(KB: Premium & Discount)

IF:
- Long scenario in premium
OR
- Short scenario in discount
THEN:
- State → NO_TRADE_DAY

────────────────────────────────

## OUTPUT RULE
IF:
- State = NO_TRADE_DAY
THEN:
- Collapse output
- Report invalidation reason only
