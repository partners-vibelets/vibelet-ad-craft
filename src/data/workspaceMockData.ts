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
    messages: [],
    artifacts: [],
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
    createdAt: new Date('2026-02-08'),
    updatedAt: new Date('2026-02-15'),
    isActive: false,
  },
  {
    id: 'thread-3',
    title: 'Product Launch - Serum',
    workspaceId: 'ws-2',
    messages: [],
    artifacts: [],
    createdAt: new Date('2026-02-12'),
    updatedAt: new Date('2026-02-16'),
    isActive: true,
  },
];

export const mockArtifacts: Artifact[] = [
  {
    id: 'art-1',
    type: 'campaign-plan',
    title: 'Spring Sale - Facebook Ads',
    status: 'draft',
    version: 1,
    isCollapsed: false,
    createdAt: new Date('2026-02-14'),
    updatedAt: new Date('2026-02-16'),
    data: {
      objective: 'Sales',
      platform: 'Facebook',
      budget: { daily: 50, total: 1500 },
      targeting: { ageRange: '25-45', interests: ['Fashion', 'Shopping'], locations: ['US', 'UK'] },
      schedule: { startDate: '2026-03-01', endDate: '2026-03-31' },
      adSets: 3,
      status: 'planning',
    },
  },
  {
    id: 'art-2',
    type: 'performance-report',
    title: 'Weekly Performance - Feb 10-16',
    status: 'ready',
    version: 2,
    isCollapsed: true,
    createdAt: new Date('2026-02-16'),
    updatedAt: new Date('2026-02-16'),
    data: {
      dateRange: 'Feb 10 - Feb 16, 2026',
      metrics: { spent: 342, revenue: 1890, roi: 4.5, conversions: 47, ctr: 3.2, impressions: 28500 },
      topCampaign: 'Spring Sale - Retargeting',
      recommendations: ['Increase budget on top ad set by 20%', 'Pause underperforming creative #3', 'Test new audience segment: Lifestyle'],
    },
  },
  {
    id: 'art-3',
    type: 'ai-signals',
    title: 'Cost Spike Detected',
    status: 'ready',
    version: 1,
    isCollapsed: true,
    createdAt: new Date('2026-02-16'),
    updatedAt: new Date('2026-02-16'),
    data: {
      type: 'anomaly',
      severity: 'high',
      title: 'CPA increased 40% overnight',
      description: 'Your cost per acquisition jumped from $12 to $16.80 in the last 24 hours. This is likely due to increased competition in your target audience.',
      metric: 'CPA',
      change: 40,
      suggestedAction: 'Consider narrowing your audience or adjusting bid strategy',
    },
  },
];

export const mockMessages: ThreadMessage[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content: "Welcome to your workspace! I'm your AI marketing assistant. I can help you plan campaigns, create ads, analyze performance, and automate optimizations — all right here in this thread. What would you like to work on?",
    timestamp: new Date('2026-02-14T09:00:00'),
  },
  {
    id: 'msg-2',
    role: 'user',
    content: 'I want to plan a Spring Sale campaign for Facebook targeting US and UK customers aged 25-45.',
    timestamp: new Date('2026-02-14T09:01:00'),
  },
  {
    id: 'msg-3',
    role: 'assistant',
    content: "Great! I've drafted a campaign plan for your Spring Sale. Take a look at the artifact below — you can edit any field directly. I've set a suggested daily budget of $50 based on your target audience size.",
    timestamp: new Date('2026-02-14T09:01:30'),
    artifactIds: ['art-1'],
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
    content: "Here's your weekly performance summary. ROI is strong at 4.5x, but I've spotted a cost spike you should look at. I've surfaced both reports below.",
    timestamp: new Date('2026-02-16T10:00:30'),
    artifactIds: ['art-2', 'art-3'],
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
