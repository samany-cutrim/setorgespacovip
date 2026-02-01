# Migration Guide: Fix Reservations in Financial and Reports

## Problem
Reservations were not appearing correctly in the financial section and reports due to database schema issues.

## Changes Made

### 1. Database Schema Changes
- **Added `status` field** to the `payments` table with default value 'received'
- **Made `reservation_id` nullable** in the `payments` table to allow standalone income entries (not linked to a reservation)

### 2. Code Changes
- **Updated Payment type interface** to reflect nullable `reservation_id` and added `status` field
- **Fixed payment creation** to use correct field name `payment_date` instead of `date`
- **Added income registration dialog** allowing users to register standalone income or link it to a reservation
- **Fixed date display consistency** - all payment dates now use `payment_date` instead of `created_at`
- **Fixed report filtering** to use `payment_date` for accurate period filtering

## How to Apply the Migration

### Option 1: Using Supabase CLI (Recommended)
```bash
# Make sure you're in the project directory
cd /path/to/setorgespacovip

# Apply the migration
supabase db push
```

### Option 2: Manual SQL Execution
If you prefer to apply the migration manually via Supabase Dashboard:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Run the following SQL:

```sql
-- Add status field to payments table
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'received';

-- Make reservation_id nullable to allow standalone income entries
ALTER TABLE public.payments 
ALTER COLUMN reservation_id DROP NOT NULL;

-- Update existing payments to have 'received' status
UPDATE public.payments 
SET status = 'received' 
WHERE status IS NULL;
```

### After Applying the Migration

After the migration is applied, you should regenerate the Supabase TypeScript types:

```bash
# Generate types
supabase gen types typescript --project-id <your-project-id> > src/integrations/supabase/types.ts
```

Or if you have the types generation configured in your project:
```bash
npm run generate-types
# or
yarn generate-types
```

## Testing the Changes

### Test Financial Page
1. Navigate to `/admin/financial`
2. Click on "Receitas" tab
3. Click "Registrar Receita" button
4. Test creating:
   - A standalone income (without selecting a reservation)
   - An income linked to a reservation
5. Verify that both types of income appear in the list

### Test Reports Page
1. Navigate to `/admin/reports`
2. Select a date range that includes your test payments
3. Verify that:
   - Reservations appear in the "Reservas" tab
   - Income entries appear in the "Receitas" tab
   - The dates displayed match the payment dates you entered
   - CSV export includes all the data correctly

## What This Fixes

✅ Allows creating income entries without a linked reservation  
✅ Payments now have a status field for better tracking  
✅ Payment dates are displayed consistently across all pages  
✅ Reports filter by actual payment date, not creation timestamp  
✅ Financial summary includes all income sources (reservation-linked and standalone)

## Notes

- The `reservation_id` can now be `null`, allowing standalone income tracking
- All existing payments will have their status set to 'received' automatically
- The migration is safe to apply on existing data
