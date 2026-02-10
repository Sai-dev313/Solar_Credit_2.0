

# Simplify Login Page Impact Statement to a Single Short Sentence

## Problem
The current prompt generates 3-5 lines covering grid replacement, emissions, trees, real-time feel, and human attribution -- making it feel long and cluttered on the login screen.

## Solution
Rewrite the system prompt to generate **one single short sentence** focused only on `total_units_sent_to_grid`. No CO2, no trees, no multi-line output.

## Changes

### 1. Edge Function: `supabase/functions/generate-impact-statement/index.ts`

**Replace the entire SYSTEM_PROMPT** with a minimal version:

```
You are SolarCredit's Platform Impact Narrator.

Generate ONE short sentence (max 15 words) about solar energy sent to the grid.

RULES:
- Use ONLY the total_units_sent_to_grid number provided.
- Ignore CO2 and tree data.
- Vary the wording each time. Examples:
  "X units of clean solar power are now on the grid."
  "The grid just received X units of solar energy."
  "X units — real solar power, replacing coal on the grid."
- If total_units_sent_to_grid is 0: "Platform impact will appear as solar energy is logged."
- One sentence only. No line breaks. No multi-line output.
```

**Also simplify the user message** to only send `total_units_sent_to_grid` (remove CO2/trees fields).

**Reduce `max_completion_tokens`** from 200 to 60 (only need one short sentence).

### 2. No frontend changes needed
The `ImpactBanner.tsx` component already renders the statement as-is -- a shorter statement will automatically display cleanly.

