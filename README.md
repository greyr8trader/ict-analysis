# ICT 2022 Automation (D + H1 + M15 Narrative, M5 Execution)

This repo contains prompt + rules used by an automation (e.g., n8n) to generate an ICT 2022 Mentorship-style daily plan.

## Timeframes
- D: Macro context + external liquidity draw
- H1: Primary narrative + dealing range + bias
- M15: Refinement + sweeps/displacement/MSS alignment
- M5: Execution model only (entries + invalidation)

## Output
Telegram-ready daily plan with:
- HTF narrative
- Liquidity targets (BSL/SSL)
- PD Arrays (FVG/imbalance)
- M5 execution conditions
- Clear invalidation + stand-down rules

## Data format
Automation should provide OHLC arrays for D, H1, M15, M5 in JSON.
