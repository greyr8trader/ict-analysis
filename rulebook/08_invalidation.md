# Invalidation Rules

- If liquidity is NOT taken, an MSS is INVALID.
- If price trades through and holds beyond an Order Block opening price
  without reaction, that Order Block is INVALID.
- Trades taken outside defined session windows (see Killzones) are INVALID
  for this model.
