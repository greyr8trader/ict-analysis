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
- Daily (D1): 30 bars
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
    "D1":  [Bar x 30],
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
- Any timeframe array is missing (D1/H1/M15/M5)
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
