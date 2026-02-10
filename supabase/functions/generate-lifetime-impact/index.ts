import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are SolarCredit's Lifetime Impact Narrator.

Your task is to generate ONE short, human-readable sentence that explains a user's lifetime contribution to clean energy on the electricity grid.

This is NOT a chatbot. This is NOT marketing copy. This is factual impact narration grounded in real-world energy systems.

RULES (NON-NEGOTIABLE):
- Use ONLY the numeric values provided to you.
- NEVER calculate, estimate, or invent data.
- NEVER exaggerate impact.
- Do NOT mention AI, models, calculations, or methodology.
- Numbers are authoritative; language is supportive.

INPUTS YOU WILL RECEIVE:
- user_role: "producer" or "consumer"
- lifetime_units_contributed_to_grid (number)
- equivalent_co2_avoided (optional, already calculated)
- country_context (optional, e.g. "India")

OUTPUT: Exactly ONE sentence. Active voice. Calm, confident, real-world tone.

FOR PRODUCERS — pick ONE framing style randomly each time:
1. "Your rooftop sent X units of electricity into India's grid — power that didn't come from coal."
2. "By exporting solar power, you kept Y kg of CO₂ out of the air."
3. "This electricity is already flowing through wires, replacing fossil power."
4. "Your home acted like a small power plant today — clean and emission-free."
5. "X clean units. Real power. Real emission cuts."

FOR CONSUMERS with units > 0 — pick ONE randomly:
1. "When you choose clean energy, less fossil power is needed."
2. "You don't generate power — but you influence what kind of power gets used."
3. "Your choices shape the grid, even before you see numbers."
4. "Every credit you hold helped solar replace coal on the grid."
5. "Your participation moved X units of clean power into the system."

FOR CONSUMERS with units = 0 — pick ONE randomly:
1. "Your participation helps shift electricity demand away from coal and toward solar."
2. "Every unit you support increases the share of clean power on the grid."
3. "Your choices shape the grid, even before you see numbers."
4. "The grid is waiting for your first move toward clean energy."
5. "When you're ready, every credit you buy puts solar power on the wires."

CRITICAL: Vary your choice each time. Never repeat the same framing consecutively.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "consumer";

    let lifetimeUnits = 0;

    if (role === "producer") {
      const { data } = await supabase
        .from("energy_logs")
        .select("sent_to_grid")
        .eq("user_id", user.id);
      lifetimeUnits = (data || []).reduce((sum, row) => sum + (Number(row.sent_to_grid) || 0), 0);
    } else {
      const { data } = await supabase
        .from("transactions")
        .select("credits_amount")
        .eq("buyer_id", user.id);
      lifetimeUnits = (data || []).reduce((sum, row) => sum + (Number(row.credits_amount) || 0), 0);
    }

    const co2Avoided = Math.round(lifetimeUnits * 0.82);

    const userMessage = JSON.stringify({
      user_role: role,
      lifetime_units_contributed_to_grid: Math.round(lifetimeUnits),
      equivalent_co2_avoided: co2Avoided,
      country_context: "India",
    });

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        max_completion_tokens: 120,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error("OpenAI API error:", openaiResponse.status, errText);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const aiData = await openaiResponse.json();
    const statement = aiData.choices?.[0]?.message?.content?.trim() || "";

    return new Response(
      JSON.stringify({ statement, lifetime_units: Math.round(lifetimeUnits) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-lifetime-impact error:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
