

# Fix Impact Banner: Always Display AI-Generated Statement

## Problem

The edge function works correctly and the AI generates a proper zero-state message when no energy data exists. However, the frontend component in `ImpactBanner.tsx` hides the banner when `total_units_sent_to_grid === 0`, so the user never sees it.

The AI response is: *"No solar energy has been logged yet. Impact data will appear as you contribute."* -- this is a valid, useful message that should be shown.

## Fix

### 1. Update `src/components/ImpactBanner.tsx`

Remove the logic that hides the banner when `total_units_sent_to_grid === 0`. The AI already handles the zero-state gracefully in its prompt, so we should always display whatever the AI returns.

**Current (broken):**
```typescript
if (!data.statement || data.total_units_sent_to_grid === 0) {
  setHidden(true);
  return;
}
```

**Fixed:**
```typescript
if (!data.statement) {
  setHidden(true);
  return;
}
```

This single change ensures the banner always appears as long as the AI returns a statement -- whether the platform has 0 units or 124,380 units.

### 2. No other changes needed

- The database table, refresh function, trigger, and edge function are all working correctly
- The AI prompt already handles the zero-state case properly
- The UI design (dark card, leaf icon, skeleton loader) is already in place

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/ImpactBanner.tsx` | Modify | Remove the `total_units_sent_to_grid === 0` hide condition (1 line change) |

