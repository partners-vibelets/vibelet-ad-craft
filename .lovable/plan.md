

# Workspace UX Overhaul — Chat-First, End-to-End Simulation

## Problem Summary

Four core issues identified:

1. **UI/UX lacks polish** — The guided chip-driven flow feels mechanical rather than conversational. Artifacts and responses could be richer and more contextual.
2. **Custom upload flow is incomplete** — "Upload your own" exists but doesn't simulate the full journey (upload, preview, use in campaign). No creative library integration.
3. **Standalone creative generation (image-only / video-only) has no tailored UX** — Different generation models need different inputs (reference image, description, script+avatar, or fully automated), but the current flow is one-size-fits-all.
4. **Homepage use-case cards are unintuitive** — The path cards + filter chips system should be replaced with a clean chat-first homepage where everything flows from the input box via suggestion prompts.

---

## Plan

### Phase 1: Replace Homepage Cards with Chat-First Entry

**Remove** the `WorkspaceHome` path cards grid (the 2x2 use-case boxes + filter chips system).

**Replace with** a minimal homepage that has:
- Personalized greeting (keep existing logic)
- A prominent chat input at center
- Below the input: a single row of lightweight suggestion chips that map to all existing demos/flows:
  - "Plan a campaign" | "Generate a video ad" | "Generate image ads" | "Run account audit" | "Check performance" | "Connect Facebook" | "Set up automation" | "Run full demo"
- No path selection, no filter chips, no category cards
- Typing or clicking a chip immediately creates a thread and starts the flow

**Files:** `src/components/workspace/WorkspaceHome.tsx` (rewrite), `src/pages/Workspace.tsx` (minor cleanup)

### Phase 2: Improve Creative Generation UX for Different Models

Refactor `buildCreativeConversation` and related handlers to support three distinct creative sub-flows:

**A. Image-only generation:**
1. AI asks: "Share a product URL, upload a reference image, or describe what you want" (chips: Paste URL | Upload image | Describe it | Use sample)
2. If upload: show upload artifact with preview, then ask for style preference
3. If URL/describe: product analysis, then style selection
4. Generate images (no script/avatar step)
5. Show results with download + "Use in campaign" options

**B. Video generation (avatar-based):**
1. Product input (URL/upload/describe)
2. Script selection (3 options + "Write your own")
3. Avatar selection grid
4. Generation progress + results

**C. Video generation (reference-image-based / description-based):**
1. AI detects this variant when user says things like "create a video from this image" or "generate a motion video"
2. Ask for reference image upload OR product URL
3. Ask for motion style / duration preferences
4. Skip script + avatar
5. Generation progress + results

**D. "Both" flow:** Combines A + B sequentially

**Files:** `src/hooks/useWorkspace.ts` (refactor creative flow builders), `src/components/workspace/ArtifactRenderer.tsx` (add upload artifact body)

### Phase 3: Add Upload Simulation + Creative Library Integration

**Upload artifact:** New artifact type `media-upload` that renders:
- Drag-and-drop zone or file picker
- Simulated upload progress bar
- Preview of uploaded file(s)
- "Use this" action button

**Creative Library chip:** Add a "Pick from library" option in creative flows that:
- Shows a simulated library artifact (grid of previously "saved" creatives from sidebar mock data)
- User clicks to select
- Flow continues with the selected creative

**Files:** `src/types/workspace.ts` (add `media-upload` type), `src/components/workspace/ArtifactRenderer.tsx` (add `MediaUploadBody`), `src/hooks/useWorkspace.ts` (add upload + library handlers)

### Phase 4: Polish the End-to-End New Thread Flow

Ensure a single new thread can walk through the complete lifecycle with proper conversational transitions:

1. **Planning** (category, goal, budget, audience -- all conversational)
2. **Product analysis** (URL/upload/describe)
3. **Blueprint** (editable artifact)
4. **Creative generation** (branching based on type: image/video/both)
5. **Upload your own** option at creative step (with library integration)
6. **Facebook connect** (artifact-based)
7. **Campaign config** (artifact-based)
8. **Publish** (confetti + feedback)
9. **Performance monitoring** (live dashboard)
10. **Audit** (30-day report with time toggles)
11. **AI recommendations** (apply/defer/dismiss with impact tracking)
12. **Automation rules** (create rules)
13. **Loop back** to "Create another campaign" or "Generate more creatives"

Key improvements:
- Remove duplicate demo threads from sidebar (they become unnecessary since everything is accessible from homepage chips)
- Action chips after each step should be contextual (not showing all options)
- Transition messages should feel natural, not labeled as "Phase X"

**Files:** `src/hooks/useWorkspace.ts` (refine all transition handlers), `src/data/workspaceMockData.ts` (clean up demo thread definitions)

### Phase 5: Visual Polish

- AI messages: render markdown properly (already using `formatMarkdown` but could be richer)
- Artifact cards: subtle entrance animations (already present but could be smoother)
- Chat input: add upload button functionality (currently decorative `Paperclip` icon)
- Remove the "Run full demo" chip from homepage (replaced by individual flow chips)
- Clean up suggestion chips in thread view to be contextual based on thread state

**Files:** `src/pages/Workspace.tsx` (suggestion chips, chat input), `src/components/workspace/WorkspaceHome.tsx`

---

## Technical Details

### New Artifact Type
```text
'media-upload' added to ArtifactType union in workspace.ts
```

### Intent Detection Updates
- Add `'upload'` intent for messages like "upload my creative", "use my own image"
- Add `'library'` intent for "pick from library", "use existing creative"
- Refine `'creative-video'` vs `'creative-video-motion'` differentiation

### Homepage Chip-to-Flow Mapping
```text
"Plan a campaign"      -> campaign planning flow
"Generate a video ad"  -> video creative flow (avatar-based)
"Generate image ads"   -> image-only creative flow
"Run account audit"    -> audit flow (asks for FB connect if not connected)
"Check performance"    -> performance dashboard
"Connect Facebook"     -> FB connect flow
"Set up automation"    -> automation rule creation
```

### Files Changed (Summary)
1. `src/components/workspace/WorkspaceHome.tsx` — Rewrite to chat-first layout
2. `src/hooks/useWorkspace.ts` — Refactor creative flows, add upload/library handlers, remove demo threads, polish transitions
3. `src/types/workspace.ts` — Add `media-upload` artifact type
4. `src/components/workspace/ArtifactRenderer.tsx` — Add `MediaUploadBody` and `CreativeLibraryBody`
5. `src/pages/Workspace.tsx` — Update suggestion chips, minor cleanup
6. `src/data/workspaceMockData.ts` — Remove demo thread templates, add upload/library artifact templates

