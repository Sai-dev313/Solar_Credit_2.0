

# Platform Impact Banner on Login Page (OpenAI-Powered)

## Overview

Add a live impact banner above the login card that displays AI-narrated platform metrics (total grid exports, CO2 avoided, trees equivalent). The AI (OpenAI) only narrates pre-computed data -- it never calculates anything.

---

## Architecture

```text
platform_impact_snapshot (1 row)
        |
        v
Edge Function: generate-impact-statement
  - Reads snapshot from DB
  - Sends data to OpenAI with exact system prompt
  - Returns 2-line narration
        |
        v
Auth.tsx: ImpactBanner component
  - Calls edge function on mount
  - Displays narrated text above login card
  - Shows loading skeleton / fallback
```

---

## Implementation Steps

### 1. Collect OpenAI API Key

Prompt you to enter your OpenAI API key as a backend secret (`OPENAI_API_KEY`).

### 2. Database: Create `platform_impact_snapshot` table

```sql
CREATE TABLE public.platform_impact_snapshot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_units_sent_to_grid numeric NOT NULL DEFAULT 0,
  total_co2_avoided_kg numeric NOT NULL DEFAULT 0,
  equivalent_trees integer NOT NULL DEFAULT 0,
  last_updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_impact_snapshot ENABLE ROW LEVEL SECURITY;

-- Public read so the edge function (and unauthenticated login page) can read it
CREATE POLICY "Anyone can read impact snapshot"
  ON public.platform_impact_snapshot FOR SELECT
  USING (true);

-- Seed with initial data
INSERT INTO public.platform_impact_snapshot
  (total_units_sent_to_grid, total_co2_avoided_kg, equivalent_trees, last_updated_at)
VALUES (0, 0, 0, now());
```

### 3. Database Function: Auto-refresh snapshot

Create a function that recalculates the snapshot from `energy_logs.sent_to_grid`:

```sql
CREATE OR REPLACE FUNCTION public.refresh_impact_snapshot()
RETURNS void AS $$
DECLARE
  total_units numeric;
  co2_kg numeric;
  trees int;
BEGIN
  SELECT COALESCE(SUM(sent_to_grid), 0) INTO total_units FROM public.energy_logs;
  co2_kg := total_units * 0.82;  -- deterministic emission factor
  trees := FLOOR(co2_kg / 22);   -- each tree absorbs ~22kg CO2/year

  UPDATE public.platform_impact_snapshot
  SET total_units_sent_to_grid = total_units,
      total_co2_avoided_kg = co2_kg,
      equivalent_trees = trees,
      last_updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

A trigger on `energy_logs` INSERT will call this function automatically.

### 4. Edge Function: `generate-impact-statement`

New file: `supabase/functions/generate-impact-statement/index.ts`

- Reads the single row from `platform_impact_snapshot`
- Sends the exact system prompt you specified to OpenAI's chat completions API
- Passes the 4 numeric values as user message
- Returns the 2-line narration as JSON
- No streaming needed (short response)
- Uses your `OPENAI_API_KEY` secret

### 5. Update Login Page UI

Modify `src/pages/Auth.tsx`:

- Add an `ImpactBanner` component displayed above the login card
- Dark/green rounded banner matching the mockup design:
  - Green circle icon (leaf/zap) on the left
  - AI-generated impact text
  - Subtle "Updated moments ago" micro-label
- Calls the edge function on page load
- Shows a skeleton loader while fetching
- Gracefully hides if the fetch fails or data is zero

### 6. Update `supabase/config.toml`

Register the new edge function with `verify_jwt = false` (login page is unauthenticated).

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| Secret: `OPENAI_API_KEY` | Add | Your OpenAI API key |
| Database migration | Create | `platform_impact_snapshot` table, seed row, refresh function, trigger |
| `supabase/functions/generate-impact-statement/index.ts` | Create | Edge function calling OpenAI |
| `src/pages/Auth.tsx` | Modify | Add ImpactBanner above login card |

---

## Design Details (from mockup)

- Banner sits at the very top of the page, above the login card
- Dark background (`bg-gray-900`) with rounded corners, centered text
- Green circle icon on the left side
- White text for the impact statement
- Plant emoji at the end
- Full width with padding, max-width constrained

---

## Security Notes

- `OPENAI_API_KEY` is stored as a backend secret, never exposed to the client
- The edge function is public (no JWT required) since the login page is unauthenticated
- The snapshot table is read-only for public access
- AI never calculates metrics -- all numbers come from the pre-computed snapshot

