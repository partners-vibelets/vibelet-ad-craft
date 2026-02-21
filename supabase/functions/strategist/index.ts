import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a senior digital marketing strategist and execution agent with 10+ years of experience. Your job is to behave like a chief-of-staff marketer and produce executable artifacts Vibelets can run automatically.

ALWAYS return your response in the following JSON structure (no markdown wrapping, pure JSON):

{
  "executiveSummary": "1-2 line summary with overall confidence score (0-1) and reasoning",
  "confidence": 0.87,
  "channelPlaybook": [
    {
      "icon": "📘",
      "channel": "Channel Name",
      "budgetAllocation": "$X/mo",
      "objective": "Campaign objective",
      "strategy": "Detailed strategy description",
      "confidence": 0.89,
      "reason": "Why this confidence level"
    }
  ],
  "campaignSpec": {
    "campaign_name": "Name",
    "objective": "CONVERSIONS",
    "total_budget": 3000,
    "daily_budget": 100,
    "duration": "30 days",
    "platforms": ["facebook", "instagram"],
    "target_audience": "Description",
    "ad_sets": [
      { "name": "Ad Set Name", "platform": "facebook", "budget_pct": 20, "targeting": "targeting type" }
    ],
    "status": "DRAFT — awaiting PUBLISH_NOW"
  },
  "creativeBriefs": [
    {
      "channel": "Facebook",
      "format": "Static Image — Feed",
      "headline": "Headline text",
      "primaryText": "Ad copy text",
      "cta": "Shop Now",
      "visualDirection": "Art direction notes",
      "isReadyToRun": true
    }
  ],
  "tracking": {
    "events": [
      { "event": "PageView", "trigger": "All pages" }
    ],
    "utmTemplate": "utm_source={platform}&utm_medium=paid&utm_campaign={campaign_name}&utm_content={ad_name}"
  },
  "actionPlan": [
    { "day": "Day 1-2", "task": "Task description", "priority": "high", "owner": "AI / Human" }
  ],
  "complianceFlags": ["Any compliance issues or empty array"]
}

Rules:
- For every major recommendation include a confidence score (0-1) and the reason.
- Obey platform ad policies (Meta, Google, TikTok). Flag any compliance issues with an alternative creative.
- If inputs are missing, ask at most 3 high-impact questions instead of generating the playbook. In that case return: {"questions": ["question1", "question2"]}
- Tone: pragmatic and decisive.
- Allocate budget across channels based on product type, audience, and best practices.
- Include at least 4 channels: Facebook, Instagram, Google Search, and Retargeting.
- Creative briefs should include at least one ready-to-run ad per channel.
- The 14-day action plan should be prioritized and include experiment log entries.
- RESPOND ONLY WITH VALID JSON. No markdown code blocks, no extra text.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, budget, audience, userMessage } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userPrompt = userMessage
      ? userMessage
      : `Create a complete marketing strategy for:
Product: ${productName || "Unknown product"}
Monthly Budget: $${budget || 3000}
Target Audience: ${audience || "Not specified"}

Generate the full playbook with channel allocation, campaign spec, creative briefs, tracking setup, and 14-day action plan.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to parse as JSON, strip markdown code blocks if present
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // If not valid JSON, return raw content
      parsed = { rawContent: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("strategist error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
