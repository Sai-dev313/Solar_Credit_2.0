
-- 1. Add credits_converted column to energy_logs
ALTER TABLE public.energy_logs ADD COLUMN credits_converted boolean NOT NULL DEFAULT false;

-- 2. Fix earn_credits() function (no-arg version using auth.uid())
CREATE OR REPLACE FUNCTION public.earn_credits()
 RETURNS TABLE(success boolean, message text, credits_earned numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_energy_log energy_logs%ROWTYPE;
  v_credits NUMERIC;
  v_today DATE := CURRENT_DATE;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'Not authenticated'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;

  SELECT * INTO v_energy_log 
  FROM energy_logs 
  WHERE user_id = v_user_id AND log_date = v_today
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'No energy log for today'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;

  -- Check if already converted
  IF v_energy_log.credits_converted THEN
    RETURN QUERY SELECT false, 'Credits already earned today'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  v_credits := COALESCE(v_energy_log.sent_to_grid, 0);
  
  IF v_credits <= 0 THEN
    RETURN QUERY SELECT false, 'No energy to convert'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Update profile credits
  UPDATE profiles SET credits = credits + v_credits WHERE id = v_user_id;
  
  -- Mark as converted (keep sent_to_grid intact!)
  UPDATE energy_logs SET credits_converted = true WHERE id = v_energy_log.id;
  
  RETURN QUERY SELECT true, 'Credits earned'::TEXT, v_credits;
END;
$function$;

-- 3. Fix earn_credits(p_user_id) overload
CREATE OR REPLACE FUNCTION public.earn_credits(p_user_id uuid)
 RETURNS TABLE(success boolean, message text, credits_earned numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_energy_log energy_logs%ROWTYPE;
  v_credits NUMERIC;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT * INTO v_energy_log 
  FROM energy_logs 
  WHERE user_id = p_user_id AND log_date = v_today
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'No energy log for today'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;

  IF v_energy_log.credits_converted THEN
    RETURN QUERY SELECT false, 'Credits already earned today'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  v_credits := COALESCE(v_energy_log.sent_to_grid, 0);
  
  IF v_credits <= 0 THEN
    RETURN QUERY SELECT false, 'No energy to convert'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  UPDATE profiles SET credits = credits + v_credits WHERE id = p_user_id;
  UPDATE energy_logs SET credits_converted = true WHERE id = v_energy_log.id;
  
  RETURN QUERY SELECT true, 'Credits earned'::TEXT, v_credits;
END;
$function$;

-- 4. Fix log_energy() - add validation that generated >= used
CREATE OR REPLACE FUNCTION public.log_energy(p_generated numeric, p_used numeric)
 RETURNS TABLE(success boolean, message text, sent_to_grid numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_sent_to_grid NUMERIC;
  v_today DATE := CURRENT_DATE;
  v_existing_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'Not authenticated'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;

  IF p_generated < 0 THEN
    RETURN QUERY SELECT false, 'Generated energy cannot be negative'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  IF p_used < 0 THEN
    RETURN QUERY SELECT false, 'Used energy cannot be negative'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;

  IF p_generated > 10000 THEN
    RETURN QUERY SELECT false, 'Generated energy exceeds maximum allowed (10000 kWh)'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  IF p_used > 10000 THEN
    RETURN QUERY SELECT false, 'Used energy exceeds maximum allowed (10000 kWh)'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;

  -- Validation: generated must be >= used
  IF p_generated < p_used THEN
    RETURN QUERY SELECT false, 'Generated energy must be greater than or equal to used energy'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  v_sent_to_grid := GREATEST(0, p_generated - p_used);
  
  SELECT id INTO v_existing_id 
  FROM energy_logs 
  WHERE user_id = v_user_id AND log_date = v_today;
  
  IF v_existing_id IS NOT NULL THEN
    UPDATE energy_logs 
    SET generated = p_generated, used = p_used, sent_to_grid = v_sent_to_grid
    WHERE id = v_existing_id;
  ELSE
    INSERT INTO energy_logs (user_id, generated, used, sent_to_grid, log_date)
    VALUES (v_user_id, p_generated, p_used, v_sent_to_grid, v_today);
  END IF;
  
  RETURN QUERY SELECT true, 'Energy logged successfully'::TEXT, v_sent_to_grid;
END;
$function$;

-- 5. Fix existing data: restore sent_to_grid for rows that were zeroed out
UPDATE energy_logs 
SET sent_to_grid = GREATEST(0, generated - used),
    credits_converted = true
WHERE sent_to_grid = 0 AND generated > used;
