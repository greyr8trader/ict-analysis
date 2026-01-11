# PD Arrays — Fair Value Gap (Imbalance)

## Definition
- A Fair Value Gap (FVG) forms when price moves in one direction without candle overlap.

## Identification
- The FVG is defined by:
  - The high of the candle prior to the impulsive move, and
  - The low of the candle following the impulsive move.

## Usage
- After a structure break, price OFTEN retraces into the FVG.
- Entries SHOULD be taken as price trades back into the FVG.
- For index futures, lower timeframes (1–3 minute) are preferred for identifying FVGs.

## Fair Value Gap (FVG) — Intraday Confirmation

- An FVG is confirmed after an MSS when the next candle fails to fully overlap.
- Entries SHOULD be taken as price retraces into the FVG.
- For indices, FVGs are best identified on 3m, 2m, or 1m charts.

## FVG Requirement

- A valid setup REQUIRES a Fair Value Gap to form after the MSS.
- If no FVG forms, the setup is INVALID.
- Price MAY retrace into the same FVG multiple times.

## ICT Fair Value Gap (FVG) — 3-Candle Formation (Precise)

### Bearish FVG
A bearish FVG is a 3-candle formation with these requirements:
1) Candle 1: defines the reference; the LOW of Candle 1 is the UPPER boundary of the FVG.
2) Candle 2: trades below Candle 1’s low (impulsive / bearish delivery).
3) Candle 3: continues lower AND does NOT trade back into Candle 1’s low.

- The bearish FVG range is between:
  - Upper boundary: Candle 1 low
  - Lower boundary: Candle 3 high

### Bullish FVG (Reverse Logic)
- Bullish FVG boundaries are defined symmetrically:
  - Lower boundary: Candle 1 high
  - Upper boundary: Candle 3 low

## Context Requirement
- FVGs MUST NOT be searched for randomly.
- Optimal FVGs form AFTER a run into liquidity AND an energetic displacement.
- If displacement occurs but no valid FVG forms, NO trade is permitted.
