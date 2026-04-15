import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch all data for this user
    const [customersRes, entriesRes] = await Promise.all([
      supabase.from("customers").select("*").eq("user_id", user.id),
      supabase.from("milk_entries").select("*").eq("user_id", user.id).order("date", { ascending: true }),
    ]);

    const customers = customersRes.data || [];
    const entries = entriesRes.data || [];

    if (entries.length < 3) {
      return new Response(JSON.stringify({
        predictions: null,
        message: "Need at least 3 milk entries to generate predictions. Keep adding daily records!",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Prepare data summary for AI
    const villageCustomers = customers.filter((c: any) => c.type === "village");
    const cityCustomers = customers.filter((c: any) => c.type === "city");

    const dailyData: Record<string, { bought: number; sold: number }> = {};
    for (const e of entries) {
      const date = e.date;
      if (!dailyData[date]) dailyData[date] = { bought: 0, sold: 0 };
      const cust = customers.find((c: any) => c.id === e.customer_id);
      if (cust?.type === "village") dailyData[date].bought += Number(e.liters);
      else dailyData[date].sold += Number(e.liters);
    }

    const sortedDates = Object.keys(dailyData).sort();
    const last30 = sortedDates.slice(-30);
    const dataSummary = last30.map(d => `${d}: bought=${dailyData[d].bought}L, sold=${dailyData[d].sold}L`).join("\n");

    const monthlyTotals: Record<string, { bought: number; sold: number; revenue: number; cost: number }> = {};
    for (const e of entries) {
      const month = e.date.substring(0, 7);
      if (!monthlyTotals[month]) monthlyTotals[month] = { bought: 0, sold: 0, revenue: 0, cost: 0 };
      const cust = customers.find((c: any) => c.id === e.customer_id);
      if (cust?.type === "village") {
        monthlyTotals[month].bought += Number(e.liters);
        monthlyTotals[month].cost += Number(e.total);
      } else {
        monthlyTotals[month].sold += Number(e.liters);
        monthlyTotals[month].revenue += Number(e.total);
      }
    }

    const monthlySummary = Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([m, d]) => `${m}: bought=${d.bought}L (Rs.${d.cost}), sold=${d.sold}L (Rs.${d.revenue}), profit=Rs.${d.revenue - d.cost}`)
      .join("\n");

    const prompt = `You are a dairy business analytics AI for a milkman in Pakistan.

Data:
- ${villageCustomers.length} village suppliers, ${cityCustomers.length} city buyers
- Total entries: ${entries.length}

Daily data (last 30 days):
${dataSummary}

Monthly totals:
${monthlySummary}

Analyze this data and provide predictions in the following JSON format. All amounts in PKR (Rs.):
{
  "supplyForecast": {
    "nextWeekLiters": <number>,
    "nextMonthLiters": <number>,
    "trend": "increasing" | "decreasing" | "stable",
    "confidence": <0-100>,
    "insight": "<one sentence>"
  },
  "demandForecast": {
    "nextWeekLiters": <number>,
    "nextMonthLiters": <number>,
    "trend": "increasing" | "decreasing" | "stable",
    "confidence": <0-100>,
    "insight": "<one sentence>"
  },
  "profitAnalysis": {
    "currentMonthEstimate": <number in Rs>,
    "nextMonthEstimate": <number in Rs>,
    "trend": "increasing" | "decreasing" | "stable",
    "insight": "<one sentence>"
  },
  "recommendations": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>"],
  "seasonalInsights": "<paragraph about seasonal patterns observed>"
}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a dairy business analytics expert. Return ONLY valid JSON, no markdown." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "provide_analytics",
            description: "Provide milk business analytics predictions",
            parameters: {
              type: "object",
              properties: {
                supplyForecast: {
                  type: "object",
                  properties: {
                    nextWeekLiters: { type: "number" },
                    nextMonthLiters: { type: "number" },
                    trend: { type: "string", enum: ["increasing", "decreasing", "stable"] },
                    confidence: { type: "number" },
                    insight: { type: "string" },
                  },
                  required: ["nextWeekLiters", "nextMonthLiters", "trend", "confidence", "insight"],
                },
                demandForecast: {
                  type: "object",
                  properties: {
                    nextWeekLiters: { type: "number" },
                    nextMonthLiters: { type: "number" },
                    trend: { type: "string", enum: ["increasing", "decreasing", "stable"] },
                    confidence: { type: "number" },
                    insight: { type: "string" },
                  },
                  required: ["nextWeekLiters", "nextMonthLiters", "trend", "confidence", "insight"],
                },
                profitAnalysis: {
                  type: "object",
                  properties: {
                    currentMonthEstimate: { type: "number" },
                    nextMonthEstimate: { type: "number" },
                    trend: { type: "string", enum: ["increasing", "decreasing", "stable"] },
                    insight: { type: "string" },
                  },
                  required: ["currentMonthEstimate", "nextMonthEstimate", "trend", "insight"],
                },
                recommendations: { type: "array", items: { type: "string" } },
                seasonalInsights: { type: "string" },
              },
              required: ["supplyForecast", "demandForecast", "profitAnalysis", "recommendations", "seasonalInsights"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "provide_analytics" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let predictions;
    if (toolCall?.function?.arguments) {
      predictions = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } else {
      // Fallback: try parsing content
      const content = aiData.choices?.[0]?.message?.content || "";
      predictions = JSON.parse(content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
    }

    return new Response(JSON.stringify({ predictions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("predict-analytics error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
