

# Create Module - AI-Powered Video & Image Generation

## Overview

The "Create" module will be a standalone creative generation tool that allows users to generate images and videos through both:
1. **Generic prompts** - Free-form text descriptions for any creative
2. **Templates/Use cases** - Pre-defined workflows like "Product in Hand", "Product Photoshoot", etc.

The UX will follow the same chat + canvas pattern used in the Dashboard campaign flow, ensuring consistency across the product while optimizing for speed-to-generation.

---

## Recommended UX Architecture

```text
+----------------------------------+----------------------------------------+
|         CHAT PANEL (30%)         |          CANVAS PANEL (70%)            |
|----------------------------------|----------------------------------------|
|                                  |                                        |
|  "What would you like to         |     [Template Gallery Grid]            |
|   create today?"                 |                                        |
|                                  |   +--------+  +--------+  +--------+   |
|  [Suggestion Chips]              |   |Product |  |Avatar  |  |Photo-  |   |
|  - Product in Hand               |   |in Hand |  |Video   |  |shoot   |   |
|  - Avatar Video                  |   +--------+  +--------+  +--------+   |
|  - Product Photoshoot            |                                        |
|  - Or describe anything...       |   +--------+  +--------+  +--------+   |
|                                  |   |Social  |  |Unbox-  |  |Custom  |   |
|  [Text Input]                    |   |Post    |  |ing     |  |Prompt  |   |
|  "Describe what you want..."     |   +--------+  +--------+  +--------+   |
|                                  |                                        |
+----------------------------------+----------------------------------------+
```

---

## User Flow

### Flow 1: Generic Prompt (Free-form Creation)

```text
User types: "A luxury watch on a marble surface with golden light"
    |
    v
AI responds: "Great choice! I'll create that for you."
    |
    v
Canvas shows: Generation Preview (loading skeleton)
    |
    v
Canvas shows: Generated Image(s) with variations
    |
    v
User can: Download, Regenerate, Edit, or Use in Campaign
```

### Flow 2: Template Selection

```text
User clicks: "Product in Hand" template
    |
    v
Chat asks: Required inputs (conversationally)
    |-- "Upload your product image"
    |-- "Describe your product briefly"  
    |-- (Optional) "Pick an avatar/hand model"
    |
    v
Canvas shows: Real-time preview as inputs are provided
    |
    v
AI generates creative when all required inputs ready
    |
    v
User can: Download, Regenerate, Edit, or Use in Campaign
```

---

## Template Definitions

Each template has specific required/optional inputs:

| Template | Required Inputs | Optional Inputs |
|----------|-----------------|-----------------|
| Product in Hand | Product Image, Description | Hand Model Style, Background |
| Avatar Video | Product Image, Description, Script | Avatar Selection, Duration |
| Product Photoshoot | Product Image | Scene, Lighting, Angle |
| Social Post | Product Image, Caption Idea | Platform Format (1:1, 9:16) |
| Unboxing | Product Image, Description | Avatar, Duration |
| Custom Prompt | Text Description | Reference Image |

---

## Key UX Principles

1. **Speed to Generation**: Minimize required inputs, use smart defaults
2. **Conversational but Efficient**: Questions appear one at a time, but users can skip optional ones
3. **Progressive Disclosure**: Canvas shows real-time preview, updating as inputs are provided
4. **Familiar Pattern**: Same chat + canvas layout as Dashboard for consistency

---

## Component Structure

```text
src/
├── pages/
│   └── Create.tsx                    # Main Create page
│
├── hooks/
│   └── useCreateFlow.ts              # State management for creation flow
│
├── components/
│   └── create/
│       ├── CreateLayout.tsx          # Chat + Canvas container
│       ├── CreateChatPanel.tsx       # Left chat panel
│       ├── CreateCanvas.tsx          # Right preview/gallery
│       ├── TemplateGallery.tsx       # Template selection grid
│       ├── TemplateCard.tsx          # Individual template card
│       ├── GenerationPreview.tsx     # Loading + result display
│       ├── InputCollector.tsx        # Smart input collection
│       └── CreativeResult.tsx        # Final output with actions
│
├── types/
│   └── create.ts                     # Type definitions
```

---

## Step-by-Step Implementation Plan

### Step 1: Types & Data Models
- Create `src/types/create.ts` with interfaces for:
  - `CreateTemplate` (id, name, icon, requiredInputs, optionalInputs)
  - `CreateInput` (type: image | text | avatar | script, required, label)
  - `CreateSession` (template, inputs, status, outputs)
  - `CreateMessage` (extending Message pattern)
  - `GeneratedCreative` (type, url, thumbnail, format)

### Step 2: Create Flow Hook
- Create `src/hooks/useCreateFlow.ts` that manages:
  - Template selection state
  - Input collection progress
  - Generation status (idle, collecting, generating, complete)
  - Generated outputs
  - Message history for chat
  - Natural language parsing for inputs

### Step 3: Create Page Layout
- Create `src/pages/Create.tsx` with:
  - Same layout structure as Dashboard (30% chat / 70% canvas)
  - Header with navigation back to Dashboard
  - Glass effect styling matching existing UI

### Step 4: Template Gallery Component
- Create `src/components/create/TemplateGallery.tsx`:
  - 2x3 or 3x3 grid of template cards
  - Visual icons/previews for each template
  - "Custom Prompt" as a special card for free-form
  - Hover states showing brief description

### Step 5: Chat Panel for Create
- Create `src/components/create/CreateChatPanel.tsx`:
  - Welcome message with template suggestions
  - Suggestion chips for quick template selection
  - Input collection via conversational prompts
  - File upload handling for product images
  - Skip buttons for optional inputs
  - Progress indicator showing what's collected

### Step 6: Canvas Panel
- Create `src/components/create/CreateCanvas.tsx`:
  - Shows TemplateGallery initially
  - Transitions to InputCollector when template selected
  - Shows GenerationPreview during generation
  - Displays CreativeResult with action buttons

### Step 7: Generation Preview
- Create `src/components/create/GenerationPreview.tsx`:
  - Shimmer loading animation (similar to CreativeGenerationPanel)
  - Progress indication
  - "Generating your creative..." messaging

### Step 8: Creative Result Display
- Create `src/components/create/CreativeResult.tsx`:
  - Large preview of generated creative
  - Variation grid (if multiple outputs)
  - Action buttons: Download, Regenerate, Edit Prompt, Use in Campaign
  - Metadata display (format, resolution, etc.)

### Step 9: Routing
- Add route to `App.tsx`: `/create`
- Add navigation link in DashboardHeader

### Step 10: Polish & Integration
- Add smooth transitions between states
- Implement "Use in Campaign" to pass creative to Dashboard flow
- Add history/recent creations feature (future)

---

## Technical Implementation Details

### Chat Message Types Extension
```typescript
// In src/types/create.ts
export interface CreateInputRequest {
  id: string;
  type: 'image' | 'text' | 'avatar' | 'script' | 'select';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: { id: string; label: string; preview?: string }[];
}

export interface CreateMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  inputRequest?: CreateInputRequest;
  uploadedImage?: string;
  templateSelection?: string;
}
```

### Template Configuration
```typescript
// Templates with their input requirements
export const CREATE_TEMPLATES: CreateTemplate[] = [
  {
    id: 'product-in-hand',
    name: 'Product in Hand',
    icon: 'hand',
    description: 'Showcase your product held naturally',
    outputType: 'image',
    requiredInputs: ['product-image', 'product-description'],
    optionalInputs: ['hand-model', 'background'],
  },
  {
    id: 'avatar-video',
    name: 'Avatar Video',
    icon: 'video',
    description: 'AI presenter showcasing your product',
    outputType: 'video',
    requiredInputs: ['product-image', 'product-description'],
    optionalInputs: ['avatar', 'script', 'duration'],
  },
  // ... more templates
];
```

### Canvas State Machine
```typescript
type CanvasState = 
  | 'template-selection'  // Show gallery
  | 'input-collection'    // Show preview + inputs needed
  | 'generating'          // Show loading animation
  | 'result'              // Show generated creative
  | 'error';              // Show error with retry
```

---

## Navigation & Access Points

1. **Header Navigation**: Add "Create" link next to existing nav items
2. **Dashboard Quick Action**: "Create New" button on Welcome panel
3. **Command Center**: "Create Ad" action from recommendations

---

## Mock Data & Demo Mode

For initial implementation, the generation will use mock delays and placeholder images:
- 3-5 second simulated generation time
- Placeholder creative outputs from `/public/` or external URLs
- Demo mode flag for easy testing

---

## Future Enhancements (Out of Scope for MVP)

- Real AI generation integration (Lovable AI / external APIs)
- Creation history with re-use capability
- Batch generation for multiple products
- Direct social platform posting
- Brand kit/style guide application

