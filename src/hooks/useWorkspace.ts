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
  | 'connect-facebook' | 'audit' | 'publish' | 'performance' | 'insights'
  | 'rule' | 'demo' | 'product-url' | 'default';

function isUrl(message: string): boolean {
  return /https?:\/\/|www\.|\.com|\.shop|\.store|\.co\b|\.io\b|\.net\b|\.org\b/i.test(message);
}

function detectIntent(message: string): Intent {
  const l = message.toLowerCase();
  if (l.includes('full demo') || l.includes('run demo') || l.includes('end to end') || l.includes('end-to-end') || l.includes('show me everything')) return 'demo';
  if (isUrl(message)) return 'product-url';
  if ((l.includes('connect') || l.includes('link') || l.includes('add') || l.includes('integrate')) && (l.includes('facebook') || l.includes('fb') || l.includes('meta'))) return 'connect-facebook';
  if (l.includes('audit') || (l.includes('review') && l.includes('account')) || (l.includes('what') && l.includes('working'))) return 'audit';
  if (l.includes('publish') || l.includes('go live') || l.includes('push live') || l.includes('launch campaign')) return 'publish';
  if ((l.includes('create') || l.includes('generate') || l.includes('make') || l.includes('design') || l.includes('build')) && (l.includes('image') && !l.includes('video'))) return 'creative-images';
  if ((l.includes('create') || l.includes('generate') || l.includes('make')) && (l.includes('video') && !l.includes('image'))) return 'creative-video';
  if ((l.includes('create') || l.includes('generate') || l.includes('make')) && l.includes('image') && l.includes('video')) return 'creative-both';
  if ((l.includes('create') || l.includes('generate') || l.includes('make') || l.includes('design') || l.includes('build'))
    && (l.includes('creative') || l.includes('ad') || l.includes('content'))) return 'create-flow';
  if (l.includes('campaign') || l.includes('plan') || l.includes('blueprint') || l.includes('summer') || l.includes('launch')) return 'campaign';
  if (l.includes('performance') || l.includes('metrics') || (l.includes('how') && l.includes('doing'))) return 'performance';
  if (l.includes('insight') || l.includes('signal') || l.includes('anomal')) return 'insights';
  if (l.includes('rule') || l.includes('automat') || l.includes('trigger')) return 'rule';
  // Treat any freeform text as a product description if it's long enough (likely describing a product)
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
  const productName = extractProductName(userMessage);
  
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

// After product analysis, ask ALL planning questions in one intelligent message
function planningQuestionsResponse(isDemo = false, hasVariants = false, variantCount = 0): SimResponse {
  const prefix = isDemo ? 'demo-' : '';
  const variantSection = hasVariants
    ? `\n\n**4. I found ${variantCount} product variants.** How do you want to handle them?`
    : '';
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

// Complete execution plan presented to user for approval
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

// Parse plan selection from action chip
function parsePlanAction(action: string): { objective: string; budget: number; multiVariant: boolean } {
  const clean = action.replace('demo-', '').replace('plan-', '');
  const multiVariant = clean.includes('-variants');
  const parts = clean.replace('-variants', '').split('-');
  const goalMap: Record<string, string> = { sales: 'Sales', awareness: 'Awareness', traffic: 'Traffic' };
  const budgetMap: Record<string, number> = { low: 25, medium: 60, high: 120 };
  return { objective: goalMap[parts[0]] || 'Sales', budget: budgetMap[parts[1]] || 60, multiVariant };
}

// ========== CREATIVE FLOW ==========

function buildCreativeConversation(creativeType?: 'image' | 'video' | 'both', context?: { filters?: Record<string, string[]> }): ConversationStep[] {
  // If context has type and style from home filters, skip ahead to product analysis
  const typeFromCtx = context?.filters?.type?.[0] as 'image' | 'video' | 'both' | undefined;
  const styleFromCtx = context?.filters?.style?.[0];
  const resolvedType = creativeType || typeFromCtx;

  if (resolvedType && styleFromCtx) {
    // Both selected — go straight to asking for product
    return [{ delay: 1200, response: {
      content: `I'll generate ${resolvedType === 'image' ? 'images 🖼️' : resolvedType === 'video' ? 'a video 🎬' : 'images + video ✨'} in a **${styleFromCtx}** style.\n\nNow I need your product details — share a URL or describe the product so I can tailor everything.`,
      actionChips: [
        { label: '🔗 Paste a URL', action: 'prompt-url' },
        { label: '📝 Describe it', action: 'prompt-describe' },
        { label: '⚡ Use sample product', action: 'use-sample-product' },
      ],
    } }];
  }

  if (resolvedType) {
    const typeLabel = resolvedType === 'image' ? 'static images 🖼️' : resolvedType === 'video' ? 'a video ad 🎬' : 'images + video ✨';
    return [{ delay: 1200, response: {
      content: `I'll create ${typeLabel}! First — share your product URL or describe what you're promoting, so I can analyze it and generate tailored creatives.`,
      actionChips: [
        { label: '🔗 Paste a URL', action: 'prompt-url' },
        { label: '📝 Describe it', action: 'prompt-describe' },
        { label: '⚡ Use sample product', action: 'use-sample-product' },
      ],
    } }];
  }
  return [{ delay: 1200, response: { content: `Let's create some amazing ad creatives! 🎨\n\nFirst — **what type of creatives do you need?**`, actionChips: [
    { label: '🖼️ Static images', action: 'creative-type-image' }, { label: '🎬 Video with AI avatar', action: 'creative-type-video' },
    { label: '✨ Both images & video', action: 'creative-type-both' },
  ] } }];
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

function generationResponse(avatarName: string): SimResponse {
  return {
    content: `**${avatarName}** is locked in! 🎬 Generating your creatives now — images + video. This takes about a minute...`,
    artifacts: [{ type: 'generation-progress' as ArtifactType, titleSuffix: 'Generating Creatives', dataOverrides: {
      stage: 'rendering', progress: 35,
      outputs: [
        { id: 'out-1', type: 'image', label: 'Hero Banner (Feed)', format: 'image', dimensions: '1200×628', status: 'generating' },
        { id: 'out-2', type: 'image', label: 'Instagram Story', format: 'image', dimensions: '1080×1920', status: 'generating' },
        { id: 'out-3', type: 'image', label: 'Square Post', format: 'image', dimensions: '1080×1080', status: 'generating' },
        { id: 'out-4', type: 'video', label: `Video Ad — ${avatarName}`, format: 'video', dimensions: '1080×1920', status: 'generating', duration: '30s' },
      ],
    } }],
  };
}

function creativeResultResponse(avatarName: string): SimResponse {
  return {
    content: `🎉 **Your creatives are ready!** Preview each one below, then download or use them directly in a campaign.`,
    artifacts: [{ type: 'creative-result' as ArtifactType, titleSuffix: 'Generated Creatives', dataOverrides: {
      outputs: [
        { id: 'res-1', type: 'image', label: 'Hero Banner (Feed)', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&h=628&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=200&fit=crop', format: 'jpg', dimensions: '1200×628' },
        { id: 'res-2', type: 'image', label: 'Instagram Story', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1080&h=1920&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200&h=350&fit=crop', format: 'jpg', dimensions: '1080×1920' },
        { id: 'res-3', type: 'image', label: 'Square Post', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1080&h=1080&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop', format: 'jpg', dimensions: '1080×1080' },
        { id: 'res-4', type: 'video', label: `Video Ad — ${avatarName}`, url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1080&h=1920&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&h=350&fit=crop', format: 'mp4', dimensions: '1080×1920', duration: '30s' },
      ],
      selectedIndex: 0,
    } }],
    actionChips: [
      { label: '📱 Connect Facebook & publish', action: 'connect-facebook' },
      { label: '📥 Download all', action: 'download-all' },
      { label: '🔄 Generate more variants', action: 'create-flow-from-campaign' },
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
    content: `🎉🎊 **Campaign published successfully!** Your ads are now live on Facebook & Instagram.`,
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
  return [
    { delay: 1200, response: {
      content: `🔍 Running a deep audit of your Facebook ad account...`,
      artifacts: [{ type: 'audit-report' as ArtifactType, titleSuffix: '30-Day Account Audit', dataOverrides: {
        loadingComplete: false,
        initialPeriod: '30-day',
        healthScore: 62,
        verdict: 'Your account needs attention',
        verdictDetail: 'Budget allocation is off, some ads are fatigued, and there\'s wasted spend. Let\'s fix it.',
        healthMetrics: mockHealthMetrics,
        reasons: mockReasons,
        actions: mockActions,
        wasteItems: mockWasteItems,
        liveAlerts: mockLiveAlerts,
        quickWins: mockQuickWins,
        trendingChanges: [
          { id: 'tc-1', metric: 'Cost per Sale', change: '-15%', direction: 'down', context: 'Getting cheaper to convert', since: 'vs last week' },
          { id: 'tc-2', metric: 'Click Rate', change: '+8%', direction: 'up', context: 'More people clicking ads', since: 'vs last week' },
          { id: 'tc-3', metric: 'Reach', change: '-22%', direction: 'down', context: 'Fewer people seeing ads', since: 'vs yesterday' },
        ],
        periodData: {
          '30-day': {
            reasons: mockReasons,
            actions: mockActions,
            wasteItems: mockWasteItems,
            quickWins: mockQuickWins,
            liveAlerts: mockLiveAlerts,
          },
          '15-day': {
            reasons: mockReasons.slice(0, 2),
            actions: mockActions.slice(0, 2),
            wasteItems: mockWasteItems.slice(0, 2),
            quickWins: mockQuickWins,
            trendingChanges: [
              { id: 'tc-1', metric: 'Cost per Sale', change: '-15%', direction: 'down', context: 'Getting cheaper to convert', since: 'vs last week' },
              { id: 'tc-2', metric: 'Click Rate', change: '+8%', direction: 'up', context: 'More people clicking ads', since: 'vs last week' },
            ],
            stats: { spend: '₹8,920', sales: 98, roi: '3.4x' },
          },
          '7-day': {
            actions: mockActions.slice(0, 1),
            quickWins: mockQuickWins.slice(0, 2),
            trendingChanges: [
              { id: 'tc-1', metric: 'Cost per Sale', change: '-15%', direction: 'down', context: 'Getting cheaper to convert', since: 'vs last week' },
              { id: 'tc-2', metric: 'Click Rate', change: '+8%', direction: 'up', context: 'More people clicking ads', since: 'vs last week' },
              { id: 'tc-3', metric: 'Reach', change: '-22%', direction: 'down', context: 'Fewer people seeing ads', since: 'vs yesterday' },
            ],
            stats: { spend: '₹4,230', sales: 47, roi: '3.2x' },
          },
          'today': {
            actions: [mockActions[0]],
            quickWins: [mockQuickWins[0]],
            liveAlerts: mockLiveAlerts,
            stats: { spend: '₹342', sales: 4, activeAds: 12 },
          },
        },
      } }],
      actionChips: isDemo ? demoAuditActionChips() : [
        { label: '📊 View live performance', action: 'performance' },
        { label: '🎨 Generate fresh creatives', action: 'create-flow-from-campaign' },
        { label: '💰 Reallocate budget', action: 'adjust-budget' },
        { label: '⚡ Set up automation rules', action: 'setup-rule' },
        { label: '🎯 Create lookalike audience', action: 'refine-targeting' },
      ],
    } },
  ];
}

// ========== DEMO FLOW ==========

function buildDemoFlow(): ConversationStep[] {
  return [
    { delay: 1200, response: {
      content: `Hey! 👋 Let me walk you through what Vibelets can do — I'll take a real product and show you the entire journey from analysis to a live campaign with AI monitoring.\n\nFirst things first — I need a product to work with. Got a URL, or want me to use a sample?`,
      actionChips: [
        { label: '🔗 Paste a URL', action: 'prompt-url' },
        { label: '⚡ Use sample product', action: 'use-sample-product' },
      ],
    }},
  ];
}

function demoBlueprintResponse(objective: string, budgetDaily: number): SimResponse {
  const base = executionPlanResponse(objective, budgetDaily, true);
  return base;
}

function demoCreativeResultResponse(avatarName: string): SimResponse {
  const base = creativeResultResponse(avatarName);
  return { ...base,
    content: `🎉 **All creatives are ready!** You've got images for feed, story, and a video with ${avatarName}.\n\nNow let's get these in front of your audience — I just need to connect your ad account.`,
    actionChips: [{ label: '📱 Connect Facebook', action: 'connect-facebook' }, { label: '📥 Download all', action: 'download-all' }],
  };
}

function demoFacebookConnectedResponse(): SimResponse {
  const base = facebookConnectedResponse();
  return { ...base,
    content: `✅ **Connected!** I found your ad account — **Primary Ad Account** with Pixel and Page auto-detected.\n\nLet me configure the campaign so you can review everything before going live.`,
    actionChips: [{ label: '🚀 Configure & publish', action: 'configure-campaign' }],
  };
}

function demoPublishResponse(): SimResponse {
  const base = publishCampaignResponse();
  return { ...base,
    content: `🎉🎊 **Your campaign is live!** Ads are now running on Facebook & Instagram.`,
  };
}

function demoAuditActionChips(): ActionChip[] {
  return [
    { label: '⚡ Apply top recommendation', action: 'demo-act-recommendation' },
    { label: '🎨 Generate fresh creatives', action: 'create-flow-from-campaign' },
  ];
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
        { time: '2 hours ago', message: 'CTR improved 12% on Hero Banner creative', type: 'positive' },
        { time: '5 hours ago', message: 'CPA decreased from $12.50 to $10.00', type: 'positive' },
        { time: '1 day ago', message: 'Story Ad creative underperforming — below 1% CTR', type: 'negative' },
        { time: '2 days ago', message: 'Campaign entered learning phase', type: 'neutral' },
      ],
      recommendations: [
        { id: 'rec-1', title: 'Increase budget on Hero Banner ad set', description: 'Hero Banner has 4.2x ROAS vs 1.8x for other creatives. Shifting budget here could improve overall return.', impact: '+$200/week revenue', confidence: 87, priority: 'high', state: 'pending' },
        { id: 'rec-2', title: 'Pause Story Ad creative', description: 'Story Ad has been running for 3 days with CTR below 1%. Pausing it will focus spend on better performers.', impact: 'Save $15/day wasted spend', confidence: 92, priority: 'high', state: 'pending' },
        { id: 'rec-3', title: 'Test lookalike audience expansion', description: 'Your top converters share strong signals. A 1% lookalike could expand reach while maintaining quality.', impact: '+30% reach', confidence: 74, priority: 'medium', state: 'pending' },
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
    content: "🎯 Here are targeting insights based on your account data and audience analysis.",
    artifacts: [{ type: 'ai-insights', titleSuffix: 'Targeting Insights', dataOverrides: { insights: [
      { type: 'opportunity', severity: 'high', title: 'Lookalike audience match', description: 'Top buyers strongly overlap with "Streetwear Enthusiasts" aged 20-28.', metric: 'Conversions', change: 30, suggestedAction: 'Create lookalike from top 500 purchasers' },
      { type: 'trend', severity: 'medium', title: 'Peak engagement: evenings', description: 'Your audience engages most 6PM–10PM.', metric: 'Engagement', change: 22, suggestedAction: 'Set ad schedule to 5PM–11PM' },
    ] } }],
  },
  'adjust-budget': {
    content: "💰 Here's a budget optimization view with projections and recommendations.",
    artifacts: [{ type: 'performance-snapshot', titleSuffix: 'Budget Projection', dataOverrides: {
      dateRange: 'Jun 1 — Aug 31, 2026 (projected)', metrics: { spent: 1800, revenue: 7200, roi: 4.0, conversions: 180, ctr: 3.5, impressions: 95000 },
      topCampaign: 'Summer T-Shirt — Broad', recommendations: ['Front-load: $80/day for first 14 days', 'Scale back to $50/day after learning', 'Allocate 30% to retargeting'],
    } }],
  },
  default: { content: "Got it! I'm ready to help. What would you like to work on — campaigns, creatives, performance, or something else?" },
};

// Helper for building planning recommendation inline (used by sendMessage)
function buildPlanningRecommendation(goalKey: string, _threadId: string): SimResponse {
  let goalLabel: string, budgetRange: string, suggestion: string, objectiveDetail: string;
  const audienceDefault = 'Your target audience, 18-45';
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
    content: `Here's what I'd recommend:\n\n🎯 **Goal:** ${goalLabel}\n👥 **Target audience:** ${audienceDefault}\n💰 **Budget:** ${budgetRange} to start\n📱 **Platforms:** Facebook & Instagram\n\n${suggestion}\n\n${objectiveDetail}\n\n**My proposed plan:**\n1. 🔍 Analyze your product page\n2. 🎨 Generate AI creatives — images + video\n3. 📋 Build campaign structure\n4. 📱 Connect Facebook & publish\n5. 📊 Monitor & auto-optimize\n\n**Your Facebook account:** Primary Ad Account (Pixel: px_987654) ✅\n\n*Does this look right? Happy to adjust anything.*`,
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

// ========== DEMO THREAD TEMPLATES ==========

function createDemoThreads(): Record<string, Thread> {
  const now = new Date();
  const demoThreadDefs: { id: string; title: string; emoji: string; firstMessage: string }[] = [
    { id: 'demo-planning', title: '📊 Demo: Campaign Planning', emoji: '📊', firstMessage: "Hey! 👋 I'm your AI campaign strategist. Before I build anything, I'd love to understand your business and goals.\n\nTell me — **what are you looking to promote?** A product, a service, a brand? The more context you give me, the better plan I can put together." },
    { id: 'demo-multi-variant', title: '🧪 Demo: Multi-Variant Campaign', emoji: '🧪', firstMessage: "Welcome to the **Multi-Variant Campaign** demo! I'll show you how to run ads for a product with multiple variants (e.g., flavors, sizes) — each with its own ad set and creatives.\n\nClick below to start with a sample product." },
    { id: 'demo-creatives', title: '🎨 Demo: Creative Generation', emoji: '🎨', firstMessage: "Welcome to the **Creative Generation** demo! I'll show you how to generate AI-powered ad images and videos.\n\nType anything or click below to begin." },
    { id: 'demo-publishing', title: '🚀 Demo: Publishing', emoji: '🚀', firstMessage: "Welcome to the **Publishing** demo! I'll walk you through connecting Facebook, configuring campaigns, and going live.\n\nClick below to start." },
    { id: 'demo-audit', title: '🔍 Demo: Account Audit', emoji: '🔍', firstMessage: "Welcome to the **30-Day Audit** demo! I'll analyze your ad account and surface actionable insights.\n\nClick below to run the audit." },
    { id: 'demo-recommendations', title: '⚡ Demo: AI Recommendations', emoji: '⚡', firstMessage: "Welcome to the **AI Recommendations** demo! I'll show you how smart recommendations work — apply, defer, or dismiss.\n\nClick below to see recommendations." },
    { id: 'demo-automation', title: '🤖 Demo: Automation Rules', emoji: '🤖', firstMessage: "Welcome to the **Automation Rules** demo! I'll show you how to set up auto-pause, auto-scale, and alert rules.\n\nClick below to create a rule." },
  ];

  const demoChips: Record<string, ActionChip[]> = {
    'demo-planning': [
      { label: '👕 I sell apparel', action: 'planning-category-apparel' },
      { label: '💪 Health & supplements', action: 'planning-category-health' },
      { label: '💄 Beauty & skincare', action: 'planning-category-beauty' },
      { label: '📝 Let me describe it', action: 'planning-category-custom' },
    ],
    'demo-multi-variant': [{ label: '🧪 Start multi-variant demo', action: 'start-demo-multi-variant' }],
    'demo-creatives': [{ label: '🎨 Generate creatives', action: 'start-demo-creatives' }],
    'demo-publishing': [{ label: '📱 Connect Facebook', action: 'connect-facebook' }],
    'demo-audit': [{ label: '🔍 Run 30-day audit', action: 'audit' }],
    'demo-recommendations': [{ label: '⚡ Show recommendations', action: 'demo-act-recommendation' }],
    'demo-automation': [{ label: '🤖 Set up automation rule', action: 'setup-rule' }],
  };

  const threads: Record<string, Thread> = {};
  demoThreadDefs.forEach(def => {
    threads[def.id] = {
      id: def.id, title: def.title, workspaceId: 'ws-1',
      messages: [{ id: `msg-${def.id}`, role: 'assistant', content: def.firstMessage, timestamp: now, actionChips: demoChips[def.id] }],
      artifacts: [], rules: [], createdAt: now, updatedAt: now, isActive: true,
      status: 'active', pinnedArtifactIds: [],
    };
  });
  return threads;
}

// ========== MAIN HOOK ==========

export function useWorkspace() {
  const [isHomeMode, setIsHomeMode] = useState(true);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Record<string, Thread>>(() => {
    const map: Record<string, Thread> = {};
    // Existing threads
    ['thread-1', 'thread-2', 'thread-3'].forEach(id => {
      const t = getThreadWithData(id);
      if (t) map[id] = t;
    });
    // Demo threads
    const demos = createDemoThreads();
    Object.assign(map, demos);
    return map;
  });
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [focusedArtifactId, setFocusedArtifactId] = useState<string | null>(null);
  const pendingStepsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isDemoRef = useRef(false);

  const activeThread = activeThreadId ? threads[activeThreadId] : null;

  const selectThread = useCallback((id: string) => {
    pendingStepsRef.current.forEach(clearTimeout);
    pendingStepsRef.current = [];
    setActiveThreadId(id);
    setIsHomeMode(false);
    setFocusedArtifactId(null);
    setIsTyping(false);
  }, []);

  // enterWorkspaceFromHome moved below respondWithSim

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
    const intent = context?.path === 'demo' ? 'demo' as Intent : detectIntent(message);
    const title = intent === 'demo' ? 'Full Demo — Campaign Lifecycle'
      : context?.path === 'campaign' || intent === 'campaign' ? 'New Campaign'
      : context?.path === 'creative' || intent === 'create-flow' || intent === 'creative-images' || intent === 'creative-video' || intent === 'creative-both' ? 'Creative Generation'
      : context?.path === 'audit' || intent === 'audit' ? 'Account Audit'
      : context?.path === 'performance' || intent === 'performance' ? 'Performance Analysis'
      : context?.path === 'recommendations' || intent === 'insights' ? 'AI Recommendations'
      : context?.path === 'automation' || intent === 'rule' ? 'Automation Setup'
      : intent === 'connect-facebook' ? 'Facebook Setup'
      : 'New Thread';

    const newThread: Thread = {
      id, title, workspaceId: 'ws-1',
      messages: [],
      artifacts: [], rules: [], createdAt: new Date(), updatedAt: new Date(), isActive: true,
      status: 'active', pinnedArtifactIds: [],
    };
    setThreads(prev => ({ ...prev, [id]: newThread }));
    setActiveThreadId(id);
    setIsHomeMode(false);

    setTimeout(() => {
      const userMsg: ThreadMessage = { id: `msg-${Date.now()}`, role: 'user', content: message, timestamp: new Date() };
      appendMessage(id, userMsg);

      if (intent === 'demo' || context?.path === 'demo') isDemoRef.current = true;

      if (intent === 'demo' || context?.path === 'demo') { setIsTyping(true); runConversationSteps(id, buildDemoFlow()); }
      else if (context?.path === 'campaign' || intent === 'campaign') { setIsTyping(true); runConversationSteps(id, buildCampaignConversation(message, context)); }
      else if (context?.path === 'creative') { setIsTyping(true); runConversationSteps(id, buildCreativeConversation(undefined, context)); }
      else if (intent === 'create-flow') { setIsTyping(true); runConversationSteps(id, buildCreativeConversation()); }
      else if (intent === 'creative-images') { setIsTyping(true); runConversationSteps(id, buildCreativeConversation('image')); }
      else if (intent === 'creative-video') { setIsTyping(true); runConversationSteps(id, buildCreativeConversation('video')); }
      else if (intent === 'creative-both') { setIsTyping(true); runConversationSteps(id, buildCreativeConversation('both')); }
      else if (context?.path === 'audit' || intent === 'audit') { setIsTyping(true); runConversationSteps(id, buildAuditFlow()); }
      else if (context?.path === 'automation' || intent === 'rule') { respondWithSim(id, automationRuleResponse()); }
      else if (context?.path === 'performance' || intent === 'performance') { respondWithSim(id, simpleResponses.performance); }
      else if (context?.path === 'recommendations' || intent === 'insights') { respondWithSim(id, simpleResponses.insights); }
      else if (intent === 'connect-facebook') { setIsTyping(true); runConversationSteps(id, buildFacebookConnectFlow()); }
      else if (intent === 'publish') { respondWithSim(id, publishCampaignResponse()); }
      else { respondWithSim(id, simpleResponses[intent] || simpleResponses.default); }
    }, 100);
  }, [appendMessage, runConversationSteps, respondWithSim]);


  const sendMessage = useCallback((content: string) => {
    if (!activeThreadId) return;
    const userMsg: ThreadMessage = { id: `msg-${Date.now()}`, role: 'user', content, timestamp: new Date() };
    appendMessage(activeThreadId, userMsg);

    const intent = detectIntent(content);
    const thread = threads[activeThreadId];
    
    // Context-aware: check what the last assistant message was asking for
    const lastAssistantMsg = thread?.messages?.filter(m => m.role === 'assistant').slice(-1)[0];
    const lastContent = lastAssistantMsg?.content?.toLowerCase() || '';
    const wasAskingForProduct = lastContent.includes('product url') || lastContent.includes('paste') || lastContent.includes('describe') || lastContent.includes('promoting') || lastContent.includes('sample product');
    const wasAskingForGoal = lastContent.includes('primary goal') || lastContent.includes('campaign goal');
    const wasAskingForBudget = lastContent.includes('budget') || lastContent.includes('comfort zone');
    const wasInPlanningConversation = lastContent.includes('what are you looking to promote') || lastContent.includes('ideal customer') || lastContent.includes('main thing you want') || lastContent.includes('go ahead and describe');
    const wasAskingPlanningQuestions = lastContent.includes('does this look right') || lastContent.includes('happy to adjust');

    // Planning conversation: user typed naturally about their product/business
    if (wasInPlanningConversation && intent !== 'product-url') {
      const l = content.toLowerCase();
      // Detect if they mentioned a goal inline
      if (l.includes('aware') || l.includes('brand')) {
        respondWithSim(activeThreadId, buildPlanningRecommendation('awareness', activeThreadId));
      } else if (l.includes('traffic') || l.includes('visit') || l.includes('click')) {
        respondWithSim(activeThreadId, buildPlanningRecommendation('traffic', activeThreadId));
      } else if (l.includes('sales') || l.includes('sell') || l.includes('revenue')) {
        respondWithSim(activeThreadId, buildPlanningRecommendation('sales', activeThreadId));
      } else {
        // User described their business — acknowledge and ask about goals
        respondWithSim(activeThreadId, {
          content: `That's really helpful context! 📝 I can already see some strong angles for your ads.\n\nNow the important part — **what's the main thing you want from this campaign?** This shapes everything — the ad format, targeting, and how we measure success.`,
          actionChips: [
            { label: '🎯 Drive sales', action: 'planning-goal-sales' },
            { label: '📣 Build brand awareness', action: 'planning-goal-awareness' },
            { label: '🔗 Get website traffic', action: 'planning-goal-traffic' },
            { label: '🤷 Not sure — suggest something', action: 'planning-goal-suggest' },
          ],
        });
      }
      return;
    }

    // Planning conversation: user responding to recommendation
    if (wasAskingPlanningQuestions) {
      const l = content.toLowerCase();
      if (l.includes('yes') || l.includes('good') || l.includes('great') || l.includes('let') || l.includes('go') || l.includes('start') || l.includes('ready') || l.includes('ok') || l.includes('sure') || l.includes('perfect')) {
        respondWithSim(activeThreadId, {
          content: `Awesome — let's build this! 🚀\n\nFirst, I need your product details so I can tailor everything perfectly. **Share a product URL** and I'll automatically pull images, pricing, features, and descriptions — or I can use a sample product for the demo.`,
          actionChips: [
            { label: '🔗 Paste a URL', action: 'prompt-url' },
            { label: '📝 Describe it', action: 'prompt-describe' },
            { label: '⚡ Use sample product', action: 'use-sample-product' },
          ],
        });
      } else if (l.includes('budget') || l.includes('money') || l.includes('spend') || l.includes('cost')) {
        respondWithSim(activeThreadId, {
          content: `Sure! What budget range are you comfortable with?`,
          actionChips: [
            { label: '🤏 $25-40/day — testing', action: 'planning-confirmed-low-budget' },
            { label: '💰 $50-80/day — recommended', action: 'planning-confirmed' },
            { label: '🚀 $100+/day — scaling', action: 'planning-confirmed-high-budget' },
          ],
        });
      } else if (l.includes('question') || l.includes('how') || l.includes('what') || l.includes('?')) {
        respondWithSim(activeThreadId, {
          content: `Of course! Ask me anything — here are some common things people want to know:\n\n• **How long until I see results?** Usually 3-7 days for initial data, 2 weeks for meaningful optimization.\n• **Can I pause anytime?** Absolutely — no commitments.\n• **What creatives will you make?** Product hero shots, lifestyle images, and a short AI video.\n\nOr type your own question. 🙂`,
          actionChips: [
            { label: '✅ I\'m ready — let\'s plan', action: 'planning-confirmed' },
            { label: '💰 Budget advice', action: 'planning-budget-advice' },
          ],
        });
      } else {
        respondWithSim(activeThreadId, {
          content: `Got it! What would you like to change? I can adjust the budget, objective, targeting, or approach — just let me know. 🙂`,
          actionChips: [
            { label: '💰 Adjust budget', action: 'planning-adjust-budget' },
            { label: '🎯 Change objective', action: 'planning-change-objective' },
            { label: '✅ Actually, let\'s go with this', action: 'planning-confirmed' },
          ],
        });
      }
      return;
    }

    // If the system was asking for product info and user provides anything (URL or description), auto-analyze
    if (wasAskingForProduct && (intent === 'product-url' || intent === 'default')) {
      setIsTyping(true);
      const analyzeSteps: ConversationStep[] = [
        { delay: 800, response: { content: `🔍 Analyzing your product... pulling details now.` } },
        { delay: 3000, response: styleToProductAnalysis('bold') },
      ];
      runConversationSteps(activeThreadId, analyzeSteps);
      return;
    }

    // If asking for planning questions and user types naturally
    if (wasAskingForGoal || wasAskingForBudget) {
      const l = content.toLowerCase();
      let objective = 'Sales';
      let budget = 60;
      if (l.includes('aware') || l.includes('brand')) objective = 'Awareness';
      else if (l.includes('traffic') || l.includes('click')) objective = 'Traffic';
      if (l.includes('low') || l.includes('small') || l.includes('under') || l.includes('less') || l.includes('minimal')) budget = 25;
      else if (l.includes('high') || l.includes('big') || l.includes('100') || l.includes('150')) budget = 120;
      const response = executionPlanResponse(objective, budget, isDemoRef.current);
      respondWithSim(activeThreadId, response);
      return;
    }

    if (intent === 'demo') {
      isDemoRef.current = true;
      setThreads(prev => {
        const thread = prev[activeThreadId];
        return { ...prev, [activeThreadId]: { ...thread, title: 'Full Demo — Summer Collection', status: 'active' as const } };
      });
      setIsTyping(true);
      runConversationSteps(activeThreadId, buildDemoFlow());
    } else if (intent === 'product-url') {
      // User pasted a URL or described product outside of a prompt context — auto-analyze
      setIsTyping(true);
      const analyzeSteps: ConversationStep[] = [
        { delay: 800, response: { content: `🔍 Analyzing your product... pulling details now.` } },
        { delay: 3000, response: styleToProductAnalysis('bold') },
      ];
      runConversationSteps(activeThreadId, analyzeSteps);
    } else if (intent === 'campaign') { setIsTyping(true); runConversationSteps(activeThreadId, buildCampaignConversation(content)); }
    else if (intent === 'create-flow') { setIsTyping(true); runConversationSteps(activeThreadId, buildCreativeConversation()); }
    else if (intent === 'creative-images') { setIsTyping(true); runConversationSteps(activeThreadId, buildCreativeConversation('image')); }
    else if (intent === 'creative-video') { setIsTyping(true); runConversationSteps(activeThreadId, buildCreativeConversation('video')); }
    else if (intent === 'creative-both') { setIsTyping(true); runConversationSteps(activeThreadId, buildCreativeConversation('both')); }
    else if (intent === 'connect-facebook') { setIsTyping(true); runConversationSteps(activeThreadId, buildFacebookConnectFlow()); }
    else if (intent === 'audit') { setIsTyping(true); runConversationSteps(activeThreadId, buildAuditFlow(isDemoRef.current)); }
    else if (intent === 'publish') { respondWithSim(activeThreadId, isDemoRef.current ? demoPublishResponse() : publishCampaignResponse()); }
    else { respondWithSim(activeThreadId, simpleResponses[intent] || simpleResponses.default); }
  }, [activeThreadId, threads, appendMessage, runConversationSteps, respondWithSim]);

  const handleActionChip = useCallback((action: string) => {
    if (!activeThreadId) return;

    // Product-first flow actions
    if (action === 'use-sample-product') {
      // Check if this is a multi-variant demo thread
      const thread = threads[activeThreadId];
      const isMultiVariant = thread?.title?.includes('Multi-Variant');
      respondWithSim(activeThreadId, styleToProductAnalysis('bold', isMultiVariant ? 'whey' : 'tshirt'));
      return;
    }
    if (action === 'prompt-url') {
      respondWithSim(activeThreadId, { content: "Sure! Paste your product URL below and I'll analyze it automatically. 🔗" });
      return;
    }
    if (action === 'prompt-describe') {
      respondWithSim(activeThreadId, { content: "Go ahead — describe your product (name, features, target audience) and I'll work with that. ✍️" });
      return;
    }
    if (action === 'product-confirmed') {
      const thread = threads[activeThreadId];
      const isCreativeThread = thread?.title?.includes('Creative');
      if (isCreativeThread) {
        respondWithSim(activeThreadId, showScriptsResponse);
      } else {
        respondWithSim(activeThreadId, planningQuestionsResponse(isDemoRef.current, false, 0));
      }
      return;
    }
    if (action === 'product-confirmed-variants') {
      // Product has variants — show variant selector
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

    // ===== CONVERSATIONAL PLANNING FLOW =====
    
    // Phase 1: User picks a category
    if (action.startsWith('planning-category-')) {
      const isCustom = action === 'planning-category-custom';
      
      respondWithSim(activeThreadId, {
        content: isCustom
          ? `Sure! Go ahead and describe what you're selling — the product, the brand, who it's for. I'll take it from there. ✍️`
          : `Great choice! That's a strong category for paid ads. 💪\n\nBefore I start building, I want to make sure I get this right. A few things I'm curious about:\n\n**1.** Who's your ideal customer? (Age range, interests, where they're located)\n**2.** Have you run ads before, or is this your first campaign?\n**3.** What's the main thing you want from this campaign?\n\n*Feel free to type naturally — or pick a quick goal below.*`,
        actionChips: isCustom ? undefined : [
          { label: '🎯 Drive sales', action: 'planning-goal-sales' },
          { label: '📣 Build brand awareness', action: 'planning-goal-awareness' },
          { label: '🔗 Get website traffic', action: 'planning-goal-traffic' },
          { label: '🤷 Not sure — suggest something', action: 'planning-goal-suggest' },
        ],
      });
      return;
    }

    // Phase 2: User picks a goal → AI presents a detailed recommendation
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
        suggestion = `For a **sales campaign**, I'd recommend starting with **$50-80/day** on Facebook & Instagram. This gives Meta's algorithm enough data to optimize in the first 1-2 weeks.`;
        objectiveDetail = `I'll set up the campaign with **Advantage+ Shopping** targeting and conversion tracking via your Pixel.`;
      } else if (goalKey === 'awareness') {
        goalLabel = 'building brand awareness'; budgetRange = '$30-50/day';
        suggestion = `For **brand awareness**, I'd suggest **$30-50/day** — awareness campaigns are cheaper per impression and great for building your audience.`;
        objectiveDetail = `I'll optimize for **reach and frequency** to maximize how many people see your brand.`;
      } else if (goalKey === 'traffic') {
        goalLabel = 'driving traffic'; budgetRange = '$40-60/day';
        suggestion = `For **website traffic**, around **$40-60/day** is a solid starting point. I'll optimize for link clicks and landing page views.`;
        objectiveDetail = `I'll focus on **link click optimization** to get the highest quality traffic to your site.`;
      } else {
        goalLabel = 'getting started'; budgetRange = '$50-80/day';
        suggestion = `Based on what you've told me about your ${category} business, I'd actually recommend a **sales-focused campaign** to start. It gives you the clearest signal on what's working.`;
        objectiveDetail = `We'll track purchases directly so you can see exactly what's making money.`;
      }

      respondWithSim(activeThreadId, {
        content: `Here's what I'd recommend based on everything you've shared:\n\n🎯 **Goal:** ${goalLabel}\n👥 **Target audience:** ${audienceDefault}\n💰 **Budget:** ${budgetRange} to start\n📱 **Platforms:** Facebook & Instagram\n\n${suggestion}\n\n${objectiveDetail}\n\n**My proposed plan:**\n1. 🔍 Analyze your product page (images, pricing, features)\n2. 🎨 Generate AI creatives — images + short-form video\n3. 📋 Build the campaign structure (ad sets, targeting, budget)\n4. 📱 Connect your Facebook account & publish\n5. 📊 Monitor & auto-optimize\n\n**Your Facebook account:** I'll use your connected account (**Primary Ad Account** — Pixel: px_987654) ✅\n\n*Does this look right? Happy to adjust anything — budget, audience, approach — before we dive in.*`,
        actionChips: [
          { label: '✅ Sounds great — let\'s go', action: 'planning-confirmed' },
          { label: '💰 I want a different budget', action: 'planning-adjust-budget' },
          { label: '🎯 Change the objective', action: 'planning-change-objective' },
          { label: '❓ I have more questions', action: 'planning-more-questions' },
        ],
      });
      return;
    }

    // Phase 3a: User asks more questions
    if (action === 'planning-more-questions') {
      respondWithSim(activeThreadId, {
        content: `Of course! Ask me anything — here are some common things people want to know:\n\n• **How long until I see results?** Usually 3-7 days for initial data, 2 weeks for meaningful optimization.\n• **Can I pause anytime?** Absolutely — no commitments. You can pause, adjust, or stop at any point.\n• **What creatives will you make?** I'll generate product hero shots, lifestyle images, and a short AI video ad with an avatar presenter.\n• **Will you handle targeting?** Yes — I'll set up interest-based targeting and let Meta's algorithm find your best customers.\n\nOr type your own question — I'm happy to dive deeper on anything. 🙂`,
        actionChips: [
          { label: '✅ I\'m ready — let\'s plan', action: 'planning-confirmed' },
          { label: '💰 What budget do you recommend?', action: 'planning-budget-advice' },
          { label: '📊 How do you track success?', action: 'planning-tracking-question' },
        ],
      });
      return;
    }

    if (action === 'planning-budget-advice') {
      respondWithSim(activeThreadId, {
        content: `Great question! Here's how I think about budget:\n\n**$25-40/day** — Good for testing. You'll learn what works but optimization will be slower.\n**$50-80/day** — Sweet spot for most brands. Enough data for Meta to optimize within 1-2 weeks.\n**$100+/day** — Aggressive scaling. Best when you already know your winning creatives.\n\nMy recommendation? **Start at $50-60/day**, run for 2 weeks, then I'll tell you exactly where to scale up or cut back based on real data. 📊`,
        actionChips: [
          { label: '✅ $50-60/day sounds good', action: 'planning-confirmed' },
          { label: '💰 Start smaller — $30/day', action: 'planning-confirmed-low-budget' },
          { label: '🚀 Go aggressive — $100+/day', action: 'planning-confirmed-high-budget' },
        ],
      });
      return;
    }

    if (action === 'planning-tracking-question') {
      respondWithSim(activeThreadId, {
        content: `I track everything that matters — in plain English, not marketing jargon:\n\n📈 **How much you're making** — Revenue from ads vs what you spent\n🛒 **How many people bought** — Actual purchases tracked via your Pixel\n💰 **Cost per sale** — How much each purchase costs you\n👀 **Who's seeing your ads** — Reach, impressions, and engagement\n🎯 **What's working** — Which creatives and audiences perform best\n\nI'll send you a daily summary and flag anything that needs your attention. Ready to get started? 🚀`,
        actionChips: [
          { label: '✅ Let\'s do it', action: 'planning-confirmed' },
          { label: '❓ One more question', action: 'planning-more-questions' },
        ],
      });
      return;
    }

    if (action === 'planning-change-objective') {
      respondWithSim(activeThreadId, {
        content: `No problem! What would you like to focus on instead?`,
        actionChips: [
          { label: '🎯 Drive sales', action: 'planning-goal-sales' },
          { label: '📣 Build brand awareness', action: 'planning-goal-awareness' },
          { label: '🔗 Get website traffic', action: 'planning-goal-traffic' },
        ],
      });
      return;
    }

    if (action === 'planning-adjust-budget') {
      respondWithSim(activeThreadId, {
        content: `Sure! What budget range are you comfortable with?`,
        actionChips: [
          { label: '🤏 $25-40/day — testing', action: 'planning-confirmed-low-budget' },
          { label: '💰 $50-80/day — recommended', action: 'planning-confirmed' },
          { label: '🚀 $100+/day — scaling', action: 'planning-confirmed-high-budget' },
        ],
      });
      return;
    }

    // Phase 4: User confirms → flow into product analysis
    if (action === 'planning-confirmed' || action === 'planning-confirmed-low-budget' || action === 'planning-confirmed-high-budget') {
      const budgetNote = action === 'planning-confirmed-low-budget' ? ' We\'ll start lean at $30/day.' : action === 'planning-confirmed-high-budget' ? ' Going aggressive at $120/day — love it!' : '';
      respondWithSim(activeThreadId, {
        content: `Awesome — let's build this! 🚀${budgetNote}\n\nFirst, I need your product details so I can tailor everything perfectly. **Share a product URL** and I'll automatically pull images, pricing, features, and descriptions — or I can use a sample product for the demo.`,
        actionChips: [
          { label: '🔗 Paste a URL', action: 'prompt-url' },
          { label: '📝 Describe it', action: 'prompt-describe' },
          { label: '⚡ Use sample product', action: 'use-sample-product' },
        ],
      });
      return;
    }

    // Legacy starter
    if (action === 'start-demo-planning') {
      setIsTyping(true);
      runConversationSteps(activeThreadId, buildCampaignConversation('Plan a new campaign'));
      return;
    }
    if (action === 'start-demo-multi-variant') {
      isDemoRef.current = true;
      setIsTyping(true);
      const steps: ConversationStep[] = [
        { delay: 1200, response: {
          content: `Great! Let me show you how Vibelets handles a product with **multiple variants** — think flavors, sizes, or colors — each getting its own optimized ad set.\n\nI'll use a sample whey protein with 5 flavors. Let me pull the product details...`,
        }},
        { delay: 3500, response: styleToProductAnalysis('bold', 'whey') },
      ];
      runConversationSteps(activeThreadId, steps);
      return;
    }
    if (action === 'start-demo-creatives') {
      setIsTyping(true);
      runConversationSteps(activeThreadId, buildCreativeConversation());
      return;
    }

    if (action === 'creative-type-image' || action === 'creative-type-video' || action === 'creative-type-both') {
      const type = action === 'creative-type-image' ? 'image' : action === 'creative-type-video' ? 'video' : 'both';
      setIsTyping(true);
      runConversationSteps(activeThreadId, buildCreativeConversation(type as any));
      return;
    }

    if (action.startsWith('style-')) {
      const style = action.replace('style-', '');
      const styleLabel = style === 'bold' ? 'Bold & Trendy 😎' : style === 'minimal' ? 'Clean & Minimal 🌿' : style === 'fun' ? 'Fun & Vibrant 🎉' : 'Premium & Elegant 💎';
      respondWithSim(activeThreadId, {
        content: `Great choice — **${styleLabel}** style! Now I need your product details to tailor the creatives perfectly.\n\nShare a product URL or describe what you're promoting.`,
        actionChips: [
          { label: '🔗 Paste a URL', action: 'prompt-url' },
          { label: '📝 Describe it', action: 'prompt-describe' },
          { label: '⚡ Use sample product', action: 'use-sample-product' },
        ],
      });
      return;
    }

    // Plan selection chips (combined goal + budget in one click)
    if (action.startsWith('demo-plan-') || action.startsWith('plan-')) {
      const { objective, budget, multiVariant } = parsePlanAction(action);
      const isDemo = action.startsWith('demo-');
      respondWithSim(activeThreadId, executionPlanResponse(objective, budget, isDemo, multiVariant));
      return;
    }

    // Approve multi-variant plan → auto-execute with per-variant creatives
    if (action === 'approve-plan-multi' || action === 'demo-approve-plan-multi') {
      const isDemo = action.startsWith('demo-');
      setIsTyping(true);
      const flavors = ['Chocolate', 'Vanilla', 'Strawberry', 'Cookies & Cream', 'Mango'];
      const steps: ConversationStep[] = [
        { delay: 800, response: { content: `🚀 **Multi-variant plan approved!** Starting execution for all 5 flavors...\n\nI'll generate per-variant creatives, set up 5 ad sets with CBO, and configure everything. Sit back — this is the fun part.` } },
        { delay: 3000, response: { content: `🎨 **Generating creatives for all variants...**\n\n${flavors.map((f, i) => `${i < 2 ? '✅' : '⏳'} ${f} — ${i < 2 ? '3/3 done' : 'queued'}`).join('\n')}\n\nCreating hero shots, lifestyle images, and AI videos per flavor...` } },
        { delay: 6000, response: { content: `🎨 **Creative generation progress:**\n\n${flavors.map(f => `✅ ${f} — 3 creatives ready`).join('\n')}\n\n**15 total creatives** across 5 flavors — hero shots, lifestyle gym photos, and AI avatar videos.`,
          artifacts: [{ type: 'creative-result' as ArtifactType, titleSuffix: 'Multi-Variant Creatives (15 total)', dataOverrides: {
            outputs: [
              { id: 'mv-1', type: 'image', label: 'Chocolate — Hero Shot', url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=1200&h=628&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&h=200&fit=crop', format: 'jpg', dimensions: '1200×628' },
              { id: 'mv-2', type: 'image', label: 'Vanilla — Hero Shot', url: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=1200&h=628&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=300&h=200&fit=crop', format: 'jpg', dimensions: '1200×628' },
              { id: 'mv-3', type: 'image', label: 'Strawberry — Lifestyle Gym', url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1080&h=1080&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=300&fit=crop', format: 'jpg', dimensions: '1080×1080' },
              { id: 'mv-4', type: 'video', label: 'Cookies & Cream — AI Video', url: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=1080&h=1920&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=200&h=350&fit=crop', format: 'mp4', dimensions: '1080×1920', duration: '30s' },
              { id: 'mv-5', type: 'image', label: 'Mango — Hero Shot', url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=1200&h=628&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&h=200&fit=crop', format: 'jpg', dimensions: '1200×628' },
            ],
            selectedIndex: 0,
          } }],
        } },
        { delay: 8500, response: { content: `Now let's assign which creatives go to which variants. **Click checkboxes** in the matrix below — or auto-assign all.`,
          artifacts: [{ type: 'creative-assignment' as ArtifactType, titleSuffix: 'Creative → Variant Assignment', dataOverrides: {
            variants: [
              { id: 'v-choco', label: 'Chocolate', image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=100&h=100&fit=crop' },
              { id: 'v-vanilla', label: 'Vanilla', image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=100&h=100&fit=crop' },
              { id: 'v-straw', label: 'Strawberry' },
              { id: 'v-cookies', label: 'Cookies & Cream', image: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=100&h=100&fit=crop' },
              { id: 'v-mango', label: 'Mango' },
            ],
            creatives: [
              { id: 'mv-1', label: 'Hero Shot', type: 'image', thumbnail: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=100&h=100&fit=crop' },
              { id: 'mv-3', label: 'Lifestyle Gym', type: 'image', thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=100&h=100&fit=crop' },
              { id: 'mv-4', label: 'AI Video', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=100&h=100&fit=crop' },
            ],
            assignments: {},
          } }],
        } },
        { delay: 9000, response: { content: `📱 **Using connected Facebook account:** Primary Ad Account (px_987654, FitFuel Nutrition page). ✅` } },
        { delay: 11000, response: { content: `📋 **Configuring multi-ad-set campaign...**\n\nStructure: **1 Campaign → 5 Ad Sets (CBO) → 3 Ads each**\n\n${flavors.map(f => `• 📦 ${f} Ad Set → Hero shot + Lifestyle + AI video`).join('\n')}\n\nCampaign Budget Optimization enabled — Meta will auto-distribute spend to top performers.`,
          artifacts: [{ type: 'campaign-config' as ArtifactType, titleSuffix: 'Multi-Variant Campaign Config', dataOverrides: {
            campaignLevel: { name: 'Whey Protein — All Flavors 2026', objective: 'Sales', budgetType: 'Daily (CBO)', budget: 60 },
            adSetLevel: { name: '5 Ad Sets (per flavor)', budget: 60, duration: '90 days', pixelId: 'px_987654',
              targeting: { ageRange: '18-45', locations: ['US', 'UK', 'CA', 'AU'], interests: ['Fitness', 'Gym', 'Protein'] },
              adSetBreakdown: flavors.map(f => ({ name: `${f} Flavor`, ads: 3 })),
            },
            adLevel: { name: 'Per-variant ads (15 total)', pageName: 'FitFuel Nutrition', primaryText: 'Fuel your gains with premium whey protein 💪 25g protein per serving!', headline: 'Premium Whey Protein', cta: 'Shop Now', websiteUrl: 'https://fitfuel.co/whey', creative: { type: 'image', url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&h=400&fit=crop', label: 'Chocolate Hero' } },
          } }],
        } },
        { delay: 14000, response: { content: `✅ **Everything's ready!** Your multi-variant campaign is fully configured with 5 ad sets and 15 ads total. CBO will optimize budget across flavors automatically.\n\nWant me to publish?`, actionChips: [
          { label: '🚀 Publish now', action: 'publish-campaign' },
          { label: '📱 Preview on device first', action: 'preview-device' },
          { label: '✏️ Let me review first', action: 'edit-plan' },
        ] } },
      ];
      runConversationSteps(activeThreadId, steps);
      return;
    }

    // Approve single plan → interactive step-by-step flow (user drives each step)
    if (action === 'approve-plan' || action === 'demo-approve-plan') {
      respondWithSim(activeThreadId, {
        content: `🚀 **Plan approved!** Now let's bring it to life.\n\nFirst up — **creatives**. I'll generate images and a video ad with an AI avatar. Let's pick a script style for the video first. 🎬`,
      }, 600);
      setTimeout(() => respondWithSim(activeThreadId, showScriptsResponse, 800), 1600);
      return;
    }

    if (action === 'edit-plan') {
      respondWithSim(activeThreadId, {
        content: `No problem! You can edit any field in the blueprint above — just click on it. Let me know when you're ready and I'll continue. 👆`,
        actionChips: [
          { label: '✅ Looks good — continue', action: isDemoRef.current ? 'demo-approve-plan' : 'approve-plan' },
        ],
      });
      return;
    }

    if (action === 'demo-creatives') {
      // Product already analyzed — skip to scripts directly
      respondWithSim(activeThreadId, {
        content: `Great — I already have your product details! Let me generate **images + video** for your campaign. First, pick a script style for the video ad. 🎬`,
      }, 600);
      setTimeout(() => respondWithSim(activeThreadId, showScriptsResponse, 800), 1600);
      return;
    }

    if (action === 'demo-act-recommendation') {
      respondWithSim(activeThreadId, {
        content: `⚡ **Done — budget reallocated!** I've shifted $400/month from underperforming broad campaigns to your retargeting campaign (making ~3.5x more per dollar spent vs 1.8x for broad).\n\n• Expected impact: **+$2,000/month revenue**\n• I'll monitor this for 7 days and auto-revert if performance drops\n\nWant me to set up an automation rule so I can handle these optimizations automatically going forward?`,
        artifacts: [{ type: 'ai-insights' as ArtifactType, titleSuffix: 'Budget Reallocation — Applied', dataOverrides: { insights: [{
          type: 'opportunity', severity: 'high', title: 'Reallocate budget to retargeting',
          description: 'Change applied. Retargeting campaign making ~3.5x per dollar vs 1.8x for broad. Monitoring for 7 days with auto-revert safety net.',
          metric: 'Return', change: 52, suggestedAction: 'Monitor for 7 days — auto-revert if performance drops',
        }] } }],
        actionChips: [
          { label: '🤖 Yes, set up automation', action: 'setup-rule' },
          { label: '📊 View performance', action: 'performance' },
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
      respondWithSim(activeThreadId, isDemoRef.current ? demoPublishResponse() : publishCampaignResponse());
      return;
    }
    if (action === 'create-flow-from-campaign') {
      // Check if product was already analyzed in this thread
      const thread = threads[activeThreadId];
      const hasProduct = thread?.artifacts.some(a => a.type === 'product-analysis');
      if (hasProduct) {
        // Skip product step — go straight to scripts
        respondWithSim(activeThreadId, {
          content: `I already have your product details — let's create some fresh creatives! Pick a script style for the video. 🎨`,
        }, 600);
        setTimeout(() => respondWithSim(activeThreadId, showScriptsResponse, 800), 1600);
      } else {
        setIsTyping(true);
        runConversationSteps(activeThreadId, buildCreativeConversation());
      }
      return;
    }
    if (action === 'show-scripts') { respondWithSim(activeThreadId, showScriptsResponse); return; }
    if (action === 'setup-rule') { respondWithSim(activeThreadId, automationRuleResponse()); return; }
    if (action === 'setup-rule-2') { respondWithSim(activeThreadId, automationRule2Response()); return; }
    if (action === 'apply-recommendation') { respondWithSim(activeThreadId, recommendationAppliedResponse()); return; }
    if (action === 'defer-recommendation') { respondWithSim(activeThreadId, recommendationDeferredResponse()); return; }
    if (action === 'dismiss-recommendation') { respondWithSim(activeThreadId, recommendationDismissedResponse()); return; }
    if (action === 'performance') { respondWithSim(activeThreadId, performanceDashboardResponse()); return; }
    if (action === 'new-campaign') {
      respondWithSim(activeThreadId, {
        content: `Let's plan a new campaign! 🚀\n\nTell me about your product or business — I'll build a complete plan.`,
        actionChips: [
          { label: '👕 I sell apparel', action: 'planning-category-apparel' },
          { label: '💪 Health & supplements', action: 'planning-category-health' },
          { label: '💄 Beauty & skincare', action: 'planning-category-beauty' },
          { label: '📝 Let me describe it', action: 'planning-category-custom' },
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
      respondWithSim(activeThreadId, isDemoRef.current ? demoFacebookConnectedResponse() : facebookConnectedResponse(), 2000);
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
          const resultResp = isDemoRef.current ? demoCreativeResultResponse(avatarName) : creativeResultResponse(avatarName);
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
        content: `⚡ **Acting on: "${payload.title}"**\n\nHere's the detailed recommendation with projected impact.`,
        artifacts: [{ type: 'ai-insights' as ArtifactType, titleSuffix: `Recommendation — ${payload.title}`, dataOverrides: { insights: [{
          type: 'opportunity', severity: 'high', title: payload.title,
          description: `This action is expected to deliver ${payload.impact}. Confidence: ${payload.confidence}%. Apply it to see results within 48-72 hours.`,
          metric: 'Impact', change: payload.confidence, suggestedAction: `Apply: ${payload.title}`,
        }] } }],
        actionChips: [{ label: '✅ Apply now', action: 'apply-recommendation' }, { label: '⏳ Defer', action: 'defer-recommendation' }, { label: '❌ Dismiss', action: 'dismiss-recommendation' }],
      });
      return;
    }
    // Variant selector confirmed — show planning questions with variant context
    if (action === 'variants-confirmed' && payload?.selectedIds) {
      const count = payload.selectedIds.length;
      respondWithSim(activeThreadId, planningQuestionsResponse(isDemoRef.current, true, count));
      return;
    }
    // Creative assignment confirmed — proceed to campaign config
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
    // Post-publish feedback → transition to performance monitoring
    if (action === 'feedback-submitted' || action === 'feedback-skipped') {
      respondWithSim(activeThreadId, {
        content: `📊 **Now let's monitor your campaign!** Here's your live performance dashboard. Metrics refresh every 30 seconds.\n\n⏳ **Note:** AI recommendations will appear in **24-48 hours** once there's enough data. In the meantime, I can run a **30-day audit** of your entire ad account to find quick wins.\n\n*Your full journey: Plan ✅ → Create ✅ → Publish ✅ → **Monitor** (you are here) → Audit → Optimize*`,
      }, 800);
      setTimeout(() => respondWithSim(activeThreadId, performanceDashboardResponse(), 600), 2000);
      return;
    }
    // Performance dashboard recommendation actions
    if ((action === 'apply-rec' || action === 'defer-rec' || action === 'dismiss-rec') && payload) {
      const newState = action === 'apply-rec' ? 'applied' : action === 'defer-rec' ? 'deferred' : 'dismissed';
      // Update the recommendation state in the artifact
      setThreads(prev => {
        const thread = prev[activeThreadId];
        if (!thread) return prev;
        return { ...prev, [activeThreadId]: { ...thread, artifacts: thread.artifacts.map(a => {
          if (a.id !== artifactId || a.type !== 'performance-dashboard') return a;
          const updatedRecs = a.data.recommendations?.map((r: any) =>
            r.id === payload.recId ? { ...r, state: newState } : r
          );
          // When applying, add to tracked actions with before metrics
          let trackedActions = a.data.trackedActions || [];
          if (action === 'apply-rec') {
            const currentMetrics = a.data.metrics || {};
            const newTracked = {
              id: `track-${Date.now()}`,
              title: payload.title,
              appliedAt: 'Just now',
              status: 'monitoring',
              before: {
                spend: currentMetrics.spent || 180,
                roas: currentMetrics.roi || 3.0,
                ctr: currentMetrics.ctr || 2.8,
                conversions: currentMetrics.conversions || 18,
              },
              after: undefined, // Will be populated by simulated monitoring
              impact: undefined,
            };
            trackedActions = [...trackedActions, newTracked];

            // Simulate "after" metrics arriving after 5 seconds
            setTimeout(() => {
              setThreads(prev2 => {
                const t = prev2[activeThreadId];
                if (!t) return prev2;
                return { ...prev2, [activeThreadId]: { ...t, artifacts: t.artifacts.map(art => {
                  if (art.id !== artifactId || art.type !== 'performance-dashboard') return art;
                  return { ...art, data: { ...art.data, trackedActions: (art.data.trackedActions || []).map((ta: any) =>
                    ta.id === newTracked.id ? {
                      ...ta,
                      status: 'positive',
                      appliedAt: '5 minutes ago',
                      after: {
                        spend: Math.round(ta.before.spend * (0.85 + Math.random() * 0.1)),
                        roas: +(ta.before.roas * (1.2 + Math.random() * 0.3)).toFixed(1),
                        ctr: +(ta.before.ctr * (1.1 + Math.random() * 0.2)).toFixed(1),
                        conversions: Math.round(ta.before.conversions * (1.15 + Math.random() * 0.25)),
                      },
                      impact: `ROAS improved by ${(20 + Math.round(Math.random() * 15))}% since applying this change`,
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
          content: `✅ **Applied: "${payload.title}"**\n\n• Changes take effect within **15-30 minutes**\n• Expected impact: **${payload.impact}**\n• I'm now monitoring this action — check the **Actions Impact** section below the dashboard for before/after comparisons.\n• Full impact assessment in **7 days**`,
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
    const summary = `📝 **Thread Summary: ${thread.title}**\n\n• ${msgCount} messages, ${artifactCount} artifacts\n• Artifact types: ${types.map(t => t.replace(/-/g, ' ')).join(', ') || 'none'}\n• Created: ${thread.createdAt.toLocaleDateString()}\n• Last updated: ${thread.updatedAt.toLocaleDateString()}`;
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
