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
