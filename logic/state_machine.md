# ICT Market State Machine
Version: 1.0
Authority: HARD RULE
Source: KB-derived states only

All states are binary.
If a required state is invalid, analysis must halt.

────────────────────────────────

## STATE: HTF_BULLISH
Source: Top-Down Timeframe Bias

Conditions:
- HTF shows expansion higher
- SSL has been respected or raided and reclaimed
- Price holds above equilibrium

────────────────────────────────

## STATE: HTF_BEARISH
Source: Top-Down Timeframe Bias

Conditions:
- HTF shows expansion lower
- BSL has been respected or raided and rejected
- Price holds below equilibrium

────────────────────────────────

## STATE: HTF_NEUTRAL
Source: Top-Down Timeframe Bias

Conditions:
- Range-bound HTF
- No expansion or directional intent

────────────────────────────────

## STATE: LIQUIDITY_RAID_CONFIRMED
Source: Liquidity

Conditions:
- Clear sweep of BSL or SSL
- Sweep exceeds a defined level
- Occurs during a valid session

────────────────────────────────

## STATE: LIQUIDITY_RAID_INVALID
Source: Liquidity

Conditions:
- Equal highs/lows without sweep
- No follow-through
- Occurs outside relevant session

────────────────────────────────

## STATE: M15_VALID
Source: Market Structure Shift (Intraday)

Conditions:
- MSS present after liquidity raid
- MSS aligns with HTF bias

────────────────────────────────

## STATE: M15_INVALID
Source: Market Structure Shift (Intraday)

Conditions:
- MSS absent
- Structure contradicts HTF bias

────────────────────────────────

## STATE: DISPLACEMENT_CONFIRMED
Source: Fair Value Gap, Market Efficiency Paradigm

Conditions:
- Strong impulsive candle
- Inefficiency (FVG) created

────────────────────────────────

## STATE: EXECUTION_ALLOWED
Source: Premium & Discount, Order Block

Conditions:
- HTF bias valid
- Liquidity raid confirmed
- M15 valid
- Price located in correct PD array

────────────────────────────────

## STATE: NO_TRADE_DAY
Source: Global

Conditions:
- Any required state is invalid
