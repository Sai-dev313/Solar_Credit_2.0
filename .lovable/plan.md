

# Fix Energy Logging, Data Persistence, and Impact Snapshot

## Problems Identified

1. **Data resets on refresh**: The `earn_credits()` database function sets `sent_to_grid = 0` after converting to credits. This means on page refresh, the UI reads 0 from the database -- losing the original values. The `credits_converted` state only lives in React memory.

2. **Impact snapshot shows 0**: Because `earn_credits()` zeroes out `sent_to_grid`, the snapshot aggregation `SUM(sent_to_grid)` across all users returns 0.

3. **No input validation for manual entry**: Users can enter unrealistic values (e.g., 1000 kWh generated) or values where "used" exceeds "generated", which makes no sense for solar producers.

## Root Cause

The `earn_credits()` function does `UPDATE energy_logs SET sent_to_grid = 0` after conversion. This destroys the original data. Instead, we need a separate flag to track conversion status.

## Solution

### 1. Database: Add `credits_converted` column to `energy_logs`

```sql
ALTER TABLE energy_logs ADD COLUMN credits_converted boolean NOT NULL DEFAULT false;
```

This preserves `sent_to_grid` values permanently while tracking whether credits were already earned.

### 2. Database: Fix `earn_credits()` function

Change from resetting `sent_to_grid = 0` to setting `credits_converted = true`:

- Check `credits_converted = false` before allowing conversion
- Set `credits_converted = true` instead of zeroing `sent_to_grid`
- The original `sent_to_grid` value stays intact for aggregation and display

### 3. Database: Fix `log_energy()` function -- add validation

- Reject if `generated < used` (for manual entries, generated must be >= used)
- Keep the existing max 10,000 kWh cap

### 4. Frontend: Update `ProducerDashboard.tsx` -- read `credits_converted` from DB

Change the energy log fetch to also select `credits_converted`:

```typescript
.select('generated, used, sent_to_grid, credits_converted')
```

This way the conversion state survives refresh and navigation.

### 5. Frontend: Update `LogEnergyPanel.tsx` -- add input validation warnings

- Show a warning when `generated < used` (power generated must be greater than or equal to power used)
- Disable the "Log Energy" button if validation fails
- Keep smart meter feed exempt (auto-generated values are always valid)

### 6. Impact snapshot will auto-fix

Since `sent_to_grid` will no longer be zeroed out, the existing trigger on `energy_logs` will correctly aggregate all units across all producers.

## Technical Details

### Modified Files

| File | Action | Description |
|------|--------|-------------|
| Database migration | Create | Add `credits_converted` column, fix `earn_credits()`, fix `log_energy()` |
| `src/pages/ProducerDashboard.tsx` | Modify | Read `credits_converted` from DB instead of inferring it |
| `src/components/dashboard/panels/LogEnergyPanel.tsx` | Modify | Add validation: generated must be >= used, show warning |

### Database Function Changes

**`earn_credits()` -- before:**
```sql
UPDATE energy_logs SET sent_to_grid = 0 WHERE id = v_energy_log.id;
```

**`earn_credits()` -- after:**
```sql
-- Check not already converted
IF v_energy_log.credits_converted THEN
  RETURN QUERY SELECT false, 'Credits already earned today', 0;
  RETURN;
END IF;
-- Mark as converted (keep sent_to_grid intact)
UPDATE energy_logs SET credits_converted = true WHERE id = v_energy_log.id;
```

**`log_energy()` -- add validation:**
```sql
IF p_generated < p_used THEN
  RETURN QUERY SELECT false, 'Generated energy must be >= used energy', 0;
  RETURN;
END IF;
```

### Frontend Validation (LogEnergyPanel)

- When user manually enters values, show a red warning if `generated < used`
- Disable "Log Energy" button when invalid
- Smart meter simulation always produces valid values (generated > used)

### Data Fix

Also run a one-time update to fix the existing `energy_logs` rows where `sent_to_grid` was incorrectly zeroed but energy was actually generated:

```sql
UPDATE energy_logs 
SET sent_to_grid = GREATEST(0, generated - used),
    credits_converted = true
WHERE sent_to_grid = 0 AND generated > used;
```

This restores the correct `sent_to_grid` values and marks them as already converted, which will also fix the `platform_impact_snapshot` totals via the trigger.

