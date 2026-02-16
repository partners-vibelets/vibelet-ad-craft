import { useState, useCallback, useRef } from 'react';
import { Thread, ThreadMessage, Artifact, ArtifactType, ActionChip } from '@/types/workspace';
import { getThreadWithData, artifactTemplates } from '@/data/workspaceMockData';
import { AVATARS } from '@/data/avatars';

interface SimResponse {
  content: string;
  artifacts?: { type: ArtifactType; titleSuffix?: string; dataOverrides?: Record<string, any> }[];
  actionChips?: ActionChip[];
}

interface ConversationStep {
  delay: number;
  response: SimResponse;
}

// ========== INTENT DETECTION — Fluid, multi-entry ==========

type Intent =
  | 'campaign' | 'create-flow' | 'creative-images' | 'creative-video' | 'creative-both'
  | 'connect-facebook' | 'audit' | 'publish' | 'performance' | 'insights'
  | 'rule' | 'default';

function detectIntent(message: string): Intent {
  const l = message.toLowerCase();

  // Facebook connect
  if ((l.includes('connect') || l.includes('link') || l.includes('add') || l.includes('integrate')) && (l.includes('facebook') || l.includes('fb') || l.includes('meta'))) return 'connect-facebook';

  // Audit
  if (l.includes('audit') || (l.includes('review') && l.includes('account')) || (l.includes('what') && l.includes('working'))) return 'audit';

  // Publish / go live
  if (l.includes('publish') || l.includes('go live') || l.includes('push live') || l.includes('launch campaign')) return 'publish';

  // Creative-specific direct requests
  if ((l.includes('create') || l.includes('generate') || l.includes('make') || l.includes('design') || l.includes('build')) && (l.includes('image') && !l.includes('video'))) return 'creative-images';
  if ((l.includes('create') || l.includes('generate') || l.includes('make')) && (l.includes('video') && !l.includes('image'))) return 'creative-video';
  if ((l.includes('create') || l.includes('generate') || l.includes('make')) && l.includes('image') && l.includes('video')) return 'creative-both';

  // General creative flow
  if ((l.includes('create') || l.includes('generate') || l.includes('make') || l.includes('design') || l.includes('build'))
    && (l.includes('creative') || l.includes('ad') || l.includes('content'))) return 'create-flow';

  // Campaign planning
  if (l.includes('campaign') || l.includes('plan') || l.includes('blueprint') || l.includes('summer') || l.includes('launch')) return 'campaign';

  // Performance
  if (l.includes('performance') || l.includes('metrics') || l.includes('how') && l.includes('doing')) return 'performance';
  if (l.includes('insight') || l.includes('signal') || l.includes('anomal')) return 'insights';
  if (l.includes('rule') || l.includes('automat') || l.includes('trigger')) return 'rule';

  return 'default';
}

// ========== CONVERSATION BUILDERS ==========

function extractProductName(msg: string): string {
  const m = msg.match(/(?:for|about|of|my)\s+(?:my\s+)?(.+?)(?:\s+campaign|\s+product|\s+brand|\s+store|\s+collection|$)/i);
  return m?.[1]?.trim() || 'your product';
}

function cap(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

function buildCampaignConversation(userMessage: string): ConversationStep[] {
  const productName = extractProductName(userMessage);
  return [
    {
      delay: 1200,
      response: {
        content: `🚀 Let's build a killer **${productName}** campaign! Before I draft the blueprint, two quick strategic questions:\n\n**What's the primary goal?**\nAre we optimizing for direct sales, brand awareness, or website traffic?`,
        actionChips: [
          { label: '💰 Direct sales', action: 'goal-sales' },
          { label: '📣 Brand awareness', action: 'goal-awareness' },
          { label: '🔗 Website traffic', action: 'goal-traffic' },
        ],
      },
    },
  ];
}

const goalFollowUps: Record<string, ConversationStep[]> = {
  'goal-sales': [{
    delay: 0,
    response: {
      content: `Great — optimizing for **sales** 💰\n\n**What's your budget comfort zone?**\nI typically recommend $40–80/day for this type of campaign. Want me to work with that?`,
      actionChips: [
        { label: '✅ $40-80/day works', action: 'budget-medium' },
        { label: '💵 Higher — $100+/day', action: 'budget-high' },
        { label: '🤏 Lower — under $30/day', action: 'budget-low' },
      ],
    },
  }],
  'goal-awareness': [{
    delay: 0,
    response: {
      content: `Smart play — **awareness** campaigns have great long-term ROI 📣\n\n**Budget range?** For awareness I'd suggest $30–60/day to maximize reach.`,
      actionChips: [
        { label: '✅ $30-60/day works', action: 'budget-medium' },
        { label: '💵 Higher — $80+/day', action: 'budget-high' },
        { label: '🤏 Lower — under $25/day', action: 'budget-low' },
      ],
    },
  }],
  'goal-traffic': [{
    delay: 0,
    response: {
      content: `**Traffic** it is 🔗 Let's drive quality clicks.\n\n**Budget range?** For traffic campaigns, $35–70/day is the sweet spot.`,
      actionChips: [
        { label: '✅ $35-70/day works', action: 'budget-medium' },
        { label: '💵 Higher — $90+/day', action: 'budget-high' },
        { label: '🤏 Lower — under $30/day', action: 'budget-low' },
      ],
    },
  }],
};

function buildBlueprintResponse(objective: string, budgetDaily: number): SimResponse {
  return {
    content: `Perfect! Here's your campaign blueprint — I've pre-filled targeting, schedule, and creatives based on similar campaigns. **Click any field to edit.**`,
    artifacts: [{
      type: 'campaign-blueprint',
      titleSuffix: 'Campaign Blueprint',
      dataOverrides: {
        campaignName: 'Summer Collection 2026',
        objective,
        platform: 'Facebook & Instagram',
        budget: { daily: budgetDaily, total: budgetDaily * 30 },
        targeting: { ageRange: '18-35', interests: ['Fashion', 'Streetwear', 'Summer Style'], locations: ['US', 'UK', 'CA'] },
        schedule: { startDate: '2026-06-01', endDate: '2026-08-31' },
        adSets: 3,
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

function buildCreativeConversation(creativeType?: 'image' | 'video' | 'both'): ConversationStep[] {
  if (creativeType) {
    // Skip the type question, go straight to style
    const typeLabel = creativeType === 'image' ? 'static images 🖼️' : creativeType === 'video' ? 'a video ad 🎬' : 'images + video ✨';
    return [{
      delay: 1200,
      response: {
        content: `Let's create ${typeLabel}! **What tone and style should we go for?**`,
        actionChips: [
          { label: '😎 Bold & trendy', action: 'style-bold' },
          { label: '🌿 Clean & minimal', action: 'style-minimal' },
          { label: '🎉 Fun & vibrant', action: 'style-fun' },
          { label: '💎 Premium & elegant', action: 'style-premium' },
        ],
      },
    }];
  }

  return [
    {
      delay: 1200,
      response: {
        content: `Let's create some amazing ad creatives! 🎨\n\n**What type of creatives do you need?**`,
        actionChips: [
          { label: '🖼️ Static images', action: 'creative-type-image' },
          { label: '🎬 Video with AI avatar', action: 'creative-type-video' },
          { label: '✨ Both images & video', action: 'creative-type-both' },
        ],
      },
    },
  ];
}

const styleToProductAnalysis = (style: string): SimResponse => ({
  content: `${style === 'bold' ? '😎' : style === 'minimal' ? '🌿' : style === 'fun' ? '🎉' : '💎'} Great taste! Let me analyze your product first so I can tailor everything perfectly.`,
  artifacts: [{
    type: 'product-analysis' as ArtifactType,
    titleSuffix: 'Product Analysis',
    dataOverrides: {
      productName: 'Summer T-Shirt Collection',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      price: '$29.99',
      category: 'Apparel / T-Shirts',
      description: 'Premium quality t-shirts made from 100% organic cotton. Modern fit with reinforced stitching and soft-touch finish. Available in 8 colorways.',
      keyFeatures: ['100% Organic Cotton', 'Modern Fit', 'Reinforced Stitching', '8 Colorways', 'Unisex'],
      targetAudience: 'Style-conscious millennials and Gen Z, ages 18-35.',
    },
  }],
  actionChips: [
    { label: '✅ Looks good — show me scripts', action: 'show-scripts' },
    { label: '✏️ Edit product details', action: 'edit-product' },
  ],
});

const showScriptsResponse: SimResponse = {
  content: "I've crafted 3 script options with different angles. **Click one to select it** — you can always change your mind.",
  artifacts: [{
    type: 'script-options' as ArtifactType,
    titleSuffix: 'Script Options',
    dataOverrides: {
      scripts: [
        { id: 'script-a', style: 'Conversational', label: 'Script A — Friendly & Casual', duration: '30s', script: "Hey! Looking for the perfect tee? Our new collection is 100% organic cotton — super soft, great fit, and good for the planet. Available in 8 colors. Grab yours!" },
        { id: 'script-b', style: 'Hype', label: 'Script B — Bold & Energetic', duration: '30s', script: "Stop scrolling. This is the tee you've been waiting for. Premium cotton. 8 fire colorways. A fit that hits different. Limited drop. Don't sleep on it." },
        { id: 'script-c', style: 'Storytelling', label: 'Script C — Narrative', duration: '45s', script: "Every great outfit starts with the perfect t-shirt. 100% organic cotton. A modern silhouette. 8 colors inspired by city sunsets. More than fashion — it's a feeling." },
      ],
      selectedScriptId: null,
    },
  }],
};

const avatarResponse: SimResponse = {
  content: `Now let's pick an **AI avatar** to present your product. **Click to select** — they'll deliver the script you chose. 🎭`,
  artifacts: [{
    type: 'avatar-selection' as ArtifactType,
    titleSuffix: 'Choose Your Avatar',
    dataOverrides: {
      avatars: AVATARS.slice(0, 8).map(a => ({ id: a.id, name: a.name, style: a.style, imageUrl: a.imageUrl, selected: false })),
      selectedAvatarId: null,
    },
  }],
};

function generationResponse(avatarName: string): SimResponse {
  return {
    content: `**${avatarName}** is locked in! 🎬 Generating your creatives now — images + video. This takes about a minute...`,
    artifacts: [{
      type: 'generation-progress' as ArtifactType,
      titleSuffix: 'Generating Creatives',
      dataOverrides: {
        stage: 'rendering', progress: 35,
        outputs: [
          { id: 'out-1', type: 'image', label: 'Hero Banner (Feed)', format: 'image', dimensions: '1200×628', status: 'generating' },
          { id: 'out-2', type: 'image', label: 'Instagram Story', format: 'image', dimensions: '1080×1920', status: 'generating' },
          { id: 'out-3', type: 'image', label: 'Square Post', format: 'image', dimensions: '1080×1080', status: 'generating' },
          { id: 'out-4', type: 'video', label: `Video Ad — ${avatarName}`, format: 'video', dimensions: '1080×1920', status: 'generating', duration: '30s' },
        ],
      },
    }],
  };
}

function creativeResultResponse(avatarName: string): SimResponse {
  return {
    content: `🎉 **Your creatives are ready!** Preview each one below, then download or use them directly in a campaign.`,
    artifacts: [{
      type: 'creative-result' as ArtifactType,
      titleSuffix: 'Generated Creatives',
      dataOverrides: {
        outputs: [
          { id: 'res-1', type: 'image', label: 'Hero Banner (Feed)', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&h=628&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=200&fit=crop', format: 'jpg', dimensions: '1200×628' },
          { id: 'res-2', type: 'image', label: 'Instagram Story', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1080&h=1920&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200&h=350&fit=crop', format: 'jpg', dimensions: '1080×1920' },
          { id: 'res-3', type: 'image', label: 'Square Post', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1080&h=1080&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop', format: 'jpg', dimensions: '1080×1080' },
          { id: 'res-4', type: 'video', label: `Video Ad — ${avatarName}`, url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1080&h=1920&fit=crop', thumbnailUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&h=350&fit=crop', format: 'mp4', dimensions: '1080×1920', duration: '30s' },
        ],
        selectedIndex: 0,
      },
    }],
    actionChips: [
      { label: '📥 Download all', action: 'download-all' },
      { label: '🚀 Use in campaign', action: 'use-in-campaign' },
      { label: '🔄 Generate more variants', action: 'create-flow-from-campaign' },
    ],
  };
}

// ========== FACEBOOK CONNECT FLOW ==========

function buildFacebookConnectFlow(): ConversationStep[] {
  return [
    {
      delay: 1200,
      response: {
        content: `📱 Let's connect your Facebook account! I'll need access to manage your ads. This is quick and secure.`,
        artifacts: [{
          type: 'facebook-connect' as ArtifactType,
          titleSuffix: 'Connect Facebook Account',
          dataOverrides: {
            status: 'disconnected',
            accountName: null,
            adAccounts: [],
          },
        }],
      },
    },
  ];
}

function facebookConnectedResponse(): SimResponse {
  return {
    content: `✅ **Facebook connected!** I found your ad account and auto-detected your Pixel and Page. Everything's ready to go.`,
    artifacts: [{
      type: 'facebook-connect' as ArtifactType,
      titleSuffix: 'Facebook Account — Connected',
      dataOverrides: {
        status: 'connected',
        accountName: 'John\'s Business',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        adAccounts: [
          { id: 'act_123456789', name: 'Primary Ad Account', pixelId: 'px_987654', pageName: 'Summer Style Co.', currency: 'USD' },
          { id: 'act_987654321', name: 'Secondary Account', pixelId: 'px_123456', pageName: 'Streetwear Daily', currency: 'USD' },
        ],
        selectedAccountId: 'act_123456789',
      },
    }],
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
    artifacts: [{
      type: 'campaign-config' as ArtifactType,
      titleSuffix: 'Campaign Configuration',
      dataOverrides: {
        campaignLevel: {
          name: 'Summer Collection 2026',
          objective: 'Sales',
          budgetType: 'Daily',
          budget: 60,
        },
        adSetLevel: {
          name: 'Core Audience — 18-35',
          budget: 60,
          duration: '90 days',
          pixelId: 'px_987654',
          targeting: { ageRange: '18-35', locations: ['US', 'UK', 'CA'], interests: ['Fashion', 'Streetwear'] },
        },
        adLevel: {
          name: 'Summer Tee — Hero',
          pageName: 'Summer Style Co.',
          primaryText: 'Summer is here ☀️ Fresh styles, bold designs. Shop now!',
          headline: 'Premium Organic Tees',
          cta: 'Shop Now',
          websiteUrl: 'https://summerstyle.co/tees',
          creative: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=400&fit=crop',
            label: 'Hero Banner',
          },
        },
      },
    }],
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
    artifacts: [{
      type: 'device-preview' as ArtifactType,
      titleSuffix: 'Ad Preview — Devices',
      dataOverrides: {
        activeDevice: 'mobile',
        ad: {
          pageName: 'Summer Style Co.',
          primaryText: 'Summer is here ☀️ Fresh styles, bold designs. Shop now!',
          headline: 'Premium Organic Tees',
          cta: 'Shop Now',
          imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=400&fit=crop',
          websiteUrl: 'summerstyle.co',
        },
      },
    }],
    actionChips: [
      { label: '🚀 Looks great — Publish!', action: 'publish-campaign' },
      { label: '✏️ Edit ad copy', action: 'configure-campaign' },
    ],
  };
}

function publishCampaignResponse(): SimResponse {
  return {
    content: `🎉🎊 **Campaign published successfully!** Your ads are now live on Facebook & Instagram. I'll monitor performance and send you insights as they come in.`,
    artifacts: [{
      type: 'publish-confirmation' as ArtifactType,
      titleSuffix: 'Campaign Published!',
      dataOverrides: {
        campaignName: 'Summer Collection 2026',
        platform: 'Facebook & Instagram',
        publishedAt: new Date().toISOString(),
        adCount: 4,
        budget: { daily: 60, total: 1800 },
        status: 'confirmed',
      },
    }],
    actionChips: [
      { label: '📊 View performance', action: 'performance' },
      { label: '🚀 Create another campaign', action: 'new-campaign' },
      { label: '⚡ Set up automation rules', action: 'rule' },
    ],
  };
}

// ========== AUDIT FLOW ==========

function buildAuditFlow(): ConversationStep[] {
  return [
    {
      delay: 1200,
      response: {
        content: `🔍 Running a deep audit of your Facebook ad account. Analyzing campaigns, spend patterns, and creative performance...`,
      },
    },
    {
      delay: 4000,
      response: {
        content: `Here's your **30-day account audit**. I've identified what's working, what's not, and specific actions to improve performance.`,
        artifacts: [
          {
            type: 'performance-snapshot' as ArtifactType,
            titleSuffix: 'Account Overview — Last 30 Days',
            dataOverrides: {
              dateRange: 'Jan 16 — Feb 16, 2026',
              metrics: { spent: 2450, revenue: 8900, roi: 3.6, conversions: 245, ctr: 2.8, impressions: 156000 },
              topCampaign: 'Winter Sale — Retargeting',
              recommendations: [],
            },
          },
          {
            type: 'ai-insights' as ArtifactType,
            titleSuffix: 'Audit Findings',
            dataOverrides: {
              insights: [
                { type: 'opportunity', severity: 'high', title: '🟢 Top performer underinvested', description: 'Your retargeting campaign has 5.2x ROAS but only gets 15% of budget. Reallocating 30% from underperformers could add $2k+/mo revenue.', metric: 'ROAS', change: 52, suggestedAction: 'Shift $400/mo budget to retargeting' },
                { type: 'anomaly', severity: 'high', title: '🔴 Creative fatigue detected', description: '3 ad sets have the same creatives running 45+ days. CTR dropped 40% in the last 2 weeks. Fresh creatives needed.', metric: 'CTR', change: -40, suggestedAction: 'Generate new creatives for fatigued ad sets' },
                { type: 'trend', severity: 'medium', title: '📈 Weekend spend spike', description: 'You\'re spending 35% more on weekends but conversion rate drops 20%. Consider dayparting or reducing weekend bids.', metric: 'CPA', change: 28, suggestedAction: 'Enable dayparting: reduce weekend bids by 25%' },
                { type: 'opportunity', severity: 'low', title: '💡 Untapped lookalike audiences', description: 'Your top purchasers form a strong signal. A 1% lookalike audience could expand reach with high intent.', metric: 'Reach', change: 45, suggestedAction: 'Create 1% lookalike from top 500 purchasers' },
              ],
            },
          },
        ],
        actionChips: [
          { label: '🎨 Generate fresh creatives', action: 'create-flow-from-campaign' },
          { label: '💰 Reallocate budget', action: 'adjust-budget' },
          { label: '⚡ Set up automation rules', action: 'rule' },
          { label: '🎯 Create lookalike audience', action: 'refine-targeting' },
        ],
      },
    },
  ];
}

// ========== SIMPLE RESPONSES ==========

const simpleResponses: Record<string, SimResponse> = {
  performance: {
    content: "📊 Here's your performance snapshot with key metrics across all active campaigns.",
    artifacts: [{
      type: 'performance-snapshot',
      titleSuffix: 'Performance Snapshot',
      dataOverrides: {
        dateRange: 'Last 7 days',
        metrics: { spent: 420, revenue: 1680, roi: 4.0, conversions: 42, ctr: 3.2, impressions: 28000 },
        topCampaign: 'Summer Collection 2026',
        recommendations: ['Scale winning ad set by 20%', 'Pause underperforming creatives', 'Test new audience segment'],
      },
    }],
  },
  insights: {
    content: "🔮 I've surfaced key signals from your campaigns. Here's what needs attention.",
    artifacts: [{ type: 'ai-insights', titleSuffix: 'AI Insights', dataOverrides: {
      insights: [
        { type: 'opportunity', severity: 'high', title: 'Lookalike audience match', description: 'Top buyers overlap with "Streetwear Enthusiasts" aged 20-28.', metric: 'Conversions', change: 30, suggestedAction: 'Create lookalike from top purchasers' },
        { type: 'trend', severity: 'medium', title: 'Peak engagement: evenings', description: 'Audience engages most 6PM–10PM. Consider dayparting.', metric: 'Engagement', change: 22, suggestedAction: 'Set ad schedule to 5PM–11PM' },
      ],
    }}],
  },
  rule: {
    content: "⚡ I've set up an automation rule. Toggle it on when you're ready.",
    artifacts: [{ type: 'automation-rule', titleSuffix: 'Automation Rule' }],
  },
  'refine-targeting': {
    content: "🎯 Here are targeting insights based on your account data and audience analysis.",
    artifacts: [{ type: 'ai-insights', titleSuffix: 'Targeting Insights', dataOverrides: {
      insights: [
        { type: 'opportunity', severity: 'high', title: 'Lookalike audience match', description: 'Top buyers strongly overlap with "Streetwear Enthusiasts" aged 20-28. A 1% lookalike could increase conversions ~30%.', metric: 'Conversions', change: 30, suggestedAction: 'Create lookalike from top 500 purchasers' },
        { type: 'trend', severity: 'medium', title: 'Peak engagement: evenings', description: 'Your audience engages most 6PM–10PM. Consider dayparting.', metric: 'Engagement', change: 22, suggestedAction: 'Set ad schedule to 5PM–11PM' },
      ],
    }}],
  },
  'adjust-budget': {
    content: "💰 Here's a budget optimization view with projections and recommendations.",
    artifacts: [{ type: 'performance-snapshot', titleSuffix: 'Budget Projection', dataOverrides: {
      dateRange: 'Jun 1 — Aug 31, 2026 (projected)',
      metrics: { spent: 1800, revenue: 7200, roi: 4.0, conversions: 180, ctr: 3.5, impressions: 95000 },
      topCampaign: 'Summer T-Shirt — Broad',
      recommendations: ['Front-load: $80/day for first 14 days', 'Scale back to $50/day after learning', 'Allocate 30% to retargeting'],
    }}],
  },
  default: {
    content: "Got it! I'm ready to help. What would you like to work on — campaigns, creatives, performance, or something else?",
  },
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
      id: artId,
      type: artSpec.type,
      title: artSpec.titleSuffix || template?.title || 'Artifact',
      status: 'draft',
      version: 1,
      isCollapsed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      data: { ...(template?.data || {}), ...(artSpec.dataOverrides || {}) },
    });
  });
  return { artifacts, ids };
}

// ========== MAIN HOOK ==========

export function useWorkspace() {
  const [activeThreadId, setActiveThreadId] = useState<string | null>('thread-1');
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

  const activeThread = activeThreadId ? threads[activeThreadId] : null;

  const selectThread = useCallback((id: string) => {
    pendingStepsRef.current.forEach(clearTimeout);
    pendingStepsRef.current = [];
    setActiveThreadId(id);
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
    };
    setThreads(prev => ({ ...prev, [id]: newThread }));
    setActiveThreadId(id);
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

  const sendMessage = useCallback((content: string) => {
    if (!activeThreadId) return;

    const userMsg: ThreadMessage = { id: `msg-${Date.now()}`, role: 'user', content, timestamp: new Date() };
    appendMessage(activeThreadId, userMsg);

    const intent = detectIntent(content);

    if (intent === 'campaign') {
      setIsTyping(true);
      runConversationSteps(activeThreadId, buildCampaignConversation(content));
    } else if (intent === 'create-flow') {
      setIsTyping(true);
      runConversationSteps(activeThreadId, buildCreativeConversation());
    } else if (intent === 'creative-images') {
      setIsTyping(true);
      runConversationSteps(activeThreadId, buildCreativeConversation('image'));
    } else if (intent === 'creative-video') {
      setIsTyping(true);
      runConversationSteps(activeThreadId, buildCreativeConversation('video'));
    } else if (intent === 'creative-both') {
      setIsTyping(true);
      runConversationSteps(activeThreadId, buildCreativeConversation('both'));
    } else if (intent === 'connect-facebook') {
      setIsTyping(true);
      runConversationSteps(activeThreadId, buildFacebookConnectFlow());
    } else if (intent === 'audit') {
      setIsTyping(true);
      runConversationSteps(activeThreadId, buildAuditFlow());
    } else if (intent === 'publish') {
      respondWithSim(activeThreadId, publishCampaignResponse());
    } else {
      respondWithSim(activeThreadId, simpleResponses[intent] || simpleResponses.default);
    }
  }, [activeThreadId, appendMessage, runConversationSteps, respondWithSim]);

  const handleActionChip = useCallback((action: string) => {
    if (!activeThreadId) return;

    // Creative type selections
    if (action === 'creative-type-image' || action === 'creative-type-video' || action === 'creative-type-both') {
      const type = action === 'creative-type-image' ? 'image' : action === 'creative-type-video' ? 'video' : 'both';
      const steps = buildCreativeConversation(type as any);
      setIsTyping(true);
      runConversationSteps(activeThreadId, steps);
      return;
    }

    // Style selections → product analysis
    if (action.startsWith('style-')) {
      const style = action.replace('style-', '');
      respondWithSim(activeThreadId, styleToProductAnalysis(style));
      return;
    }

    // Goal selections (campaign flow)
    if (action.startsWith('goal-')) {
      const followUp = goalFollowUps[action];
      if (followUp) {
        setIsTyping(true);
        runConversationSteps(activeThreadId, followUp);
      }
      return;
    }

    // Budget selections → generate blueprint
    if (action.startsWith('budget-')) {
      const budgetMap: Record<string, number> = { 'budget-low': 25, 'budget-medium': 60, 'budget-high': 120 };
      respondWithSim(activeThreadId, buildBlueprintResponse('Sales', budgetMap[action] || 60));
      return;
    }

    // Facebook connect
    if (action === 'connect-facebook') {
      setIsTyping(true);
      runConversationSteps(activeThreadId, buildFacebookConnectFlow());
      return;
    }

    // Audit
    if (action === 'audit') {
      setIsTyping(true);
      runConversationSteps(activeThreadId, buildAuditFlow());
      return;
    }

    // Configure campaign
    if (action === 'configure-campaign' || action === 'use-in-campaign') {
      respondWithSim(activeThreadId, campaignConfigResponse());
      return;
    }

    // Device preview
    if (action === 'preview-device') {
      respondWithSim(activeThreadId, devicePreviewResponse());
      return;
    }

    // Publish
    if (action === 'publish-campaign') {
      respondWithSim(activeThreadId, publishCampaignResponse());
      return;
    }

    // Creative flow from campaign
    if (action === 'create-flow-from-campaign') {
      setIsTyping(true);
      runConversationSteps(activeThreadId, buildCreativeConversation());
      return;
    }

    // Script/Avatar flow
    if (action === 'show-scripts') {
      respondWithSim(activeThreadId, showScriptsResponse);
      return;
    }

    // Performance/Insights/Rule
    if (action === 'performance') { respondWithSim(activeThreadId, simpleResponses.performance); return; }
    if (action === 'new-campaign') {
      respondWithSim(activeThreadId, { content: "Let's plan a new campaign! 🚀 What product or service are you promoting?" });
      return;
    }

    // Simple responses
    const simple = simpleResponses[action];
    if (simple) { respondWithSim(activeThreadId, simple); return; }

    // Fallback
    respondWithSim(activeThreadId, simpleResponses.default);
  }, [activeThreadId, runConversationSteps, respondWithSim]);

  const handleArtifactAction = useCallback((artifactId: string, action: string, payload?: any) => {
    if (!activeThreadId) return;

    // Facebook connect button
    if (action === 'facebook-connect-auth') {
      respondWithSim(activeThreadId, facebookConnectedResponse(), 2000);
      return;
    }

    // Script selected
    if (action === 'script-selected') {
      respondWithSim(activeThreadId, avatarResponse);
      return;
    }

    // Avatar selected → trigger generation
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

        // Simulate progress
        const progressArtId = artifactIds[0];
        const progressSteps = [
          { delay: 2000, progress: 55 }, { delay: 4000, progress: 75 },
          { delay: 6000, progress: 90 }, { delay: 8000, progress: 100, stage: 'complete' },
        ];
        progressSteps.forEach(({ delay, progress, stage }) => {
          const t = setTimeout(() => {
            setThreads(prev => {
              const thread = prev[activeThreadId];
              if (!thread) return prev;
              return { ...prev, [activeThreadId]: { ...thread, artifacts: thread.artifacts.map(a =>
                a.id === progressArtId ? { ...a, data: { ...a.data, progress, stage: stage || 'rendering', outputs: a.data.outputs?.map((o: any) => ({ ...o, status: progress >= 100 ? 'ready' : o.status })) }, updatedAt: new Date() } : a
              )}};
            });
          }, delay);
          pendingStepsRef.current.push(t);
        });

        // Spawn creative result
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

  return {
    activeThread, activeThreadId, isTyping, sidebarCollapsed, focusedArtifactId,
    selectThread, createThread, sendMessage, handleActionChip, handleArtifactAction,
    toggleArtifactCollapse, updateArtifactData, focusArtifact, setSidebarCollapsed,
  };
}
