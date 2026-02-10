CREATE OR REPLACE FUNCTION public.refresh_impact_snapshot()
RETURNS void AS $$
DECLARE
  total_units numeric;
  co2_kg numeric;
  trees int;
  snapshot_id uuid;
BEGIN
  SELECT COALESCE(SUM(sent_to_grid), 0) INTO total_units FROM public.energy_logs;
  co2_kg := total_units * 0.82;
  trees := FLOOR(co2_kg / 22);

  SELECT id INTO snapshot_id FROM public.platform_impact_snapshot LIMIT 1;

  UPDATE public.platform_impact_snapshot
  SET total_units_sent_to_grid = total_units,
      total_co2_avoided_kg = co2_kg,
      equivalent_trees = trees,
      last_updated_at = now()
  WHERE id = snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;