

# Advanced Strategy Planning Flow — Implementation Plan

## Overview

A new "Advanced Strategy Planning" flow powered by a real LLM (via `supabase/functions/advance-strategist/index.ts`) that behaves as a 10+ year Meta advertising expert. The AI conducts a multi-turn discovery conversation, determines the optimal campaign architecture (simple Advantage+ vs complex multi-campaign/multi-ad-set), presents an editable plan artifact, and executes on approval.

## UX Philosophy

```text
User intent → AI discovery conversation → AI-designed architecture → User review/edit → Auto-execute
```

No step wizards. No forms. The AI asks only what it needs via natural conversation + action chips.

---

## 1. New Edge Function: `supabase/functions/advance-strategist/index.ts`

System prompt encodes a senior Meta media buyer persona with:
- Deep knowledge of Meta campaign structure (Campaign → Ad Set → Ad hierarchy)
- Advantage+ Shopping vs manual campaign architecture decision logic
- Budget allocation best practices, audience structuring, creative strategy
- Guardrails: ask only essential questions, follow Meta policies

**Multi-turn conversation support**: The function accepts full `messages[]` history so the AI maintains context across turns. Uses tool-calling to extract structured output when the AI has enough info to generate the plan.

**Two modes**:
- **Discovery mode**: AI returns natural conversation text + optional `suggestedChips[]` for quick responses
- **Plan mode**: AI returns a structured `strategyPlan` JSON with campaigns, ad sets, ads, budgets, targeting, and creatives

**Tool-calling schema for structured plan extraction**:
```typescript
{
  planType: 'simple' | 'complex',
  // simple = 1 campaign, 1 ad set, 1-6 ads (Advantage+)
  // complex = multiple campaigns/ad sets
  campaigns: [{
    name, objective, budgetType, dailyBudget,
    adSets: [{
      name, targeting, budget, placements,
      ads: [{ name, format, primaryText, headline, cta }]
    }]
  }],
  totalDailyBudget, totalMonthlyBudget,
  rationale, confidenceScore,
  guardrailNotes: string[]
}
```

## 2. New Artifact Type: `strategy-architecture`

Added to `src/types/workspace.ts` as a new `ArtifactType`. Renders as a visual campaign architecture diagram showing:
- Campaign(s) with objectives and budget types
- Ad Set(s) with targeting summaries and budgets  
- Ad(s) with format indicators and creative briefs
- Inline editing for names, budgets, targeting
- Color-coded confidence scores per component
- "Simple vs Complex" badge at top

Rendered in `ArtifactRenderer.tsx` as `StrategyArchitectureBody`.

## 3. Intent Detection & Routing

Add `'advance-strategy'` intent to `detectIntent()`:
```
Keywords: 'advance strategy', 'advanced strategy', 'media buying', 
'campaign architecture', 'complex campaign', 'multiple ad sets',
'scaling strategy', 'advanced planning', 'meta strategy'
```

Add suggestion chip to `WorkspaceHome.tsx`:
```
{ label: '🧠 Advanced Strategy Planning', message: 'Help me plan an advanced Meta advertising strategy' }
```

## 4. Conversation Flow in `useWorkspace.ts`

### Entry
When `advance-strategy` intent detected → create thread titled "Advanced Strategy Planning" → send first AI message via edge function with empty history.

### Multi-turn Discovery  
Each user response (typed or chip-clicked) → append to `conversationHistoryRef` → call edge function with full history → render AI response + optional chips.

The AI will ask things like:
- "What's your product/service?"
- "What's your monthly ad budget?"
- "Have you run Meta ads before? What worked?"
- "Do you have multiple products/audiences to target?"
- "What's your primary KPI — ROAS, CPA, or volume?"

### Plan Generation
When the AI determines it has enough context, it returns a structured plan via tool-calling. The frontend:
1. Renders a `strategy-architecture` artifact with the full campaign tree
2. Shows action chips: "✅ Approve & Execute", "✏️ I want to tweak something", "🔄 Rethink the approach"

### Edit Loop
If user wants changes → their feedback goes back to the AI → AI returns an updated plan artifact (version incremented).

### Execution
On approval → simulated execution sequence:
1. "Creating Campaign 1..." 
2. "Configuring Ad Sets..."
3. "Assigning creatives..."
4. "✅ Everything is set up and ready to publish"
→ Shows `publish-confirmation` artifact

## 5. Guardrails Layer

Built into the edge function system prompt:
- **Minimum viable questions**: AI must determine strategy in ≤5 questions
- **No redundant asks**: If product info already exists in thread, skip
- **Meta policy compliance**: Flag restricted categories, required disclaimers
- **Budget sanity checks**: Warn if daily budget < $10 or > $10K
- **Structure validation**: Ensure every ad set has ≥1 ad, every campaign has objective

## 6. Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/advance-strategist/index.ts` | **Create** — New edge function with expert Meta strategist persona |
| `src/types/workspace.ts` | **Modify** — Add `'strategy-architecture'` to `ArtifactType` |
| `src/components/workspace/ArtifactRenderer.tsx` | **Modify** — Add `StrategyArchitectureBody` component with campaign tree visualization |
| `src/hooks/useWorkspace.ts` | **Modify** — Add `advance-strategy` intent, conversation history tracking, multi-turn AI calls, plan approval/execution handlers |
| `src/components/workspace/WorkspaceHome.tsx` | **Modify** — Add suggestion chip for advanced strategy |
| `supabase/config.toml` | **Modify** — Add function entry with `verify_jwt = false` |

## 7. Architecture Artifact Visual Design

```text
┌─────────────────────────────────────────────┐
│ 🏗️ Campaign Architecture    Simple │ Complex │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─ Campaign: Summer Sales (Sales) ─── $80/d │
│ │  ┌─ Ad Set: Broad 18-35 ──────── $50/d   │
│ │  │  ├─ Ad: Hero Image (Feed)              │
│ │  │  ├─ Ad: Carousel (Story)               │
│ │  │  └─ Ad: Video (Reels)                  │
│ │  └─ Ad Set: Retargeting ──────── $30/d    │
│ │     ├─ Ad: DPA Feed                       │
│ │     └─ Ad: Reminder Story                 │
│ └───────────────────────────────────────────│
│                                             │
│ Confidence: 87%  │  Total: $80/day          │
│ Rationale: "Advantage+ with retargeting..." │
└─────────────────────────────────────────────┘
```

Each node is clickable/editable. Budget bars show proportional allocation.

