

# Redesign Creative Briefs: Upload-First, AI-Second

## Problem Statement
Two core user pain points:
1. **AI generation takes too long** — video/image generation can take minutes, blocking the workflow
2. **Creative briefs are cognitively heavy** — too many fields, selectors, and options overwhelm users, especially when there could be 10+ ads each with briefs

## Design Philosophy
Flip the mental model: **"Bring your own creative"** is the primary, fastest path. AI generation becomes a secondary power-user option. This dramatically reduces friction because uploading a file takes seconds vs. minutes for AI generation.

## Proposed UX Architecture

### 1. Replace Current Briefs with a "Creative Source" Selector
Each ad node gets a simple 3-tab selector at the top:

```text
┌─────────────────────────────────────────────────┐
│  📎 Upload    │  📚 Library    │  ✨ AI Generate │
│  (primary)    │  (secondary)   │  (tertiary)     │
└─────────────────────────────────────────────────┘
```

- **Upload** (default, highlighted): Drag-drop zone or file picker. Accepts images and videos. Shows the creative brief summary (headline, CTA, text) as a compact editable card below the uploaded asset.
- **Library**: Grid of previously uploaded/generated assets from the Vibelets creative library. One-click select.
- **AI Generate**: The current full creative brief (video style, avatar, script, etc.) tucked behind this tab — only shown when the user explicitly opts in.

### 2. Simplified Ad Card (Collapsed State)
Currently ads expand into large, complex briefs. Instead:

```text
┌──────────────────────────────────────────────┐
│ 🎬 Video - Problem/Solution     [x remove]  │
│ ┌────┐  Headline: Spring Sale...   [edit]    │
│ │thumb│  CTA: Shop Now ▾                     │
│ │    │  Status: ⬚ No creative attached       │
│ └────┘  [📎 Upload] [📚 Library] [✨ AI]     │
└──────────────────────────────────────────────┘
```

- Thumbnail preview appears once a creative is attached
- Core ad copy fields (headline, primary text, CTA dropdown) are always visible in compact form
- The 3 source buttons are inline — no need to expand the full brief just to attach a file

### 3. Upload Path (Primary)
When user clicks "Upload":
- File picker opens (accepts image/video based on ad type)
- Uploaded file shows as a preview thumbnail with a play button for video
- Below it: compact editable fields for **Headline** (40 chars), **Primary Text** (125 chars), **CTA** (dropdown), **Description** (30 chars)
- A "Lock" button to confirm
- Total interaction: ~15 seconds

### 4. Library Path (Secondary)
When user clicks "Library":
- Modal/drawer with grid of existing assets filtered by type (video/image)
- Search + filter by date, campaign, tags
- One-click select attaches the asset
- Same compact fields appear below

### 5. AI Generate Path (Tertiary)
When user clicks "AI Generate":
- The current detailed brief expands (video style, avatar, script, reference images, etc.)
- But with a clear warning: "AI generation may take 1-3 minutes per creative"
- Progress indicator and ability to continue configuring other ads while one generates
- This is essentially the current VideoCreativeBrief/ImageCreativeBrief but accessed only on demand

### 6. Batch Operations
For 10+ ads, add a batch action bar:
- "Upload All" — opens a multi-file uploader that auto-maps files to ads by order
- "Use Same Creative" — apply one uploaded creative to multiple selected ads
- "AI Generate All" — queue all remaining ads for AI generation (with progress tracker)

## Technical Implementation

### Files to modify:
1. **`src/components/workspace/strategy/VideoCreativeBrief.tsx`** — Wrap current content inside the "AI Generate" tab; add Upload and Library tabs above
2. **`src/components/workspace/strategy/ImageCreativeBrief.tsx`** — Same treatment
3. **`src/components/workspace/StrategyMapPanel.tsx`** — Update collapsed ad cards to show inline source buttons and thumbnail preview; add batch action bar
4. **New: `src/components/workspace/strategy/CreativeSourceTabs.tsx`** — Shared tab component with Upload, Library, AI Generate modes
5. **New: `src/components/workspace/strategy/CompactAdFields.tsx`** — Reusable compact ad copy editor (headline, text, CTA, description) used across all 3 source modes
6. **New: `src/components/workspace/strategy/CreativeLibraryPicker.tsx`** — Modal/drawer for selecting from existing library assets

### State changes:
- Each ad gets a `creativeSource: 'upload' | 'library' | 'ai-generate'` field
- Each ad gets `attachedCreative: { url, type, fileName }` for uploaded/library assets
- The "Lock" button only requires: creative attached + ad copy fields filled (regardless of source)
- Completion indicator updates: for Upload/Library path, only 2-3 fields needed vs. 4-6 for AI path

### Key UX micro-behaviors:
- Default tab is "Upload" — the fastest path is always front and center
- When switching tabs, previously entered data is preserved
- Upload zone accepts drag-and-drop with visual feedback
- Video uploads show a thumbnail frame, not the full video
- CTA dropdown pre-populated with Meta-aligned options (already exists in codebase)
- Character counters on text fields (already exists)
- "Lock" button remains at bottom, same behavior as current

