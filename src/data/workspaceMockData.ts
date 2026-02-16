import { Workspace, Thread, ThreadMessage, Artifact } from '@/types/workspace';

export const mockWorkspaces: Workspace[] = [
  {
    id: 'ws-1',
    name: 'Acme Corp',
    clientName: 'Acme Corporation',
    threads: [],
    createdAt: new Date('2026-01-15'),
  },
  {
    id: 'ws-2',
    name: 'Bloom Beauty',
    clientName: 'Bloom Beauty Co.',
    threads: [],
    createdAt: new Date('2026-02-01'),
  },
];

export const mockThreads: Thread[] = [
  {
    id: 'thread-1',
    title: 'Spring Sale Campaign',
    workspaceId: 'ws-1',
    connectedAccount: 'Facebook Ads',
    messages: [],
    artifacts: [],
    rules: [],
    createdAt: new Date('2026-02-10'),
    updatedAt: new Date('2026-02-16'),
    isActive: true,
  },
  {
    id: 'thread-2',
    title: 'Brand Awareness Q1',
    workspaceId: 'ws-1',
    messages: [],
    artifacts: [],
    rules: [],
    createdAt: new Date('2026-02-08'),
    updatedAt: new Date('2026-02-15'),
    isActive: false,
  },
  {
    id: 'thread-3',
    title: 'Product Launch - Serum',
    workspaceId: 'ws-2',
    connectedAccount: 'Facebook Ads',
    messages: [],
    artifacts: [],
    rules: [],
    createdAt: new Date('2026-02-12'),
    updatedAt: new Date('2026-02-16'),
    isActive: true,
  },
];

export const mockArtifacts: Artifact[] = [
  {
    id: 'art-1',
    type: 'campaign-blueprint',
    title: 'Spring Sale — Facebook Ads',
    status: 'draft',
    version: 1,
    isCollapsed: false,
    createdAt: new Date('2026-02-14'),
    updatedAt: new Date('2026-02-16'),
    data: {
      campaignName: 'Spring Sale 2026',
      objective: 'Sales',
      platform: 'Facebook',
      budget: { daily: 50, total: 1500 },
      targeting: { ageRange: '25-45', interests: ['Fashion', 'Shopping'], locations: ['US', 'UK'] },
      schedule: { startDate: '2026-03-01', endDate: '2026-03-31' },
      adSets: 3,
      primaryText: 'Up to 40% off everything this Spring! Shop now and refresh your wardrobe.',
      cta: 'Shop Now',
    },
  },
  {
    id: 'art-2',
    type: 'creative-set',
    title: 'Spring Sale Creatives',
    status: 'draft',
    version: 1,
    isCollapsed: true,
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date('2026-02-16'),
    data: {
      name: 'Spring Sale Set',
      count: 3,
      items: [
        { id: 'cr-1', label: 'Hero Banner', format: 'image', dimensions: '1200×628' },
        { id: 'cr-2', label: 'Story Ad', format: 'image', dimensions: '1080×1920' },
        { id: 'cr-3', label: 'Carousel Card 1', format: 'image', dimensions: '1080×1080' },
      ],
    },
  },
  {
    id: 'art-3',
    type: 'video-creative',
    title: 'Avatar Video — Spring Promo',
    status: 'draft',
    version: 1,
    isCollapsed: true,
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date('2026-02-16'),
    data: {
      name: 'Spring Promo Video',
      duration: '30s',
      avatar: 'Sophia',
      script: "Hey there! Spring is finally here, and we've got something special for you. Our biggest sale of the season is live — up to 40% off everything. Don't miss out!",
      status: 'ready',
    },
  },
  {
    id: 'art-4',
    type: 'performance-snapshot',
    title: 'Weekly Performance — Feb 10-16',
    status: 'live',
    version: 2,
    isCollapsed: true,
    createdAt: new Date('2026-02-16'),
    updatedAt: new Date('2026-02-16'),
    data: {
      dateRange: 'Feb 10 — Feb 16, 2026',
      metrics: { spent: 342, revenue: 1890, roi: 4.5, conversions: 47, ctr: 3.2, impressions: 28500 },
      topCampaign: 'Spring Sale — Retargeting',
      recommendations: [
        'Increase budget on top ad set by 20%',
        'Pause underperforming creative #3',
        'Test new audience: Lifestyle enthusiasts',
      ],
    },
  },
  {
    id: 'art-5',
    type: 'ai-insights',
    title: 'AI Insights — This Week',
    status: 'live',
    version: 1,
    isCollapsed: true,
    createdAt: new Date('2026-02-16'),
    updatedAt: new Date('2026-02-16'),
    data: {
      insights: [
        {
          type: 'anomaly',
          severity: 'high',
          title: 'CPA spike detected',
          description: 'Cost per acquisition jumped 40% overnight due to increased competition.',
          metric: 'CPA',
          change: 40,
          suggestedAction: 'Narrow audience or adjust bid strategy',
        },
        {
          type: 'opportunity',
          severity: 'medium',
          title: 'Lookalike audience opportunity',
          description: 'Your top converters share similar demographics. A lookalike audience could improve results.',
          metric: 'Conversions',
          change: 25,
          suggestedAction: 'Create a 1% lookalike from recent purchasers',
        },
      ],
    },
  },
  {
    id: 'art-6',
    type: 'automation-rule',
    title: 'Auto-pause high CPA ads',
    status: 'live',
    version: 1,
    isCollapsed: true,
    createdAt: new Date('2026-02-14'),
    updatedAt: new Date('2026-02-16'),
    data: {
      name: 'Auto-pause high CPA',
      trigger: 'CPA exceeds $20',
      condition: 'For 24 consecutive hours',
      action: 'Pause ad set',
      isActive: true,
      autoExecute: false,
      lastTriggered: '2026-02-15T14:30:00',
    },
  },
];

// Template artifacts for simulated responses
export const artifactTemplates: Record<string, Partial<Artifact>> = {
  'campaign-blueprint': {
    type: 'campaign-blueprint',
    title: 'New Campaign Blueprint',
    data: {
      campaignName: 'New Campaign',
      objective: 'Sales',
      platform: 'Facebook',
      budget: { daily: 30, total: 900 },
      targeting: { ageRange: '18-55', interests: ['General'], locations: ['US'] },
      schedule: { startDate: '2026-03-01', endDate: '2026-03-31' },
      adSets: 1,
      primaryText: '',
      cta: 'Learn More',
    },
  },
  'campaign-live': {
    type: 'campaign-live',
    title: 'Live Campaign',
    data: {
      campaignName: 'Campaign',
      objective: 'Sales',
      platform: 'Facebook',
      budget: { daily: 50, total: 1500, spent: 420 },
      status: 'active',
      publishedAt: new Date().toISOString(),
      adSets: 2,
      activeAds: 4,
    },
  },
  'creative-set': {
    type: 'creative-set',
    title: 'Creative Set',
    data: {
      name: 'New Creative Set',
      count: 2,
      items: [
        { id: 'cr-new-1', label: 'Ad Image 1', format: 'image', dimensions: '1200×628' },
        { id: 'cr-new-2', label: 'Ad Image 2', format: 'image', dimensions: '1080×1080' },
      ],
    },
  },
  'creative-variant': {
    type: 'creative-variant',
    title: 'Creative Variant',
    data: {
      parentSetId: '',
      label: 'Variant A',
      headline: 'Your headline here',
      primaryText: 'Your ad copy here',
      cta: 'Shop Now',
      format: 'image',
      dimensions: '1200×628',
    },
  },
  'video-creative': {
    type: 'video-creative',
    title: 'Video Creative',
    data: {
      name: 'New Video',
      duration: '30s',
      avatar: 'Sophia',
      script: '',
      status: 'generating',
    },
  },
  'performance-snapshot': {
    type: 'performance-snapshot',
    title: 'Performance Snapshot',
    data: {
      dateRange: 'Last 7 days',
      metrics: { spent: 0, revenue: 0, roi: 0, conversions: 0, ctr: 0, impressions: 0 },
      topCampaign: '',
      recommendations: [],
    },
  },
  'ai-insights': {
    type: 'ai-insights',
    title: 'AI Insights',
    data: { insights: [] },
  },
  'automation-rule': {
    type: 'automation-rule',
    title: 'Automation Rule',
    data: {
      name: 'New Rule',
      trigger: '',
      condition: '',
      action: '',
      isActive: false,
      autoExecute: false,
    },
  },
  'publish-confirmation': {
    type: 'publish-confirmation',
    title: 'Publish Confirmation',
    data: {
      campaignName: '',
      platform: 'Facebook',
      publishedAt: '',
      adCount: 0,
      budget: { daily: 0, total: 0 },
      status: 'pending',
    },
  },
  'ai-signals-summary': {
    type: 'ai-signals-summary',
    title: 'AI Signals Summary',
    data: {
      period: 'Last 7 days',
      signals: [],
      actionsTaken: 0,
      actionsRemaining: 0,
    },
  },
  'product-analysis': {
    type: 'product-analysis',
    title: 'Product Analysis',
    data: {
      productName: '',
      imageUrl: '',
      price: '',
      category: '',
      description: '',
      keyFeatures: [],
      targetAudience: '',
    },
  },
  'script-options': {
    type: 'script-options',
    title: 'Script Options',
    data: {
      scripts: [],
      selectedScriptId: null,
    },
  },
  'avatar-selection': {
    type: 'avatar-selection',
    title: 'Avatar Selection',
    data: {
      avatars: [],
      selectedAvatarId: null,
    },
  },
  'generation-progress': {
    type: 'generation-progress',
    title: 'Generation Progress',
    data: {
      stage: 'analyzing',
      progress: 0,
      outputs: [],
    },
  },
};

export const mockMessages: ThreadMessage[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content: "Welcome to your workspace! I can help you plan campaigns, create ads, analyze performance, and set up automations — all in this thread. What would you like to work on?",
    timestamp: new Date('2026-02-14T09:00:00'),
  },
  {
    id: 'msg-2',
    role: 'user',
    content: 'Plan a Spring Sale campaign for Facebook targeting US and UK customers aged 25-45.',
    timestamp: new Date('2026-02-14T09:01:00'),
  },
  {
    id: 'msg-3',
    role: 'assistant',
    content: "I've drafted a campaign blueprint for your Spring Sale. You can edit any field directly — click on a value to change it. I've also prepared a creative set and a video creative to go with it.",
    timestamp: new Date('2026-02-14T09:01:30'),
    artifactIds: ['art-1', 'art-2', 'art-3'],
  },
  {
    id: 'msg-4',
    role: 'user',
    content: "How's the campaign performing this week?",
    timestamp: new Date('2026-02-16T10:00:00'),
  },
  {
    id: 'msg-5',
    role: 'assistant',
    content: "Here's your weekly snapshot. ROI is strong at 4.5x, but I've flagged some insights and set up an automation rule to protect your spend.",
    timestamp: new Date('2026-02-16T10:00:30'),
    artifactIds: ['art-4', 'art-5', 'art-6'],
  },
];

export function getThreadWithData(threadId: string): Thread | null {
  const thread = mockThreads.find(t => t.id === threadId);
  if (!thread) return null;
  return {
    ...thread,
    messages: threadId === 'thread-1' ? mockMessages : [mockMessages[0]],
    artifacts: threadId === 'thread-1' ? mockArtifacts : [],
  };
}
