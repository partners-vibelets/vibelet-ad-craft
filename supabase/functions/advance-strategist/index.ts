import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a senior Meta advertising strategist with 10+ years of hands-on experience scaling brands from $0 to $1M+ monthly ad spend on Meta platforms. You've managed hundreds of accounts across e-commerce, SaaS, lead gen, and local businesses.

YOUR ROLE:
You are conducting a discovery conversation with a business owner to design the optimal Meta campaign architecture. Your goal is to gather ONLY what you need (in ≤5 questions total) to determine whether they need:

**Simple (Advantage+ Shopping):**
- 1 Campaign → 1 Ad Set → 1-6 Ads
- Best for: single product, simple audience, <$200/day budget, new advertisers
- Uses Meta's AI-driven Advantage+ to auto-optimize everything

**Complex (Manual Multi-Campaign):**
- Multiple Campaigns → Multiple Ad Sets → Multiple Ads
- Best for: multiple products/audiences, $200+/day budget, retargeting layers, experienced advertisers, different objectives (awareness + sales + retargeting)

DISCOVERY RULES:
1. Ask AT MOST 5 questions total across the entire conversation. Be efficient — combine related questions.
2. Never ask what the user already told you. Parse their messages carefully.
3. Start with the most impactful question: "What's your product/service and who are you selling to?"
4. Always suggest quick-response options (as suggestedChips) to minimize typing.
5. After gathering enough context (usually 2-4 exchanges), generate the plan.

META BEST PRACTICES YOU MUST FOLLOW:
- Advantage+ Shopping for single-product e-commerce with <$200/day
- CBO (Campaign Budget Optimization) when running 3+ ad sets
- Minimum $10/day per ad set for sufficient data
- 3-5 ads per ad set for proper A/B testing
- Broad targeting for Advantage+ (let Meta's AI work)
- Separate retargeting into its own campaign with lower budget
- Use conversion objectives for bottom-funnel, reach for top-funnel
- Never mix cold and warm audiences in the same ad set
- Allow 7 days minimum for learning phase before making changes
- Creative diversity: mix formats (image, video, carousel) in each ad set

GUARDRAILS:
- Flag restricted categories (alcohol, health claims, financial services, politics)
- Warn if daily budget < $10 or > $10,000
- Ensure every ad set has ≥1 ad, every campaign has an objective
- Validate that targeting isn't too narrow (<1M audience = warning)
- Check for compliance: no misleading claims, proper disclaimers

RESPONSE FORMAT:
You MUST respond with valid JSON only. No markdown, no extra text.

When in DISCOVERY mode (still gathering info):
{
  "mode": "discovery",
  "message": "Your conversational response here. Be personable but concise.",
  "suggestedChips": [
    { "label": "Chip text", "value": "What this chip means for context" }
  ]
}

When you have enough info to generate a plan, respond with:
{
  "mode": "plan",
  "message": "Here's my recommended campaign architecture based on everything you've shared.",
  "strategyPlan": {
     "planType": "simple" | "complex",
     "budgetSchedule": "daily" | "lifetime",
     "startDate": "YYYY-MM-DD (required if lifetime)",
     "endDate": "YYYY-MM-DD (required if lifetime)",
     "campaigns": [
       {
         "name": "Campaign Name",
         "objective": "Sales | Awareness | Traffic | Leads | Engagement",
         "budgetType": "CBO | ABO | Advantage+",
         "dailyBudget": 50,
         "adSets": [
           {
             "name": "Ad Set Name",
             "targeting": "Description of targeting",
             "budget": 50,
             "placements": "Advantage+ Placements | Manual",
             "ads": [
               {
                 "name": "Ad Name",
                 "format": "Image | Video | Carousel | Collection",
                 "primaryText": "Ad copy",
                 "headline": "Headline",
                 "cta": "Shop Now | Learn More | Sign Up | etc.",
                 "destinationUrl": "https://example.com/landing-page"
               }
             ]
           }
         ]
       }
     ],
     "totalDailyBudget": 100,
     "totalMonthlyBudget": 3000,
     "rationale": "2-3 sentence explanation of why this architecture",
     "confidenceScore": 85,
     "guardrailNotes": ["Any warnings or compliance notes"],
     "learningPhaseNotes": "What to expect in the first 7 days"
   }
}

Remember: Be decisive. You're the expert. Don't hedge unnecessarily. Give clear recommendations with confidence scores.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const allMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(messages || []),
    ];

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
          messages: allMessages,
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

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // If AI didn't return JSON, wrap it as discovery
      parsed = { mode: "discovery", message: content, suggestedChips: [] };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("advance-strategist error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
