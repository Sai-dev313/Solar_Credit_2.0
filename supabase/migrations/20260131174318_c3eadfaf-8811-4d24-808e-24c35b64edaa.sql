-- Drop the marketplace_listings_public view entirely
-- The application will now query directly from marketplace_listings which has proper RLS
DROP VIEW IF EXISTS public.marketplace_listings_public;