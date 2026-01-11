# Invalidation Rules

- If liquidity is NOT taken, an MSS is INVALID.
- If price trades through and holds beyond an Order Block opening price
  without reaction, that Order Block is INVALID.
- Trades taken outside defined session windows (see Killzones) are INVALID
  for this model.

## Setup Invalidation

- If liquidity is taken but no MSS forms, the setup is INVALID.
- If an MSS forms but no FVG develops, the setup is INVALID.
- If price action does not return to a valid FVG, no entry is permitted.
