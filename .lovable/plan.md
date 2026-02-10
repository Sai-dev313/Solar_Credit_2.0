

# UI Improvements: Dashboard, Marketplace, Bill Payment, and Receipt

## Summary of Changes

This plan covers 7 distinct fixes across multiple files. No Stripe integration for now -- we'll keep the simulated UPI flow.

---

## 1. Producer Dashboard: Cash Balance Changes

**File:** `src/pages/ProducerDashboard.tsx`

- Set initial cash to `0` instead of `5000` in the default state
- Rename "Cash Balance" label to "Earned by Credits (Rs.)"
- Round credits display to nearest whole number using `Math.round()`

## 2. Consumer Dashboard: Update Credit Value

**File:** `src/pages/ConsumerDashboard.tsx`

- Change `profile.credits * 2` to `profile.credits * 3` for potential savings display
- Round credits display to nearest whole number

## 3. Credit-to-Rupee Offset: 1 Credit = Rs.3 (everywhere)

Update all references from Rs.2 to Rs.3:

| File | Change |
|------|--------|
| `src/components/BillPayment.tsx` | `savingsPerCredit = 3` |
| `src/components/dashboard/DashboardInfoCard.tsx` | "1 Credit = Rs.3 savings" (two places) |
| `src/components/home/FAQSection.tsx` | "1 credit = Rs.3 savings on your bill" |
| Database: `pay_bill` function | `v_credit_savings := p_credits_to_use * 3` |

## 4. Marketplace: Price Per Credit Limit (Rs.0.50 - Rs.2.50)

**File:** `src/components/dashboard/panels/ProducerMarketplacePanel.tsx`

- Add min/max validation on the price input field (`min="0.50"` `max="2.50"`)
- Show a warning if user enters a value outside the range
- Disable "List for Sale" button if price is out of range
- Update the `create_listing` database function to enforce the range server-side as well

## 5. Consumer Number: 10-Digit Numeric Validation

**File:** `src/components/BillPayment.tsx`

- Set `maxLength={10}` on the consumer number input
- Filter input to only allow digits (strip non-numeric characters on change)
- Show warning text if non-numeric characters are attempted or length is not exactly 10
- Disable "Fetch Bill" button until exactly 10 digits are entered

## 6. Slider Visibility Fix

**File:** `src/components/ui/slider.tsx`

The slider track and thumb may not be visible due to the `bg-secondary` color blending with the muted background. Fix:

- Add explicit styling to ensure the slider track and range are visible against the muted card background
- Make the thumb more prominent with a visible border/shadow

## 7. Download Receipt as PDF

**File:** `src/components/BillPayment.tsx`

Implement a client-side receipt download that generates a text/HTML file:

- Wire up the existing "Download Receipt" button
- Generate a formatted HTML receipt with all payment details
- Use `window.open` + `document.write` or create a Blob to trigger a download
- Include receipt ID, date, provider, consumer name, bill amount, credits applied, and UPI paid amount

---

## Technical Details

### Database Migration

A new migration to:
1. Update `pay_bill` function: change `p_credits_to_use * 2` to `p_credits_to_use * 3`
2. Update `create_listing` function: add price validation (`p_price_per_credit BETWEEN 0.5 AND 2.5`)

### Files Modified

| File | Changes |
|------|---------|
| `src/pages/ProducerDashboard.tsx` | Initial cash = 0, rename label, round credits |
| `src/pages/ConsumerDashboard.tsx` | Update savings multiplier to 3, round credits |
| `src/components/BillPayment.tsx` | savingsPerCredit = 3, consumer number validation (10-digit numeric only), download receipt functionality |
| `src/components/dashboard/panels/ProducerMarketplacePanel.tsx` | Price range validation 0.50-2.50 |
| `src/components/dashboard/DashboardInfoCard.tsx` | Update "Rs.2" to "Rs.3" text |
| `src/components/home/FAQSection.tsx` | Update "Rs.2" to "Rs.3" text |
| `src/components/ui/slider.tsx` | Improve track/thumb visibility |
| Database migration | Update `pay_bill` and `create_listing` functions |

