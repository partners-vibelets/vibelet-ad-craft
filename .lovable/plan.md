

# 2-Column Strategy Architecture — Implementation Plan

## Layout

When a `strategy-architecture` artifact exists in the active thread, Workspace switches from single-column chat to a 2-column layout:

```text
┌──────────────────────┬──────────────────────────────┐
│  Column 1 — Chat     │  Column 2 — Strategy Panel   │
│  (40%)               │  (60%)                       │
│                      │                              │
│  AI conversation     │  Strategy tree (collapsed)   │
│  Action chips        │  Click node → expands inline │
│  Chat input          │  with editable detail card   │
│                      │                              │
│                      │  Budget bar + confidence     │
│                      │  Approve / Tweak / Rethink   │
└──────────────────────┴──────────────────────────────┘
```

## Column 1 — Conversation (40%)
- Same chat: messages, typing indicator, chips, input
- No artifacts rendered here during strategy mode

## Column 2 — Strategy Panel (60%)
- Combines the tree view and detail inspector into one panel
- Campaign tree with collapsed nodes by default (icon + name + budget pill)
- Clicking a node **expands it inline** to reveal an editable detail card below it (slide-down animation)
  - Campaign: name, objective, budget type, daily budget
  - Ad Set: name, budget, targeting tags, placements
  - Ad: name, format, primary text, headline, CTA
- Click-to-edit inline fields (no forms)
- Only one node expanded at a time (accordion behavior)
- Bottom bar: total budget summary, confidence score, Approve/Tweak/Rethink buttons

## Activation Logic
- `useWorkspace` exposes `activeStrategyArtifact` — latest `strategy-architecture` artifact in active thread
- When present → `Workspace.tsx` renders 2-col with resizable panels
- When absent (approved/executed or thread changes) → reverts to single-col

## Files to Create/Modify

| File | Change |
|------|--------|
| `src/pages/Workspace.tsx` | Detect active strategy artifact → render 2-col layout using `ResizablePanelGroup` |
| `src/components/workspace/StrategyMapPanel.tsx` | **Create** — Combined tree + inline-expandable detail cards with accordion behavior, budget bar, action buttons |
| `src/hooks/useWorkspace.ts` | Expose `activeStrategyArtifact` computed state + `updateStrategyNode(path, field, value)` for inline edits |

