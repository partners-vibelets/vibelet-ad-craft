

# Full Simulation Implementation Plan

## Overview

This plan implements all 14 gaps identified in the gap analysis to create a fully functional, end-to-end testable simulation in the `/workspace` route. Every feature will work as if it were a real product -- you'll be able to test the complete user journey from first conversation through campaign publishing, post-publish feedback, live performance monitoring, and 30-day audits.

---

## What Will Change

### Phase 1: Post-Publish Celebration and Feedback (Gap #1)

**What you'll experience:** After clicking "Publish now", instead of jumping straight to action chips, you'll see:
- Confetti celebration animation
- A success screen with campaign details
- "What happens next?" notice (24-48 hour learning phase)
- 5-star rating with quick tags (high rating) or improvement reasons (low rating)
- Skip option that goes directly to performance

**Technical approach:**
- Add `post-publish-feedback` artifact type to `src/types/workspace.ts`
- Create `PostPublishFeedbackBody` component in `ArtifactRenderer.tsx` (port the confetti, star rating, and tag selection from existing `PostPublishFeedbackPanel.tsx`)
- Modify `publishCampaignResponse()` in `useWorkspace.ts` to show the feedback artifact before performance chips
- Add action chip handler for `submit-feedback` and `skip-feedback` that transitions to performance

### Phase 2: Live Performance Dashboard (Gaps #2, #3)

**What you'll experience:** After publishing (or clicking "View performance"), you'll see a rich, live-updating dashboard artifact with:
- Unified metrics grid (Spend, Revenue, ROI, Conversions, CTR, AOV) with animated count-up on refresh
- Campaign lifecycle stage indicator (Testing -> Optimizing -> Scaling) with progress bar
- Manual refresh button + auto-polling indicator (simulated 30s refresh)
- Campaign filter/switcher when multiple campaigns exist
- Recent performance changes list

**Technical approach:**
- Add `performance-dashboard` artifact type to `src/types/workspace.ts`
- Create `PerformanceDashboardBody` in `ArtifactRenderer.tsx` with metrics grid, lifecycle stage, and refresh animation
- Replace static `performance-snapshot` response with a richer `performance-dashboard` artifact in the post-publish flow
- Simulate auto-refresh by updating artifact data on a timer within the hook
- Include lifecycle stages: "Testing" (0-7 days), "Optimizing" (7-14 days), "Scaling" (14+ days)

### Phase 3: Custom Script and Creative Upload (Gaps #4, #5)

**What you'll experience:**
- Script selection artifact gains a "Write my own" option at the bottom
- Selecting it reveals a form with Primary Text, Headline, and Description fields with Facebook character limit counters
- Creative results artifact gains an "Upload your own" button
- Clicking it shows a drag-and-drop zone with format/size validation feedback

**Technical approach:**
- Extend `ScriptOptionsBody` in `ArtifactRenderer.tsx` with a "Write my own" button that expands into an inline form with character counters (Primary Text: 125 chars, Headline: 40 chars, Description: 30 chars)
- Add `custom-script-submitted` artifact action handler in `useWorkspace.ts`
- Add an "Upload your own creative" action chip after creative results
- Create an inline upload simulation in `ArtifactRenderer.tsx` (drag-and-drop zone with accepted formats listed, simulated upload progress)

### Phase 4: AI Recommendations with Impact Tracking (Gaps #9, #12)

**What you'll experience:**
- After publishing, AI recommendations appear as interactive cards with Apply/Defer/Dismiss buttons
- When you apply a recommendation, the card shows "Applied" state with a monitoring badge
- A floating "Actions Impact" mini-badge appears showing "X monitoring"
- Clicking it expands to show before/after metric comparisons (e.g., ROAS went from 2.1x to 3.4x)
- "View All History" link shows a full impact table

**Technical approach:**
- Enhance the `performance-dashboard` artifact to include inline recommendation cards with apply/defer/dismiss states
- Add `tracked-actions` state tracking in `useWorkspace.ts` with before/after mock metrics
- Create `ActionsImpactSection` within the performance dashboard body showing monitored actions with metric deltas
- When a recommendation is applied, update its visual state and add it to tracked actions with simulated "before" values and delayed "after" values

### Phase 5: Enhanced Audit / Command Center (Gap #10)

**What you'll experience:**
- Running an audit shows a full-page loading animation ("Connecting to your ad account...", "Analyzing 30 days of data...", "Finding optimization opportunities...")
- Results include:
  - Health Score circle (0-100) with color coding
  - Waste Analysis ("Where Your Money Goes") showing wasted spend categories
  - Time-period toggle (Today / 7 days / 15 days / 30 days) that switches the data view
  - Quick Wins section with one-click actionable items

**Technical approach:**
- Enhance `buildAuditFlow()` in `useWorkspace.ts` to include a multi-step loading conversation (3 messages simulating connection, analysis, and completion)
- Extend the existing `ai-signals-dashboard` artifact body with:
  - Health score ring (already partially built)
  - Waste analysis section (port from existing `mockWasteItems`)
  - Time-period selector tabs
  - Quick wins cards with action buttons
- Wire quick win actions to recommendation handlers

### Phase 6: Variant Selector and Creative Assignment (Gaps #6, #7)

**What you'll experience:**
- After product analysis detects variants, you see a grid of variants with checkboxes to include/exclude specific ones
- After creatives are generated for variants, you see a creative assignment panel letting you drag/assign specific creatives to specific variants
- AI-recommended assignments are pre-filled but editable

**Technical approach:**
- Enhance `ProductAnalysisBody` to add interactive checkboxes on each variant (with AI-recommended ones pre-checked)
- Add `variant-selector` interaction within product-confirmed-variants flow
- Create `CreativeAssignmentSection` within the multi-variant creative result showing a matrix of variants x creatives with toggle assignment
- Keep current auto-assignment as default with "Customize" button to reveal manual controls

### Phase 7: Regenerate and Polish (Gaps #11, #13, #14)

**What you'll experience:**
- "Regenerate" buttons on product analysis, scripts, and creative results
- Clicking regenerate shows a brief loading state and produces fresh (shuffled) results
- Campaign config artifact clearly distinguishes editable fields (Campaign Name, Primary Text, Budget) from locked fields (Objective, Pixel ID) with lock icons
- Notification simulation: after publishing, a simulated browser notification appears for new recommendations

**Technical approach:**
- Add "Regenerate" action chips after product analysis, scripts, and creative results
- Handle `regenerate-product`, `regenerate-scripts`, `regenerate-creatives` in `useWorkspace.ts` with shuffled mock data
- Update `CampaignConfigBody` to show lock icons on read-only fields
- Add simple notification toast simulation when new recommendations arrive post-publish

### Phase 8: Multi-Campaign Hub (Gap #8)

**What you'll experience:**
- After confirming one campaign goal, AI asks "Would you also like to run a brand awareness campaign alongside this?"
- Accepting creates a second campaign draft
- A campaign switcher tab appears in the config artifact
- Summary view shows both campaigns side by side before publishing

**Technical approach:**
- Add `multi-campaign-prompt` response after plan confirmation offering additional objectives
- Track multiple campaign drafts in thread state
- Extend `CampaignConfigBody` with tab switcher for multiple campaigns
- Add `multi-campaign-summary` section before publish showing all campaigns

---

## Files to Modify

1. **`src/types/workspace.ts`** -- Add `post-publish-feedback` and `performance-dashboard` artifact types and their data interfaces
2. **`src/hooks/useWorkspace.ts`** -- Add all new response builders, action handlers, and flow transitions (~300 lines of new handlers)
3. **`src/components/workspace/ArtifactRenderer.tsx`** -- Add new artifact body components: PostPublishFeedbackBody, PerformanceDashboardBody, enhanced ScriptOptionsBody, and enhanced CampaignConfigBody (~400 lines of new UI)
4. **`src/data/workspaceMockData.ts`** -- Add artifact templates for new types

---

## Implementation Order

The work will be done in the exact order listed above (Phase 1 through 8), as each phase builds on the previous. This ensures you can test progressively:

1. First test: Create campaign -> Publish -> See celebration + feedback -> View performance dashboard
2. Second test: Full flow with custom script writing and creative upload
3. Third test: Apply recommendations -> See impact tracking
4. Fourth test: Run audit -> See health scores and time-period views
5. Fifth test: Multi-variant with manual variant/creative selection
6. Sixth test: Regenerate at any step, verify config field locking
7. Final test: Multi-campaign hub with side-by-side summary

---

## What Won't Change

- Landing page (`/`) -- untouched
- Old dashboard route (`/dashboard`) -- remains as-is for reference
- Command Center route (`/command-center`) -- remains as-is
- All existing workspace flows that currently work -- fully preserved
- The conversational planning agent flow -- enhanced, not replaced

