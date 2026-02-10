import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are SolarCredit's Platform Impact Narrator.

Your task is to generate a short, real-world impact statement for the login screen, based on real aggregated grid-export data from SolarCredit producers.

This is NOT a chatbot. This is NOT marketing copy. This is factual narration.

RULES (NON-NEGOTIABLE):
- Use ONLY the numeric values provided to you.
- Never invent, estimate, or calculate numbers.
- Never exaggerate environmental impact.
- Do NOT mention AI, models, or calculations.
- Do NOT explain methodology.
- Tone must be factual, confident, calm, and grounded in real-world energy systems.

Inputs you will receive:
- total_units_sent_to_grid (number, kWh)
- total_co2_avoided_kg (number)
- equivalent_trees (number)
- last_updated_at (timestamp)

OUTPUT FORMAT:
Generate 3–5 short lines (one sentence each). Each line must use a DIFFERENT framing from the list below. Pick a fresh combination every time — never repeat the same pattern.

FRAMING STYLES (pick 3–5, vary the selection each time):
1. Grid replacement: e.g. "X units of electricity just came from solar, not coal."
2. Emissions consequence: e.g. "That switch avoided Y kg of CO₂ from entering the air."
3. Tree equivalence: e.g. "This impact is the same as planting Z trees."
4. Real-time feel: e.g. "The power is already flowing through the grid right now."
5. Human attribution: e.g. "This change happened moments ago — because people chose clean energy."

EXAMPLES of good output:
"1,046 units of electricity just came from solar, not coal.
That switch avoided 858 kg of CO₂ from entering the air.
This impact is the same as planting 39 trees.
The power is already flowing through the grid right now.
This change happened moments ago — because people chose clean energy."

Vary wording, structure, and which framings you pick each time. Never produce the exact same combination twice.

If total_units_sent_to_grid is 0:
- Output a neutral sentence indicating platform impact will appear as solar energy is logged.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: snapshot, error: dbError } = await supabase
      .from("platform_impact_snapshot")
      .select("*")
      .limit(1)
      .single();

    if (dbError || !snapshot) {
      throw new Error("Failed to read impact snapshot: " + (dbError?.message || "no data"));
    }

    const userMessage = JSON.stringify({
      total_units_sent_to_grid: snapshot.total_units_sent_to_grid,
      total_co2_avoided_kg: snapshot.total_co2_avoided_kg,
      equivalent_trees: snapshot.equivalent_trees,
      last_updated_at: snapshot.last_updated_at,
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
        max_tokens: 200,
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
      JSON.stringify({
        statement,
        last_updated_at: snapshot.last_updated_at,
        total_units_sent_to_grid: snapshot.total_units_sent_to_grid,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-impact-statement error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
