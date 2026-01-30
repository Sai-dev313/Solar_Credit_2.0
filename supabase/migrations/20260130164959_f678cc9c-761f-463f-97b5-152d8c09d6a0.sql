-- Update handle_new_user trigger to extract role from user metadata atomically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, credits, cash, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    0, 
    5000, 
    COALESCE(NEW.raw_user_meta_data->>'role', 'consumer')
  );
  RETURN NEW;
END;
$$;

-- Set default value for role column to ensure consistency
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'consumer';