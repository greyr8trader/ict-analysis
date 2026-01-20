# ICT 2022 — Compiled Rulebook

Generated from repo snapshot: ict-analysis-main (4).zip

---

## 0) System Data Contract

# Data Contract — ICT Analysis Engine
Version: 1.1
Authority: HARD RULE

────────────────────────────────────────
1) TIMEZONE (HARD RULE)
────────────────────────────────────────
- All timestamps provided are ALREADY New York local time.
- The system MUST treat all times as America/New_York.
- No timezone conversion is required or allowed.

DST handling:
- Timestamps are assumed correct NY local time (DST already handled upstream).

────────────────────────────────────────
2) BAR WINDOWS (HARD RULE)
────────────────────────────────────────
Minimum required bar counts:
- Daily (D): 30 bars
- H1: 100 bars
- M15: 200 bars
- M5: 300 bars

Ordering:
- Bars MUST be sorted oldest → newest.
- The LAST bar is the most recent.

Latest bar rule:
- The latest bar is ALWAYS closed.
- Therefore: no forming candles are present.
- No `isClosed` field is required.

────────────────────────────────────────
3) SESSION DEFINITIONS (NY LOCAL TIME)
────────────────────────────────────────
All session logic uses NY local time.

Asia:
- 20:00 → 00:00

London:
- 02:00 → 05:00

New York AM (Primary):
- 08:00 → 11:00

New York PM (Optional):
- 13:00 → 15:00

Session rule:
- Liquidity events outside these windows must be labeled OFF-SESSION and deprioritized.

────────────────────────────────────────
4) SYMBOL SOURCE + NORMALIZATION
────────────────────────────────────────
- The input sheet includes a column named: NAS100
- This column name is the canonical symbol for the analysis run.

Hard rules:
- The system MUST set symbol = "NAS100" when using the NAS100 column.
- If the column name is missing or not recognized → INVALID_INPUT.

(Optional mapping, only if you add more columns later)
- US100/USTEC/NAS → NAS100

────────────────────────────────────────
5) OHLC BAR SCHEMA (REQUIRED FIELDS)
────────────────────────────────────────
Each bar MUST contain:
- time (string): NY local time (parseable)
- open (number)
- high (number)
- low (number)
- close (number)
- volume (number | "" | null allowed)

Validation rules:
- high >= max(open, close)
- low  <= min(open, close)
- Any violation → INVALID_INPUT

────────────────────────────────────────
6) PAYLOAD SHAPE (RECOMMENDED)
────────────────────────────────────────
{
  "symbol": "NAS100",
  "timezone": "America/New_York",
  "asOf": "YYYY-MM-DDTHH:mm",
  "bars": {
    "D":  [Bar x 30],
    "H1":  [Bar x 100],
    "M15": [Bar x 200],
    "M5":  [Bar x 300]
  }
}

Notes:
- `asOf` is NY local time.
- Since last bars are closed, analysis treats last candle as final.

────────────────────────────────────────
7) DATA QUALITY RULES (FAIL FAST)
────────────────────────────────────────
Return INVALID_INPUT if:
- Any timeframe array is missing (D/H1/M15/M5)
- Any timeframe has fewer than required bars
- Bars not ordered oldest → newest
- Any OHLC invalid relationship
- Time cannot be parsed as NY local time

────────────────────────────────────────
8) ANALYSIS BOUNDARIES
────────────────────────────────────────
Allowed:
- Identify liquidity, MSS, displacement, FVG only within provided windows.

Not allowed:
- Claim levels/raids beyond provided history window.
- Assume HTF above Daily (no Weekly/Monthly data provided).

---

## 1) Logic

### 1.1 Compile Order

# ICT Analysis Compile Order
Version: 1.0
Authority: HARD RULE
Source: Derived exclusively from KB concepts

The system MUST evaluate market data in the following order.
No step may be skipped or reordered.

────────────────────────────────

## STEP 1 — Top-Down Timeframe Bias
(KB: Top-Down Timeframe Bias)

- Establish HTF bias using Daily → H1
- Bias must be Bullish, Bearish, or Neutral
- Bias is defined by expansion, range, or consolidation

If HTF bias is Neutral → analysis may continue but execution is restricted

────────────────────────────────

## STEP 2 — Institutional Price Framework
(KB: Institutional Price Levels, Power of Three)

- Identify dealing range high / low
- Identify equilibrium (50%)
- Classify accumulation / manipulation / distribution phase

────────────────────────────────

## STEP 3 — Liquidity Landscape
(KB: Liquidity, Internal Range Liquidity)

- Identify Buy-Side Liquidity (BSL)
- Identify Sell-Side Liquidity (SSL)
- Identify internal liquidity pools within range

────────────────────────────────

## STEP 4 — Premium & Discount Validation
(KB: Premium & Discount)

- Longs permitted only below equilibrium
- Shorts permitted only above equilibrium

────────────────────────────────

## STEP 5 — Session Context
(KB: Session-Based Liquidity)

- Determine active session (Asia / London / New York)
- Liquidity events outside active sessions are deprioritized

────────────────────────────────

## STEP 6 — Liquidity Event Detection
(KB: Liquidity)

- Confirm whether BSL or SSL has been raided
- Raid must show clear sweep beyond a defined level

────────────────────────────────

## STEP 7 — Intraday Structure Confirmation
(KB: Market Structure Shift – Intraday)

- Confirm MSS after liquidity raid
- MSS must align with HTF bias

────────────────────────────────

## STEP 8 — Displacement & Imbalance
(KB: Fair Value Gap, Market Efficiency Paradigm)

- Confirm displacement candle
- Identify valid FVG supporting direction

────────────────────────────────

## STEP 9 — Execution Model Eligibility
(KB: Order Block, High-Frequency Algorithmic Structure)

- Confirm valid PD array (OB, FVG, IRL)
- No hybrid or undefined models allowed

────────────────────────────────

## STEP 10 — Target Selection
(KB: Target Selection – Low-Hanging Fruit)

- Select nearest opposing liquidity
- Extended projections are disallowed

────────────────────────────────

## STEP 11 — Invalidation Check
(KB: All)

- Apply invalidation rules
- If invalid → collapse analysis


### 1.2 State Machine

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


### 1.3 Invalidation Rules

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

---

## 2) Concepts

### Economic Calendar as Volatility Catalyst

Economic Calendar as Volatility Catalyst (News Embargo Framework)
Canonical Definition

The Economic Calendar acts as a scheduled volatility catalyst, where price often compresses or repositions ahead of high-impact events and expands directionally once the news embargo lifts.

Identification Criteria

Scheduled economic releases listed on a public economic calendar.

Events classified by impact level (low, medium, high).

Specific release times aligned to New York local time.

Explicit Rules (From Sources)

Traders must consult an economic calendar prior to trading to avoid unexpected volatility.
(Source: Episode 10)

The 08:30 NY time release window is the primary news embargo lift for U.S. equities and indices.
(Source: Episode 10)

High-impact news can be used as a smokescreen or catalyst for directional price delivery.
(Source: Episode 10)

Price often builds up or drops immediately before a scheduled report, with the real move occurring after release.
(Source: Episode 10)

Not all scheduled events are heavy hitters, but most materially affect stock indices.
(Source: Episode 10)

High-impact and medium-impact economic news determine which markets are tradable on a given day.
(Source: Episode 40)

Markets without a calendar catalyst often exhibit:

low range, or

unreliable setups.
(Source: Episode 40)

Trading focus should be restricted to markets with scheduled volatility, not all instruments.
(Source: Episode 40)

Implied Conditions (Clearly Inferred)

Volatility expansion following news is often aligned with pre-existing daily bias.
(Source: Episode 10 — CLEAR INFERENCE)

News releases are frequently used to justify liquidity runs rather than to change bias.
(Source: Episode 10 — CLEAR INFERENCE)

Validity Conditions

Applies only when:

A scheduled event exists.

The trader is operating during affected sessions (London / New York).

Intraday setups are favored when:

HTF bias exists, and

a calendar catalyst aligns with Kill Zones.
(Source: Episode 40)

Invalidation / Failure Conditions

Not explicitly defined in available sources.

What This Concept Is NOT

Not a fundamental analysis framework.

Not predictive of bullish or bearish direction by itself.

Not a reason to trade solely based on news data.

News is not traded directionally by fundamentals.

News is used only as a timing catalyst.
(Source: Episode 40)

Ambiguities / Conflicts

No quantitative volatility thresholds are defined for “high impact.”
(Source: Episode 10)

Source Log

2022 ICT Mentorship — Episode 10 — economic calendar usage and news embargo behavior
Episode 40 — calendar-driven market selection

---

### Fair Value Gap (Imbalance)

Fair Value Gap (Imbalance)
Canonical Definition

A Fair Value Gap is a price imbalance created when a single candle moves without overlap between the previous candle’s high and the next candle’s low.

A single impulsive candle creating inefficiency qualifies as an imbalance.

Rebalancing that inefficiency creates an intermediate-term swing point.
(Source: Episode 12)

Identification Criteria

One-directional candle.

No overlap between adjacent candles.

Forms immediately after a market structure break.

Clarified that a Fair Value Gap is defined using a three-candle sequence, where:

The middle candle delivers displacement

The gap exists between the prior candle’s high and the subsequent candle’s low
(Source: Episode 6)

Fair Value Gaps may be identified on lower timeframes (5m–1m) within a higher-timeframe price leg.
(Source: Episode 8)

An imbalance may coexist with a price gap, reinforcing inefficiency.
(Source: Episode 22)

Imbalance relevance is evaluated by body interaction, not wick extremes, during volatility.
(Source: Episode 23)

The Fair Value Gap is measured from the displacement leg, not from arbitrary candles.
(Source: Episode 24)

FVG relevance is assessed relative to the most recent liquidity event (sell-side or buy-side taken).
(Source: Episode 26)

“Close proximity” interaction with an imbalance is acceptable when price does not fully rebalance the gap.
(Source: Episode 29)

Imbalance relevance is assessed in context of the most recent liquidity event (e.g., lunch-hour sweep).
(Source: Episode 30)

FVG relevance is confirmed when followed by:

a swing formation, and

continuation toward the higher-timeframe liquidity objective.
(Source: Episode 31)

Imbalances may appear only on lower timeframes (e.g., 5-minute) and still govern delivery.
(Source: Episode 33)

An imbalance’s relevance is confirmed when price:

trades away impulsively, then

returns to the imbalance before expanding again.
(Source: Episode 34)

Imbalance relevance increases when it aligns with:

prior liquidity clearance, and

premium/discount context.
(Source: Episode 36)

Fair Value Gaps identified on the daily timeframe remain relevant when transposed to lower timeframes.
(Source: Episode 37)

A Fair Value Gap is contextualized by:

premium/discount relative to the active dealing range, and

proximity to liquidity pools.
(Source: Episode 38)

Fair Value Gaps are most actionable when aligned with:

session timing, and

liquidity objectives beyond the gap.
(Source: Episode 39)

Explicit Rules (From Sources)

Fair Value Gaps are used as entry delivery zones after a break in market structure.
(Source: 2022 ICT Mentorship — Episode 2)

Price often retraces into the imbalance before continuing.
(Source: 2022 ICT Mentorship — Episode 2)

A Fair Value Gap must exist between the candle high preceding displacement and the candle low following it.
(Source: 2022 ICT Mentorship — Episode 4)

If no Fair Value Gap forms after a swing violation, no trade setup exists.
(Source: 2022 ICT Mentorship — Episode 4)

Fair Value Gaps are evaluated only after displacement, not before.
(Source: Episode 5)

If price retraces into an FVG created by displacement, it qualifies as a valid delivery zone.
(Source: Episode 5)

A Fair Value Gap must result from energetic displacement, not gradual price movement.
(Source: Episode 6)

Lower-timeframe FVGs are valid only when aligned with higher-timeframe bias and session timing.
(Source: Episode 8)

Fair Value Gaps created during manipulation phases often serve as support during distribution.
(Source: Episode 9)

Fair Value Gaps act as precision entry zones when aligned with:

Prior swing highs

Market structure

Liquidity draw
(Source: Episode 11)

Entry into an FVG does not require price to reach the extreme of the range.
(Source: Episode 11)

Price often returns to rebalance an imbalance before continuing toward liquidity.
(Source: Episode 12)

Imbalances exist across all timeframes and form fractal relationships.
(Source: Episode 12)

Price does not always fully rebalance a Fair Value Gap before continuing toward its liquidity objective.
(Source: Episode 13)

Shallow retracements into an FVG can be sufficient for continuation.
(Source: Episode 13)

A Fair Value Gap can be used as a limit-entry reference after a confirmed market structure shift.
(Source: Episode 14)

Closure or partial closure of a Fair Value Gap often precedes directional continuation.
(Source: Episode 14)

An imbalance is considered complete only after the displacement candle closes.
(Source: Episode 15)

Price may overshoot the low boundary of an imbalance intraday without invalidating it, when evaluated within a higher-timeframe bullish narrative.
(Source: Episode 15)

Higher-timeframe Fair Value Gaps provide context, even when lower-timeframe imbalances appear noisy.
(Source: Episode 16)

Lower-timeframe FVGs must be interpreted within the higher-timeframe narrative.
(Source: Episode 16)

Partial fills of an imbalance may be sufficient prior to continuation toward liquidity in FX.
(Source: Episode 17)

Higher-timeframe imbalances act as parent PD arrays to lower-timeframe imbalances.
(Source: Episode 18)

Lower-timeframe Fair Value Gaps are only actionable when aligned with the higher-timeframe imbalance narrative.
(Source: Episode 18)

Lower-timeframe FVGs must align with session manipulation phase to be actionable.

Session context governs relevance.

(Source: Episode 19)

A Fair Value Gap is not actionable until price has clearly displaced away from it.
(Source: Episode 20)

Immediate re-entry into an imbalance without displacement does not qualify as valid delivery.
(Source: Episode 20)

Multiple candles may trade inside an imbalance without invalidating it, provided the bodies remain within the gap.
(Source: Episode 22)

Wicks probing beyond an imbalance boundary are permissible price action.
(Source: Episode 22)

During high-volatility events (e.g., FOMC), price may dip slightly beyond an imbalance boundary without invalidating it, provided candle bodies respect the imbalance.
(Source: Episode 23)

An imbalance can act as a staging area prior to continuation toward a higher-timeframe liquidity objective.
(Source: Episode 23)

Fair Value Gaps are only considered after a valid Market Structure Shift.
(Source: Episode 24)

An imbalance defines the area where a setup may form, not a guaranteed trade.
(Source: Episode 24)

The Fair Value Gap is the primary focal point of the simplified model taught in the mentorship.
(Source: Episode 25)

FVGs are evaluated only after displacement and within the correct time window.
(Source: Episode 25)

Re-entry back into a Fair Value Gap after a liquidity run supports continuation toward opposing liquidity, not immediate reversal.
(Source: Episode 26)

Interaction with an FVG can be brief and partial; full rebalancing is not required.
(Source: Episode 26)

Fair Value Gaps can be used in counter-trend contexts when aligned with:

Liquidity draw, and

Discount / Premium location.
(Source: Episode 27)

Counter-trend FVGs are treated as short-term retracement opportunities, not directional bias changes.
(Source: Episode 27)

A Fair Value Gap is only actionable after a valid Market Structure Shift.
(Source: Episode 29)

Multiple candles may provide repeated opportunities within or near a Fair Value Gap.
(Source: Episode 29)

An imbalance below relative equal lows can serve as a collection area during manipulation prior to expansion.
(Source: Episode 30)

Price may not fully trade into an imbalance before continuation; partial interaction is sufficient.
(Source: Episode 30)

Fair Value Gaps are used beyond session opens; lack of a setup at the open does not invalidate the model.
(Source: Episode 31)

An imbalance may only become visible when zooming into lower timeframes, yet still governs delivery.
(Source: Episode 31)

Small Fair Value Gaps forming inside a choppy dealing range may fail to produce follow-through.
(Source: Episode 32)

Lack of displacement following an imbalance signals low expectancy conditions.
(Source: Episode 32)

A Fair Value Gap becomes actionable only after a qualifying liquidity event (e.g., short-term low or prior daily low taken).
(Source: Episode 33)

Fair Value Gaps are preferred over “old lows / highs” as reference levels; without an imbalance, the level is not trusted.
(Source: Episode 33)

Fair Value Gaps can form:

after a sell-side run, and

act as supportive price zones during accumulation prior to expansion.
(Source: Episode 34)

Price may return to the exact level of a prior imbalance (high or low) with high precision before continuing.
(Source: Episode 34)

A Fair Value Gap may be revisited multiple times during accumulation before expansion.
(Source: Episode 35)

Partial re-entry into an imbalance is sufficient to maintain validity.
(Source: Episode 35)

Imbalances often function as compression zones prior to expansion during news-driven sessions.
(Source: Episode 35)

Fair Value Gaps formed after a Market Structure Shift act as re-entry zones during retracement.
(Source: Episode 36)

Price may trade partially into an imbalance before resuming delivery; full rebalancing is not required.
(Source: Episode 36)

Price may work inside a higher-timeframe Fair Value Gap for multiple sessions before resuming expansion.
(Source: Episode 37)

A Fair Value Gap can act as support during a retracement prior to continuation in the direction of the prevailing bias.
(Source: Episode 37)

Repeated testing of a Fair Value Gap does not invalidate it, provided displacement continues to respect it.
(Source: Episode 37)
Fair Value Gaps can exist simultaneously on multiple timeframes (daily, 15-minute, 5-minute), and lower-timeframe gaps must be interpreted within higher-timeframe gaps.
(Source: Episode 38)

Price may:

trade into a higher-timeframe Fair Value Gap,

form a lower-timeframe Fair Value Gap inside it, and

use that nested imbalance as the basis for continuation.
(Source: Episode 38)

Fair Value Gaps do not need to fully rebalance to remain valid.
(Source: Episode 38)

Fair Value Gaps act as magnets for repricing, not guaranteed reversal points.
(Source: Episode 39)

A Fair Value Gap may remain valid even after multiple partial fills, provided displacement persists.
(Source: Episode 39)

Lower-timeframe Fair Value Gaps are subordinate to higher-timeframe Fair Value Gaps.
(Source: Episode 39)

Fair Value Gaps are evaluated within premium/discount context of the active dealing range.
(Source: Episode 40)

Overlapping Fair Value Gaps with equilibrium are lower-priority arrays.
(Source: Episode 40)

Fair Value Gaps function as price delivery mechanisms, not entry guarantees.
(Source: Episode 40)

When multiple Fair Value Gaps exist, larger-timeframe gaps take precedence over smaller ones.
(Source: Episode 41)

Price may:

overrun a smaller Fair Value Gap

to rebalance into a larger Fair Value Gap beyond it.
(Source: Episode 41)

A Fair Value Gap remains valid when price closes inside it and later re-expands.
(Source: Episode 41)


Implied Conditions (Clearly Inferred)

Fair Value Gaps are algorithmically rebalanced for efficient price delivery.
(Source: 2022 ICT Mentorship — Episode 2)

Strong displacement candles formed immediately after news releases frequently create Fair Value Gaps.
(Source: Episode 10 — CLEAR INFERENCE)

Narrative context governs tolerance for minor intraday violations around imbalance boundaries.
(Source: Episode 15 — CLEAR INFERENCE)

Validity Conditions

Occurs most frequently on lower timeframes (1m–3m) in indices.

Fair Value Gaps are evaluated relative to the current defined range and its equilibrium.
(Source: 2022 ICT Mentorship — Episode 4)

An imbalance must form after a liquidity run and in alignment with directional bias.
(Source: Episode 25)

Invalidation / Failure Conditions

Not explicitly defined in available sources.

What This Concept Is NOT

Not supply/demand zones.

Not gaps caused by illiquidity between sessions.

Not every gap or inefficiency qualifies as an FVG without displacement.
(Source: Episode 5)

Wick-only inefficiencies or slow grind price action do not qualify as Fair Value Gaps.
(Source: Episode 6)

Not all imbalances are tradeable; context determines relevance.
(Source: Episode 18)

Not every Fair Value Gap is tradable.
(Source: Episode 24)

Not every imbalance is tradable.

Not valid outside time-based context.
(Source: Episode 25)

Not required to achieve perfect precision.
(Source: Episode 29)

The presence of an imbalance alone does not imply a valid setup.
(Source: Episode 32)

Not support/resistance.

Not valid without displacement.
(Source: Episode 33)

Not all imbalances require full rebalancing.

Not every imbalance implies immediate continuation.
(Source: Episode 34)
Imbalances are not guaranteed turning points.

Full rebalancing is not required.
(Source: Episode 35)

FVGs are not entry signals by themselves.

FVGs do not require full rebalancing.
(Source: Episode 40)

Smaller Fair Value Gaps are not always defended.
(Source: Episode 41)

Ambiguities / Conflicts

No explicit rule for minimum size or candle count.
(Source: 2022 ICT Mentorship — Episode 2)

Source Log

Episode 6 — three-candle FVG clarification and displacement requirement

2022 ICT Mentorship — Episode 2 — first formal FVG definition

2022 ICT Mentorship — Episode 4 — FVG as mandatory condition reinforced
Episode 8 — LTF FVG alignment rules
Episode 9 — FVG role inside Power of Three
Episode 10 — news-induced imbalance creation
Episode 11 — FVG precision usage
Episode 12 — imbalance → structure relationship
Episode 13 — partial FVG rebalancing behavior
Episode 14 — FVG entry and continuation behavior
Episode 15 — FVG completion and tolerance clarification
Episode 16 — HTF vs LTF imbalance alignment
Episode 18 — HTF → LTF imbalance hierarchy
Episode 17 — partial FVG behavior in FX
Episode 20 — displacement requirement for FVG validity
Episode 22 — imbalance tolerance and body priority
Episode 23 — imbalance behavior under volatility
Episode 24 — FVG as conditional setup location
Episode 25 — FVG as centerpiece of the model
Episode 26 — FVG used after liquidity raid
Episode 27 — FVG usage in counter-trend conditions
Episode 29 — repeated FVG interaction and proximity logic
Episode 30 — imbalance used during manipulation phase
Episode 31 — FVG usage outside opening window
Episode 32 — FVG unreliability inside chop
Episode 33 — FVG required after liquidity run, rejection of S/R framing
Episode 34 — precise imbalance interaction and re-engagement
Episode 35 — repeated and partial FVG interaction
Episode 36 — FVG used after MSS and liquidity run
Episode 37 — multi-session interaction with HTF FVG
Episode 38 — nested HTF/LTF FVG interaction
Episode 39 — HTF FVG as afternoon draw
Episode 40 — FVG hierarchy and discount context
Episode 41 — HTF FVG priority and overrun behavior

---

### High-Frequency Algorithmic Structure (Lower Timeframes)

High-Frequency Algorithmic Structure (Lower Timeframes)
Canonical Definition

High-frequency algorithmic structure refers to the use of very short-term market structure (1m–3m and sub-minute) to engineer liquidity and delivery.

Identification Criteria

Swing highs/lows on 1m–3m charts.

Rapid stop runs followed by immediate reversals.

Frequent Fair Value Gap formation.

Explicit Rules (From Sources)

High-frequency algorithms operate primarily on 1m–3m and sub-minute intervals.
(Source: 2022 ICT Mentorship — Episode 3)

Structural signals on these timeframes are valid only in proper liquidity context.
(Source: 2022 ICT Mentorship — Episode 3)

Implied Conditions (Clearly Inferred)

Lower timeframe precision is a refinement, not a replacement, for higher-timeframe bias.
(Source: 2022 ICT Mentorship — Episode 3)

Validity Conditions

Requires alignment with session timing and liquidity conditions.

Invalidation / Failure Conditions

Not explicitly defined in available sources.

What This Concept Is NOT

Not indicator-based scalping.

Not volume-based analysis.

Ambiguities / Conflicts

Exact sub-minute intervals are referenced but not formalized.
(Source: 2022 ICT Mentorship — Episode 3)

Source Log

2022 ICT Mentorship — Episode 3 — algorithmic timeframe emphasis

---

### Institutional Price Levels

Institutional Price Levels (Big Figures)
Canonical Definition

Institutional Price Levels are standardized price increments (notably big figures and their subdivisions) where liquidity commonly concentrates and price frequently reacts.

Identification Criteria

Big figures (e.g., 1.09, 109.00).

Sub-levels commonly referenced as 00, 20, 50, 80 within the big figure.

Explicit Rules (From Sources)

Big figures attract liquidity due to concentration of commercial and institutional activity.
(Source: Episode 17)

Relative equal highs/lows forming near big figures often mark sell-side or buy-side liquidity.
(Source: Episode 17)

Price frequently respects bodies near big figures even if wicks probe slightly beyond.
(Source: Episode 17)

Big figures (e.g., 4100, 4070, 4400) act as liquidity magnets, not support/resistance.
(Source: Episode 39)

What This Concept Is NOT (Append)

Big figures are not reversal guarantees.
(Source: Episode 39)

Implied Conditions (Clearly Inferred)

Liquidity objectives commonly align with big figures during daily expansions.
(Source: Episode 17 — CLEAR INFERENCE)

Validity Conditions

Applies across FX and indices.

Most effective when aligned with session timing and prevailing bias.

Invalidation / Failure Conditions

Not explicitly defined in available sources.

What This Concept Is NOT

Not Fibonacci levels.

Not indicator-derived support/resistance.

Ambiguities / Conflicts

Exact tick/pip tolerance around each level is not quantitatively defined.
(Source: Episode 17)

Source Log

2022 ICT Mentorship — Episode 17 — big figures and institutional levels
Episode 39 — 4100 / 4070 liquidity framing

---

### Intermarket Confluence

Intermarket Confluence (Index Correlation Framework)
Canonical Definition

Intermarket Confluence describes the use of correlated markets (e.g., NASDAQ, S&P, Dow) to confirm or invalidate anticipated price delivery through relative strength, weakness, or non-confirmation at key liquidity levels.
Intermarket Confluence describes how correlated or inversely correlated markets (e.g., Dollar Index vs FX pairs or equity indices) provide confirmation or invalidation of directional bias.

Identification Criteria

One index takes liquidity while another does not.

Correlated markets diverge near prior highs or lows.

Relative unwillingness of one market to deliver to a liquidity level.

In currency pairs, directional bias is derived from relative strength and weakness of the component currencies.
(Source: Episode 8)

A currency pair is expected to rise when the base currency is strong and the quote currency is weak.
(Source: Episode 8)

Explicit Rules (From Sources)

Correlated indices generally move in tandem, but temporary divergence can signal accumulation or distribution.
(Source: Episode 7)

A market’s unwillingness to make a lower low while correlated markets do so can confirm a bullish shift.
(Source: Episode 7)

Intermarket confirmation is used after liquidity events, not in isolation.
(Source: Episode 7)

Intermarket confluence applies to Forex by decomposing the pair into its two component instruments.
(Source: Episode 8)

Confirmation can be obtained by observing Euro futures for Euro pairs and corresponding Yen behavior for Yen crosses.
(Source: Episode 8)

Confirmation can be obtained by observing correlated indices delivering in the same direction.
(Source: Episode 14)

In Forex, intermarket confirmation is achieved by decomposing a pair into base and quote currencies and assessing relative strength/weakness.
(Source: Episode 17)

Forex pairs must be evaluated against a barometer market (e.g., Dollar Index) to confirm or invalidate apparent breakouts.
(Source: Episode 20)

Inverted relationships (e.g., USD ↔ EUR) allow one market’s liquidity objective to confirm another market’s reversal.
(Source: Episode 20)

Rising Dollar Index reflects risk-off conditions, generally pressuring risk assets lower.
(Source: Episode 21)

Declining Dollar Index reflects risk-on conditions, generally supporting risk assets.
(Source: Episode 21)

Forex pairs should be evaluated relative to Dollar Index direction for sustained moves.
(Source: Episode 21)

Equity indices often move inversely to the Dollar Index during risk-off phases.
(Source: Episode 21)

SMT divergence occurs when one correlated index makes a higher high while the other fails to do so.
(Source: Episode 22)

Such divergence often signals distribution rather than continuation.
(Source: Episode 22)

SMT (Smart Money Technique) is identified when:

One correlated market (e.g., NASDAQ) makes a lower low,

While another correlated market (e.g., S&P) fails to do so.
(Source: Episode 29)

SMT divergence supports directional bias validation, not precise timing.
(Source: Episode 29)

SMT divergence is most reliable when observed:

near 08:30 or 09:30 NY, and

after an early session price run.
(Source: Episode 35)

SMT is used to confirm bias, not to predict direction in isolation.
(Source: Episode 35)

SMT divergence is most meaningful when observed:

at or near discount pricing, and

during a liquidity sweep on one correlated market that is not confirmed by another.
(Source: Episode 38)

SMT is used to confirm accumulation or distribution, not to define entries.
(Source: Episode 38)

Intermarket analysis is used to:

confirm directional bias, and

select the stronger or weaker correlated instrument.
(Source: Episode 40)

When one correlated market fails to make a lower low while another does, the relative strength leader is preferred.
(Source: Episode 40)

Implied Conditions (Clearly Inferred)

Intermarket divergence provides confirmation of an already-established narrative.
(Source: Episode 7 — CLEAR INFERENCE)

Validity Conditions

Requires at least two correlated markets.

Requires alignment with time-of-day and liquidity context.

Intermarket analysis is most effective when both markets reach opposing liquidity objectives simultaneously.
(Source: Episode 20)

Intermarket signals are strongest when both markets reach or react from liquidity objectives concurrently.
(Source: Episode 21)

Invalidation / Failure Conditions

Not explicitly defined in available sources.

What This Concept Is NOT

Not indicator-based divergence.

Not a standalone entry signal.

Not predictive by itself.

Not exotic-pair prediction without component confirmation.
(Source: Episode 8)

Not an indicator.

Not a standalone entry signal.
(Source: Episode 29)

SMT is not constant.

SMT signals can disappear as markets realign.
(Source: Episode 35)

SMT is not predictive in isolation.
(Source: Episode 38)

Intermarket confluence is not correlation trading.

It is not predictive in isolation.
(Source: Episode 40)

Ambiguities / Conflicts

Degree and duration of divergence are not quantitatively defined.
(Source: Episode 7)

Source Log

2022 ICT Mentorship — Episode 7 — intermarket confirmation and divergence explanation
Episode 8 — forex application via currency components
Episode 14 — ES confirming NQ delivery
Episode 17 — FX component confirmation
Episode 20 — Dollar Index vs Euro inversion logic
Episode 21 — Dollar Index as risk barometer
Episode 22 — SMT confirmation via index divergence
Episode 29 — NASDAQ vs S&P SMT divergence example
Episode 35 — SMT timing and reliability constraints
Episode 38 — SMT confirmation during discount-based accumulation
Episode 40 — CAD vs indices / FX intermarket framing

---

### Internal Range Liquidity

Internal Range Liquidity
Canonical Definition

Internal Range Liquidity refers to short-term liquidity pools (stops or imbalances) that form inside an existing price leg, as opposed to external range highs or lows.

Identification Criteria

Short-term swing highs or lows within a retracement.

Fair Value Gaps formed inside a larger price leg.

Relative equal highs/lows internal to the session range.

Internal range liquidity includes partial retracements and mid-range liquidity pools, not only equal highs/lows.
(Source: Episode 6)

Explicit Rules (From Sources)

Internal range liquidity consists of short-term highs or lows inside a price leg that contain buy-side or sell-side stops.
(Source: 2022 ICT Mentorship — Episode 3)

Internal liquidity is often targeted after an external liquidity run.
(Source: 2022 ICT Mentorship — Episode 3)

Internal range liquidity can be identified using the most recent low-to-high range, even when external session highs/lows are not in play.
(Source: 2022 ICT Mentorship — Episode 4)

Relative equal highs or lows within the current range qualify as internal liquidity targets.
(Source: 2022 ICT Mentorship — Episode 4)

Prolonged consolidation around equilibrium reflects internal liquidity recycling.
(Source: Episode 7)

Relative equal highs or lows formed during accumulation represent liquidity targets for manipulation.
(Source: Episode 9)

Equal highs or lows formed during consolidation represent internal liquidity recycling, not directional intent.
(Source: Episode 11)

Equal highs/lows inside consolidation often represent internal liquidity, not trend intent.
(Source: Episode 12)

Implied Conditions (Clearly Inferred)

Internal range liquidity provides intermediate objectives during intraday delivery.
(Source: 2022 ICT Mentorship — Episode 3)

Relative equal highs/lows formed repeatedly indicate retail positioning and buildup of internal liquidity.
(Source: Episode 5)

Three-drive patterns contribute to internal liquidity formation.
(Source: Episode 5)

Internal liquidity is commonly cleared before price seeks external range liquidity.
(Source: Episode 6 — CLEAR INFERENCE)

Validity Conditions

Internal range liquidity is evaluated after defining the current range using the most recent significant low and high.
(Source: 2022 ICT Mentorship — Episode 4)

Requires a clearly defined external range or prior impulse leg.

Invalidation / Failure Conditions

Not explicitly defined in available sources.

What This Concept Is NOT

Not external session highs or lows.

Not higher-timeframe liquidity pools.

Ambiguities / Conflicts

No formal hierarchy between internal liquidity types (stops vs imbalance).
(Source: 2022 ICT Mentorship — Episode 3)

Source Log

2022 ICT Mentorship — Episode 3 — internal range liquidity defined
2022 ICT Mentorship — Episode 4 — internal range examples and refinement
Episode 5 — equal highs/lows and three-drive explanation
Episode 6 — internal vs external liquidity sequencing
Episode 7 — equilibrium consolidation behavior
Episode 9 — accumulation-phase liquidity
Episode 11 — consolidation liquidity behavior
Episode 12 — internal liquidity during consolidation

---

### Liquidity

Liquidity (Buy-Side / Sell-Side)
Canonical Definition

Liquidity refers to resting stop orders above prior highs (buy-side liquidity) and below prior lows (sell-side liquidity) that price is algorithmically drawn toward.

Identification Criteria

Prior swing highs indicate locations of buy stops.

Prior swing lows indicate locations of sell stops.

Consolidation followed by expansion increases probability of a liquidity draw.

Explicit Rules (From Sources)

Markets draw to one of two things: liquidity (stops) or imbalance.
(Source: 2022 ICT Mentorship — Episode 2)

Buy stops rest above old highs; sell stops rest below old lows.
(Source: 2022 ICT Mentorship — Episode 2)

Liquidity is engineered before large directional moves.
(Source: 2022 ICT Mentorship — Episode 2)

Sell-side liquidity below prior daily lows remains a valid draw even after extended consolidation.
(Source: Episode 11)

Buy-side liquidity above relative equal highs serves as a primary draw during bullish expansions.
(Source: Episode 13)

Buy-side liquidity above prior relative highs remains a valid draw even after short-term consolidation.
(Source: Episode 14)

Sell-side liquidity commonly rests below the most recent short-term swing low immediately following a bullish structure shift.
(Source: Episode 15)

Liquidity may be taken before price delivers into an imbalance.
(Source: Episode 15)

Relative equal highs/lows remain valid liquidity pools even after partial runs earlier in the day.
(Source: Episode 16)

PM-session liquidity often forms from the most energetic AM-session swing.
(Source: Episode 16)

Previous daily highs and lows act as primary liquidity pools targeted by algorithms.
(Source: Episode 18)

Liquidity pools remain valid even after partial raids.
(Source: Episode 18)

Relative Equal Highs / Lows reaffirmed as primary, easiest-to-identify liquidity pools.

Old highs/lows remain valid regardless of partial raids.

(Source: Episode 19)

Relative equal highs and prior weekly highs act as high-probability liquidity pools.
(Source: Episode 20)

Liquidity runs may present as false breakouts when contradicted by intermarket context.
(Source: Episode 20)

Relative equal highs/lows on the daily timeframe serve as primary liquidity objectives.
(Source: Episode 21)

Liquidity objectives remain valid until clearly violated or fully displaced through.
(Source: Episode 21)

Relative equal highs and relative equal lows on the daily timeframe represent high-visibility liquidity pools frequently targeted by algorithms.
(Source: Episode 22)

Liquidity below relative equal lows often serves as the primary draw during bearish daily narratives.
(Source: Episode 22)

Sweep vs Run distinction:

Sweep: brief probe beyond a high/low followed by reversal back into range.

Run: price trades through a prior high/low and continues without immediate reversal.
(Source: Episode 23)

Relative equal highs are considered run targets when expansion is expected.
(Source: Episode 23)

Relative Equal Highs / Lows are the primary external liquidity objectives used to frame setups.
(Source: Episode 24)

Liquidity above relative equal highs is often targeted before bearish delivery.
(Source: Episode 24)

In a bearish bias, price typically seeks buy-side liquidity first (premium) before expanding toward sell-side liquidity (discount).
(Source: Episode 25)

Relative equal highs are commonly used as liquidity inducement prior to bearish expansion.
(Source: Episode 25)

Sell-side liquidity resting below prior daily lows serves as the offset pool for short positioning.
(Source: Episode 25)

Sell-side liquidity is considered “taken” when price trades below relative equal lows and does not immediately reclaim them.
(Source: Episode 26)

After sell-side liquidity is taken, buy-side liquidity above relative highs becomes the next primary draw, even when trading counter to the daily bias.
(Source: Episode 26)

A counter-trend move is often driven by external liquidity (e.g., relative equal highs) rather than trend continuation.
(Source: Episode 27)

Liquidity objectives do not need to be reached for a valid counter-trend expansion to occur.
(Source: Episode 27)

Relative Equal Highs on the daily timeframe serve as primary draw-on-liquidity levels when a bullish bias is present.
(Source: Episode 29)

Liquidity objectives may be framed days in advance and remain valid until reached or clearly invalidated.
(Source: Episode 29)

Relative Equal Highs act as pre-identified draw-on-liquidity, even if price initially falls short before reversing.
(Source: Episode 30)

Buy stops from breakout participation can be triggered and reversed against prior to the real move toward the higher-timeframe liquidity objective.
(Source: Episode 30)

After sell-side liquidity (e.g., lunch lows) is taken, short positions may be squeezed, accelerating price toward buy-side liquidity.
(Source: Episode 30)

Prior daily lows (e.g., May 16, 2022 low) act as clearly defined sell-side liquidity objectives when price trades above them.
(Source: Episode 31)

Drawing attention to a prior low while price is trading above it implies expectation of liquidity delivery, not support.
(Source: Episode 31)

Relative Equal Highs serve as buy-side liquidity that can be intentionally targeted late in the session to induce breakout participation.
(Source: Episode 32)

A run above relative equal highs late in the day often functions as liquidity inducement, not continuation.
(Source: Episode 32)

Sell-side liquidity can be engineered after buy-side inducement, even if the higher-timeframe low is not fully reached.
(Source: Episode 32)

Prior daily lows (e.g., May 12, 2022 low) function as explicit sell-side liquidity objectives when price consolidates above them.
(Source: Episode 33)

Liquidity objectives must be taken before lower-timeframe setups are considered valid.
(Source: Episode 33)

A break below a clearly defined short-term low is required to confirm willingness to seek deeper sell-side liquidity.
(Source: Episode 33)

Relative Equal Highs formed intraday act as buy-side liquidity pools, even when the broader environment is consolidative.
(Source: Episode 34)

A run toward buy-side liquidity may require:

an initial sell-side liquidity run, followed by

re-accumulation and expansion higher.
(Source: Episode 34)

Prior short-term highs may act as interim liquidity objectives when higher-timeframe targets remain active.
(Source: Episode 34)

Relative Equal Highs act as valid buy-side liquidity objectives even when:

price initially fails to reach them, and

later returns to complete delivery.
(Source: Episode 35)

Liquidity objectives may be reached in staged deliveries, not a single impulse.
(Source: Episode 35)

Relative Equal Lows represent sell-side liquidity that may be taken in rapid succession before reversal or expansion.
(Source: Episode 36)

Clearing sell-side liquidity often precedes:

a Market Structure Shift, and

subsequent expansion toward buy-side liquidity.
(Source: Episode 36)

Morning highs frequently serve as draw-on-liquidity objectives once sell-side is cleared.
(Source: Episode 36)

Short-term highs act as immediate buy-side liquidity objectives following a retracement from a higher-timeframe Fair Value Gap.
(Source: Episode 37)

Relative Equal Highs above short-term highs serve as subsequent buy-side liquidity objectives if acceleration occurs.
(Source: Episode 37)

Liquidity objectives may be anticipated and studied even when not immediately reached.
(Source: Episode 37)

A failed draw on liquidity (e.g., an anticipated sell-side level not reached) does not invalidate the trading day; it requires bias reassessment.
(Source: Episode 38)

Relative Equal Lows may be taken repeatedly without follow-through, indicating absorption rather than continuation.
(Source: Episode 38)

Previous Day’s High functions as a valid buy-side liquidity objective when price remains within a higher-timeframe Fair Value Gap.
(Source: Episode 38)

Liquidity objectives must be identified before the session opens, not retroactively.
(Source: Episode 39)

Multiple successive sell-side runs without displacement away indicate absorption, increasing likelihood of a buy-side run.
(Source: Episode 39)

Liquidity pools exist at:

Relative equal highs/lows

Prior session highs/lows

Big figures (e.g., 4100)
(Source: Episode 39)

Liquidity objectives are defined before the session begins, based on:

prior highs/lows,

relative equal highs/lows,

Fair Value Gaps, and

institutional price levels.
(Source: Episode 40)

Liquidity runs may occur:

before the news release, or

at the news release.
(Source: Episode 40)

Liquidity may be taken:

before a targeted PD array is reached, or

after a prolonged consolidation, without invalidating the objective.
(Source: Episode 41)

Failure to reach a specific anticipated level does not negate the broader liquidity narrative.
(Source: Episode 41)

Implied Conditions (Clearly Inferred)

Liquidity runs often precede reversals when aligned with higher-timeframe bias.
(Source: 2022 ICT Mentorship — Episode 2)

Breaks below relative equal lows often invite breakout participation that provides sell-side liquidity.
(Source: Episode 22 — CLEAR INFERENCE)

A lack of downside follow-through after sell-side is taken increases the likelihood of reversion toward buy-side liquidity.
(Source: Episode 26 — CLEAR INFERENCE)

Validity Conditions

Most relevant when price is consolidating or approaching prior highs/lows.

Liquidity targeting is valid only when aligned with time-of-day expectations.
(Source: Episode 39)

Invalidation / Failure Conditions

Not explicitly defined in available sources.

What This Concept Is NOT

Not buying/selling pressure.

Not supply and demand zones.

Not retail resistance or breakout confirmation.
(Source: Episode 20)

Liquidity runs are not entries by themselves.
(Source: Episode 24)

Not support/resistance.

Not retail breakout logic.
(Source: Episode 25)

Counter-trend liquidity draws are not trend reversals by default.
(Source: Episode 27)

Liquidity framing is not dependent on intraday volatility or constant participation.
(Source: Episode 29)

Not resistance/support logic.

Not confirmation of trend continuation at the first touch.
(Source: Episode 30)

Prior lows are not defended levels.

They are not “should hold” areas.
(Source: Episode 31)

Buy-side runs late in the day are not confirmation of bullish continuation.
(Source: Episode 32)

Liquidity objectives are not support levels.

They are not optional confirmations.
(Source: Episode 33)

Buy-side liquidity runs are not confirmation of trend continuation.

Relative highs are not resistance.
(Source: Episode 34)

Failure to reach liquidity on the first attempt does not invalidate the objective.
(Source: Episode 35)

Liquidity raids are not support failures.

Multiple sweeps do not imply trend continuation.
(Source: Episode 36)

Liquidity objectives are not trade signals.

Liquidity objectives do not require immediate execution.
(Source: Episode 37)

Liquidity objectives are not predictions.

Failure to reach an objective is not a signal by itself.
(Source: Episode 38)

Liquidity is not volume-based.

Liquidity is not inferred from order book data.
(Source: Episode 39)

Liquidity is not support/resistance.

Liquidity is not volume-based.
(Source: Episode 40)

Liquidity objectives are not guaranteed to be reached on the first attempt.
(Source: Episode 41)

Ambiguities / Conflicts

Speaker rejects auction theory equivalence without formal definition.
(Source: 2022 ICT Mentorship — Episode 2)

Source Log

2022 ICT Mentorship — Episode 2 — introduction of liquidity draw logic
Episode 11 — persistence of liquidity draw
Episode 13 — buy-side draw emphasis
Episode 14 — persistence of buy-side draw
Episode 15 — short-term sell-side draw after MSS
Episode 16 — intraday liquidity recycling
Episode 18 — persistence of daily liquidity pools
Episode 20 — false breakout via liquidity sweep
Episode 21 — daily relative equal highs/lows as draw
Episode 22 — daily relative equal lows as draw on liquidity
Episode 23 — sweep vs run semantics
Episode 24 — relative equal highs framing setup context
Episode 25 — buy-side first, sell-side second sequencing
Episode 26 — sell-side taken → buy-side draw sequencing
Episode 27 — liquidity-driven counter-trend expansion
Episode 29 — daily relative equal highs as advance liquidity draw
Episode 30 — sell-side sweep → buy-side squeeze sequencing
Episode 31 — prior daily low as explicit sell-side draw
Episode 32 — buy-side inducement preceding afternoon sell-off
Episode 33 — prior daily lows and short-term lows as prerequisite liquidity events
Episode 34 — relative equal highs and staged liquidity delivery
Episode 35 — staged liquidity delivery behavior
Episode 36 — staged sell-side clearance before buy-side run
Episode 37 — staged buy-side liquidity objectives (short-term → relative equal highs)
Episode 38 — failed sell-side objective → reassessment toward buy-side liquidity
Episode 39 — repeated sell-side runs and absorption behavior
Episode 40 — pre-session liquidity planning
Episode 41 — expectation failure vs liquidity persistence

---

### Market Efficiency Paradigm

Market Efficiency Paradigm
Canonical Definition

The Market Efficiency Paradigm describes price delivery as an algorithmic process that seeks opposing liquidity to efficiently rebalance buy-side and sell-side participation over time.

Identification Criteria

Price consistently seeks opposing liquidity pools.

Expansion phases follow inducement of uninformed participation.

Time-of-day governs volatility and delivery likelihood.

Explicit Rules (From Sources)

Price is anticipated to seek opposing liquidity rather than follow retail technical patterns.
(Source: 2022 ICT Mentorship — Episode 6)

Institutional order flow is governed primarily by time and price, not indicators.
(Source: 2022 ICT Mentorship — Episode 6)

Algorithms operate at specific times of day to deliver price efficiently.
(Source: 2022 ICT Mentorship — Episode 6)

Fair Value Gaps are manifestations of inefficient price delivery that price later seeks to rebalance.
(Source: 2022 ICT Mentorship — Episode 6)

Buy-stops above old highs are used to facilitate short selling, not bullish continuation.
(Source: Episode 25)

Sell-stops below old lows provide the necessary liquidity for short covering.
(Source: Episode 25)

Implied Conditions (Clearly Inferred)

Retail participation provides liquidity for institutional positioning.
(Source: Episode 6 — CLEAR INFERENCE)

Liquidity runs precede directional price delivery.
(Source: Episode 6 — CLEAR INFERENCE)

Validity Conditions

Applies across all markets and timeframes.

Requires time-based charting.

Invalidation / Failure Conditions

Not explicitly defined in available sources.

What This Concept Is NOT

Not indicator-based market efficiency.

Not academic Efficient Market Hypothesis (EMH).

Not pattern-recognition trading.

Ambiguities / Conflicts

Degree of determinism of algorithmic behavior is not quantified.
(Source: Episode 6)

Source Log
2022 ICT Mentorship — Episode 6 — market efficiency and institutional order flow framing

2022 ICT Mentorship — Episode 6 — market efficiency and institutional order flow framing
Episode 25 — liquidity engineering explanation

---

### Market Structure Shift (Intraday)

Market Structure Shift (Intraday)
Canonical Definition

A Market Structure Shift is an intraday change in directional delivery that occurs after liquidity has been taken, indicated by violation of a previously formed short-term swing high or swing low.
Market structure is defined by hierarchical swing relationships (short-term, intermediate-term, long-term), where higher-timeframe swings subordinate lower-timeframe price action.

Identification Criteria

A swing high or swing low is formed.

Buy-side or sell-side liquidity is taken.

Price subsequently trades through the short-term swing level on lower timeframes (1m–3m).

A swing high is defined as a candle with lower highs on both the left and right.
(Source: Episode 11)

Swing highs and lows can be classified as:

Short-term

Intermediate-term

Long-term
based on their relative nesting.
(Source: Episode 11)

Swings are classified as:

Short-term

Intermediate-term

Long-term

An intermediate-term high or low forms when an imbalance is rebalanced.

Intermediate-term highs/lows should not be violated if the prevailing directional narrative remains valid.

An intermediate-term low forms when:

A retracement into an imbalance occurs, and

Price subsequently resumes higher without violating that low.
(Source: Episode 13)

Explicit Rules (From Sources)

A short-term low or high being violated after a liquidity run constitutes a market structure shift.
(Source: 2022 ICT Mentorship — Episode 2)

Market structure shifts are used only after liquidity has been taken.
(Source: 2022 ICT Mentorship — Episode 2)

Intraday market structure shifts are distinct from higher-timeframe market structure breaks.
(Source: 2022 ICT Mentorship — Episode 3)

A market structure shift is confirmed at the moment price trades through the swing, not at candle close.
(Source: 2022 ICT Mentorship — Episode 4)

A structure shift is invalid if price violates a prior high or low but fails to produce a Fair Value Gap.
(Source: 2022 ICT Mentorship — Episode 4)

Swing highs and swing lows used for structure are defined as three-candle formations, independent of candle close direction.
(Source: Episode 5)

A valid intraday structure event requires energetic displacement, not a slow or anemic move.
(Source: Episode 5)

A valid intraday structure shift requires impulsive displacement, not a slow or overlapping move.
(Source: Episode 6)

Wick-only violations of a swing high/low do not constitute a valid structure shift.
(Source: Episode 6)

Structure shifts occurring during heavy consolidation require additional confirmation.
(Source: Episode 7)

A valid intraday structure shift may occur across multiple lower timeframes (15m → 5m → 3m → 1m) within the same price leg.
(Source: Episode 8)

A structure shift is confirmed when both a prior low and a prior high are violated within the same leg, followed by displacement.
(Source: Episode 8)

Manipulation phases often include a short-term structure violation that precedes true directional delivery.
(Source: Episode 9)

Structure analysis requires hierarchical comparison of swings, not simple lower-high / lower-low logic.
(Source: Episode 11)

Wick violations without displacement are insufficient for confirming structure change.
(Source: Episode 11)

A simple higher-high / higher-low model is insufficient for determining structure.
(Source: Episode 12)

Intermediate-term highs must have:

A lower short-term high to the left

A lower short-term high to the right
(OR form via imbalance rebalance)
(Source: Episode 12)

If an intermediate-term high is violated after being formed, the prior directional idea is invalidated.
(Source: Episode 12)

Once an intermediate-term low is formed, it should not be violated before the intended liquidity objective is reached.
(Source: Episode 13)

A market structure shift establishes directional bias before seeking Fair Value Gap retracement.
(Source: Episode 14)

A bullish intraday market structure shift is confirmed when a prior short-term swing high is traded through following displacement.
(Source: Episode 15)

Structure confirmation precedes any expectation of retracement into imbalance.
(Source: Episode 15)

Market structure shifts may occur multiple times intraday without negating the higher-timeframe bias.
(Source: Episode 16)

An intermediate-term high is confirmed when price retraces into an imbalance and fails to exceed it within a bearish narrative.
(Source: Episode 17)

An internal Market Structure Shift occurs when:

A short-term swing is violated, and

Delivery changes direction with displacement.
(Source: Episode 18)

MSS is validated after session manipulation and confirmed by displacement away from the opening price.

(Source: Episode 19)

A market structure shift is confirmed after displacement away from a Fair Value Gap, not merely after a swing violation.
(Source: Episode 20)

Intraday structure shifts align with displacement away from session opening prices.
(Source: Episode 21)

Market Structure must be interpreted hierarchically:

Short-term

Intermediate-term

Long-term
(Source: Episode 22)

An intermediate-term high or low is often confirmed through displacement and imbalance formation.
(Source: Episode 22)

Intraday structure confirmation may occur after volatility subsides, not necessarily on the first impulse move.
(Source: Episode 23)

A valid Market Structure Shift requires:

A run on liquidity, and

Displacement that takes out a short-term swing low (bearish case) or high (bullish case).
(Source: Episode 24)

A simple move above or below a level does NOT qualify as a structure shift.
(Source: Episode 24)

Market Structure Shift is confirmed by:

Liquidity run →

Displacement →

Subsequent imbalance
(Source: Episode 25)

Intraday structure confirmation is reinforced when:

Sell-side liquidity is taken,

Price re-enters an imbalance, and

Delivery shifts toward opposing liquidity.
(Source: Episode 26)

Counter-trend entries require an intraday structure shift, even when the higher-timeframe bias remains opposite.
(Source: Episode 27)

A bullish intraday Market Structure Shift is confirmed when:

Sell-side liquidity is taken, and

Subsequent price action fails to make a lower low, then

Short-term highs are displaced to the upside.
(Source: Episode 29)

A valid setup does not need to appear during the initial sell-off; the structure shift may only become clear after manipulation completes.
(Source: Episode 30)

A swing high followed by bearish displacement supports continuation toward external sell-side liquidity.
(Source: Episode 31)

On consolidation days, multiple minor swing violations may occur without producing a valid structure shift.
(Source: Episode 32)

A meaningful structure shift often appears only after liquidity inducement late in the session.
(Source: Episode 32)

A valid bearish shift requires:

a liquidity run below a short-term low, followed by

bearish displacement.
(Source: Episode 33)

Minor swing breaks inside consolidation do not qualify as a structure shift.
(Source: Episode 33)

When multiple apparent swing breaks exist, the valid Market Structure Shift is the one that:

aligns with the active dealing range, and

follows a liquidity event.
(Source: Episode 36)

Minor or early swing violations inside a range do not qualify as a true shift.
(Source: Episode 36)

A bullish Market Structure Shift is confirmed when:

a short-term high is displaced, and

price sustains above it following retracement.
(Source: Episode 37)

Intraday structure shifts often align with higher-timeframe bias, not against it.
(Source: Episode 37)

A valid bullish Market Structure Shift is confirmed when:

a short-term high is displaced, and

price sustains acceptance above it after retracement.
(Source: Episode 38)

Structure shifts must be evaluated relative to the active dealing range, not older intraday swings.
(Source: Episode 38)

Market Structure Shifts must be evaluated after liquidity has been addressed, not before.
(Source: Episode 39)

A valid bearish structure shift requires:

buy-side liquidity run, and

displacement lower following that run.
(Source: Episode 39)

A valid Market Structure Shift requires:

displacement through a prior short-term high/low, and

failure to immediately reverse back through that level.
(Source: Episode 41)

Absence of displacement after a stop run indicates no actionable shift.
(Source: Episode 41)

Implied Conditions (Clearly Inferred)

Intraday market structure shifts typically lead to single intraday price legs, not multi-day trends.
(Source: 2022 ICT Mentorship — Episode 3)

A structure shift requires both swing violation and displacement to be actionable.
(Source: 2022 ICT Mentorship — Episode 4)

Directional intent following a shift aligns with the most recent liquidity event.
(Source: 2022 ICT Mentorship — Episode 2)

Structure shifts formed without displacement are invalid.
(Source: Episode 6)

MSS signals are weaker when price oscillates around equilibrium.
(Source: Episode 7 — CLEAR INFERENCE)

Validity Conditions

Must occur after a confirmed buy-side or sell-side liquidity run.

Invalidation / Failure Conditions

Not explicitly defined in available sources.

Violation of an intermediate-term high (bearish case) or low (bullish case) invalidates the structural premise.
(Source: Episode 12)

If displacement does not occur after a liquidity run, no setup exists.
(Source: Episode 24)

Without displacement, no structure shift exists, regardless of swing violations.
(Source: Episode 25)

What This Concept Is NOT

Not trendline breaks.

Not indicator-based confirmation.

Not higher-timeframe structural reversal.

Not every intraday sell-off constitutes a setup.
(Source: Episode 30)


Not every lower low is a Market Structure Shift.
(Source: Episode 33)

Not every lower low or higher high is a Market Structure Shift.
(Source: Episode 36)

A single candle violation alone does not define a structure shift.
(Source: Episode 37)

Structure shifts are not defined by single-candle violations.
(Source: Episode 38)

A structure shift without a liquidity event is non-actionable.
(Source: Episode 39)

A stop run alone is not a structure shift.
(Source: Episode 41)

Ambiguities / Conflicts

Exact candle-count definition for swings is not formally quantified.
(Source: 2022 ICT Mentorship — Episodes 2 & 3)

Source Log

2022 ICT Mentorship — Episode 2 — structure break after liquidity run

2022 ICT Mentorship — Episode 3 — intraday MSS distinction clarified

2022 ICT Mentorship — Episode 4 — confirmation timing and FVG requirement

Episode 7 — MSS reliability during consolidation

Episode 6 — displacement vs wick-only clarification
Episode 8 — multi-timeframe intraday MSS confirmation
Episode 9 — MSS inside Po3 sequence
Episode 12 — hierarchical market structure & imbalance-based swing formation
Episode 11 — swing hierarchy and structure clarification
Episode 13 — intermediate-term low behavior during expansion
Episode 14 — MSS → FVG sequencing
Episode 15 — MSS confirmation before imbalance interaction
Episode 16 — multiple intraday MSS events
Episode 17 — IT high via imbalance retest
Episode 18 — internal MSS clarification
Episode 20 — MSS confirmation via displacement
Episode 21 — MSS relative to opening price
Episode 22 — hierarchy of structure via imbalance
Episode 23 — MSS timing around volatility events
Episode 24 — MSS trigger definition and filtering logic
Episode 25 — MSS dependency chain clarified
Episode 26 — structure confirmation via liquidity + FVG alignment
Episode 27 — MSS as prerequisite for counter-trend participation
Episode 29 — MSS confirmation via failure to expand lower
Episode 30 — delayed MSS after manipulation
Episode 31 — swing-based MSS preceding liquidity run
Episode 32 — delayed MSS on range-bound days
Episode 33 — MSS requires liquidity + displacement, not consolidation noise
Episode 36 — filtering valid MSS from internal noise
Episode 37 — MSS confirmation via displacement of short-term high
Episode 38 — MSS confirmation following failed downside objective
Episode 39 — MSS sequencing relative to liquidity
Episode 41 — MSS requires displacement, not just liquidity

---

### Order Block (Change in State of Delivery)

Order Block (Change in State of Delivery)
Canonical Definition

An Order Block is the price level marking a change in the state of delivery, identified by the opening price of a sequence of candles whose direction is later violated.
An order block is a series of consecutive up-closed or down-closed candles formed within valid market structure, representing institutional order flow.
An Order Block is a series of consecutive candles representing a change in delivery that must be validated by an associated imbalance.

Identification Criteria

Consecutive candles closing in one direction.

The opening price of the first candle in that sequence.

Subsequent violation of that opening price.

Consecutive down-closed candles preceding impulsive expansion define a bullish order block.
(Source: Episode 9)

Order blocks are not limited to the last candle before displacement.

Multiple consecutive candles may define the valid order block range.
(Source: Episode 12)

An Order Block is invalid without an accompanying Fair Value Gap.
(Source: Episode 18)

The Order Block may consist of multiple consecutive candles, not necessarily the last up-close or down-close candle.
(Source: Episode 18)

Explicit Rules (From Sources)

An order block is defined by a change in the state of delivery when its originating open is violated.
(Source: 2022 ICT Mentorship — Episode 3)

Multiple consecutive candles can form a single order block.
(Source: 2022 ICT Mentorship — Episode 3)

Order blocks formed during manipulation can act as entry anchors during distribution.
(Source: Episode 9)

In bearish conditions:

Up-closed candles act as resistance.

Price should not trade above them if the bearish premise is valid.
(Source: Episode 12)

In bullish conditions:

Down-closed candles act as support.
(Source: Episode 12)

In bullish conditions, down-closed candles act as support and may be revisited multiple times without being violated.
(Source: Episode 13)

Order blocks must be evaluated within the prevailing structural narrative, not in isolation.
(Source: Episode 13)

The market is not required to trade into the final candle of an Order Block.
(Source: Episode 18)

Parent-timeframe imbalances can cap price delivery, preventing deeper Order Block interaction.
(Source: Episode 18)

Candle bodies prioritized over wicks for Order Block relevance.

OB requires displacement + FVG to validate.

OB is a reference bookmark, not a supply/demand zone.

(Source: Episode 19)

Daily Order Blocks provide directional bias, even when not part of the intraday entry model.
(Source: Episode 21)

Price is less likely to trade to the high of a bearish daily Order Block.
(Source: Episode 21)

Order Blocks must be evaluated by candle bodies, not wick extremes.
(Source: Episode 22)

Price may wick beyond an Order Block without invalidating it, provided the candle bodies respect the zone.
(Source: Episode 22)

An Order Block gains validity when aligned with:

Higher-timeframe narrative

Liquidity draw

Associated imbalance
(Source: Episode 22)

Order Block validity is determined by candle bodies respecting the zone, even if wicks probe beyond during volatility.
(Source: Episode 23)

A bearish Order Block may be revisited and respected before continuation in the direction of the prevailing narrative.
(Source: Episode 23)

A bullish Order Block may be defined by two consecutive down-closed candles, with the upper candle’s open/body acting as the primary reference.
(Source: Episode 26)

Price may touch only the wick of the referenced Order Block candle and still respect it.
(Source: Episode 26)

An Order Block may be revisited multiple times before continuation toward the liquidity objective.
(Source: Episode 30)

Shallow interaction with an Order Block (wick or partial body) can still be valid prior to delivery.
(Source: Episode 30)

A bearish Order Block can form immediately before displacement toward sell-side liquidity.
(Source: Episode 31)

Order Blocks may be overshot during high volatility without invalidation.
(Source: Episode 31)

Order Blocks may form as multi-candle structures and be refined on lower timeframes (e.g., 5-minute).
(Source: Episode 34)

Price may:

trade into an Order Block,

consolidate, and

re-accumulate before continuation.
(Source: Episode 34)

When using a higher-timeframe Order Block candle, the three most sensitive levels are:

the low,

the open, and

the midpoint (50%) of the candle.
(Source: Episode 35)

Price trading into the 50% of an Order Block candle is referred to as the Mean Threshold.
(Source: Episode 35)

Reaching the Mean Threshold supports continuation toward the next liquidity objective.
(Source: Episode 35)

An Order Block may appear after consolidation following displacement, and act as a staging area before continuation.
(Source: Episode 36)

Shallow interaction with an Order Block (wick or partial body) may still be valid.
(Source: Episode 36)

A down-closed candle prior to an impulsive move may define an Order Block that aligns with an associated Fair Value Gap.
(Source: Episode 37)

Order Blocks may appear on lower timeframes within a higher-timeframe narrative.
(Source: Episode 37)

Order Blocks derive validity from:

displacement, and

alignment with time-of-day narrative.
(Source: Episode 39)

Order Blocks that fail to reject price after liquidity is taken are considered weak.
(Source: Episode 39)

Order Blocks derive relevance when aligned with:

HTF bias,

liquidity objectives, and

time-of-day expectations.
(Source: Episode 40)

Down-closed candles preceding displacement define valid bearish Order Blocks; up-closed candles define bullish ones.
(Source: Episode 40)

Order Blocks gain relevance when they appear:

after a Market Structure Shift, and

inside a higher-timeframe Fair Value Gap.
(Source: Episode 41)

Order Blocks may be retested multiple times before expansion.
(Source: Episode 41)

Implied Conditions (Clearly Inferred)

Order blocks gain significance when aligned with liquidity runs and structure shifts.
(Source: 2022 ICT Mentorship — Episode 3)

Order blocks may align with Fair Value Gap retracements during continuation phases.
(Source: Episode 14 — CLEAR INFERENCE)

Validity Conditions

Must coincide with a structural change and liquidity event.

Invalidation / Failure Conditions

Not explicitly defined in available sources.

What This Concept Is NOT

Not every down-closed or up-closed candle.

Not supply and demand zones.

Not simply “the last up candle before a drop.”

Not a single-candle concept divorced from structure.
(Source: Episode 12)

Not supply & demand zones.

Not “last candle before a move” logic.
(Source: Episode 18)

Not a guaranteed reversal zone.
(Source: Episode 21)

Not a single “entry candle”.

Not invalidated by minor wick penetration.
(Source: Episode 22)

Not invalidated by minor wick penetration during news-driven volatility.
(Source: Episode 23)

Not required to trade into the deepest portion of the Order Block to be valid.
(Source: Episode 26)

Order Blocks are not single-candle patterns by necessity.

Deep penetration is not required for validity.
(Source: Episode 34)

The Mean Threshold is not a reversal requirement.

Full penetration of the Order Block is not required.
(Source: Episode 35)

Ambiguities / Conflicts

No explicit minimum candle count defined.
(Source: 2022 ICT Mentorship — Episode 3)

Source Log

2022 ICT Mentorship — Episode 3 — order block formally defined
Episode 9 — OB formation and usage inside Po3
Episode 12 — advanced order block definition & misuse correction
Episode 13 — order block support behavior
Episode 14 — OB alignment with FVG
Episode 18 — Order Block definition correction & constraints
Episode 21 — daily order block directional context
Episode 22 — Order Block body-based validation
Episode 23 — OB body vs wick clarification (volatility context)
Episode 26 — multi-candle OB definition and shallow interaction
Episode 30 — repeated OB interaction before expansion
Episode 31 — OB preceding sell-side delivery
Episode 34 — multi-candle OB refinement and accumulation behavior
Episode 35 — OB sensitive levels and Mean Threshold clarification
Episode 36 — OB as consolidation-to-expansion mechanism
Episode 37 — OB aligned with FVG and continuation
Episode 39 — OB failure after multiple sell-side runs
Episode 40 — OB alignment rules within the model
Episode 41 — OB inside HTF FVG following MSS

---

### Power of Three

Power of Three (Accumulation–Manipulation–Distribution)
Canonical Definition

Power of Three describes a recurring price delivery sequence in which price first consolidates (accumulation), then performs a false move (manipulation), and finally delivers the intended directional expansion (distribution), often within a single session or trading day.

Identification Criteria

A defined opening price or opening range.

Initial consolidation or compression.

A false move away from the eventual directional objective.

Subsequent expansion in the true directional bias.

In FX, manipulation (Judas Swing) often occurs above/below the session opening price (midnight NY and/or 08:30 recalibration).
(Source: Episode 17)

Explicit Rules (From Sources)

Power of Three consists of accumulation, manipulation, and distribution phases.
(Source: 2022 ICT Mentorship — Episode 9)

In a bullish Power of Three:

Price opens near the low,

Trades lower (manipulation),

Then rallies and closes higher (distribution).
(Source: Episode 9)

The manipulation phase often appears as a Judas Swing.
(Source: Episode 9)

The opening price (e.g., 08:30 NY) can be used as a key reference for identifying the sequence.
(Source: Episode 9)

News releases frequently coincide with the manipulation → distribution transition within Power of Three.
(Source: Episode 10)

Manipulation phases may include false rallies or sell-offs designed to draw participation before distribution.
(Source: Episode 11)

Manipulation phases often coincide with:

Equity market open, or

Short-term false moves against the prevailing bias.
(Source: Episode 13)

Manipulation frequently manifests as a Judas Swing relative to the session opening price.
(Source: Episode 16)

Distribution may occur later in the same session or extend into the PM session.
(Source: Episode 16)

Judas Swing explicitly defined as price moving below NY Midnight Open or 08:30 Open opposite daily bias.

Midnight and 08:30 openings are accumulation anchors for Po3.

(Source: Episode 19)

Accumulation often forms below opening prices in strongly bearish markets.
(Source: Episode 21)

Manipulation may be minimal or absent in extreme directional conditions.
(Source: Episode 21)

Power of Three frequently manifests as:

Rally above session open (manipulation), followed by

Distribution below relative equal lows.
(Source: Episode 22)

Distribution often coincides with sell-side liquidity below well-known lows.
(Source: Episode 22)

In bearish conditions:

Accumulation occurs below session open,

Manipulation rallies price into premium,

Distribution expands toward sell-side liquidity.
(Source: Episode 25)

Counter-trend participation typically aligns with the distribution phase of Power of Three within the session.
(Source: Episode 27)

Manipulation frequently occurs at session open, even when the broader trend is bearish.
(Source: Episode 27)

Daily price action may exhibit:

accumulation near the open,

manipulation creating the low of the day, and

distribution in the direction of the higher-timeframe bias.
(Source: Episode 37)

Power of Three behavior on the daily chart is mirrored on lower timeframes, though less visually obvious.
(Source: Episode 37)

On bullish days:

accumulation may occur near the NY midnight open,

manipulation may form the low of the day, and

distribution may unfold during the PM session.
(Source: Episode 38)

Power of Three unfolds relative to:

New York Midnight Open, and

key session times (8:30, 9:30, PM).
(Source: Episode 39)

Manipulation often presents as:

short-term liquidity runs against the daily bias.
(Source: Episode 39)

Implied Conditions (Clearly Inferred)

Manipulation targets short-term liquidity pools formed during accumulation.
(Source: Episode 9 — CLEAR INFERENCE)

Distribution aligns with the prevailing higher-timeframe bias.
(Source: Episode 9 — CLEAR INFERENCE)

Validity Conditions

Most effective when aligned with:

Session timing

Liquidity objectives

Higher-timeframe bias

Invalidation / Failure Conditions

Not explicitly defined in available sources.

What This Concept Is NOT

Not candle-pattern prediction.

Not guaranteed daily direction.

Not dependent on predicting the closing price.

Ambiguities / Conflicts

Exact duration of each phase is not quantitatively defined.
(Source: Episode 9)

Power of Three phases may compress or visually diminish during high-momentum days.
(Source: Episode 21)

Source Log

2022 ICT Mentorship — Episode 9 — Power of Three framework and examples
Episode 10 — news-driven Po3 delivery
Episode 11 — manipulation clarification
Episode 13 — Judas Swing within Power of Three
Episode 16 — session-based Po3 sequencing
Episode 17 — FX Judas Swing relative to opens
Episode 21 — compressed Po3 behavior
Episode 22 — Po3 aligned with relative equal lows
Episode 25 — Po3 mapped to session timing
Episode 27 — Po3 applied to counter-trend scenarios
Episode 37 — Po3 alignment across timeframes
Episode 38 — intraday Po3 behavior aligned with daily range
Episode 39 — Judas swing above NY midnight open

---

### Premium & Discount

Premium / Discount (50% Equilibrium)
Canonical Definition

Premium and Discount are relative price states defined by the midpoint (50%) of a defined range.

Identification Criteria

Define a range (e.g., high of day to low of day).

Calculate 50% midpoint.

Above = premium, below = discount.

Equilibrium can be defined using the most recent impulsive price leg, even when a larger range is not obvious.
(Source: Episode 8)

Explicit Rules (From Sources)

Shorts are preferred when price is in premium; longs when in discount.
(Source: 2022 ICT Mentorship — Episode 2)

Algorithms seek opposing side of the range for delivery.
(Source: 2022 ICT Mentorship — Episode 2)

The equilibrium level is derived from the most recent significant low-to-high range, not necessarily a session range.
(Source: 2022 ICT Mentorship — Episode 4)

Targets should exist below equilibrium for shorts and above equilibrium for longs.
(Source: 2022 ICT Mentorship — Episode 4)

Counter-trend longs are only considered when price trades at or below equilibrium (discount).
(Source: Episode 27)

Counter-trend shorts are only considered when price trades at or above equilibrium (premium).
(Source: Episode 27)

The middle of the daily dealing range acts as a natural gravitational target after liquidity is run above or below the range.
(Source: Episode 32)

Premium and discount are assessed relative to the most recent dealing range, not fixed session extremes.
(Source: Episode 33)

Failure to reach a visible premium does not invalidate the model if the liquidity objective remains active.
(Source: Episode 33)

Premium and discount must be measured using the impulsive price leg in the intended direction, not arbitrary highs/lows.
(Source: Episode 34)

The 50% equilibrium of the active dealing range acts as a key filter for retracement-based participation.
(Source: Episode 34)

The 50% equilibrium must be measured using the active dealing range associated with the most recent impulsive leg.
(Source: Episode 35)

Equilibrium drawn from older or counter-trend legs is invalid for current decision-making.
(Source: Episode 35)

Premium and discount are defined strictly relative to the active swing high–low range, not by indicators.
(Source: Episode 36)

Price trading below the 50% equilibrium places the market in discount, regardless of perceived “oversold” conditions.
(Source: Episode 36)

Premium and discount must be measured using the current intraday dealing range, not earlier rejected ranges.
(Source: Episode 38)

Price repricing into discount ahead of the PM session supports a bullish afternoon narrative when liquidity remains above.
(Source: Episode 38)

Discount and premium must be evaluated relative to the active intraday dealing range, not earlier rejected ranges.
(Source: Episode 41)

Repricing into discount during lunch hour can precede PM expansion.
(Source: Episode 41)

Implied Conditions (Clearly Inferred)

Premium/discount assists in target selection after entry.
(Source: 2022 ICT Mentorship — Episode 2)

Premium/discount is used to filter valid targets, not to trigger entries.
(Source: 2022 ICT Mentorship — Episode 4)

Validity Conditions

Requires a clearly defined range.

Invalidation / Failure Conditions

Not explicitly defined in available sources.

What This Concept Is NOT

Not Fibonacci trading strategy.

Not valuation analysis.

Not justification for trading mid-range.
(Source: Episode 27)

Mid-range is not a random target; it is a mean-reversion objective on consolidation days.
(Source: Episode 32)

Equilibrium is not measured from counter-trend swings.

Not every 50% level is relevant without context.
(Source: Episode 34)

Equilibrium is not static across sessions.

Not every 50% level is actionable.
(Source: Episode 35)

Discount does not require oscillators or indicators.

Equilibrium is not subjective.
(Source: Episode 36)

Discount is not defined by oscillators or indicators.
(Source: Episode 38)

Ambiguities / Conflicts

Range selection hierarchy not formally defined.
(Source: 2022 ICT Mentorship — Episode 2)

Source Log

2022 ICT Mentorship — Episode 2 — equilibrium logic introduced

2022 ICT Mentorship — Episode 4 — equilibrium usage refined
Episode 8 — equilibrium in expansion environments
Episode 27 — equilibrium as counter-trend filter
Episode 32 — mid-range gravitation on outside / choppy days
Episode 33 — equilibrium framed relative to active range
Episode 34 — correct dealing-range construction for equilibrium
Episode 35 — correct equilibrium measurement rules
Episode 36 — equilibrium used as objective premium/discount boundary
Episode 38 — discount repricing prior to PM expansion
Episode 41 — discount repricing before PM delivery

---

### Session-Based Liquidity  (Asia,London,New York)

Session-Based Liquidity (Asia / London / New York)
Canonical Definition

Session-Based Liquidity refers to the highs and lows formed during defined trading sessions that act as liquidity pools.
Session-Based Liquidity describes how liquidity objectives and price delivery can differ between the New York AM session and the New York PM session, allowing for multiple valid setups within a single trading day.

(Refinement justified by extensive explicit discussion in Episode 16)

Identification Criteria

Asia session: ~7 PM – 9 PM New York time.

London session: ~2 AM – 5 AM New York time.

New York session: ~7 AM – 10 AM New York time.

Identification Criteria (Append)

New York AM session: 08:30–12:00 NY time

New York PM session: 12:00–16:00 NY time

Lunch hour (12:00–13:00) often marks a transition or pause.

(Source: Episode 16)

London Kill Zone: 02:00–05:00 NY local time.
(Source: Episode 20)

Explicit Rules (From Sources)

Session highs and lows are frequently swept for liquidity.
(Source: 2022 ICT Mentorship — Episode 3)

Intraday setups most commonly occur between 8:30 AM and noon New York time.
(Source: 2022 ICT Mentorship — Episode 3)

Time-of-day is a primary variable in determining when liquidity will be engineered.
(Source: Episode 6)

The 9:30 NY open often produces volatility that obscures bias and may require patience.
(Source: Episode 7)

Forex setups are primarily hunted during:

London Kill Zone: 02:00–05:00 NY time

New York Kill Zone: 07:00–10:00 NY time
(Source: Episode 8)

The 08:30 NY open is a primary reference for equities Power of Three setups.
(Source: Episode 9)

The New York PM session (after lunch) frequently completes distribution.
(Source: Episode 9)

The 08:30 NY open marks the lifting of the news embargo for U.S. markets.
(Source: Episode 10)

Volatility following 08:30 often resolves toward the day’s true directional objective.
(Source: Episode 10)

Holiday sessions may truncate distribution, with continuation occurring on the next trading day.
(Source: Episode 11)

The 09:30 NY equity open frequently produces an initial false move (Judas Swing) before true delivery.
(Source: Episode 13)

The 09:30 NY equity open frequently introduces volatility that can briefly violate short-term levels without negating the prevailing narrative.
(Source: Episode 15)

Multiple valid trade setups may form within the same session and across both AM and PM sessions.
(Source: Episode 16)

Morning session price action often delivers the primary daily objective.
(Source: Episode 16)

PM session price action often seeks opposing liquidity, especially on Fridays.
(Source: Episode 16)

Liquidity objectives differ by session and must not be assumed identical.
(Source: Episode 16)

FX New York Kill Zone: 07:00–10:00 NY time.
(Source: Episode 17)

High-impact news after 10:00 NY can extend effective session volatility into 11:00–11:30.
(Source: Episode 17)

New York session setups are framed using:

Midnight NY open

07:00–10:00 NY Kill Zone
(Source: Episode 18)

Trade ideas should be formed during Kill Zones, even if execution occurs later.
(Source: Episode 18)

NY Midnight Opening Price acts as a daily discount/premium anchor.

08:30 NY Opening Price supersedes midnight open when midnight is invalidated.

Both openings act as session reference prices, not entries.

(Source: Episode 19)

London session frequently establishes the low of the day when the higher-timeframe bias is bullish.
(Source: Episode 20)

London price action often completes the manipulation phase prior to New York delivery.
(Source: Episode 20)

NY Midnight Opening Price is used to frame London session Power of Three logic.
(Source: Episode 21)

08:30 NY Opening Price frames New York session Power of Three logic.
(Source: Episode 21)

Failure to rally above both opening prices in a bearish environment signals extreme directional strength.
(Source: Episode 21)

08:30 NY Opening Price acts as a primary reference for New York session manipulation.
(Source: Episode 22)

09:30 NY Equity Open commonly produces short-term highs or lows that serve as liquidity targets.
(Source: Episode 22)

During FOMC, initial reaction may be followed by:

secondary leg,

false move,

then true delivery.
(Source: Episode 23)

The ~2:30 NY time window often marks the end of initial volatility leg.
(Source: Episode 23)

09:30 NY Open is the primary time catalyst for equity index setups.
(Source: Episode 24)

Time is a required element; price patterns without time alignment are incomplete.
(Source: Episode 24)

New York time governs algorithmic behavior, beginning at 00:00 NY time.
(Source: Episode 25)

08:30 NY and 09:30 NY act as primary session catalysts for intraday delivery.
(Source: Episode 25)

08:30 NY time imbalance and volatility can create false bearish expectations that later resolve toward buy-side liquidity.
(Source: Episode 26)

Counter-trend setups most frequently occur during:

09:30–11:00 NY, or

13:30–15:30 NY retracement windows.
(Source: Episode 27)

09:30 NY Open is a critical catalyst for short-term liquidity runs and structure shifts.
(Source: Episode 29)

Pre–high-impact-event days (e.g., ahead of FED speeches) often exhibit compressed ranges and lethargic delivery.
(Source: Episode 29)

NY lunch-hour lows (12:00–13:00 NY) are frequently swept ahead of an afternoon continuation to the upside.
(Source: Episode 30)

On days with 14:00 NY macro remarks, the true delivery may occur after lunch-hour manipulation rather than during the morning session.
(Source: Episode 30)

New York lunch hour often introduces:

consolidation, then

continuation toward the pre-identified liquidity objective.
(Source: Episode 31)

Consolidation days often resolve during the 15:00–16:00 NY window, rather than during the morning session.
(Source: Episode 32)

The 3:00–4:00 NY period acts as a delivery window tied to on-close order flow, even in the absence of strong morning trends.
(Source: Episode 32)

The afternoon (PM) session can complete delivery after morning consolidation, especially on high-volatility days.
(Source: Episode 33)

The 13:30–16:00 NY window may host the primary expansion once prerequisites are met.
(Source: Episode 33)

Lunch-hour retracements are common during consolidation weeks and often precede afternoon delivery.
(Source: Episode 34)

Markets affected by high-impact calendar events (e.g., FOMC) frequently remain range-bound before completing delivery later in the session.
(Source: Episode 34)

09:30 NY Open remains a primary catalyst, but:

valid delivery may occur after an initial false move.
(Source: Episode 36)

Failure to deliver at 08:30 or 09:30 does not invalidate the session model.
(Source: Episode 36)

The New York Midnight Opening Price acts as a key reference during intraday retracements.
(Source: Episode 37)

Lunch-hour consolidation may precede PM session delivery toward pre-identified liquidity objectives.
(Source: Episode 37)

If price retraces into discount during the NY lunch hour, this often signals continued activity through lunch, rather than consolidation.
(Source: Episode 38)

PM session delivery frequently follows:

a morning failure to reach a downside objective, and

a lunchtime retracement into Fair Value Gap territory.
(Source: Episode 38)

8:30 NY time is the first valid intraday algorithmic inflection point.
(Source: Episode 39)

9:30 NY open often provides a secondary manipulation leg if the 8:30 move fails.
(Source: Episode 39)

PM session (post–1:30 PM) is the primary delivery window on large-range days.
(Source: Episode 39)

Valid intraday delivery windows are:

08:30–11:00 NY (AM session), and

13:30–16:00 NY (PM session).
(Source: Episode 40)

London Close (10:00–11:00 NY) frequently marks:

opposing end of the daily range.
(Source: Episode 40)

If a high-impact news expectation fails during the AM session, it is often preferable to stand aside until the PM session rather than force a narrative.
(Source: Episode 41)

Lunch hour (12:00–13:00 NY) frequently marks:

consolidation, or

completion of a retracement into higher-timeframe PD arrays.
(Source: Episode 41)

PM session (≈13:30 NY onward) remains a valid delivery window even when the AM narrative fails.
(Source: Episode 41)

Implied Conditions (Clearly Inferred)

Session liquidity provides predictable intraday targets.
(Source: 2022 ICT Mentorship — Episode 3)

The New York lunch hour (12:00–13:00 NY time) is a no-trade window during learning.
(Source: Episode 5)

Morning session: 08:30–11:00 NY

Afternoon session begins observation around 13:30 NY
(Source: Episode 5)

Validity Conditions

Requires consistent session timing (New York local time).

Session concepts require New York local time calibration on charts.
(Source: Episode 5)

Session-based concepts require strict New York time anchoring to be valid.
(Source: Episode 6)

All session-based analysis must be anchored to New York local time, regardless of trader location.
(Source: Episode 8)

Session logic must be evaluated in conjunction with higher-timeframe PD arrays.
(Source: Episode 16)

London setups must be evaluated in context of higher-timeframe bias and intermarket confirmation.
(Source: Episode 20)

Lunch-hour sweep logic applies when price consolidates into lunch and external liquidity remains unresolved.
(Source: Episode 30)

Afternoon delivery is most likely when:

Price remains range-bound most of the day, and

External liquidity (relative highs/lows) remains unresolved.
(Source: Episode 32)

Afternoon delivery is more likely when:

morning price action is choppy, and

higher-timeframe liquidity objectives remain unfulfilled.
(Source: Episode 34)

PM continuation is most likely when:

higher-timeframe Fair Value Gap contains price, and

buy-side liquidity remains unfulfilled.
(Source: Episode 38)

PM session continuation is favored when:

daily range expansion remains incomplete, and

liquidity objectives are unfulfilled.
(Source: Episode 39)

Invalidation / Failure Conditions

Not explicitly defined in available sources.

What This Concept Is NOT

Not market open strategies.

Not volatility-based time filters.

Lunch consolidation does not imply reversal.
(Source: Episode 31)

Asia session is not the primary delivery window for this model.
(Source: Episode 25)

Low-volatility days do not invalidate the model.
(Source: Episode 29)

Morning inactivity does not negate the model.
(Source: Episode 33)

Failure to deliver in the morning session does not invalidate the daily bias.
(Source: Episode 37)

Not every session will produce a setup.

Absence of delivery is not a failure of the model.
(Source: Episode 40)

Failure of an AM setup does not invalidate the day.

Missing a move is not an error condition.
(Source: Episode 41)

Ambiguities / Conflicts

Afternoon session logic is acknowledged but excluded from scope.
(Source: 2022 ICT Mentorship — Episode 3)

Source Log

2022 ICT Mentorship — Episode 3 — session liquidity framework

Episode 5 — intraday segmentation and no-trade window

Episode 6 — time-based delivery emphasis

Episode 7 — open volatility and consolidation hurdles
Episode 8 — Forex session operating hours
Episode 9 — AM/PM session roles in Power of Three
Episode 10 — session timing + news interaction
Episode 11 — holiday session behavior
Episode 13 — equity open behavior
Episode 15 — equity open volatility behavior
Episode 16 — multiple setups across AM/PM sessions
Episode 17 — FX session timing and news extension
Episode 18 — session timing and entry framing
Episode 20 — London Kill Zone low formation
Episode 21 — opening price hierarchy (midnight vs 08:30)
Episode 22 — NY session opening price behavior
Episode 23 — FOMC session sequencing
Episode 24 — time as an algorithmic element
Episode 25 — NY-centric algorithm timing
Episode 26 — post-08:30 volatility behavior
Episode 27 — counter-trend timing windows
Episode 29 — pre-event session behavior
Episode 30 — lunch-hour sweep preceding afternoon expansion
Episode 31 — lunch consolidation before continuation
Episode 32 — consolidation day resolves into the close
Episode 33 — PM delivery after delayed liquidity run
Episode 34 — lunch-hour retracement and PM expansion during FOMC week
Episode 36 — delayed NY delivery after false starts
Episode 37 — NY midnight open and lunch-hour behavior
Episode 38 — lunch-hour retracement → PM delivery
Episode 39 — lunch-hour stop runs → PM expansion
Episode 40 — Kill Zones and London Close behavior
Episode 41 — standing down after AM failure; PM delivery

---

### Target Selection (Low-Hanging Fruit)

Target Selection (Low-Hanging Fruit)
Canonical Definition

Target selection prioritizes the nearest opposing liquidity or imbalance that lies beyond equilibrium, favoring probability over maximum range capture.

Identification Criteria

Targets below equilibrium for shorts.

Targets above equilibrium for longs.

Imbalances or prior lows/highs nearest to entry.

Explicit Rules (From Sources)

The closest opposing liquidity or imbalance should be selected as the primary target.
(Source: 2022 ICT Mentorship — Episode 4)

Traders should not attempt to capture the full range while learning.
(Source: 2022 ICT Mentorship — Episode 4)

The model is designed to filter out trades when conditions are not present.
(Source: Episode 24)

Implied Conditions (Clearly Inferred)

Larger range targets may be left untraded even if later reached.
(Source: 2022 ICT Mentorship — Episode 4)

Target selection must remain subordinate to higher-timeframe objectives.
(Source: Episode 12)

Validity Conditions

Requires a defined range and equilibrium.

Invalidation / Failure Conditions

Not explicitly defined in available sources.

What This Concept Is NOT

Not profit maximization.

Not fixed risk-reward targeting.

Not a guarantee of daily participation.
(Source: Episode 24)

Ambiguities / Conflicts

No quantitative distance threshold defined.
(Source: 2022 ICT Mentorship — Episode 4)

Source Log

2022 ICT Mentorship — Episode 4 — target refinement lesson
Episode 12 — holding trades toward HTF objectives
Episode 24 — no-trade days as valid outcomes

---

### Top-Down Timeframe Bias

Top-Down Timeframe Bias
Canonical Definition

Directional bias is established on higher timeframes and refined on lower timeframes for execution.

Identification Criteria

Weekly chart defines expected expansion.

Daily chart identifies liquidity pools.

Intraday charts provide execution logic.

Daily bias is derived from:

Daily Fair Value Gaps

Recent daily expansion

Draw on daily highs or lows
(Source: Episode 18)

Explicit Rules (From Sources)

Weekly candle establishes primary bias.
(Source: 2022 ICT Mentorship — Episode 2)

Daily chart contains majority of liquidity draw.
(Source: 2022 ICT Mentorship — Episode 2)

Intraday bias should align with daily candle expansion expectations, not prediction of exact close.
(Source: Episode 5)

Morning session behavior informs afternoon continuation or reversal bias.
(Source: Episode 5)

Higher-timeframe bias provides context, not prediction of exact highs or lows.
(Source: Episode 6)

Daily bias is derived from liquidity draw and range context, not candle color alone.
(Source: Episode 7)

Bias may become indeterminate near equilibrium or during consolidation.
(Source: Episode 7)

Daily bias in Forex should be derived from relative currency strength, not candle direction alone.
(Source: Episode 8)

Daily bias should be established before the news release and not altered solely due to news volatility.
(Source: Episode 10)

Daily chart bias governs all lower-timeframe trade ideas.
(Source: Episode 12)

Trading against the daily narrative increases failure probability.
(Source: Episode 12 — explicit warning)

Intraday expectations are governed by daily bias, even when short-term volatility obscures immediate direction.
(Source: Episode 15)

Intraday trades must be filtered exclusively in the direction of daily bias unless clearly invalidated.
(Source: Episode 18)

Daily bias is not required to complete its ultimate objective for intraday trades to be valid.
(Source: Episode 18)

Daily bias is not required every day; bias is framed only when higher-timeframe expansion is likely.
(Source: Episode 40)

Weekly bias is determined by identifying whether price is gravitating toward:

prior weekly highs,

prior weekly lows, or

higher-timeframe Fair Value Gaps.
(Source: Episode 40)

The objective is to determine direction of expansion, not to predict the weekly close.
(Source: Episode 40)

Implied Conditions (Clearly Inferred)

Lower-timeframe setups are filtered by higher-timeframe bias.
(Source: 2022 ICT Mentorship — Episode 2)

Intraday price action should be interpreted through the lens of daily expansion narrative.
(Source: Episode 6 — CLEAR INFERENCE)

Validity Conditions

Requires alignment across at least two timeframes.

Daily bias remains valid until a clear daily structural invalidation occurs.
(Source: Episode 18)

Invalidation / Failure Conditions

Not explicitly defined in available sources.

What This Concept Is NOT

Not multi-timeframe indicators.

Not mechanical timeframe stacking.

Bias is not a daily obligation.

Bias is not a prediction requirement.
(Source: Episode 40)

Ambiguities / Conflicts

Exact timeframe combinations not rigidly specified.
(Source: 2022 ICT Mentorship — Episode 2)

Source Log

2022 ICT Mentorship — Episode 2 — full top-down model explanation

Episode 6 — HTF bias framing
Episode 7 — daily bias during consolidation
Episode 8 — HTF bias via currency components
Episode 10 — bias stability around news
Episode 12 — daily chart as parent structure
Episode 15 — daily bias governing intraday volatility
Episode 18 — daily bias anchoring intraday model
Episode 40 — weekly expansion framing governs daily bias selection

---

