

# Modernize Creative Source UX: AI-Native, Not SaaS

## Overview

Four interconnected improvements to make the creative brief flow feel like a modern AI tool rather than a traditional SaaS form builder.

## Changes

### 1. Batch Operations Bar (Bottom of Strategy Tree)

Add a floating action bar above the existing bottom bar when there are 2+ ads. Three actions:

- **Upload All** — opens a multi-file uploader dialog; files auto-map to unlocked ads in order
- **Use Same Creative** — apply one creative (upload or library pick) to all unlocked ads at once
- **AI Generate All** — queue all unlocked ads for AI generation with a single click

This bar appears contextually only when there are unlocked ads remaining. Visually: a subtle glass-morphism strip with icon buttons and labels, sitting between the tree scroll area and the existing progress/approve bar.

**File**: `src/components/workspace/StrategyMapPanel.tsx` — add batch bar section before the existing bottom bar.

### 2. Modern AI-Native UX Overhaul for CreativeSourceTabs

The current 3-tab selector looks like a traditional form. Redesign to feel conversational and AI-native:

- **Replace boxy tabs** with pill-shaped segmented control using a sliding highlight indicator (like iOS/modern AI tools)
- **Upload zone**: Replace the generic dashed-border box with a more visual, gradient-accent drop zone with animated icon and contextual micro-copy. When creative is attached, show it as a card with glassmorphism overlay rather than a plain bordered box
- **Library tab**: Instead of a blank placeholder, show a mini-grid preview of 3-4 recent assets inline (no modal needed for quick picks), with "See all" to open the full picker
- **AI Generate tab**: Add a subtle AI sparkle animation on the tab icon; the warning becomes a softer inline chip rather than an alert box
- **Lock button**: Transform from a flat button into a smooth state transition — when ready, it pulses subtly; when locked, it transforms into a confirmed state badge
- **Product images context**: Show scraped product images as a collapsible "AI found these from your product page" strip at the top of Upload and Library tabs, so users understand they already have reference images available

**Files**: `src/components/workspace/strategy/CreativeSourceTabs.tsx`, `src/components/workspace/strategy/CompactAdFields.tsx`

### 3. Collapsed Ad Card — Thumbnail Preview + Status Badge

Currently the collapsed ad row only shows text (name, format badge, checkmark). Enhance:

- Add a **24x24px thumbnail** of the attached creative (or a subtle placeholder icon if none) left-aligned next to the ad name
- Add a **status badge** replacing the current simple checkmark:
  - No creative: dim "Not set" chip
  - Creative attached but not locked: "Ready" chip in amber
  - Locked: green checkmark chip (existing but restyled)
- The remove (X) button stays as hover-reveal

**File**: `src/components/workspace/StrategyMapPanel.tsx` — modify the ad row rendering (lines ~251-278).

### 4. Scraped Product Images in Upload/Library Context

The product images scraped from the product URL currently only appear in the AI Generate briefs. Surface them in Upload and Library tabs:

- **Upload tab**: Below the upload zone, show a "From your product page" section with a horizontal scrollable strip of scraped images. Clicking one auto-attaches it as the creative (same as uploading). This gives users a zero-effort path: "We already have your product images, just pick one."
- **Library tab**: Add a "Product Images" section above the general library grid in the `CreativeLibraryPicker` modal, separated by a subtle divider with label "Scraped from [product URL]"
- Pass `productImages` from the ad's brief data down through `CreativeSourceTabs` props

**Files**: 
- `src/components/workspace/strategy/CreativeSourceTabs.tsx` — add props for `productImages`, render strip in upload/library tabs
- `src/components/workspace/strategy/CreativeLibraryPicker.tsx` — add optional `productImages` prop, render them as a top section

## Technical Details

### New Props
- `CreativeSourceTabs` gets `productImages?: string[]` prop passed from StrategyMapPanel
- `CreativeLibraryPicker` gets `productImages?: string[]` prop for the scraped images section

### State Flow
- Batch operations in StrategyMapPanel iterate over all campaigns/adSets/ads, skip frozen ones, and apply the action
- Thumbnail in collapsed row reads from ad's `attachedCreative` field (already in state)
- Scraped images come from `ad.productImages` or the brief's `productImages` array (already in mock data)

### Styling Approach
- Use `backdrop-blur-sm`, gradient borders, and subtle animations for the AI-native feel
- Pill segmented control uses `transform: translateX()` for the sliding indicator
- Batch bar uses `bg-background/80 backdrop-blur-md` glass effect
- Status badges use the existing Badge component with custom color variants

