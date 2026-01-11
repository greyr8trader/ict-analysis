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
