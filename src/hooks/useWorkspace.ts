import { useState, useCallback, useRef } from 'react';
import { Thread, ThreadMessage, Artifact, ArtifactType, ActionChip } from '@/types/workspace';
import { getThreadWithData, artifactTemplates, mockThreads as baseMockThreads } from '@/data/workspaceMockData';
import { AVATARS } from '@/data/avatars';
import { mockReasons, mockActions, mockWasteItems, mockLiveAlerts, mockHealthMetrics, mockQuickWins } from '@/components/command-center/mockData';

interface SimResponse {
  content: string;
  artifacts?: { type: ArtifactType; titleSuffix?: string; dataOverrides?: Record<string, any> }[];
  actionChips?: ActionChip[];
}

interface ConversationStep {
  delay: number;
  response: SimResponse;
}

// ========== INTENT DETECTION ==========

type Intent =
  | 'campaign' | 'create-flow' | 'creative-images' | 'creative-video' | 'creative-both'
  | 'creative-video-motion' | 'connect-facebook' | 'audit' | 'publish' | 'performance'
  | 'insights' | 'rule' | 'demo' | 'product-url' | 'upload' | 'library' | 'default';

function isUrl(message: string): boolean {
  return /https?:\/\/|www\.|\.com|\.shop|\.store|\.co\b|\.io\b|\.net\b|\.org\b/i.test(message);
}

function detectIntent(message: string): Intent {
  const l = message.toLowerCase();
  if (l.includes('full demo') || l.includes('run demo') || l.includes('end to end') || l.includes('end-to-end') || l.includes('show me everything')) return 'demo';
  if (isUrl(message)) return 'product-url';
  if (l.includes('upload') && (l.includes('creative') || l.includes('image') || l.includes('video') || l.includes('own'))) return 'upload';
  if ((l.includes('library') || l.includes('existing') || l.includes('saved')) && (l.includes('creative') || l.includes('pick'))) return 'library';
  if ((l.includes('connect') || l.includes('link') || l.includes('add') || l.includes('integrate')) && (l.includes('facebook') || l.includes('fb') || l.includes('meta'))) return 'connect-facebook';
  if (l.includes('audit') || (l.includes('review') && l.includes('account')) || (l.includes('what') && l.includes('working'))) return 'audit';
  if (l.includes('publish') || l.includes('go live') || l.includes('push live') || l.includes('launch campaign')) return 'publish';
  if ((l.includes('motion') || l.includes('animate') || l.includes('from this image')) && (l.includes('video'))) return 'creative-video-motion';
  if ((l.includes('create') || l.includes('generate') || l.includes('make') || l.includes('design') || l.includes('build')) && (l.includes('image') && !l.includes('video'))) return 'creative-images';
  if ((l.includes('create') || l.includes('generate') || l.includes('make')) && (l.includes('video') && !l.includes('image'))) return 'creative-video';
  if ((l.includes('create') || l.includes('generate') || l.includes('make')) && l.includes('image') && l.includes('video')) return 'creative-both';
  if ((l.includes('create') || l.includes('generate') || l.includes('make') || l.includes('design') || l.includes('build'))
    && (l.includes('creative') || l.includes('ad') || l.includes('content'))) return 'create-flow';
  if (l.includes('campaign') || l.includes('plan') || l.includes('blueprint') || l.includes('summer') || l.includes('launch')) return 'campaign';
  if (l.includes('performance') || l.includes('metrics') || (l.includes('how') && l.includes('doing'))) return 'performance';
  if (l.includes('insight') || l.includes('signal') || l.includes('anomal')) return 'insights';
  if (l.includes('rule') || l.includes('automat') || l.includes('trigger')) return 'rule';
  if (l.length > 30 && !l.includes('?')) return 'product-url';
  return 'default';
}

// ========== CONVERSATION BUILDERS ==========

function extractProductName(msg: string): string {
  const m = msg.match(/(?:for|about|of|my)\s+(?:my\s+)?(.+?)(?:\s+campaign|\s+product|\s+brand|\s+store|\s+collection|$)/i);
  return m?.[1]?.trim() || 'your product';
}

function buildCampaignConversation(userMessage: string, context?: { filters?: Record<string, string[]> }): ConversationStep[] {
  const hasUrl = /https?:\/\/|www\.|\.com|\.shop|\.store/i.test(userMessage);
  if (hasUrl) {
    return [
      { delay: 1200, response: { content: `🔍 Analyzing your product page... Let me pull the details.` } },
      { delay: 3000, response: styleToProductAnalysis('bold') },
    ];
  }
  return [{
    delay: 1200,
    response: {
      content: `Let's get started! 🚀 I need to understand your product first — share a URL and I'll pull everything automatically, or describe what you're promoting.`,
      actionChips: [
        { label: '🔗 Paste a URL', action: 'prompt-url' },
        { label: '📝 Describe it', action: 'prompt-describe' },
        { label: '⚡ Use sample product', action: 'use-sample-product' },
      ],
    },
  }];
}

function planningQuestionsResponse(isDemo = false, hasVariants = false, variantCount = 0): SimResponse {
  const prefix = isDemo ? 'demo-' : '';
  const variantSection = hasVariants ? `\n\n**4. I found ${variantCount} product variants.** How do you want to handle them?` : '';
  const fbSection = `\n\n${hasVariants ? '**5' : '**4'}. **Facebook account:** I'll use your connected account (Primary Ad Account — Summer Style Co.) with Pixel auto-detected. ✅`;
  const baseChips: ActionChip[] = [
    { label: '💰 Drive sales · $50-80/day', action: `${prefix}plan-sales-medium${hasVariants ? '-variants' : ''}` },
    { label: '💰 Drive sales · $100+/day', action: `${prefix}plan-sales-high${hasVariants ? '-variants' : ''}` },
    { label: '📣 Build awareness · $30-60/day', action: `${prefix}plan-awareness-medium${hasVariants ? '-variants' : ''}` },
    { label: '🔗 Drive traffic · $40-70/day', action: `${prefix}plan-traffic-medium${hasVariants ? '-variants' : ''}` },
    { label: '🤏 Just exploring · minimal budget', action: `${prefix}plan-sales-low${hasVariants ? '-variants' : ''}` },
  ];
  return {
    content: `Product looks great! ✅ Now let me gather everything to build your complete plan.\n\n**1. What's the main goal?**\n**2. How much are you comfortable spending per day?**\n**3. Creative preferences?** (I'll generate images + video by default)${variantSection}${fbSection}\n\n*Click a quick option below, or type naturally — I'll figure out the rest.*`,
    actionChips: baseChips,
  };
}

function executionPlanResponse(objective: string, budgetDaily: number, isDemo = false, multiVariant = false): SimResponse {
  const prefix = isDemo ? 'demo-' : '';
  const objectiveLabel = objective === 'Sales' ? 'drive sales' : objective === 'Awareness' ? 'build awareness' : 'drive traffic';
  if (multiVariant) {
    const perVariantBudget = Math.round(budgetDaily / 5);
    return {
      content: `Here's your **multi-variant campaign plan**. I've structured it using Meta's best practices — one campaign with **separate ad sets per variant** so each flavor gets optimized independently.\n\n📋 **The Plan:**\n1. ✅ Product analyzed — Whey Protein (5 flavors)\n2. 🎯 Goal: **${objectiveLabel}** at **$${budgetDaily}/day** (CBO)\n3. 🏗️ Structure: **1 Campaign → 5 Ad Sets → 3 Ads each**\n4. 🎨 Generate **15 creatives** (per-variant images + video)\n5. 📱 Publish via **Primary Ad Account** (Pixel: px_987654)\n6. 📊 Monitor & auto-optimize budget across variants\n\n**Campaign Budget Optimization (CBO)** will automatically shift spend toward top-performing flavors.\n\n*Everything below is editable — click any field to change it.*`,
      artifacts: [{
        type: 'campaign-blueprint',
        titleSuffix: 'Multi-Variant Campaign Blueprint',
        dataOverrides: {
          campaignName: 'Whey Protein — All Flavors 2026', objective, platform: 'Facebook & Instagram',
          budget: { daily: budgetDaily, total: budgetDaily * 30 },
          budgetStrategy: 'CBO (Campaign Budget Optimization)',
          targeting: { ageRange: '18-45', interests: ['Fitness', 'Gym', 'Protein Supplements', 'Health & Wellness'], locations: ['US', 'UK', 'CA', 'AU'] },
          schedule: { startDate: '2026-03-01', endDate: '2026-05-31' },
          adSets: 5,
          adSetBreakdown: [
            { name: 'Chocolate Flavor', variant: 'Chocolate', ads: 3, minBudget: `$${perVariantBudget}`, creatives: ['Hero shot', 'Lifestyle gym', 'AI video'] },
            { name: 'Vanilla Flavor', variant: 'Vanilla', ads: 3, minBudget: `$${perVariantBudget}`, creatives: ['Hero shot', 'Lifestyle gym', 'AI video'] },
            { name: 'Strawberry Flavor', variant: 'Strawberry', ads: 3, minBudget: `$${perVariantBudget}`, creatives: ['Hero shot', 'Lifestyle gym', 'AI video'] },
            { name: 'Cookies & Cream', variant: 'Cookies & Cream', ads: 3, minBudget: `$${perVariantBudget}`, creatives: ['Hero shot', 'Lifestyle gym', 'AI video'] },
            { name: 'Mango Flavor', variant: 'Mango', ads: 3, minBudget: `$${perVariantBudget}`, creatives: ['Hero shot', 'Lifestyle gym', 'AI video'] },
          ],
          primaryText: 'Fuel your gains with premium whey protein 💪 25g protein per serving. Available in 5 delicious flavors!',
          cta: 'Shop Now',
          facebookAccount: { name: 'Primary Ad Account', pixelId: 'px_987654', pageName: 'FitFuel Nutrition' },
          suggestedCreatives: [
            'Per-variant hero shots with flavor-matched backgrounds',
            'Lifestyle gym shots with product placement',
            'Short-form AI avatar video per flavor',
            'Carousel — all 5 flavors side by side',
          ],
        },
      }],
      actionChips: [
        { label: '✅ Approve — start execution', action: `${prefix}approve-plan-multi` },
        { label: '✏️ I want to change something', action: 'edit-plan' },
        { label: '💰 Adjust budget', action: 'adjust-budget' },
      ],
    };
  }
  return {
    content: `Here's your complete plan. **Review it, tweak anything, then approve** — I'll handle everything from there.\n\n📋 **The Plan:**\n1. ✅ Product analyzed — Summer T-Shirt Collection\n2. 🎯 Campaign goal: **${objectiveLabel}** at **$${budgetDaily}/day**\n3. 🎨 Generate **4 creatives** (3 images + 1 AI video)\n4. 📱 Publish via **Primary Ad Account** (Pixel: px_987654, Page: Summer Style Co.)\n5. 🚀 Configure & publish campaign\n6. 📊 Monitor performance & send you insights\n\n*Everything below is editable — click any field to change it.*`,
    artifacts: [{
      type: 'campaign-blueprint',
      titleSuffix: 'Campaign Blueprint',
      dataOverrides: {
        campaignName: 'Summer Collection 2026', objective, platform: 'Facebook & Instagram',
        budget: { daily: budgetDaily, total: budgetDaily * 30 },
        targeting: { ageRange: '18-35', interests: ['Fashion', 'Streetwear', 'Summer Style'], locations: ['US', 'UK', 'CA'] },
        schedule: { startDate: '2026-06-01', endDate: '2026-08-31' }, adSets: 3,
        primaryText: 'Summer is here ☀️ Fresh styles, bold designs. Shop now and get free shipping!',
        cta: 'Shop Now',
        facebookAccount: { name: 'Primary Ad Account', pixelId: 'px_987654', pageName: 'Summer Style Co.' },
        suggestedCreatives: ['Lifestyle photo — model outdoors', 'Flat-lay product shot', 'Short-form video ad with AI avatar', 'Carousel — color variants'],
      },
    }],
    actionChips: [
      { label: '✅ Approve — start execution', action: `${prefix}approve-plan` },
      { label: '✏️ I want to change something', action: 'edit-plan' },
      { label: '💰 Adjust budget', action: 'adjust-budget' },
    ],
  };
}

function parsePlanAction(action: string): { objective: string; budget: number; multiVariant: boolean } {
  const clean = action.replace('demo-', '').replace('plan-', '');
  const multiVariant = clean.includes('-variants');
  const parts = clean.replace('-variants', '').split('-');
  const goalMap: Record<string, string> = { sales: 'Sales', awareness: 'Awareness', traffic: 'Traffic' };
  const budgetMap: Record<string, number> = { low: 25, medium: 60, high: 120 };
  return { objective: goalMap[parts[0]] || 'Sales', budget: budgetMap[parts[1]] || 60, multiVariant };
}

// ========== CREATIVE FLOWS ==========

// Image-only flow
function buildImageOnlyFlow(): ConversationStep[] {
  return [{
    delay: 1200,
    response: {
      content: `I'll generate **static image ads** for you 🖼️\n\nFirst, I need to know your product — share a URL, upload a reference image, or describe what you want.`,
      actionChips: [
        { label: '🔗 Paste a URL', action: 'prompt-url' },
        { label: '📤 Upload reference image', action: 'upload-creative' },
        { label: '📝 Describe it', action: 'prompt-describe' },
        { label: '⚡ Use sample product', action: 'use-sample-product-images' },
      ],
    },
  }];
}

// Video (avatar-based) flow
function buildVideoAvatarFlow(): ConversationStep[] {
  return [{
    delay: 1200,
    response: {
      content: `I'll create a **video ad with an AI avatar** presenter 🎬\n\nI'll need your product details, a script, and an avatar selection. Let's start with the product.`,
      actionChips: [
        { label: '🔗 Paste a URL', action: 'prompt-url' },
        { label: '📝 Describe it', action: 'prompt-describe' },
        { label: '⚡ Use sample product', action: 'use-sample-product-video' },
      ],
    },
  }];
}

// Video (motion/reference-image based) flow
function buildVideoMotionFlow(): ConversationStep[] {
  return [{
    delay: 1200,
    response: {
      content: `I'll create a **motion video** from a reference image or product description 🎥\n\nThis skips avatar + script — I'll animate your product directly. Share a reference or describe the motion you want.`,
      actionChips: [
        { label: '📤 Upload reference image', action: 'upload-creative-motion' },
        { label: '🔗 Paste product URL', action: 'prompt-url-motion' },
        { label: '📝 Describe the video', action: 'prompt-describe-motion' },
        { label: '⚡ Use sample', action: 'use-sample-motion' },
      ],
    },
  }];
}

function buildCreativeConversation(creativeType?: 'image' | 'video' | 'both', context?: { filters?: Record<string, string[]> }): ConversationStep[] {
  const typeFromCtx = context?.filters?.type?.[0] as 'image' | 'video' | 'both' | undefined;
  const styleFromCtx = context?.filters?.style?.[0];
  const resolvedType = creativeType || typeFromCtx;

  if (resolvedType === 'image') return buildImageOnlyFlow();
  if (resolvedType === 'video') return buildVideoAvatarFlow();

  if (resolvedType && styleFromCtx) {
    return [{ delay: 1200, response: {
      content: `I'll generate ${resolvedType === 'both' ? 'images + video ✨' : 'creatives'} in a **${styleFromCtx}** style.\n\nNow I need your product details — share a URL or describe the product so I can tailor everything.`,
      actionChips: [
        { label: '🔗 Paste a URL', action: 'prompt-url' },
        { label: '📝 Describe it', action: 'prompt-describe' },
        { label: '⚡ Use sample product', action: 'use-sample-product' },
      ],
    } }];
  }

  if (resolvedType) {
    const typeLabel = resolvedType === 'both' ? 'images + video ✨' : 'creatives';
    return [{ delay: 1200, response: {
      content: `I'll create ${typeLabel}! First — share your product URL or describe what you're promoting.`,
      actionChips: [
        { label: '🔗 Paste a URL', action: 'prompt-url' },
        { label: '📝 Describe it', action: 'prompt-describe' },
        { label: '⚡ Use sample product', action: 'use-sample-product' },
      ],
    } }];
  }

  return [{ delay: 1200, response: {
    content: `Let's create some amazing ad creatives! 🎨\n\n**What type of creatives do you need?**`,
    actionChips: [
      { label: '🖼️ Static images only', action: 'creative-type-image' },
      { label: '🎬 Video with AI avatar', action: 'creative-type-video' },
      { label: '🎥 Motion video (from image)', action: 'creative-type-motion' },
      { label: '✨ Both images & video', action: 'creative-type-both' },
    ],
  } }];
}

const styleToProductAnalysis = (style: string, productType: 'tshirt' | 'whey' = 'tshirt'): SimResponse => {
  if (productType === 'whey') {
    return {
      content: `I've analyzed your product and pulled the key details — including **5 flavor variants**. Take a look:`,
      artifacts: [{ type: 'product-analysis' as ArtifactType, titleSuffix: 'Product Analysis', dataOverrides: {
        productName: 'FitFuel Premium Whey Protein',
        images: [
          'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&h=450&fit=crop',
          'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&h=450&fit=crop',
          'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=600&h=450&fit=crop',
          'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=450&fit=crop',
        ],
        price: '$44.99', category: 'Health & Nutrition / Protein',
        description: 'Premium whey protein isolate with 25g protein per serving, low sugar, and fast absorption. Available in 5 delicious flavors. 30 servings per container.',
        hasVariants: true,
        variants: [
          { id: 'v-choco', label: 'Chocolate', value: '$44.99', image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=100&h=100&fit=crop', inStock: true },
          { id: 'v-vanilla', label: 'Vanilla', value: '$44.99', image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=100&h=100&fit=crop', inStock: true },
          { id: 'v-straw', label: 'Strawberry', value: '$44.99', inStock: true },
          { id: 'v-cookies', label: 'Cookies & Cream', value: '$49.99', inStock: true },
          { id: 'v-mango', label: 'Mango', value: '$44.99', inStock: true },
        ],
        keyFeatures: ['25g Protein/Serving', 'Low Sugar', 'Fast Absorption', '5 Flavors', 'No Artificial Colors', 'Third-Party Tested'],
        targetAudience: 'Fitness enthusiasts, gym-goers, and health-conscious individuals aged 18-45.',
      } }],
      actionChips: [
        { label: '✅ Looks good — continue', action: 'product-confirmed-variants' },
        { label: '✏️ Edit product details', action: 'edit-product' },
      ],
    };
  }
  return {
    content: `I've analyzed your product and pulled the key details. Take a look — everything checks out?`,
    artifacts: [{ type: 'product-analysis' as ArtifactType, titleSuffix: 'Product Analysis', dataOverrides: {
      productName: 'Summer T-Shirt Collection',
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=450&fit=crop',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=450&fit=crop',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=450&fit=crop',
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=450&fit=crop',
        'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=450&fit=crop',
      ],
      price: '$29.99', category: 'Apparel / T-Shirts',
      description: 'Premium quality t-shirts made from 100% organic cotton. Modern fit with reinforced stitching and soft-touch finish. Available in 8 colorways.',
      variants: [
        { id: 'v-black', label: 'Black', value: '$29.99', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop' },
        { id: 'v-white', label: 'White', value: '$29.99', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100&h=100&fit=crop' },
        { id: 'v-navy', label: 'Navy', value: '$29.99', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=100&h=100&fit=crop' },
        { id: 'v-olive', label: 'Olive', value: '$34.99' },
        { id: 'v-rust', label: 'Rust', value: '$34.99' },
      ],
      keyFeatures: ['100% Organic Cotton', 'Modern Fit', 'Reinforced Stitching', '8 Colorways', 'Unisex'],
      targetAudience: 'Style-conscious millennials and Gen Z, ages 18-35.',
    } }],
    actionChips: [
      { label: '✅ Looks good — continue', action: 'product-confirmed' },
      { label: '✏️ Edit product details', action: 'edit-product' },
    ],
  };
};

const showScriptsResponse: SimResponse = {
  content: "I've crafted 3 script options with different angles. **Click one to select it** — you can always change your mind.",
  artifacts: [{ type: 'script-options' as ArtifactType, titleSuffix: 'Script Options', dataOverrides: { scripts: [
    { id: 'script-a', style: 'Conversational', label: 'Script A — Friendly & Casual', duration: '30s', script: "Hey! Looking for the perfect tee? Our new collection is 100% organic cotton — super soft, great fit, and good for the planet. Available in 8 colors. Grab yours!" },
    { id: 'script-b', style: 'Hype', label: 'Script B — Bold & Energetic', duration: '30s', script: "Stop scrolling. This is the tee you've been waiting for. Premium cotton. 8 fire colorways. A fit that hits different. Limited drop. Don't sleep on it." },
    { id: 'script-c', style: 'Storytelling', label: 'Script C — Narrative', duration: '45s', script: "Every great outfit starts with the perfect t-shirt. 100% organic cotton. A modern silhouette. 8 colors inspired by city sunsets. More than fashion — it's a feeling." },
  ], selectedScriptId: null } }],
};

const avatarResponse: SimResponse = {
  content: `Now let's pick an **AI avatar** to present your product. **Click to select** — they'll deliver the script you chose. 🎭`,
  artifacts: [{ type: 'avatar-selection' as ArtifactType, titleSuffix: 'Choose Your Avatar', dataOverrides: {
    avatars: AVATARS.slice(0, 8).map(a => ({ id: a.id, name: a.name, style: a.style, imageUrl: a.imageUrl, selected: false })),
    selectedAvatarId: null,
  } }],
};

function generationResponse(avatarName: string, imageOnly = false): SimResponse {
  const outputs = imageOnly ? [
    { id: 'out-1', type: 'image', label: 'Hero Banner (Feed)', format: 'image', dimensions: '1200×628', status: 'generating' },
    { id: 'out-2', type: 'image', label: 'Instagram Story', format: 'image', dimensions: '1080×1920', status: 'generating' },
    { id: 'out-3', type: 'image', label: 'Square Post', format: 'image', dimensions: '1080×1080', status: 'generating' },
    { id: 'out-4', type: 'image', label: 'Carousel Card', format: 'image', dimensions: '1080×1080', status: 'generating' },
  ] : [
    { id: 'out-1', type: 'image', label: 'Hero Banner (Feed)', format: 'image', dimensions: '1200×628', status: 'generating' },
    { id: 'out-2', type: 'image', label: 'Instagram Story', format: 'image', dimensions: '1080×1920', status: 'generating' },
    { id: 'out-3', type: 'image', label: 'Square Post', format: 'image', dimensions: '1080×1080', status: 'generating' },
    { id: 'out-4', type: 'video', label: `Video Ad — ${avatarName}`, format: 'video', dimensions: '1080×1920', status: 'generating', duration: '30s' },
  ];
  return {
    content: imageOnly
      ? `🎨 Generating your **image creatives** now — 4 ad formats optimized for Facebook & Instagram...`
      : `**${avatarName}** is locked in! 🎬 Generating your creatives now — images + video. This takes about a minute...`,
    artifacts: [{ type: 'generation-progress' as ArtifactType, titleSuffix: 'Generating Creatives', dataOverrides: {
      stage: 'rendering', progress: 35, outputs,
    } }],
  };
}

function motionGenerationResponse(): SimResponse {
  return {
    content: `🎥 Generating your **motion video** — animating the product with smooth transitions and cinematic effects...`,
    artifacts: [{ type: 'generation-progress' as ArtifactType, titleSuffix: 'Generating Motion Video', dataOverrides: {
      stage: 'rendering', progress: 35,
      outputs: [
        { id: 'out-1', type: 'video', label: 'Motion Video — Product Showcase', format: 'video', dimensions: '1080×1920', status: 'generating', duration: '15s' },
        { id: 'out-2', type: 'video', label: 'Motion Video — Feed Format', format: 'video', dimensions: '1200×628', status: 'generating', duration: '10s' },
      ],
    } }],
  };
}

function creativeResultResponse(avatarName: string, imageOnly = false): SimResponse {
  const outputs = imageOnly ? [
    { id: 'res-1', type: 'image', label: 'Hero Banner (Feed)', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&h=628&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=200&fit=crop', format: 'jpg', dimensions: '1200×628' },
    { id: 'res-2', type: 'image', label: 'Instagram Story', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1080&h=1920&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200&h=350&fit=crop', format: 'jpg', dimensions: '1080×1920' },
    { id: 'res-3', type: 'image', label: 'Square Post', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1080&h=1080&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop', format: 'jpg', dimensions: '1080×1080' },
    { id: 'res-4', type: 'image', label: 'Carousel Card', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1080&h=1080&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop', format: 'jpg', dimensions: '1080×1080' },
  ] : [
    { id: 'res-1', type: 'image', label: 'Hero Banner (Feed)', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&h=628&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=200&fit=crop', format: 'jpg', dimensions: '1200×628' },
    { id: 'res-2', type: 'image', label: 'Instagram Story', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1080&h=1920&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200&h=350&fit=crop', format: 'jpg', dimensions: '1080×1920' },
    { id: 'res-3', type: 'image', label: 'Square Post', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1080&h=1080&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop', format: 'jpg', dimensions: '1080×1080' },
    { id: 'res-4', type: 'video', label: `Video Ad — ${avatarName}`, url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1080&h=1920&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&h=350&fit=crop', format: 'mp4', dimensions: '1080×1920', duration: '30s' },
  ];
  return {
    content: `🎉 **Your creatives are ready!** Preview each one below, then download or use them directly in a campaign.`,
    artifacts: [{ type: 'creative-result' as ArtifactType, titleSuffix: 'Generated Creatives', dataOverrides: { outputs, selectedIndex: 0 } }],
    actionChips: [
      { label: '📱 Connect Facebook & publish', action: 'connect-facebook' },
      { label: '📥 Download all', action: 'download-all' },
      { label: '🔄 Generate more variants', action: 'create-flow-from-campaign' },
    ],
  };
}

function motionResultResponse(): SimResponse {
  return {
    content: `🎥 **Motion videos are ready!** Two formats optimized for different placements.`,
    artifacts: [{ type: 'creative-result' as ArtifactType, titleSuffix: 'Motion Videos', dataOverrides: {
      outputs: [
        { id: 'res-m1', type: 'video', label: 'Motion Video — Story/Reel', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1080&h=1920&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&h=350&fit=crop', format: 'mp4', dimensions: '1080×1920', duration: '15s' },
        { id: 'res-m2', type: 'video', label: 'Motion Video — Feed', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&h=628&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=200&fit=crop', format: 'mp4', dimensions: '1200×628', duration: '10s' },
      ],
      selectedIndex: 0,
    } }],
    actionChips: [
      { label: '📱 Connect Facebook & publish', action: 'connect-facebook' },
      { label: '📥 Download all', action: 'download-all' },
      { label: '🖼️ Also generate images', action: 'creative-type-image' },
    ],
  };
}

// ========== FACEBOOK CONNECT ==========

function buildFacebookConnectFlow(): ConversationStep[] {
  return [{ delay: 1200, response: {
    content: `📱 Let's connect your Facebook account! I'll need access to manage your ads. This is quick and secure.`,
    artifacts: [{ type: 'facebook-connect' as ArtifactType, titleSuffix: 'Connect Facebook Account', dataOverrides: { status: 'disconnected', accountName: null, adAccounts: [] } }],
  } }];
}

function facebookConnectedResponse(): SimResponse {
  return {
    content: `✅ **Facebook connected!** I found your ad account and auto-detected your Pixel and Page. Everything's ready to go.`,
    artifacts: [{ type: 'facebook-connect' as ArtifactType, titleSuffix: 'Facebook Account — Connected', dataOverrides: {
      status: 'connected', accountName: 'John\'s Business',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      adAccounts: [
        { id: 'act_123456789', name: 'Primary Ad Account', pixelId: 'px_987654', pageName: 'Summer Style Co.', currency: 'USD' },
        { id: 'act_987654321', name: 'Secondary Account', pixelId: 'px_123456', pageName: 'Streetwear Daily', currency: 'USD' },
      ],
      selectedAccountId: 'act_123456789',
    } }],
    actionChips: [
      { label: '🚀 Configure & publish campaign', action: 'configure-campaign' },
      { label: '📊 Run account audit', action: 'audit' },
      { label: '🔄 Switch ad account', action: 'switch-ad-account' },
    ],
  };
}

// ========== CAMPAIGN CONFIG & PUBLISH ==========

function campaignConfigResponse(): SimResponse {
  return {
    content: `📋 Here's your campaign configuration. I've pre-filled everything based on your blueprint and creatives. **Review and edit any field**, then confirm to publish.`,
    artifacts: [{ type: 'campaign-config' as ArtifactType, titleSuffix: 'Campaign Configuration', dataOverrides: {
      campaignLevel: { name: 'Summer Collection 2026', objective: 'Sales', budgetType: 'Daily', budget: 60 },
      adSetLevel: { name: 'Core Audience — 18-35', budget: 60, duration: '90 days', pixelId: 'px_987654', targeting: { ageRange: '18-35', locations: ['US', 'UK', 'CA'], interests: ['Fashion', 'Streetwear'] } },
      adLevel: { name: 'Summer Tee — Hero', pageName: 'Summer Style Co.', primaryText: 'Summer is here ☀️ Fresh styles, bold designs. Shop now!', headline: 'Premium Organic Tees', cta: 'Shop Now', websiteUrl: 'https://summerstyle.co/tees', creative: { type: 'image', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=400&fit=crop', label: 'Hero Banner' } },
    } }],
    actionChips: [
      { label: '🚀 Publish to Facebook', action: 'publish-campaign' },
      { label: '📱 Preview on device', action: 'preview-device' },
      { label: '✏️ Edit creatives', action: 'create-flow-from-campaign' },
    ],
  };
}

function devicePreviewResponse(): SimResponse {
  return {
    content: `📱 Here's how your ad will look on mobile and desktop. Toggle between views to check everything.`,
    artifacts: [{ type: 'device-preview' as ArtifactType, titleSuffix: 'Ad Preview — Devices', dataOverrides: {
      activeDevice: 'mobile',
      ad: { pageName: 'Summer Style Co.', primaryText: 'Summer is here ☀️ Fresh styles, bold designs. Shop now!', headline: 'Premium Organic Tees', cta: 'Shop Now', imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=400&fit=crop', websiteUrl: 'summerstyle.co' },
    } }],
    actionChips: [
      { label: '🚀 Looks great — Publish!', action: 'publish-campaign' },
      { label: '✏️ Edit ad copy', action: 'configure-campaign' },
    ],
  };
}

function publishCampaignResponse(): SimResponse {
  return {
    content: `🎉🎊 **Campaign published successfully!** Your ads are now live on Facebook & Instagram.\n\n*Your journey so far: Plan ✅ → Create ✅ → Publish ✅ → Monitor (next)*`,
    artifacts: [
      { type: 'publish-confirmation' as ArtifactType, titleSuffix: 'Campaign Published!', dataOverrides: {
        campaignName: 'Summer Collection 2026', platform: 'Facebook & Instagram',
        publishedAt: new Date().toISOString(), adCount: 4,
        budget: { daily: 60, total: 1800 }, status: 'confirmed',
      } },
      { type: 'post-publish-feedback' as ArtifactType, titleSuffix: 'How was your experience?', dataOverrides: {
        campaignName: 'Summer Collection 2026', platform: 'Facebook & Instagram',
        adCount: 4, budget: { daily: 60, total: 1800 },
        rating: 0, selectedTags: [], selectedReasons: [], feedback: '', submitted: false,
      } },
    ],
  };
}

// ========== AUDIT FLOW ==========

function buildAuditFlow(isDemo = false): ConversationStep[] {
  return [{ delay: 1200, response: {
    content: `🔍 Running a deep audit of your Facebook ad account...`,
    artifacts: [{ type: 'audit-report' as ArtifactType, titleSuffix: '30-Day Account Audit', dataOverrides: {
      loadingComplete: false, initialPeriod: '30-day', healthScore: 62,
      verdict: 'Your account needs attention',
      verdictDetail: 'Budget allocation is off, some ads are fatigued, and there\'s wasted spend. Let\'s fix it.',
      healthMetrics: mockHealthMetrics, reasons: mockReasons, actions: mockActions,
      wasteItems: mockWasteItems, liveAlerts: mockLiveAlerts, quickWins: mockQuickWins,
      trendingChanges: [
        { id: 'tc-1', metric: 'Cost per Sale', change: '-15%', direction: 'down', context: 'Getting cheaper to convert', since: 'vs last week' },
        { id: 'tc-2', metric: 'Click Rate', change: '+8%', direction: 'up', context: 'More people clicking ads', since: 'vs last week' },
        { id: 'tc-3', metric: 'Reach', change: '-22%', direction: 'down', context: 'Fewer people seeing ads', since: 'vs yesterday' },
      ],
      periodData: {
        '30-day': { reasons: mockReasons, actions: mockActions, wasteItems: mockWasteItems, quickWins: mockQuickWins, liveAlerts: mockLiveAlerts },
        '15-day': { reasons: mockReasons.slice(0, 2), actions: mockActions.slice(0, 2), wasteItems: mockWasteItems.slice(0, 2), quickWins: mockQuickWins, trendingChanges: [
          { id: 'tc-1', metric: 'Cost per Sale', change: '-15%', direction: 'down', context: 'Getting cheaper to convert', since: 'vs last week' },
          { id: 'tc-2', metric: 'Click Rate', change: '+8%', direction: 'up', context: 'More people clicking ads', since: 'vs last week' },
        ], stats: { spend: '₹8,920', sales: 98, roi: '3.4x' } },
        '7-day': { actions: mockActions.slice(0, 1), quickWins: mockQuickWins.slice(0, 2), trendingChanges: [
          { id: 'tc-1', metric: 'Cost per Sale', change: '-15%', direction: 'down', context: 'Getting cheaper to convert', since: 'vs last week' },
          { id: 'tc-2', metric: 'Click Rate', change: '+8%', direction: 'up', context: 'More people clicking ads', since: 'vs last week' },
          { id: 'tc-3', metric: 'Reach', change: '-22%', direction: 'down', context: 'Fewer people seeing ads', since: 'vs yesterday' },
        ], stats: { spend: '₹4,230', sales: 47, roi: '3.2x' } },
        'today': { actions: [mockActions[0]], quickWins: [mockQuickWins[0]], liveAlerts: mockLiveAlerts, stats: { spend: '₹342', sales: 4, activeAds: 12 } },
      },
    } }],
    actionChips: [
      { label: '⚡ Apply top recommendation', action: 'demo-act-recommendation' },
      { label: '🎨 Generate fresh creatives', action: 'create-flow-from-campaign' },
      { label: '💰 Reallocate budget', action: 'adjust-budget' },
      { label: '🤖 Set up automation rules', action: 'setup-rule' },
      { label: '🚀 Create another campaign', action: 'new-campaign' },
    ],
  } }];
}

// ========== DEMO FLOW ==========

function buildDemoFlow(): ConversationStep[] {
  return [{
    delay: 1200,
    response: {
      content: `Hey! 👋 Let me walk you through what Vibelets can do — I'll take a real product and show you the entire journey from analysis to a live campaign with AI monitoring.\n\nFirst things first — I need a product to work with. Got a URL, or want me to use a sample?`,
      actionChips: [
        { label: '🔗 Paste a URL', action: 'prompt-url' },
        { label: '⚡ Use sample product', action: 'use-sample-product' },
      ],
    },
  }];
}

function automationRuleResponse(): SimResponse {
  return {
    content: `⚡ I've set up a smart automation rule based on your campaign data. Toggle it on when you're ready — it'll protect your spend automatically.`,
    artifacts: [{ type: 'automation-rule' as ArtifactType, titleSuffix: 'Auto-pause High CPA Ads', dataOverrides: {
      name: 'Auto-pause high CPA ads', trigger: 'CPA exceeds $20 for any ad set',
      condition: 'Sustained for 24 consecutive hours', action: 'Pause the ad set and notify me',
      isActive: true, autoExecute: false, lastTriggered: null,
    } }],
    actionChips: [
      { label: '➕ Add another rule', action: 'setup-rule-2' },
      { label: '📊 View performance', action: 'performance' },
      { label: '🚀 Create another campaign', action: 'new-campaign' },
    ],
  };
}

function automationRule2Response(): SimResponse {
  return {
    content: `Here's another rule — this one automatically scales your winning campaigns.`,
    artifacts: [{ type: 'automation-rule' as ArtifactType, titleSuffix: 'Scale on High ROAS', dataOverrides: {
      name: 'Scale budget when ROAS > 3x', trigger: 'ROAS exceeds 3.0x on any campaign',
      condition: 'Maintained for 48 hours with $50+ spend', action: 'Increase daily budget by 25%',
      isActive: true, autoExecute: false, lastTriggered: null,
    } }],
    actionChips: [{ label: '📊 View performance', action: 'performance' }, { label: '🚀 Create another campaign', action: 'new-campaign' }],
  };
}

function recommendationAppliedResponse(): SimResponse {
  return {
    content: `✅ **Recommendation applied!** I've submitted the change to your ad account.\n\n• Changes take effect within **15-30 minutes**\n• Initial data in **24-48 hours**\n• Full impact assessment in **7 days**\n\nI'll monitor and alert you if anything unexpected happens.`,
    actionChips: [
      { label: '📊 View performance', action: 'performance' },
      { label: '⚡ Set up automation rule', action: 'setup-rule' },
      { label: '🔍 Run account audit', action: 'audit' },
      { label: '🚀 Create another campaign', action: 'new-campaign' },
    ],
  };
}

function recommendationDeferredResponse(): SimResponse {
  return { content: `⏳ **Recommendation deferred.** I'll remind you about this in 48 hours.`, actionChips: [{ label: '📊 View performance', action: 'performance' }, { label: '🔍 Run audit', action: 'audit' }] };
}

function recommendationDismissedResponse(): SimResponse {
  return { content: `❌ **Recommendation dismissed.** Got it — I'll learn from this and improve future suggestions.`, actionChips: [{ label: '📊 View performance', action: 'performance' }, { label: '🚀 Create another campaign', action: 'new-campaign' }] };
}

// ========== PERFORMANCE DASHBOARD ==========

function performanceDashboardResponse(campaignName = 'Summer Collection 2026'): SimResponse {
  return {
    content: `📊 Here's your **live performance dashboard** for ${campaignName}. Metrics refresh automatically every 30 seconds.`,
    artifacts: [{ type: 'performance-dashboard' as ArtifactType, titleSuffix: `${campaignName} — Live Dashboard`, dataOverrides: {
      campaignName,
      dateRange: 'Feb 17 — Feb 24, 2026',
      lifecycleStage: 'testing',
      stageProgress: 35,
      stageDescription: 'Learning phase — Meta is testing ad delivery across audiences. Expect variability in the first 7 days.',
      daysSincePublish: 3,
      metrics: { spent: 180, revenue: 540, roi: 3.0, conversions: 18, ctr: 2.8, aov: 30 },
      previousMetrics: { spent: 150, revenue: 420, roi: 2.8, conversions: 14, ctr: 2.5, aov: 30 },
      recentChanges: [
        { time: '2 hours ago', message: 'CPC dropped to $0.42 — down 15% from yesterday', type: 'positive' },
        { time: '5 hours ago', message: 'New conversion recorded from Story ad placement', type: 'positive' },
        { time: '8 hours ago', message: 'Instagram Reels placement getting 2x more clicks', type: 'positive' },
        { time: '12 hours ago', message: 'Story ad CTR below average — monitoring', type: 'negative' },
      ],
      recommendations: [
        { id: 'rec-1', title: 'Increase budget on Hero Banner ad set', description: 'Hero Banner has 4.2x ROAS vs 1.8x for other creatives.', impact: '+$200/week revenue', confidence: 87, priority: 'high', state: 'pending' },
        { id: 'rec-2', title: 'Pause Story Ad creative', description: 'Story Ad has been running for 3 days with CTR below 1%.', impact: 'Save $15/day wasted spend', confidence: 92, priority: 'high', state: 'pending' },
        { id: 'rec-3', title: 'Test lookalike audience expansion', description: 'Top converters share strong signals.', impact: '+30% reach', confidence: 74, priority: 'medium', state: 'pending' },
      ],
      lastRefreshed: new Date().toISOString(),
      isAutoRefreshing: true,
    } }],
    actionChips: [
      { label: '🔍 Run 30-day account audit', action: 'audit' },
      { label: '⚡ Set up automation rules', action: 'setup-rule' },
      { label: '🎨 Generate fresh creatives', action: 'create-flow-from-campaign' },
      { label: '🚀 Create another campaign', action: 'new-campaign' },
    ],
  };
}

// ========== UPLOAD & LIBRARY RESPONSES ==========

function uploadArtifactResponse(): SimResponse {
  return {
    content: `📤 Drop your creatives below — I'll preview them and you can use them directly in your campaign.`,
    artifacts: [{ type: 'media-upload' as ArtifactType, titleSuffix: 'Upload Your Creatives', dataOverrides: { uploaded: false, progress: 0 } }],
  };
}

function creativeLibraryResponse(): SimResponse {
  return {
    content: `📚 Here's your **Creative Library** — pick any previously saved creative to use in this campaign.`,
    artifacts: [{ type: 'creative-library' as ArtifactType, titleSuffix: 'Creative Library', dataOverrides: {} }],
  };
}

// ========== SIMPLE RESPONSES ==========

const simpleResponses: Record<string, SimResponse> = {
  performance: performanceDashboardResponse(),
  insights: {
    content: "🔮 I've surfaced key signals from your campaigns. Here's what needs attention.",
    artifacts: [{ type: 'ai-insights', titleSuffix: 'AI Insights', dataOverrides: { insights: [
      { type: 'opportunity', severity: 'high', title: 'Lookalike audience match', description: 'Top buyers overlap with "Streetwear Enthusiasts" aged 20-28.', metric: 'Conversions', change: 30, suggestedAction: 'Create lookalike from top purchasers' },
      { type: 'trend', severity: 'medium', title: 'Peak engagement: evenings', description: 'Audience engages most 6PM–10PM. Consider dayparting.', metric: 'Engagement', change: 22, suggestedAction: 'Set ad schedule to 5PM–11PM' },
    ] } }],
  },
  rule: { content: "⚡ I've set up an automation rule. Toggle it on when you're ready.", artifacts: [{ type: 'automation-rule', titleSuffix: 'Automation Rule' }] },
  'refine-targeting': {
    content: "🎯 Here are targeting insights based on your account data.",
    artifacts: [{ type: 'ai-insights', titleSuffix: 'Targeting Insights', dataOverrides: { insights: [
      { type: 'opportunity', severity: 'high', title: 'Lookalike audience match', description: 'Top buyers strongly overlap with "Streetwear Enthusiasts" aged 20-28.', metric: 'Conversions', change: 30, suggestedAction: 'Create lookalike from top 500 purchasers' },
      { type: 'trend', severity: 'medium', title: 'Peak engagement: evenings', description: 'Your audience engages most 6PM–10PM.', metric: 'Engagement', change: 22, suggestedAction: 'Set ad schedule to 5PM–11PM' },
    ] } }],
  },
  'adjust-budget': {
    content: "💰 Here's a budget optimization view with projections.",
    artifacts: [{ type: 'performance-snapshot', titleSuffix: 'Budget Projection', dataOverrides: {
      dateRange: 'Jun 1 — Aug 31, 2026 (projected)', metrics: { spent: 1800, revenue: 7200, roi: 4.0, conversions: 180, ctr: 3.5, impressions: 95000 },
      topCampaign: 'Summer T-Shirt — Broad', recommendations: ['Front-load: $80/day for first 14 days', 'Scale back to $50/day after learning', 'Allocate 30% to retargeting'],
    } }],
  },
  default: { content: "Got it! I'm ready to help. What would you like to work on — campaigns, creatives, performance, or something else?" },
};

function buildPlanningRecommendation(goalKey: string, _threadId: string): SimResponse {
  let goalLabel: string, budgetRange: string, suggestion: string, objectiveDetail: string;
  if (goalKey === 'sales') {
    goalLabel = 'driving sales'; budgetRange = '$50-80/day';
    suggestion = `For a **sales campaign**, I'd recommend starting with **$50-80/day** on Facebook & Instagram.`;
    objectiveDetail = `I'll set up the campaign with **Advantage+ Shopping** targeting and conversion tracking via your Pixel.`;
  } else if (goalKey === 'awareness') {
    goalLabel = 'building brand awareness'; budgetRange = '$30-50/day';
    suggestion = `For **brand awareness**, I'd suggest **$30-50/day** — great for building your audience.`;
    objectiveDetail = `I'll optimize for **reach and frequency** to maximize brand visibility.`;
  } else {
    goalLabel = 'driving traffic'; budgetRange = '$40-60/day';
    suggestion = `For **website traffic**, around **$40-60/day** is a solid starting point.`;
    objectiveDetail = `I'll focus on **link click optimization** to get quality traffic.`;
  }
  return {
    content: `Here's what I'd recommend:\n\n🎯 **Goal:** ${goalLabel}\n👥 **Target audience:** Your target audience, 18-45\n💰 **Budget:** ${budgetRange} to start\n📱 **Platforms:** Facebook & Instagram\n\n${suggestion}\n\n${objectiveDetail}\n\n**My proposed plan:**\n1. 🔍 Analyze your product page\n2. 🎨 Generate AI creatives — images + video\n3. 📋 Build campaign structure\n4. 📱 Connect Facebook & publish\n5. 📊 Monitor & auto-optimize\n\n**Your Facebook account:** Primary Ad Account (Pixel: px_987654) ✅\n\n*Does this look right?*`,
    actionChips: [
      { label: '✅ Sounds great — let\'s go', action: 'planning-confirmed' },
      { label: '💰 I want a different budget', action: 'planning-adjust-budget' },
      { label: '🎯 Change the objective', action: 'planning-change-objective' },
      { label: '❓ I have more questions', action: 'planning-more-questions' },
    ],
  };
}

function createArtifactsFromSpec(specs: SimResponse['artifacts']): { artifacts: Artifact[]; ids: string[] } {
  const artifacts: Artifact[] = [];
  const ids: string[] = [];
  if (!specs) return { artifacts, ids };
  specs.forEach((artSpec, idx) => {
    const artId = `art-${Date.now()}-${idx}`;
    ids.push(artId);
    const template = artifactTemplates[artSpec.type];
    artifacts.push({
      id: artId, type: artSpec.type, title: artSpec.titleSuffix || template?.title || 'Artifact',
      status: 'draft', version: 1, isCollapsed: false, createdAt: new Date(), updatedAt: new Date(),
      data: { ...(template?.data || {}), ...(artSpec.dataOverrides || {}) },
    });
  });
  return { artifacts, ids };
}

// ========== MAIN HOOK ==========

export function useWorkspace() {
  const [isHomeMode, setIsHomeMode] = useState(true);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Record<string, Thread>>(() => {
    const map: Record<string, Thread> = {};
    ['thread-1', 'thread-2', 'thread-3'].forEach(id => {
      const t = getThreadWithData(id);
      if (t) map[id] = t;
    });
    return map;
  });
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [focusedArtifactId, setFocusedArtifactId] = useState<string | null>(null);
  const pendingStepsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isDemoRef = useRef(false);
  // Track creative flow mode per thread
  const creativeFlowModeRef = useRef<'images' | 'video' | 'motion' | 'both' | null>(null);

  const activeThread = activeThreadId ? threads[activeThreadId] : null;

  const selectThread = useCallback((id: string) => {
    pendingStepsRef.current.forEach(clearTimeout);
    pendingStepsRef.current = [];
    setActiveThreadId(id);
    setIsHomeMode(false);
    setFocusedArtifactId(null);
    setIsTyping(false);
  }, []);

  const createThread = useCallback((workspaceId: string) => {
    pendingStepsRef.current.forEach(clearTimeout);
    pendingStepsRef.current = [];
    const id = `thread-${Date.now()}`;
    const newThread: Thread = {
      id, title: 'New Thread', workspaceId,
      messages: [{ id: `msg-${Date.now()}`, role: 'assistant', content: "Hi! I'm your AI marketing assistant. What would you like to work on? 🚀\n\nI can help with **campaigns**, **creatives**, **Facebook account management**, **performance analysis**, or **automation**.", timestamp: new Date() }],
      artifacts: [], rules: [], createdAt: new Date(), updatedAt: new Date(), isActive: true,
      status: 'active', pinnedArtifactIds: [],
    };
    setThreads(prev => ({ ...prev, [id]: newThread }));
    setActiveThreadId(id);
    setIsHomeMode(false);
  }, []);

  const appendMessage = useCallback((threadId: string, msg: ThreadMessage, newArtifacts: Artifact[] = []) => {
    setThreads(prev => {
      const thread = prev[threadId];
      if (!thread) return prev;
      return { ...prev, [threadId]: { ...thread, messages: [...thread.messages, msg], artifacts: [...thread.artifacts, ...newArtifacts], updatedAt: new Date() } };
    });
  }, []);

  const runConversationSteps = useCallback((threadId: string, steps: ConversationStep[]) => {
    pendingStepsRef.current.forEach(clearTimeout);
    pendingStepsRef.current = [];
    steps.forEach((step, i) => {
      const typingTimer = setTimeout(() => setIsTyping(true), i === 0 ? 0 : step.delay - 800);
      pendingStepsRef.current.push(typingTimer);
      const msgTimer = setTimeout(() => {
        const response = step.response;
        const { artifacts: newArtifacts, ids: artifactIds } = createArtifactsFromSpec(response.artifacts);
        const aiMsg: ThreadMessage = {
          id: `msg-${Date.now()}-${i}`, role: 'assistant', content: response.content, timestamp: new Date(),
          artifactIds: artifactIds.length > 0 ? artifactIds : undefined, actionChips: response.actionChips,
        };
        appendMessage(threadId, aiMsg, newArtifacts);
        if (artifactIds.length > 0) setFocusedArtifactId(artifactIds[0]);
        if (i === steps.length - 1) setIsTyping(false);
      }, step.delay);
      pendingStepsRef.current.push(msgTimer);
    });
  }, [appendMessage]);

  const respondWithSim = useCallback((threadId: string, response: SimResponse, delay = 800) => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      const { artifacts: newArtifacts, ids: artifactIds } = createArtifactsFromSpec(response.artifacts);
      const aiMsg: ThreadMessage = {
        id: `msg-${Date.now()}`, role: 'assistant', content: response.content, timestamp: new Date(),
        artifactIds: artifactIds.length > 0 ? artifactIds : undefined, actionChips: response.actionChips,
      };
      appendMessage(threadId, aiMsg, newArtifacts);
      setIsTyping(false);
      if (artifactIds.length > 0) setFocusedArtifactId(artifactIds[0]);
    }, delay + Math.random() * 600);
    pendingStepsRef.current.push(timer);
    return timer;
  }, [appendMessage]);

  const enterWorkspaceFromHome = useCallback((message: string, context?: { path: string; filters?: Record<string, string[]> }) => {
    if (!message.trim() && !context) {
      setIsHomeMode(true);
      setActiveThreadId(null);
      return;
    }
    const id = `thread-${Date.now()}`;
    const intent = detectIntent(message);
    const title = intent === 'demo' ? 'Full Demo — Campaign Lifecycle'
      : intent === 'campaign' ? 'New Campaign'
      : intent === 'creative-images' ? 'Image Generation'
      : intent === 'creative-video' ? 'Video Generation'
      : intent === 'creative-video-motion' ? 'Motion Video'
      : intent === 'creative-both' || intent === 'create-flow' ? 'Creative Generation'
      : intent === 'audit' ? 'Account Audit'
      : intent === 'performance' ? 'Performance Analysis'
      : intent === 'insights' ? 'AI Recommendations'
      : intent === 'rule' ? 'Automation Setup'
      : intent === 'connect-facebook' ? 'Facebook Setup'
      : intent === 'upload' ? 'Upload Creatives'
      : intent === 'library' ? 'Creative Library'
      : 'New Thread';

    const newThread: Thread = {
      id, title, workspaceId: 'ws-1',
      messages: [], artifacts: [], rules: [], createdAt: new Date(), updatedAt: new Date(), isActive: true,
      status: 'active', pinnedArtifactIds: [],
    };
    setThreads(prev => ({ ...prev, [id]: newThread }));
    setActiveThreadId(id);
    setIsHomeMode(false);

    setTimeout(() => {
      const userMsg: ThreadMessage = { id: `msg-${Date.now()}`, role: 'user', content: message, timestamp: new Date() };
      appendMessage(id, userMsg);

      if (intent === 'demo') { isDemoRef.current = true; setIsTyping(true); runConversationSteps(id, buildDemoFlow()); }
      else if (intent === 'campaign') { setIsTyping(true); runConversationSteps(id, buildCampaignConversation(message)); }
      else if (intent === 'creative-images') { creativeFlowModeRef.current = 'images'; setIsTyping(true); runConversationSteps(id, buildImageOnlyFlow()); }
      else if (intent === 'creative-video') { creativeFlowModeRef.current = 'video'; setIsTyping(true); runConversationSteps(id, buildVideoAvatarFlow()); }
      else if (intent === 'creative-video-motion') { creativeFlowModeRef.current = 'motion'; setIsTyping(true); runConversationSteps(id, buildVideoMotionFlow()); }
      else if (intent === 'creative-both' || intent === 'create-flow') { creativeFlowModeRef.current = 'both'; setIsTyping(true); runConversationSteps(id, buildCreativeConversation('both')); }
      else if (intent === 'audit') { setIsTyping(true); runConversationSteps(id, buildAuditFlow()); }
      else if (intent === 'rule') { respondWithSim(id, automationRuleResponse()); }
      else if (intent === 'performance') { respondWithSim(id, simpleResponses.performance); }
      else if (intent === 'insights') { respondWithSim(id, simpleResponses.insights); }
      else if (intent === 'connect-facebook') { setIsTyping(true); runConversationSteps(id, buildFacebookConnectFlow()); }
      else if (intent === 'upload') { respondWithSim(id, uploadArtifactResponse()); }
      else if (intent === 'library') { respondWithSim(id, creativeLibraryResponse()); }
      else if (intent === 'publish') { respondWithSim(id, publishCampaignResponse()); }
      else if (intent === 'product-url') {
        setIsTyping(true);
        runConversationSteps(id, [
          { delay: 800, response: { content: `🔍 Analyzing your product... pulling details now.` } },
          { delay: 3000, response: styleToProductAnalysis('bold') },
        ]);
      }
      else { respondWithSim(id, simpleResponses[intent] || simpleResponses.default); }
    }, 100);
  }, [appendMessage, runConversationSteps, respondWithSim]);

  const sendMessage = useCallback((content: string) => {
    if (!activeThreadId) return;
    const userMsg: ThreadMessage = { id: `msg-${Date.now()}`, role: 'user', content, timestamp: new Date() };
    appendMessage(activeThreadId, userMsg);

    const intent = detectIntent(content);
    const thread = threads[activeThreadId];
    const lastAssistantMsg = thread?.messages?.filter(m => m.role === 'assistant').pop();
    const lastContent = lastAssistantMsg?.content?.toLowerCase() || '';
    const lastChips = lastAssistantMsg?.actionChips?.map(c => c.action) || [];

    const wasAskingForProduct = lastContent.includes('product url') || lastContent.includes('paste a url') || lastContent.includes('share a url') || lastContent.includes('describe what you') || lastContent.includes('product details') || lastChips.some(a => a === 'prompt-url' || a === 'use-sample-product');
    const wasAskingForGoal = lastChips.some(a => a.startsWith('planning-goal-'));
    const wasAskingForBudget = lastContent.includes('what budget');
    const wasAskingForMotionStyle = lastContent.includes('motion style') || lastContent.includes('describe the video') || lastContent.includes('describe the motion');

    // Natural language -> planning flow
    if (wasAskingForGoal || wasAskingForBudget) {
      const l = content.toLowerCase();
      let objective = 'Sales';
      let budget = 60;
      if (l.includes('aware') || l.includes('brand')) objective = 'Awareness';
      else if (l.includes('traffic') || l.includes('click')) objective = 'Traffic';
      if (l.includes('low') || l.includes('small') || l.includes('minimal')) budget = 25;
      else if (l.includes('high') || l.includes('big') || l.includes('100') || l.includes('150')) budget = 120;
      respondWithSim(activeThreadId, executionPlanResponse(objective, budget, isDemoRef.current));
      return;
    }

    // Natural language -> product analysis
    if (wasAskingForProduct && (intent === 'product-url' || intent === 'default')) {
      setIsTyping(true);
      runConversationSteps(activeThreadId, [
        { delay: 800, response: { content: `🔍 Analyzing your product... pulling details now.` } },
        { delay: 3000, response: styleToProductAnalysis('bold') },
      ]);
      return;
    }

    // Motion video description
    if (wasAskingForMotionStyle) {
      respondWithSim(activeThreadId, {
        content: `Got it! I'll create a motion video with that style. Let me generate it now... 🎥`,
      }, 600);
      setTimeout(() => {
        respondWithSim(activeThreadId, motionGenerationResponse(), 800);
        setTimeout(() => respondWithSim(activeThreadId, motionResultResponse(), 9000), 1000);
      }, 1200);
      return;
    }

    if (intent === 'demo') {
      isDemoRef.current = true;
      setIsTyping(true);
      runConversationSteps(activeThreadId, buildDemoFlow());
    } else if (intent === 'product-url') {
      setIsTyping(true);
      runConversationSteps(activeThreadId, [
        { delay: 800, response: { content: `🔍 Analyzing your product... pulling details now.` } },
        { delay: 3000, response: styleToProductAnalysis('bold') },
      ]);
    } else if (intent === 'campaign') { setIsTyping(true); runConversationSteps(activeThreadId, buildCampaignConversation(content)); }
    else if (intent === 'creative-images') { creativeFlowModeRef.current = 'images'; setIsTyping(true); runConversationSteps(activeThreadId, buildImageOnlyFlow()); }
    else if (intent === 'creative-video') { creativeFlowModeRef.current = 'video'; setIsTyping(true); runConversationSteps(activeThreadId, buildVideoAvatarFlow()); }
    else if (intent === 'creative-video-motion') { creativeFlowModeRef.current = 'motion'; setIsTyping(true); runConversationSteps(activeThreadId, buildVideoMotionFlow()); }
    else if (intent === 'creative-both') { creativeFlowModeRef.current = 'both'; setIsTyping(true); runConversationSteps(activeThreadId, buildCreativeConversation('both')); }
    else if (intent === 'create-flow') { setIsTyping(true); runConversationSteps(activeThreadId, buildCreativeConversation()); }
    else if (intent === 'connect-facebook') { setIsTyping(true); runConversationSteps(activeThreadId, buildFacebookConnectFlow()); }
    else if (intent === 'audit') { setIsTyping(true); runConversationSteps(activeThreadId, buildAuditFlow(isDemoRef.current)); }
    else if (intent === 'upload') { respondWithSim(activeThreadId, uploadArtifactResponse()); }
    else if (intent === 'library') { respondWithSim(activeThreadId, creativeLibraryResponse()); }
    else if (intent === 'publish') { respondWithSim(activeThreadId, isDemoRef.current ? publishCampaignResponse() : publishCampaignResponse()); }
    else { respondWithSim(activeThreadId, simpleResponses[intent] || simpleResponses.default); }
  }, [activeThreadId, threads, appendMessage, runConversationSteps, respondWithSim]);

  const handleActionChip = useCallback((action: string) => {
    if (!activeThreadId) return;

    // Product-first flow actions
    if (action === 'use-sample-product' || action === 'use-sample-product-images' || action === 'use-sample-product-video') {
      const thread = threads[activeThreadId];
      const isMultiVariant = thread?.title?.includes('Multi-Variant');
      if (action === 'use-sample-product-images') creativeFlowModeRef.current = 'images';
      if (action === 'use-sample-product-video') creativeFlowModeRef.current = 'video';
      respondWithSim(activeThreadId, styleToProductAnalysis('bold', isMultiVariant ? 'whey' : 'tshirt'));
      return;
    }
    if (action === 'use-sample-motion') {
      creativeFlowModeRef.current = 'motion';
      respondWithSim(activeThreadId, {
        content: `Great! I'll use the sample product for a motion video. What style would you like?\n\n• **Smooth zoom** — slow zoom into product details\n• **Dynamic pan** — camera pans around the product\n• **Lifestyle reveal** — product appears in a lifestyle context`,
        actionChips: [
          { label: '🎥 Smooth zoom', action: 'motion-style-zoom' },
          { label: '🎬 Dynamic pan', action: 'motion-style-pan' },
          { label: '✨ Lifestyle reveal', action: 'motion-style-reveal' },
        ],
      });
      return;
    }
    if (action.startsWith('motion-style-')) {
      respondWithSim(activeThreadId, motionGenerationResponse(), 800);
      setTimeout(() => respondWithSim(activeThreadId, motionResultResponse(), 600), 9000);
      return;
    }
    if (action === 'prompt-url' || action === 'prompt-url-motion') {
      respondWithSim(activeThreadId, { content: "Sure! Paste your product URL below and I'll analyze it automatically. 🔗" });
      return;
    }
    if (action === 'prompt-describe' || action === 'prompt-describe-motion') {
      const isMotion = action === 'prompt-describe-motion';
      respondWithSim(activeThreadId, { content: isMotion ? "Describe the video you want — what product, what motion style, what mood? I'll generate it. ✍️" : "Go ahead — describe your product (name, features, target audience) and I'll work with that. ✍️" });
      return;
    }
    if (action === 'upload-creative' || action === 'upload-creative-motion') {
      if (action === 'upload-creative-motion') creativeFlowModeRef.current = 'motion';
      respondWithSim(activeThreadId, uploadArtifactResponse());
      return;
    }
    if (action === 'product-confirmed') {
      const thread = threads[activeThreadId];
      const isCreativeThread = thread?.title?.includes('Creative') || thread?.title?.includes('Image') || thread?.title?.includes('Video') || thread?.title?.includes('Motion');
      const mode = creativeFlowModeRef.current;
      if (isCreativeThread || mode) {
        if (mode === 'images') {
          // Image-only: skip scripts/avatar, go straight to generation
          respondWithSim(activeThreadId, {
            content: `Product analyzed! Now I'll generate **4 image ad formats** optimized for Facebook & Instagram. No scripts or avatars needed for static images. 🖼️\n\nWould you like to pick a style first, or should I use the best match?`,
            actionChips: [
              { label: '😎 Bold & Trendy', action: 'style-gen-images-bold' },
              { label: '🌿 Clean & Minimal', action: 'style-gen-images-minimal' },
              { label: '🎉 Fun & Vibrant', action: 'style-gen-images-fun' },
              { label: '✨ AI picks the best', action: 'style-gen-images-auto' },
            ],
          });
        } else if (mode === 'motion') {
          respondWithSim(activeThreadId, {
            content: `Product analyzed! Now choose a **motion style** for your video:`,
            actionChips: [
              { label: '🎥 Smooth zoom', action: 'motion-style-zoom' },
              { label: '🎬 Dynamic pan', action: 'motion-style-pan' },
              { label: '✨ Lifestyle reveal', action: 'motion-style-reveal' },
            ],
          });
        } else {
          // Video or both: show scripts
          respondWithSim(activeThreadId, showScriptsResponse);
        }
      } else {
        respondWithSim(activeThreadId, planningQuestionsResponse(isDemoRef.current, false, 0));
      }
      return;
    }
    if (action === 'product-confirmed-variants') {
      respondWithSim(activeThreadId, {
        content: `I found **5 product variants**. Select which ones you'd like to advertise — I recommend the top sellers. 📦`,
        artifacts: [{ type: 'variant-selector' as ArtifactType, titleSuffix: 'Select Variants', dataOverrides: {
          variants: [
            { id: 'v-choco', label: 'Chocolate', value: '$44.99', image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&h=300&fit=crop', inStock: true, attrs: { flavor: 'Chocolate', size: '2lb' }, recReason: 'Best seller — 38% of revenue' },
            { id: 'v-vanilla', label: 'Vanilla', value: '$44.99', image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=300&h=300&fit=crop', inStock: true, attrs: { flavor: 'Vanilla', size: '2lb' }, recReason: '2nd highest margin' },
            { id: 'v-straw', label: 'Strawberry', value: '$44.99', inStock: true, attrs: { flavor: 'Strawberry', size: '2lb' } },
            { id: 'v-cookies', label: 'Cookies & Cream', value: '$49.99', image: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=300&h=300&fit=crop', inStock: true, attrs: { flavor: 'Cookies & Cream', size: '2lb' }, recReason: 'Trending — 120% growth' },
            { id: 'v-mango', label: 'Mango', value: '$44.99', inStock: false, attrs: { flavor: 'Mango', size: '2lb' } },
          ],
          selectedIds: [],
          recommendedIds: ['v-choco', 'v-vanilla', 'v-cookies'],
          attributes: ['flavor', 'size'],
        } }],
      });
      return;
    }

    // Image-only style selection → direct generation (no scripts/avatar)
    if (action.startsWith('style-gen-images-')) {
      const style = action.replace('style-gen-images-', '');
      respondWithSim(activeThreadId, generationResponse('', true), 800);
      // Simulate progress
      setTimeout(() => respondWithSim(activeThreadId, creativeResultResponse('', true), 600), 9000);
      return;
    }

    // ===== CONVERSATIONAL PLANNING FLOW =====
    if (action.startsWith('planning-category-')) {
      const isCustom = action === 'planning-category-custom';
      respondWithSim(activeThreadId, {
        content: isCustom
          ? `Sure! Go ahead and describe what you're selling — the product, the brand, who it's for. I'll take it from there. ✍️`
          : `Great choice! That's a strong category for paid ads. 💪\n\nBefore I start building, I want to make sure I get this right:\n\n**1.** Who's your ideal customer?\n**2.** Have you run ads before?\n**3.** What's the main goal?\n\n*Pick a quick goal below, or type naturally.*`,
        actionChips: isCustom ? undefined : [
          { label: '🎯 Drive sales', action: 'planning-goal-sales' },
          { label: '📣 Build brand awareness', action: 'planning-goal-awareness' },
          { label: '🔗 Get website traffic', action: 'planning-goal-traffic' },
          { label: '🤷 Not sure — suggest something', action: 'planning-goal-suggest' },
        ],
      });
      return;
    }

    if (action.startsWith('planning-goal-')) {
      const goalKey = action.replace('planning-goal-', '');
      const thread = threads[activeThreadId];
      const hasHealth = thread?.messages.some(m => m.content?.toLowerCase().includes('health') || m.content?.toLowerCase().includes('supplement'));
      const hasBeauty = thread?.messages.some(m => m.content?.toLowerCase().includes('beauty') || m.content?.toLowerCase().includes('skincare'));
      const category = hasHealth ? 'health & supplements' : hasBeauty ? 'beauty & skincare' : 'apparel';
      const audienceDefault = hasHealth ? 'Fitness enthusiasts, gym-goers, 18-45' : hasBeauty ? 'Skincare enthusiasts, beauty buyers, 20-40' : 'Style-conscious millennials & Gen Z, 18-35';

      let goalLabel: string, budgetRange: string, suggestion: string, objectiveDetail: string;
      if (goalKey === 'sales') {
        goalLabel = 'driving sales'; budgetRange = '$50-80/day';
        suggestion = `For a **sales campaign**, I'd recommend **$50-80/day** on Facebook & Instagram.`;
        objectiveDetail = `I'll set up **Advantage+ Shopping** with conversion tracking.`;
      } else if (goalKey === 'awareness') {
        goalLabel = 'building brand awareness'; budgetRange = '$30-50/day';
        suggestion = `For **brand awareness**, **$30-50/day** is great for building your audience.`;
        objectiveDetail = `I'll optimize for **reach and frequency**.`;
      } else if (goalKey === 'traffic') {
        goalLabel = 'driving traffic'; budgetRange = '$40-60/day';
        suggestion = `For **website traffic**, **$40-60/day** is a solid starting point.`;
        objectiveDetail = `I'll focus on **link click optimization**.`;
      } else {
        goalLabel = 'getting started'; budgetRange = '$50-80/day';
        suggestion = `Based on your ${category} business, I'd recommend a **sales-focused campaign** to start.`;
        objectiveDetail = `We'll track purchases directly.`;
      }

      respondWithSim(activeThreadId, {
        content: `Here's my recommendation:\n\n🎯 **Goal:** ${goalLabel}\n👥 **Audience:** ${audienceDefault}\n💰 **Budget:** ${budgetRange}\n📱 **Platforms:** Facebook & Instagram\n\n${suggestion} ${objectiveDetail}\n\n**The plan:**\n1. 🔍 Analyze your product\n2. 🎨 Generate AI creatives\n3. 📋 Build campaign structure\n4. 📱 Connect Facebook & publish\n5. 📊 Monitor & optimize\n\n**Facebook account:** Primary Ad Account (Pixel: px_987654) ✅`,
        actionChips: [
          { label: '✅ Sounds great — let\'s go', action: 'planning-confirmed' },
          { label: '💰 Different budget', action: 'planning-adjust-budget' },
          { label: '🎯 Change objective', action: 'planning-change-objective' },
          { label: '❓ More questions', action: 'planning-more-questions' },
        ],
      });
      return;
    }

    if (action === 'planning-more-questions') {
      respondWithSim(activeThreadId, {
        content: `Of course! Common questions:\n\n• **Results timeline?** 3-7 days for data, 2 weeks for optimization.\n• **Can I pause?** Absolutely — anytime.\n• **What creatives?** Product shots, lifestyle images, and an AI video.\n• **Targeting?** Interest-based + Meta's algorithm.\n\nOr type your own question. 🙂`,
        actionChips: [
          { label: '✅ I\'m ready — let\'s plan', action: 'planning-confirmed' },
          { label: '💰 Budget advice', action: 'planning-budget-advice' },
        ],
      });
      return;
    }

    if (action === 'planning-budget-advice') {
      respondWithSim(activeThreadId, {
        content: `Budget guide:\n\n**$25-40/day** — Testing · slower optimization\n**$50-80/day** — Sweet spot · enough data for 1-2 week optimization\n**$100+/day** — Aggressive scaling · best with proven creatives\n\nMy pick? **$50-60/day** for 2 weeks, then I'll tell you where to scale. 📊`,
        actionChips: [
          { label: '✅ $50-60/day', action: 'planning-confirmed' },
          { label: '💰 Start at $30/day', action: 'planning-confirmed-low-budget' },
          { label: '🚀 Go $100+/day', action: 'planning-confirmed-high-budget' },
        ],
      });
      return;
    }

    if (action === 'planning-tracking-question') {
      respondWithSim(activeThreadId, {
        content: `I track everything that matters in plain English:\n\n📈 Revenue vs spend\n🛒 Purchases via Pixel\n💰 Cost per sale\n👀 Reach & engagement\n🎯 Best-performing creatives & audiences\n\nDaily summary + alerts for anything needing attention. 🚀`,
        actionChips: [
          { label: '✅ Let\'s do it', action: 'planning-confirmed' },
          { label: '❓ One more question', action: 'planning-more-questions' },
        ],
      });
      return;
    }

    if (action === 'planning-change-objective') {
      respondWithSim(activeThreadId, {
        content: `What would you like to focus on instead?`,
        actionChips: [
          { label: '🎯 Drive sales', action: 'planning-goal-sales' },
          { label: '📣 Brand awareness', action: 'planning-goal-awareness' },
          { label: '🔗 Website traffic', action: 'planning-goal-traffic' },
        ],
      });
      return;
    }

    if (action === 'planning-adjust-budget') {
      respondWithSim(activeThreadId, {
        content: `What budget range works for you?`,
        actionChips: [
          { label: '🤏 $25-40/day', action: 'planning-confirmed-low-budget' },
          { label: '💰 $50-80/day', action: 'planning-confirmed' },
          { label: '🚀 $100+/day', action: 'planning-confirmed-high-budget' },
        ],
      });
      return;
    }

    if (action === 'planning-confirmed' || action === 'planning-confirmed-low-budget' || action === 'planning-confirmed-high-budget') {
      const budgetNote = action === 'planning-confirmed-low-budget' ? ' Starting lean at $30/day.' : action === 'planning-confirmed-high-budget' ? ' Going aggressive at $120/day!' : '';
      respondWithSim(activeThreadId, {
        content: `Awesome — let's build this! 🚀${budgetNote}\n\nFirst, I need your product details. **Share a product URL** and I'll pull images, pricing, and features — or use a sample.`,
        actionChips: [
          { label: '🔗 Paste a URL', action: 'prompt-url' },
          { label: '📝 Describe it', action: 'prompt-describe' },
          { label: '⚡ Use sample product', action: 'use-sample-product' },
        ],
      });
      return;
    }

    // Plan actions
    if (action.startsWith('plan-') || action.startsWith('demo-plan-')) {
      const { objective, budget, multiVariant } = parsePlanAction(action);
      respondWithSim(activeThreadId, executionPlanResponse(objective, budget, isDemoRef.current, multiVariant));
      return;
    }

    // Approve multi-variant plan → auto-execute pipeline
    if (action === 'approve-plan-multi' || action === 'demo-approve-plan-multi') {
      isDemoRef.current = action.startsWith('demo-');
      respondWithSim(activeThreadId, {
        content: `🚀 **Multi-variant plan approved!** Since you have multiple variants, I'll auto-execute the full pipeline:\n\n1. ✅ Product analyzed\n2. 🎨 Generating 15 creatives (3 per variant)...\n3. 📱 Configuring campaign structure...\n4. 🚀 Ready to publish!\n\nSit tight — this takes about 2 minutes.`,
      }, 600);
      const steps: ConversationStep[] = [
        { delay: 4000, response: generationResponse('Sophia') },
        { delay: 12000, response: {
          content: `✅ **15 creatives generated!** Now configuring your multi-variant campaign structure...`,
          artifacts: [{ type: 'campaign-config' as ArtifactType, titleSuffix: 'Multi-Variant Campaign Config', dataOverrides: {
            campaignLevel: { name: 'Whey Protein — All Flavors 2026', objective: 'Sales', budgetType: 'CBO', budget: 60 },
            adSetLevel: { name: '5 Ad Sets (one per flavor)', budget: 60, duration: '90 days', pixelId: 'px_987654', targeting: { ageRange: '18-45', locations: ['US', 'UK', 'CA', 'AU'], interests: ['Fitness', 'Gym', 'Protein'] } },
            adLevel: { name: 'Per-variant ads (15 total)', pageName: 'FitFuel Nutrition', primaryText: 'Fuel your gains with premium whey protein 💪', headline: 'Premium Whey Protein', cta: 'Shop Now', websiteUrl: 'https://fitfuel.co/whey', creative: { type: 'image', url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&h=400&fit=crop', label: 'Chocolate Hero' } },
          } }],
        } },
        { delay: 14000, response: { content: `✅ **Everything's ready!** Your multi-variant campaign is configured. Want me to publish?`, actionChips: [
          { label: '🚀 Publish now', action: 'publish-campaign' },
          { label: '📱 Preview on device', action: 'preview-device' },
        ] } },
      ];
      runConversationSteps(activeThreadId, steps);
      return;
    }

    // Approve single plan → interactive step-by-step
    if (action === 'approve-plan' || action === 'demo-approve-plan') {
      respondWithSim(activeThreadId, {
        content: `🚀 **Plan approved!** Now let's bring it to life.\n\nFirst up — **creatives**. I'll generate images and a video ad. Let's pick a script style for the video first. 🎬`,
      }, 600);
      setTimeout(() => respondWithSim(activeThreadId, showScriptsResponse, 800), 1600);
      return;
    }

    if (action === 'edit-plan') {
      respondWithSim(activeThreadId, {
        content: `No problem! Edit any field in the blueprint above — just click on it. Let me know when you're ready. 👆`,
        actionChips: [{ label: '✅ Looks good — continue', action: isDemoRef.current ? 'demo-approve-plan' : 'approve-plan' }],
      });
      return;
    }

    // Creative type selection
    if (action === 'creative-type-image') { creativeFlowModeRef.current = 'images'; setIsTyping(true); runConversationSteps(activeThreadId, buildImageOnlyFlow()); return; }
    if (action === 'creative-type-video') { creativeFlowModeRef.current = 'video'; setIsTyping(true); runConversationSteps(activeThreadId, buildVideoAvatarFlow()); return; }
    if (action === 'creative-type-motion') { creativeFlowModeRef.current = 'motion'; setIsTyping(true); runConversationSteps(activeThreadId, buildVideoMotionFlow()); return; }
    if (action === 'creative-type-both') { creativeFlowModeRef.current = 'both'; setIsTyping(true); runConversationSteps(activeThreadId, buildCreativeConversation('both')); return; }

    if (action === 'demo-act-recommendation') {
      respondWithSim(activeThreadId, {
        content: `⚡ **Done — budget reallocated!** Shifted $400/month from underperforming broad campaigns to retargeting (3.5x ROAS vs 1.8x).\n\n• Expected: **+$2,000/month revenue**\n• Monitoring for 7 days with auto-revert safety net\n\nWant me to automate optimizations like this going forward?`,
        artifacts: [{ type: 'ai-insights' as ArtifactType, titleSuffix: 'Budget Reallocation — Applied', dataOverrides: { insights: [{
          type: 'opportunity', severity: 'high', title: 'Reallocate budget to retargeting',
          description: 'Change applied. Retargeting ~3.5x per dollar vs 1.8x for broad. Monitoring 7 days.',
          metric: 'Return', change: 52, suggestedAction: 'Monitor for 7 days',
        }] } }],
        actionChips: [
          { label: '🤖 Yes, set up automation', action: 'setup-rule' },
          { label: '📊 View performance', action: 'performance' },
          { label: '🚀 Create another campaign', action: 'new-campaign' },
        ],
      });
      return;
    }

    if (action === 'connect-facebook') { setIsTyping(true); runConversationSteps(activeThreadId, buildFacebookConnectFlow()); return; }
    if (action === 'audit') { setIsTyping(true); runConversationSteps(activeThreadId, buildAuditFlow(isDemoRef.current)); return; }
    if (action === 'configure-campaign' || action === 'use-in-campaign') { respondWithSim(activeThreadId, campaignConfigResponse()); return; }
    if (action === 'preview-device') { respondWithSim(activeThreadId, devicePreviewResponse()); return; }
    if (action === 'publish-campaign') {
      setThreads(prev => {
        const thread = prev[activeThreadId];
        if (!thread) return prev;
        return { ...prev, [activeThreadId]: { ...thread, status: 'live-campaign' } };
      });
      respondWithSim(activeThreadId, publishCampaignResponse());
      return;
    }
    if (action === 'create-flow-from-campaign') {
      const thread = threads[activeThreadId];
      const hasProduct = thread?.artifacts.some(a => a.type === 'product-analysis');
      if (hasProduct) {
        respondWithSim(activeThreadId, {
          content: `I already have your product details — what type of creatives do you want? 🎨`,
          actionChips: [
            { label: '🖼️ Static images', action: 'creative-type-image' },
            { label: '🎬 Video with avatar', action: 'creative-type-video' },
            { label: '🎥 Motion video', action: 'creative-type-motion' },
            { label: '✨ Both images & video', action: 'creative-type-both' },
            { label: '📤 Upload my own', action: 'upload-creative' },
            { label: '📚 Pick from library', action: 'show-library' },
          ],
        });
      } else {
        setIsTyping(true);
        runConversationSteps(activeThreadId, buildCreativeConversation());
      }
      return;
    }
    if (action === 'show-scripts') { respondWithSim(activeThreadId, showScriptsResponse); return; }
    if (action === 'show-library') { respondWithSim(activeThreadId, creativeLibraryResponse()); return; }
    if (action === 'setup-rule') { respondWithSim(activeThreadId, automationRuleResponse()); return; }
    if (action === 'setup-rule-2') { respondWithSim(activeThreadId, automationRule2Response()); return; }
    if (action === 'apply-recommendation') { respondWithSim(activeThreadId, recommendationAppliedResponse()); return; }
    if (action === 'defer-recommendation') { respondWithSim(activeThreadId, recommendationDeferredResponse()); return; }
    if (action === 'dismiss-recommendation') { respondWithSim(activeThreadId, recommendationDismissedResponse()); return; }
    if (action === 'performance') { respondWithSim(activeThreadId, performanceDashboardResponse()); return; }
    if (action === 'download-all') {
      respondWithSim(activeThreadId, {
        content: `📥 **Download started!** Your creatives are being packaged...\n\n*(In production, this would download a ZIP with all generated assets.)*\n\nWhat's next?`,
        actionChips: [
          { label: '📱 Connect Facebook & publish', action: 'connect-facebook' },
          { label: '🔄 Generate more', action: 'create-flow-from-campaign' },
          { label: '🚀 Plan a campaign', action: 'new-campaign' },
        ],
      });
      return;
    }
    if (action === 'new-campaign') {
      respondWithSim(activeThreadId, {
        content: `Let's plan a new campaign! 🚀\n\nTell me about your product or business.`,
        actionChips: [
          { label: '👕 Apparel', action: 'planning-category-apparel' },
          { label: '💪 Health & supplements', action: 'planning-category-health' },
          { label: '💄 Beauty & skincare', action: 'planning-category-beauty' },
          { label: '📝 Describe it', action: 'planning-category-custom' },
        ],
      });
      return;
    }

    const simple = simpleResponses[action];
    if (simple) { respondWithSim(activeThreadId, simple); return; }
    respondWithSim(activeThreadId, simpleResponses.default);
  }, [activeThreadId, threads, runConversationSteps, respondWithSim]);

  const handleArtifactAction = useCallback((artifactId: string, action: string, payload?: any) => {
    if (!activeThreadId) return;
    if (action === 'facebook-connect-auth') {
      respondWithSim(activeThreadId, facebookConnectedResponse(), 2000);
      return;
    }
    if (action === 'script-selected') { respondWithSim(activeThreadId, avatarResponse); return; }
    if (action === 'avatar-selected') {
      const avatar = AVATARS.find(a => a.id === payload?.avatarId);
      const avatarName = avatar?.name || 'Avatar';
      const response = generationResponse(avatarName);
      setIsTyping(true);
      const timer = setTimeout(() => {
        const { artifacts: newArtifacts, ids: artifactIds } = createArtifactsFromSpec(response.artifacts);
        const aiMsg: ThreadMessage = {
          id: `msg-${Date.now()}`, role: 'assistant', content: response.content, timestamp: new Date(),
          artifactIds: artifactIds.length > 0 ? artifactIds : undefined,
        };
        appendMessage(activeThreadId, aiMsg, newArtifacts);
        setIsTyping(false);
        if (artifactIds.length > 0) setFocusedArtifactId(artifactIds[0]);
        const progressArtId = artifactIds[0];
        [{ delay: 2000, progress: 55 }, { delay: 4000, progress: 75 }, { delay: 6000, progress: 90 }, { delay: 8000, progress: 100, stage: 'complete' }].forEach(({ delay, progress, stage }) => {
          const t = setTimeout(() => {
            setThreads(prev => {
              const thread = prev[activeThreadId];
              if (!thread) return prev;
              return { ...prev, [activeThreadId]: { ...thread, artifacts: thread.artifacts.map(a =>
                a.id === progressArtId ? { ...a, data: { ...a.data, progress, stage: stage || 'rendering', outputs: a.data.outputs?.map((o: any) => ({ ...o, status: progress >= 100 ? 'ready' : o.status })) }, updatedAt: new Date() } : a
              ) } };
            });
          }, delay);
          pendingStepsRef.current.push(t);
        });
        const completionTimer = setTimeout(() => {
          const resultResp = creativeResultResponse(avatarName);
          const { artifacts: resultArts, ids: resultIds } = createArtifactsFromSpec(resultResp.artifacts);
          const resultMsg: ThreadMessage = {
            id: `msg-${Date.now()}-result`, role: 'assistant', content: resultResp.content, timestamp: new Date(),
            artifactIds: resultIds.length > 0 ? resultIds : undefined, actionChips: resultResp.actionChips,
          };
          appendMessage(activeThreadId, resultMsg, resultArts);
          if (resultIds.length > 0) setFocusedArtifactId(resultIds[0]);
        }, 9500);
        pendingStepsRef.current.push(completionTimer);
      }, 800 + Math.random() * 600);
      pendingStepsRef.current.push(timer);
      return;
    }
    if (action === 'act-on-signal' && payload) {
      respondWithSim(activeThreadId, {
        content: `⚡ **Acting on: "${payload.title}"**\n\nHere's the recommendation with projected impact.`,
        artifacts: [{ type: 'ai-insights' as ArtifactType, titleSuffix: `Recommendation — ${payload.title}`, dataOverrides: { insights: [{
          type: 'opportunity', severity: 'high', title: payload.title,
          description: `Expected: ${payload.impact}. Confidence: ${payload.confidence}%. Apply to see results in 48-72 hours.`,
          metric: 'Impact', change: payload.confidence, suggestedAction: `Apply: ${payload.title}`,
        }] } }],
        actionChips: [{ label: '✅ Apply now', action: 'apply-recommendation' }, { label: '⏳ Defer', action: 'defer-recommendation' }, { label: '❌ Dismiss', action: 'dismiss-recommendation' }],
      });
      return;
    }
    if (action === 'variants-confirmed' && payload?.selectedIds) {
      const count = payload.selectedIds.length;
      respondWithSim(activeThreadId, planningQuestionsResponse(isDemoRef.current, true, count));
      return;
    }
    if (action === 'assignment-confirmed' && payload?.assignments) {
      const totalAds = Object.values(payload.assignments as Record<string, string[]>).reduce((sum: number, arr: string[]) => sum + arr.length, 0);
      respondWithSim(activeThreadId, {
        content: `✅ **Creative assignment locked!** ${totalAds} ads across ${Object.keys(payload.assignments).length} ad sets with CBO.\n\nNow let me configure the campaign and connect your Facebook account.`,
        actionChips: [
          { label: '📱 Connect Facebook', action: 'connect-facebook' },
          { label: '📋 Configure campaign', action: 'configure-campaign' },
        ],
      });
      return;
    }
    // Upload artifact actions
    if (action === 'upload-use') {
      respondWithSim(activeThreadId, {
        content: `✅ **Creatives uploaded!** ${payload?.files?.length || 2} files ready to use.\n\nWhat would you like to do with them?`,
        actionChips: [
          { label: '📱 Use in campaign', action: 'configure-campaign' },
          { label: '📱 Connect Facebook & publish', action: 'connect-facebook' },
          { label: '📤 Upload more', action: 'upload-creative' },
        ],
      });
      return;
    }
    // Library select action
    if (action === 'library-select' && payload?.item) {
      respondWithSim(activeThreadId, {
        content: `✅ **Selected: "${payload.item.label}"** (${payload.item.dimensions})\n\nGreat choice! What would you like to do next?`,
        actionChips: [
          { label: '📱 Use in campaign', action: 'configure-campaign' },
          { label: '📱 Connect Facebook & publish', action: 'connect-facebook' },
          { label: '🔄 Generate more variants', action: 'create-flow-from-campaign' },
        ],
      });
      return;
    }
    // Post-publish feedback → transition to performance monitoring
    if (action === 'feedback-submitted' || action === 'feedback-skipped') {
      respondWithSim(activeThreadId, {
        content: `📊 **Now let's monitor your campaign!** Here's your live performance dashboard.\n\n⏳ AI recommendations will appear in **24-48 hours**. In the meantime, I can run a **30-day audit** of your entire ad account.\n\n*Journey: Plan ✅ → Create ✅ → Publish ✅ → **Monitor** → Audit → Optimize*`,
      }, 800);
      setTimeout(() => respondWithSim(activeThreadId, performanceDashboardResponse(), 600), 2000);
      return;
    }
    // Performance dashboard recommendation actions
    if ((action === 'apply-rec' || action === 'defer-rec' || action === 'dismiss-rec') && payload) {
      const newState = action === 'apply-rec' ? 'applied' : action === 'defer-rec' ? 'deferred' : 'dismissed';
      setThreads(prev => {
        const thread = prev[activeThreadId];
        if (!thread) return prev;
        return { ...prev, [activeThreadId]: { ...thread, artifacts: thread.artifacts.map(a => {
          if (a.id !== artifactId || a.type !== 'performance-dashboard') return a;
          const updatedRecs = a.data.recommendations?.map((r: any) =>
            r.id === payload.recId ? { ...r, state: newState } : r
          );
          let trackedActions = a.data.trackedActions || [];
          if (action === 'apply-rec') {
            const currentMetrics = a.data.metrics || {};
            const newTracked = {
              id: `track-${Date.now()}`,
              title: payload.title,
              appliedAt: 'Just now',
              status: 'monitoring',
              before: { spend: currentMetrics.spent || 180, roas: currentMetrics.roi || 3.0, ctr: currentMetrics.ctr || 2.8, conversions: currentMetrics.conversions || 18 },
              after: undefined,
              impact: undefined,
            };
            trackedActions = [...trackedActions, newTracked];
            setTimeout(() => {
              setThreads(prev2 => {
                const t = prev2[activeThreadId];
                if (!t) return prev2;
                return { ...prev2, [activeThreadId]: { ...t, artifacts: t.artifacts.map(art => {
                  if (art.id !== artifactId || art.type !== 'performance-dashboard') return art;
                  return { ...art, data: { ...art.data, trackedActions: (art.data.trackedActions || []).map((ta: any) =>
                    ta.id === newTracked.id ? {
                      ...ta, status: 'positive', appliedAt: '5 minutes ago',
                      after: { spend: Math.round(ta.before.spend * 0.9), roas: +(ta.before.roas * 1.35).toFixed(1), ctr: +(ta.before.ctr * 1.15).toFixed(1), conversions: Math.round(ta.before.conversions * 1.2) },
                      impact: `ROAS improved by ${25 + Math.round(Math.random() * 10)}%`,
                    } : ta
                  ) } };
                }) } };
              });
            }, 5000);
          }
          return { ...a, data: { ...a.data, recommendations: updatedRecs, trackedActions }, updatedAt: new Date() };
        }) } };
      });
      if (action === 'apply-rec') {
        respondWithSim(activeThreadId, {
          content: `✅ **Applied: "${payload.title}"**\n\n• Effect within **15-30 min** · Expected: **${payload.impact}** · Full assessment in **7 days**`,
          actionChips: [
            { label: '📊 View dashboard', action: 'performance' },
            { label: '⚡ Set up auto-rule', action: 'setup-rule' },
          ],
        });
      }
      return;
    }
  }, [activeThreadId, appendMessage, respondWithSim]);

  const toggleArtifactCollapse = useCallback((artifactId: string) => {
    if (!activeThreadId) return;
    setThreads(prev => {
      const thread = prev[activeThreadId];
      return { ...prev, [activeThreadId]: { ...thread, artifacts: thread.artifacts.map(a => a.id === artifactId ? { ...a, isCollapsed: !a.isCollapsed } : a) } };
    });
  }, [activeThreadId]);

  const updateArtifactData = useCallback((artifactId: string, data: Record<string, any>) => {
    if (!activeThreadId) return;
    setThreads(prev => {
      const thread = prev[activeThreadId];
      return { ...prev, [activeThreadId]: { ...thread, artifacts: thread.artifacts.map(a => a.id === artifactId ? { ...a, data, version: a.version + 1, updatedAt: new Date() } : a) } };
    });
  }, [activeThreadId]);

  const focusArtifact = useCallback((artifactId: string) => {
    if (!activeThreadId) return;
    setThreads(prev => {
      const thread = prev[activeThreadId];
      return { ...prev, [activeThreadId]: { ...thread, artifacts: thread.artifacts.map(a => a.id === artifactId ? { ...a, isCollapsed: false } : a) } };
    });
    setFocusedArtifactId(artifactId);
    setTimeout(() => document.getElementById(`artifact-${artifactId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  }, [activeThreadId]);

  const openSignalsDashboard = useCallback(() => {
    const existingSignalsThread = Object.values(threads).find(t => t.title === 'AI Signals');
    if (existingSignalsThread) { setActiveThreadId(existingSignalsThread.id); setIsHomeMode(false); return; }
    const id = `thread-signals-${Date.now()}`;
    const signalsArtifact: Artifact = {
      id: `art-signals-${Date.now()}`, type: 'ai-signals-dashboard', title: 'Account Signals & Health',
      status: 'live', version: 1, isCollapsed: false, createdAt: new Date(), updatedAt: new Date(),
      data: { healthScore: 62, verdict: 'Your account needs attention', verdictDetail: 'Budget allocation is off, some ads are fatigued, and there\'s wasted spend.',
        healthMetrics: mockHealthMetrics, reasons: mockReasons, actions: mockActions, wasteItems: mockWasteItems, liveAlerts: mockLiveAlerts, quickWins: mockQuickWins },
    };
    const newThread: Thread = {
      id, title: 'AI Signals', workspaceId: 'ws-1',
      messages: [{ id: `msg-${Date.now()}`, role: 'assistant', content: '🔍 Here\'s your **AI Signals Dashboard** — a real-time view of your ad account health.', timestamp: new Date(), artifactIds: [signalsArtifact.id] }],
      artifacts: [signalsArtifact], rules: [], createdAt: new Date(), updatedAt: new Date(), isActive: true, status: 'active', pinnedArtifactIds: [],
    };
    setThreads(prev => ({ ...prev, [id]: newThread }));
    setActiveThreadId(id);
    setIsHomeMode(false);
  }, [threads]);

  const archiveThread = useCallback((threadId: string) => {
    setThreads(prev => {
      const thread = prev[threadId];
      if (!thread) return prev;
      return { ...prev, [threadId]: { ...thread, status: thread.status === 'archived' ? 'active' : 'archived', isActive: thread.status === 'archived' } };
    });
  }, []);

  const summarizeThread = useCallback((threadId: string) => {
    if (!threadId) return;
    const thread = threads[threadId];
    if (!thread) return;
    const artifactCount = thread.artifacts.length;
    const msgCount = thread.messages.length;
    const types = [...new Set(thread.artifacts.map(a => a.type))];
    const summary = `📝 **Thread Summary: ${thread.title}**\n\n• ${msgCount} messages, ${artifactCount} artifacts\n• Types: ${types.map(t => t.replace(/-/g, ' ')).join(', ') || 'none'}\n• Created: ${thread.createdAt.toLocaleDateString()}\n• Updated: ${thread.updatedAt.toLocaleDateString()}`;
    const summaryMsg: ThreadMessage = { id: `msg-summary-${Date.now()}`, role: 'assistant', content: summary, timestamp: new Date() };
    appendMessage(threadId, summaryMsg);
  }, [threads, appendMessage]);

  const pinArtifact = useCallback((artifactId: string) => {
    if (!activeThreadId) return;
    setThreads(prev => {
      const thread = prev[activeThreadId];
      if (!thread) return prev;
      const pinned = thread.pinnedArtifactIds.includes(artifactId)
        ? thread.pinnedArtifactIds.filter(id => id !== artifactId)
        : [...thread.pinnedArtifactIds, artifactId];
      return { ...prev, [activeThreadId]: { ...thread, pinnedArtifactIds: pinned } };
    });
  }, [activeThreadId]);

  const allThreads = Object.values(threads);

  return {
    activeThread, activeThreadId, isTyping, sidebarCollapsed, focusedArtifactId,
    selectThread, createThread, sendMessage, handleActionChip, handleArtifactAction,
    toggleArtifactCollapse, updateArtifactData, focusArtifact, setSidebarCollapsed,
    openSignalsDashboard, archiveThread, summarizeThread, pinArtifact, allThreads,
    isHomeMode, enterWorkspaceFromHome,
  };
}
