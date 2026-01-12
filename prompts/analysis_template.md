
⚠️ This template is STRUCTURAL ONLY.
All logic, permissions, and rules are enforced by system.txt and the RULEBOOK.

ICT 2022 — Discretionary Analysis  
Educational / Discretionary · Not a signal service

────────────────────────

0️⃣ MARKET STATE (DECLARE FIRST — NO REASONING)

HTF Bias  
• 🟢 Bullish  
• 🔴 Bearish  

HTF Draw on Price  
• 🟢 Buy-Side Liquidity (BSL)  
• 🔴 Sell-Side Liquidity (SSL)  

M15 Status (Permission Gate)  
• 🟢 Valid  
• 🔴 Invalid  

────────────────────────

1️⃣ TRADE PERMISSION STATE

IF M15 Status = 🔴 Invalid  
• ➜ NO TRADE  
• ➜ Skip execution logic  
• ➜ Skip risk & targets  

IF M15 Status = 🟢 Valid  
• ➜ Execution MAY proceed  

────────────────────────

2️⃣ HTF CONTEXT (FACTS ONLY)

Dealing Range  
• High:  
• Low:  
• Equilibrium (50%):  

Liquidity Reference  
• External BSL:  
• External SSL:  

────────────────────────

3️⃣ CONDITIONAL LOGIC (IF → THEN ONLY)

• IF price holds above EQ → HTF bias intact  
• IF price trades below EQ → HTF bias weakened  
• IF opposing liquidity is not taken → NO TRADE  

────────────────────────

4️⃣ M15 VALIDATION (MANDATORY GATE)

ALL must be 🟢 or trade is INVALID:

• MSS aligned with HTF bias  
• Clear displacement  
• Structure is not ranging  

M15 Result  
• 🟢 Valid  
• 🔴 Invalid → NO TRADE  

────────────────────────

5️⃣ M5 EXECUTION STATE (ONLY IF PERMITTED)

ALL must be 🟢 or NO TRADE:

• Opposing liquidity taken  
• M5 MSS  
• Displacement present  
• Post-MSS FVG formed  
• Entry in correct premium / discount  
• Occurs within valid session  

────────────────────────

6️⃣ RISK & OBJECTIVES

IF Execution State = 🔴 Invalid  
• Stop: NO TRADE  
• Targets: NO TRADE  

IF Execution State = 🟢 Valid  
• Stop Location:  
• Primary Target:  
• Secondary Target (optional):  

────────────────────────

7️⃣ INVALIDATION CONDITIONS (HARD FAILS)

Bias or setup is INVALID if ANY occur:

• Required liquidity not taken  
• MSS fails to form  
• No displacement  
• No FVG after displacement  
• Price holds beyond intended PD array  
• Entry outside session window  

────────────────────────

KEY LEVELS (REFERENCE ONLY — NOT ENTRIES)

• Price | Dealing Range High  
• Price | Dealing Range Low  
• Price | Equilibrium  
• Price | Equal Highs (BSL)  
• Price | Equal Lows (SSL)  

────────────────────────

FINAL OUTPUT STATE

• 🟢 TRADE PERMITTED  
• 🔴 NO TRADE
