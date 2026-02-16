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
  
  // If user provided a product URL, skip to product analysis
  if (hasUrl) {
    return [{
      delay: 1200,
      response: {
        content: `🔍 Analyzing your product page... Let me pull the details.`,
      },
    }, {
      delay: 3000,
      response: styleToProductAnalysis('bold'),
    }];
  }

  // If filters provided goal already, skip to budget
  if (context?.filters?.objective?.length) {
    const goalMap: Record<string, string> = { sales: 'goal-sales', awareness: 'goal-awareness', traffic: 'goal-traffic', leads: 'goal-sales' };
    const goalAction = goalMap[context.filters.objective[0]] || 'goal-sales';
    return [{
      delay: 1200,
      response: {
        content: `I see you want to create a campaign for **${productName}**. First, I need to know about your product so I can optimize everything.\n\n**Share your product URL** or describe what you're promoting, and I'll analyze it automatically.`,
        actionChips: [
          { label: '🔗 Paste a URL', action: 'prompt-url' },
          { label: '📝 Describe it', action: 'prompt-describe' },
          { label: '⚡ Use sample product', action: 'use-sample-product' },
        ],
      },
    }];
  }

  // Default: ask for product info first
  return [{
    delay: 1200,
    response: {
      content: `Let's create a campaign for **${productName}**! 🚀\n\nFirst, share your product URL or describe what you're promoting — I'll pull everything I need automatically.`,
      actionChips: [
        { label: '🔗 Paste a URL', action: 'prompt-url' },
        { label: '📝 Describe it', action: 'prompt-describe' },
        { label: '⚡ Use sample product', action: 'use-sample-product' },
      ],
    },
  }];
}

const goalFollowUps: Record<string, ConversationStep[]> = {
  'goal-sales': [{ delay: 0, response: { content: `Great — optimizing for **sales** 💰\n\n**What's your budget comfort zone?**\nI typically recommend $40–80/day for this type of campaign.`, actionChips: [{ label: '✅ $40-80/day works', action: 'budget-medium' }, { label: '💵 Higher — $100+/day', action: 'budget-high' }, { label: '🤏 Lower — under $30/day', action: 'budget-low' }] } }],
  'goal-awareness': [{ delay: 0, response: { content: `Smart play — **awareness** campaigns have great long-term ROI 📣\n\n**Budget range?** For awareness I'd suggest $30–60/day.`, actionChips: [{ label: '✅ $30-60/day works', action: 'budget-medium' }, { label: '💵 Higher — $80+/day', action: 'budget-high' }, { label: '🤏 Lower — under $25/day', action: 'budget-low' }] } }],
  'goal-traffic': [{ delay: 0, response: { content: `**Traffic** it is 🔗 Let's drive quality clicks.\n\n**Budget range?** For traffic campaigns, $35–70/day is the sweet spot.`, actionChips: [{ label: '✅ $35-70/day works', action: 'budget-medium' }, { label: '💵 Higher — $90+/day', action: 'budget-high' }, { label: '🤏 Lower — under $30/day', action: 'budget-low' }] } }],
};

function buildBlueprintResponse(objective: string, budgetDaily: number): SimResponse {
  return {
    content: `Perfect! Here's your campaign blueprint — I've pre-filled targeting, schedule, and creatives based on similar campaigns. **Click any field to edit.**`,
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
        suggestedCreatives: ['Lifestyle photo — model outdoors', 'Flat-lay product shot', 'Short-form video ad with AI avatar', 'Carousel — color variants'],
      },
    }],
    actionChips: [
      { label: '🎨 Generate creatives', action: 'create-flow-from-campaign' },
      { label: '📱 Connect Facebook', action: 'connect-facebook' },
      { label: '🎯 Refine targeting', action: 'refine-targeting' },
      { label: '💰 Adjust budget', action: 'adjust-budget' },
    ],
  };
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

const styleToProductAnalysis = (style: string): SimResponse => ({
  content: `I've analyzed your product and pulled the key details. Take a look — everything checks out?`,
  artifacts: [{ type: 'product-analysis' as ArtifactType, titleSuffix: 'Product Analysis', dataOverrides: {
    productName: 'Summer T-Shirt Collection', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    price: '$29.99', category: 'Apparel / T-Shirts',
    description: 'Premium quality t-shirts made from 100% organic cotton. Modern fit with reinforced stitching and soft-touch finish. Available in 8 colorways.',
    keyFeatures: ['100% Organic Cotton', 'Modern Fit', 'Reinforced Stitching', '8 Colorways', 'Unisex'],
    targetAudience: 'Style-conscious millennials and Gen Z, ages 18-35.',
  } }],
  actionChips: [
    { label: '✅ Looks good — continue', action: 'product-confirmed' },
    { label: '✏️ Edit product details', action: 'edit-product' },
  ],
});

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
      { label: '📥 Download all', action: 'download-all' },
      { label: '🚀 Use in campaign', action: 'use-in-campaign' },
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
    content: `🎉🎊 **Campaign published successfully!** Your ads are now live on Facebook & Instagram. I'll monitor performance and send you insights as they come in.\n\nYour campaign is now in learning phase — expect initial data within 24-48 hours.`,
    artifacts: [{ type: 'publish-confirmation' as ArtifactType, titleSuffix: 'Campaign Published!', dataOverrides: {
      campaignName: 'Summer Collection 2026', platform: 'Facebook & Instagram',
      publishedAt: new Date().toISOString(), adCount: 4,
      budget: { daily: 60, total: 1800 }, status: 'confirmed',
    } }],
    actionChips: [
      { label: '📊 View performance', action: 'performance' },
      { label: '🔍 Run 30-day audit', action: 'audit' },
      { label: '⚡ Set up automation rules', action: 'setup-rule' },
      { label: '🚀 Create another campaign', action: 'new-campaign' },
    ],
  };
}

// ========== AUDIT FLOW ==========

function buildAuditFlow(isDemo = false): ConversationStep[] {
  return [
    { delay: 1200, response: { content: `🔍 Running a deep audit of your Facebook ad account. Analyzing campaigns, spend patterns, and creative performance...` } },
    { delay: 4000, response: {
      content: `Here's your **30-day account audit**. I've identified what's working, what's not, and specific actions to improve performance.`,
      artifacts: [
        { type: 'performance-snapshot' as ArtifactType, titleSuffix: 'Account Overview — Last 30 Days', dataOverrides: {
          dateRange: 'Jan 16 — Feb 16, 2026', metrics: { spent: 2450, revenue: 8900, roi: 3.6, conversions: 245, ctr: 2.8, impressions: 156000 },
          topCampaign: 'Winter Sale — Retargeting', recommendations: [],
        } },
        { type: 'ai-insights' as ArtifactType, titleSuffix: 'Audit Findings', dataOverrides: { insights: [
          { type: 'opportunity', severity: 'high', title: '🟢 Top performer underinvested', description: 'Your retargeting campaign has 5.2x ROAS but only gets 15% of budget. Reallocating 30% from underperformers could add $2k+/mo revenue.', metric: 'ROAS', change: 52, suggestedAction: 'Shift $400/mo budget to retargeting' },
          { type: 'anomaly', severity: 'high', title: '🔴 Creative fatigue detected', description: '3 ad sets have the same creatives running 45+ days. CTR dropped 40% in the last 2 weeks. Fresh creatives needed.', metric: 'CTR', change: -40, suggestedAction: 'Generate new creatives for fatigued ad sets' },
          { type: 'trend', severity: 'medium', title: '📈 Weekend spend spike', description: 'You\'re spending 35% more on weekends but conversion rate drops 20%. Consider dayparting or reducing weekend bids.', metric: 'CPA', change: 28, suggestedAction: 'Enable dayparting: reduce weekend bids by 25%' },
          { type: 'opportunity', severity: 'low', title: '💡 Untapped lookalike audiences', description: 'Your top purchasers form a strong signal. A 1% lookalike audience could expand reach with high intent.', metric: 'Reach', change: 45, suggestedAction: 'Create 1% lookalike from top 500 purchasers' },
        ] } },
      ],
      actionChips: isDemo ? demoAuditActionChips() : [
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
  const base = buildBlueprintResponse(objective, budgetDaily);
  return { ...base,
    content: `I've put together a full campaign blueprint based on your product. Targeting, schedule, creatives — all pre-filled. **Click any field to tweak it.**`,
    actionChips: [{ label: '🎨 Generate creatives', action: 'demo-creatives' }, { label: '✏️ Edit blueprint', action: 'refine-targeting' }],
  };
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
    content: `🎉🎊 **Your campaign is live!** Ads are now running on Facebook & Instagram.\n\nThe campaign enters a learning phase — I'll have initial data for you in 24-48 hours. In the meantime, want me to audit your account to find more opportunities?`,
    actionChips: [{ label: '🔍 Run account audit', action: 'audit' }, { label: '📊 View performance', action: 'performance' }],
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
    actionChips: [{ label: '📊 View performance', action: 'performance' }, { label: '⚡ Set up automation rule', action: 'setup-rule' }, { label: '🔍 Run another audit', action: 'audit' }],
  };
}

function recommendationDeferredResponse(): SimResponse {
  return { content: `⏳ **Recommendation deferred.** I'll remind you about this in 48 hours.`, actionChips: [{ label: '📊 View performance', action: 'performance' }, { label: '🔍 Run audit', action: 'audit' }] };
}

function recommendationDismissedResponse(): SimResponse {
  return { content: `❌ **Recommendation dismissed.** Got it — I'll learn from this and improve future suggestions.`, actionChips: [{ label: '📊 View performance', action: 'performance' }, { label: '🚀 Create another campaign', action: 'new-campaign' }] };
}

// ========== SIMPLE RESPONSES ==========

const simpleResponses: Record<string, SimResponse> = {
  performance: {
    content: "📊 Here's your performance snapshot with key metrics across all active campaigns.",
    artifacts: [{ type: 'performance-snapshot', titleSuffix: 'Performance Snapshot', dataOverrides: {
      dateRange: 'Last 7 days', metrics: { spent: 420, revenue: 1680, roi: 4.0, conversions: 42, ctr: 3.2, impressions: 28000 },
      topCampaign: 'Summer Collection 2026', recommendations: ['Scale winning ad set by 20%', 'Pause underperforming creatives', 'Test new audience segment'],
    } }],
  },
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

// ========== HELPERS ==========

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
    { id: 'demo-planning', title: '📊 Demo: Campaign Planning', emoji: '📊', firstMessage: "Welcome to the **Campaign Planning** demo! Type anything or click below to start planning a campaign from scratch.\n\nI'll walk you through goal selection, budget, and blueprint generation." },
    { id: 'demo-creatives', title: '🎨 Demo: Creative Generation', emoji: '🎨', firstMessage: "Welcome to the **Creative Generation** demo! I'll show you how to generate AI-powered ad images and videos.\n\nType anything or click below to begin." },
    { id: 'demo-publishing', title: '🚀 Demo: Publishing', emoji: '🚀', firstMessage: "Welcome to the **Publishing** demo! I'll walk you through connecting Facebook, configuring campaigns, and going live.\n\nClick below to start." },
    { id: 'demo-audit', title: '🔍 Demo: Account Audit', emoji: '🔍', firstMessage: "Welcome to the **30-Day Audit** demo! I'll analyze your ad account and surface actionable insights.\n\nClick below to run the audit." },
    { id: 'demo-recommendations', title: '⚡ Demo: AI Recommendations', emoji: '⚡', firstMessage: "Welcome to the **AI Recommendations** demo! I'll show you how smart recommendations work — apply, defer, or dismiss.\n\nClick below to see recommendations." },
    { id: 'demo-automation', title: '🤖 Demo: Automation Rules', emoji: '🤖', firstMessage: "Welcome to the **Automation Rules** demo! I'll show you how to set up auto-pause, auto-scale, and alert rules.\n\nClick below to create a rule." },
  ];

  const demoChips: Record<string, ActionChip[]> = {
    'demo-planning': [{ label: '🚀 Plan a campaign', action: 'start-demo-planning' }],
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
    const wasAskingForProduct = lastContent.includes('product url') || lastContent.includes('paste') || lastContent.includes('describe') || lastContent.includes('promoting') || lastContent.includes('sample');
    const wasAskingForGoal = lastContent.includes('primary goal') || lastContent.includes('campaign goal');
    const wasAskingForBudget = lastContent.includes('budget') || lastContent.includes('comfort zone');

    // If the system was asking for product info and user provides anything (URL or description), auto-analyze
    if (wasAskingForProduct && (intent === 'product-url' || intent === 'default')) {
      // Simulate analyzing the product
      setIsTyping(true);
      const analyzeSteps: ConversationStep[] = [
        { delay: 800, response: { content: `🔍 Analyzing your product... pulling details now.` } },
        { delay: 3000, response: styleToProductAnalysis('bold') },
      ];
      runConversationSteps(activeThreadId, analyzeSteps);
      return;
    }

    // If asking for goal and user types something matching
    if (wasAskingForGoal) {
      const l = content.toLowerCase();
      let goalAction = 'goal-sales';
      if (l.includes('aware') || l.includes('brand')) goalAction = 'goal-awareness';
      else if (l.includes('traffic') || l.includes('click') || l.includes('visit')) goalAction = 'goal-traffic';
      else if (l.includes('lead')) goalAction = 'goal-sales';
      const prefix = isDemoRef.current ? 'demo-' : '';
      const followUp = goalFollowUps[goalAction];
      if (followUp) {
        const mapped = isDemoRef.current ? followUp.map(step => ({
          ...step, response: { ...step.response, actionChips: step.response.actionChips?.map(c => ({ ...c, action: c.action.replace('budget-', 'demo-budget-') })) },
        })) : followUp;
        setIsTyping(true);
        runConversationSteps(activeThreadId, mapped);
      }
      return;
    }

    // If asking for budget and user types something
    if (wasAskingForBudget) {
      const l = content.toLowerCase();
      let budgetLevel = 'budget-medium';
      if (l.includes('low') || l.includes('small') || l.includes('under') || l.includes('less')) budgetLevel = 'budget-low';
      else if (l.includes('high') || l.includes('big') || l.includes('more') || l.includes('100') || l.includes('150')) budgetLevel = 'budget-high';
      const budgetMap: Record<string, number> = { 'budget-low': 25, 'budget-medium': 60, 'budget-high': 120 };
      const response = isDemoRef.current ? demoBlueprintResponse('Sales', budgetMap[budgetLevel] || 60) : buildBlueprintResponse('Sales', budgetMap[budgetLevel] || 60);
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
      respondWithSim(activeThreadId, styleToProductAnalysis('bold'));
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
      // In demo/campaign mode → ask goal, in creative mode → show scripts
      const thread = threads[activeThreadId];
      const isCreativeThread = thread?.title?.includes('Creative');
      if (isCreativeThread) {
        respondWithSim(activeThreadId, showScriptsResponse);
      } else {
        // Campaign flow — ask for goal
        respondWithSim(activeThreadId, {
          content: `Product looks great! Now — **what's the primary goal for this campaign?**`,
          actionChips: [
            { label: '💰 Direct sales', action: isDemoRef.current ? 'demo-goal-sales' : 'goal-sales' },
            { label: '📣 Brand awareness', action: isDemoRef.current ? 'demo-goal-awareness' : 'goal-awareness' },
            { label: '🔗 Website traffic', action: isDemoRef.current ? 'demo-goal-traffic' : 'goal-traffic' },
          ],
        });
      }
      return;
    }

    // Demo thread specific starters
    if (action === 'start-demo-planning') {
      setIsTyping(true);
      runConversationSteps(activeThreadId, buildCampaignConversation('Plan a new campaign'));
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

    if (action.startsWith('demo-goal-')) {
      const goalKey = action.replace('demo-', '');
      const followUp = goalFollowUps[goalKey];
      if (followUp) {
        const demoFollowUp: ConversationStep[] = followUp.map(step => ({
          ...step, response: { ...step.response, actionChips: step.response.actionChips?.map(c => ({ ...c, action: c.action.replace('budget-', 'demo-budget-') })) },
        }));
        setIsTyping(true);
        runConversationSteps(activeThreadId, demoFollowUp);
      }
      return;
    }

    if (action.startsWith('demo-budget-')) {
      const budgetKey = action.replace('demo-', '');
      const budgetMap: Record<string, number> = { 'budget-low': 25, 'budget-medium': 60, 'budget-high': 120 };
      respondWithSim(activeThreadId, demoBlueprintResponse('Sales', budgetMap[budgetKey] || 60));
      return;
    }

    if (action === 'demo-creatives') {
      setIsTyping(true);
      runConversationSteps(activeThreadId, buildCreativeConversation('both'));
      return;
    }

    if (action === 'demo-act-recommendation') {
      respondWithSim(activeThreadId, {
        content: `⚡ **Done — budget reallocated!** I've shifted $400/month from underperforming broad campaigns to your retargeting campaign (5.2x ROAS).\n\n• Expected impact: **+$2,000/month revenue**\n• I'll monitor this for 7 days and auto-revert if ROAS drops below 3x\n\nWant me to set up an automation rule so I can handle these optimizations automatically going forward?`,
        artifacts: [{ type: 'ai-insights' as ArtifactType, titleSuffix: 'Budget Reallocation — Applied', dataOverrides: { insights: [{
          type: 'opportunity', severity: 'high', title: 'Reallocate budget to retargeting',
          description: 'Change applied. Retargeting campaign has 5.2x ROAS vs 1.8x for broad. Monitoring for 7 days with auto-revert safety net.',
          metric: 'ROAS', change: 52, suggestedAction: 'Monitor for 7 days — auto-revert if ROAS drops below 3x',
        }] } }],
        actionChips: [
          { label: '🤖 Yes, set up automation', action: 'setup-rule' },
          { label: '📊 View performance', action: 'performance' },
        ],
      });
      return;
    }

    if (action.startsWith('goal-')) {
      const followUp = goalFollowUps[action];
      if (followUp) { setIsTyping(true); runConversationSteps(activeThreadId, followUp); }
      return;
    }

    if (action.startsWith('budget-')) {
      const budgetMap: Record<string, number> = { 'budget-low': 25, 'budget-medium': 60, 'budget-high': 120 };
      respondWithSim(activeThreadId, buildBlueprintResponse('Sales', budgetMap[action] || 60));
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
    if (action === 'create-flow-from-campaign') { setIsTyping(true); runConversationSteps(activeThreadId, buildCreativeConversation()); return; }
    if (action === 'show-scripts') { respondWithSim(activeThreadId, showScriptsResponse); return; }
    if (action === 'setup-rule') { respondWithSim(activeThreadId, automationRuleResponse()); return; }
    if (action === 'setup-rule-2') { respondWithSim(activeThreadId, automationRule2Response()); return; }
    if (action === 'apply-recommendation') { respondWithSim(activeThreadId, recommendationAppliedResponse()); return; }
    if (action === 'defer-recommendation') { respondWithSim(activeThreadId, recommendationDeferredResponse()); return; }
    if (action === 'dismiss-recommendation') { respondWithSim(activeThreadId, recommendationDismissedResponse()); return; }
    if (action === 'performance') { respondWithSim(activeThreadId, simpleResponses.performance); return; }
    if (action === 'new-campaign') { respondWithSim(activeThreadId, { content: "Let's plan a new campaign! 🚀 What product or service are you promoting?" }); return; }

    const simple = simpleResponses[action];
    if (simple) { respondWithSim(activeThreadId, simple); return; }
    respondWithSim(activeThreadId, simpleResponses.default);
  }, [activeThreadId, runConversationSteps, respondWithSim]);

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
