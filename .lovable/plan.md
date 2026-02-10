

# Upgrade AI Features to GPT-5.2 + Improve Prompts, Loading States, and SolarGPT Free Chat

## Root Cause of Current Errors

All three AI features (`generate-impact-statement`, `generate-lifetime-impact`, `solargpt`) are hitting OpenAI's **gpt-4o-mini free-tier rate limits** (3 requests/minute, 200 requests/day). Switching to `gpt-5.2` will resolve this since it has higher rate limits on your account.

---

## Changes Overview

### 1. Switch all 3 edge functions from `gpt-4o-mini` to `gpt-5.2`

All three backend functions will be updated:
- `supabase/functions/generate-impact-statement/index.ts`
- `supabase/functions/generate-lifetime-impact/index.ts`
- `supabase/functions/solargpt/index.ts`

Change: `model: "gpt-4o-mini"` becomes `model: "gpt-5.2"` in all three files.

---

### 2. Login Page Impact Banner -- Richer, Varied Sentences

**File:** `supabase/functions/generate-impact-statement/index.ts`

Update the system prompt to produce **5 varied lines** instead of the current rigid 2-line format. The new prompt will instruct the model to pick ONE framing style per request from these categories:

- **Grid replacement**: "X units of electricity just came from solar, not coal."
- **Emissions consequence**: "That switch avoided Y kg of CO2 from entering the air."
- **Tree equivalence**: "This impact is the same as planting Z trees."
- **Real-time feel**: "The power is already flowing through the grid right now."
- **Human attribution**: "This change happened moments ago -- because people chose clean energy."

The prompt will require the model to generate a **fresh combination of 3-5 short lines** each time, using different framings, so it never feels repetitive. Temperature will be raised from 0.4 to 0.7 for more variety.

---

### 3. Dashboard Lifetime Impact Pill -- Real-World Varied Sentences

**File:** `supabase/functions/generate-lifetime-impact/index.ts`

Update the system prompt with the user-provided framing variations:

**For Producers** (pick ONE per request):
- "Your rooftop sent X units of electricity into India's grid -- power that didn't come from coal."
- "By exporting solar power, you kept Y kg of CO2 out of the air."
- "This electricity is already flowing through wires, replacing fossil power."
- "Your home acted like a small power plant today -- clean and emission-free."
- "X clean units. Real power. Real emission cuts."

**For Consumers** (zero-state or active):
- Zero: "Your participation helps shift electricity demand away from coal and toward solar."
- Zero: "Every unit you support increases the share of clean power on the grid."
- Active: "When you choose clean energy, less fossil power is needed."
- Active: "You don't generate power -- but you influence what kind of power gets used."
- Active: "Your choices shape the grid, even before you see numbers."

Temperature raised to 0.7 for variety.

---

### 4. Loading State Improvements

**File:** `src/components/ImpactBanner.tsx`
- Replace the skeleton loading with text: **"Generating platform impact..."** with a subtle pulse animation

**File:** `src/components/dashboard/LifetimeImpactPill.tsx`
- Replace the skeleton loading with text: **"Generating your impact..."** with a subtle pulse animation

---

### 5. Fix SolarGPT Error Handling

**File:** `src/components/dashboard/panels/SolarGPTPanel.tsx`

Current issue: When OpenAI returns 429 errors, the function returns a 500 with an error message, but the frontend just shows a generic toast. Fixes:
- Better error message display inline (not just toast)
- Retry logic: if error occurs, show "Could not fetch answer. Tap to retry." on the card itself
- Surface rate-limit specific messages

---

### 6. SolarGPT Cards -- Real-World Examples in Prompts

**File:** `supabase/functions/solargpt/index.ts`

Enhance each card prompt with the concrete real-world example outputs the user provided, so the model uses them as reference for tone and style. Also raise temperature to 0.6 for more natural answers.

---

### 7. "Have a different question? Ask SolarGPT" -- Free-Text Input

**File:** `src/components/dashboard/panels/SolarGPTPanel.tsx`

Add below the 5 cards:
- A divider with text: **"Have a different question? Ask SolarGPT"**
- When clicked, reveals a text input field + send button
- Sends custom question to the `solargpt` edge function with a new `question_id: 0` (free-text mode)
- Answer displayed in the same answer area

**File:** `supabase/functions/solargpt/index.ts`

Add handling for `question_id: 0` OR a `custom_question` field:
- Accept the user's free-text question
- Still enforce all grounding rules (no speculation, use only provided data)
- Still fetch user context (role, credits, lifetime units)
- Pass the custom question with the same system prompt + user data

---

## Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `supabase/functions/generate-impact-statement/index.ts` | Switch to gpt-5.2, new varied prompt with 5 framing styles, temperature 0.7 |
| `supabase/functions/generate-lifetime-impact/index.ts` | Switch to gpt-5.2, new producer/consumer sample framings, temperature 0.7 |
| `supabase/functions/solargpt/index.ts` | Switch to gpt-5.2, add real-world examples to card prompts, add free-text mode (question_id 0 or custom_question), temperature 0.6 |
| `src/components/ImpactBanner.tsx` | Loading text: "Generating platform impact..." |
| `src/components/dashboard/LifetimeImpactPill.tsx` | Loading text: "Generating your impact..." |
| `src/components/dashboard/panels/SolarGPTPanel.tsx` | Better error handling with inline retry, add "Ask SolarGPT" free-text input section |

### No Database Changes Required

All changes are to edge functions and frontend components only.

