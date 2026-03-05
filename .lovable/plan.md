

# Post-Strategy Approval → End-to-End Execution Flow

## Overview

When the user approves their advanced strategy plan, instead of immediately jumping to "published", the AI orchestrates a full execution pipeline: creative sourcing (use-case templates, avatar selection, script selection), generation with engaging wait UX, campaign configuration, Facebook connect, device preview, and publishing — all within the same 2-column layout.

## Key Design Decisions

1. **Column 2 becomes a multi-purpose execution canvas** — it transitions from the Strategy Map to creative setup panels (use-case templates, avatar grid, video setup, generation progress, creative results) as the execution progresses
2. **Column 1 stays the conversation command center** — all decisions, AI recommendations, and action chips live here
3. **"Deep work" loading experience** — when AI performs time-consuming tasks (creative generation, campaign configuration), column 2 shows an animated multi-step progress UI inspired by Perplexity/ChatGPT deep research, with rotating status messages, fun facts, and a progress timeline
4. **AI recommends at every step** — avatar, script, template all have AI-recommended badges; user can override or accept

## Execution Flow After Strategy Approval

```text
Strategy Approved
  ↓
Step 1: Creative Sourcing (Col1: "How to source?" chips → Col2: use-case templates)
  ↓
Step 2: Video Setup (Col1: AI recommends avatar + script → Col2: video-setup panel with avatar grid, script editor)
  ↓
Step 3: Generation (Col1: fun waiting messages → Col2: DeepWorkProgress component with animated steps)
  ↓
Step 4: Results Review (Col1: "Approve creatives?" → Col2: creative results gallery)
  ↓
Step 5: Facebook Connect (Col1: connect flow → Col2: account selection panel)
  ↓
Step 6: Campaign Config (Col1: summary → Col2: campaign config with editable fields)
  ↓
Step 7: Device Preview (Col1: "Ready to publish?" → Col2: mobile/desktop preview)
  ↓
Step 8: Publish (Col1: publish confirmation → Col2: confetti + success)
```

## New Component: DeepWorkProgress

A fun, engaging loading experience for Column 2 during time-consuming AI tasks. Inspired by ChatGPT's "Thinking" and Perplexity's "Searching" UX:

- Animated timeline with sequential steps (each with icon, label, sublabel)
- Steps auto-advance with checkmarks
- Rotating "fun fact" / "did you know" carousel at the bottom
- Pulsing brain/sparkle animation in the center
- Progress percentage with smooth transitions
- Example steps for creative generation: "Analyzing your product...", "Selecting best angles...", "Rendering video frames...", "Applying brand colors...", "Final polish..."

## New State: `executionPanelContent`

A new state in `useWorkspace` that determines what renders in Column 2 during post-strategy execution:

- `'strategy-map'` — default, shows StrategyMapPanel
- `'use-case-templates'` — shows template gallery
- `'video-setup'` — shows avatar + script + settings panel
- `'deep-work'` — shows DeepWorkProgress with configurable steps
- `'creative-results'` — shows generated creatives gallery
- `'facebook-connect'` — shows FB account selection
- `'campaign-config'` — shows campaign hierarchy config
- `'device-preview'` — shows mobile/desktop ad preview
- `null` — reverts to single-column

When `activeStrategyArtifact` exists AND the execution flow is active, Column 2 switches content based on this state.

## Files to Create/Modify

| File | Change |
|------|--------|
| `src/components/workspace/DeepWorkProgress.tsx` | **Create** — Animated multi-step loading component with fun facts, rotating messages, progress timeline |
| `src/components/workspace/ExecutionPanel.tsx` | **Create** — Wrapper that switches between StrategyMapPanel, template gallery, video setup, deep work, results, FB connect, config, preview based on `executionPanelContent` state |
| `src/hooks/useWorkspace.ts` | **Modify** — Add `executionPanelContent` state, rewrite `approve-advance-strategy` handler to orchestrate multi-step execution flow with proper delays and transitions, add handlers for each execution step (template-selected, avatar-selected, script-selected, etc.) that route to existing flow logic but render in Col 2 |
| `src/pages/Workspace.tsx` | **Modify** — Replace `StrategyMapPanel` with `ExecutionPanel` in the 2-col layout so it can switch between strategy map and execution panels |
| `src/types/workspace.ts` | **Modify** — Add `ExecutionPanelContent` type |

## Approve Strategy → Execution Sequence (in useWorkspace)

When `approve-advance-strategy` is clicked:

1. **Col1**: AI message: "Strategy approved! Now let's create the creatives for each ad. First — pick a video template."
2. **Col2**: Switches from StrategyMapPanel → use-case template gallery
3. User picks template → **Col1**: "Great pick! Now configure your video — I've pre-selected the best avatar and generated a script based on your product."
4. **Col2**: Switches to video-setup panel (avatar grid + script + settings), with AI-recommended avatar highlighted
5. User clicks Generate → **Col2**: Switches to DeepWorkProgress with creative generation steps
6. After ~10s → **Col1**: "Your creatives are ready! Take a look." + **Col2**: creative results
7. User approves → **Col1**: "Now let's connect your Facebook account" → **Col2**: Facebook connect panel
8. FB connected → **Col1**: "Here's your campaign config based on the strategy" → **Col2**: campaign config
9. User approves config → **Col2**: device preview
10. User clicks publish → standard publish flow

## DeepWorkProgress Fun Messages

Rotating messages during generation:
- "AI models work best when they take their time ☕"
- "Fun fact: The average Facebook user sees 1,500 ads per day"
- "Your video is being rendered frame by frame..."
- "Did you know? Video ads get 2x more engagement than static"
- "Almost there — polishing the final touches..."

