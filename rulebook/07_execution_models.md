# Execution Model (Index Futures)

## Preconditions
An entry MUST NOT be taken unless all of the following are present:
1. Weekly bias defined.
2. Daily liquidity context identified.
3. Opposing-side liquidity taken.
4. Break in Market Structure on a lower timeframe.
5. Fair Value Gap formed.

## Entry Logic
- Entries MAY occur while price is moving against the intended direction
  (e.g., selling as price trades higher into an FVG).
- Chasing price after a structure break SHOULD be avoided.

## Stops
- Stop loss MAY be placed above:
  - The high preceding the FVG, or
  - The high of the FVG-forming candle.
- Risk MUST be appropriate to the instrument (micros vs full contracts).

## Targets
- Targets SHOULD prioritize the closest opposing-side liquidity or imbalance.
- “Low-hanging fruit” targets are preferred over extended projections.

## Intraday Entry Constraints

- Entries MUST occur only after:
  1. Liquidity is taken,
  2. An intraday MSS is confirmed,
  3. An FVG or valid Order Block is present.
- Entries MAY be taken against the immediate candle direction.
- Early entries WITHOUT MSS confirmation SHOULD be avoided by developing traders.

## Targets

- Primary objectives include:
  - Internal Range Liquidity,
  - Opposing-side stops,
  - Imbalances within premium or discount.
- The closest, easiest objective (“low-hanging fruit”) SHOULD be prioritized.

## Execution Discipline

- Trades MUST NOT be forced or anticipated.
- Entries MUST occur only after all criteria align:
  1. Liquidity taken,
  2. MSS confirmed,
  3. FVG formed,
  4. Entry in correct premium/discount context.
- If any element is missing, NO trade is permitted.

## Targets

- Acceptable targets include:
  - Prior session lows/highs,
  - Prior swing lows/highs,
  - Imbalances beyond equilibrium.
- Conservative or partial targets are acceptable.

## Two-Pattern Constraint (Indices)

Only TWO execution patterns are required:

1) Stop Hunt → MSS → FVG Entry
- Price raids liquidity (above an old high or below an old low),
  THEN produces an MSS,
  THEN forms an FVG,
  THEN entry is taken on retracement into the FVG.

2) Displacement → FVG Entry
- Price produces obvious displacement,
  THEN forms an FVG,
  THEN entry is taken on retracement into the FVG.

- No additional patterns, indicators, or named models are required.

## Displacement Requirement

- A valid stop hunt setup REQUIRES clear, obvious displacement.
- Weak or lethargic movement is NOT sufficient displacement.
- If displacement occurs but no FVG forms, NO trade is permitted.

## Trade Frequency & Risk

- Traders MUST NOT aim for high trade frequency or micro-scalping.
- One quality trade per session is sufficient.
- Excessive leverage and oversized contract use can cause rapid loss and MUST be avoided.

## FVG Entry & Stops (Precise)

### Entry
- The simplest bearish FVG entry is a limit order just above Candle 3’s high.
- (Bullish: reverse the logic.)

### Stops
- Stop loss MAY be placed:
  - Above Candle 1 high, OR
  - Above Candle 2 high.
- Wider stops are acceptable while learning.

## Model Integrity
- This model MUST NOT be modified, renamed, or expanded with extra indicators/patterns.
- Deviating from the process prevents finding valid ICT FVG setups.


