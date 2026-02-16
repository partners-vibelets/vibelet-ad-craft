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

// Multi-step campaign planning conversation
function buildCampaignConversation(userMessage: string): ConversationStep[] {
  const productMatch = userMessage.match(/(?:launch|plan|create|run|start)\s+(?:a\s+)?(.+?)(?:\s+campaign|$)/i);
  const productName = productMatch?.[1]?.trim() || 'your product';

  return [
    {
      delay: 1200,
      response: {
        content: `Love it — a ${productName} campaign! Before I draft the blueprint, a couple of quick questions to make sure we nail this:\n\n**1. What's the primary goal?**\nAre we going for direct sales, building brand awareness, or driving traffic to your site?`,
      },
    },
    {
      delay: 3500,
      response: {
        content: `**2. What's your budget comfort zone?**\nI can optimize for any range, but knowing your ballpark helps me set realistic targets and recommend the right ad formats.\n\nFor a ${productName} campaign, I'd typically suggest $40–80/day on Facebook & Instagram. Want me to work with that, or do you have something else in mind?`,
      },
    },
    {
      delay: 6500,
      response: {
        content: `Great — based on your input, here's the campaign blueprint for **${productName}**. I've pre-filled targeting, budget, and schedule based on similar campaigns. You can click any field to edit it directly.`,
        artifacts: [
          {
            type: 'campaign-blueprint',
            titleSuffix: `${productName.charAt(0).toUpperCase() + productName.slice(1)} — Campaign Blueprint`,
            dataOverrides: {
              campaignName: `${productName.charAt(0).toUpperCase() + productName.slice(1)} Campaign 2026`,
              objective: 'Sales',
              platform: 'Facebook & Instagram',
              budget: { daily: 60, total: 1800 },
              targeting: {
                ageRange: '18-35',
                interests: ['Fashion', 'Streetwear', 'Summer Style', 'Online Shopping'],
                locations: ['US', 'UK', 'CA'],
              },
              schedule: { startDate: '2026-06-01', endDate: '2026-08-31' },
              adSets: 3,
              primaryText: `Summer is here ☀️ Check out our latest ${productName} collection — fresh styles, bold designs, and unbeatable comfort. Shop now and get free shipping!`,
              cta: 'Shop Now',
              suggestedCreatives: [
                'Lifestyle photo — model wearing product outdoors',
                'Flat-lay product shot with summer props',
                'Short-form video ad with AI avatar',
                'Carousel showcasing color variants',
              ],
            },
          },
        ],
        actionChips: [
          { label: '🎨 Generate image creatives', icon: 'image', action: 'creative' },
          { label: '🎬 Generate video ad', icon: 'video', action: 'video' },
          { label: '🎯 Refine targeting', icon: 'target', action: 'refine-targeting' },
          { label: '💰 Adjust budget', icon: 'budget', action: 'adjust-budget' },
        ],
      },
    },
  ];
}

// Multi-step creative creation flow: product → scripts → avatar → generate
function buildCreativeConversation(userMessage: string): ConversationStep[] {
  // Extract product name from message
  const productMatch = userMessage.match(/(?:create|make|generate|build|design)\s+(?:a\s+|an\s+|some\s+)?(?:creative|creatives|ad|ads|video|videos|content)?\s*(?:for\s+)?(?:my\s+|a\s+|the\s+)?(.+?)(?:\s+product|\s+brand|\s+store|$)/i);
  const productName = productMatch?.[1]?.trim() || 'your product';
  const capName = productName.charAt(0).toUpperCase() + productName.slice(1);

  return [
    {
      delay: 1200,
      response: {
        content: `Let's create some amazing creatives for **${capName}**! 🎨\n\nFirst, let me analyze the product so I can tailor everything — scripts, visuals, and targeting.`,
      },
    },
    {
      delay: 3200,
      response: {
        content: `Here's what I found about your product. Take a look and let me know if anything needs adjusting before we move to scripts.`,
        artifacts: [
          {
            type: 'product-analysis' as ArtifactType,
            titleSuffix: `${capName} — Product Analysis`,
            dataOverrides: {
              productName: capName,
              imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
              price: '$29.99',
              category: 'Apparel / T-Shirts',
              description: `Premium quality ${productName} made from 100% organic cotton. Features a modern fit with reinforced stitching and a soft-touch finish. Available in 8 colorways.`,
              keyFeatures: ['100% Organic Cotton', 'Modern Fit', 'Reinforced Stitching', '8 Colorways', 'Unisex'],
              targetAudience: 'Style-conscious millennials and Gen Z, ages 18-35, interested in streetwear and sustainable fashion.',
            },
          },
        ],
        actionChips: [
          { label: '✅ Looks good — show me scripts', icon: 'check', action: 'show-scripts' },
          { label: '✏️ Edit product details', icon: 'edit', action: 'edit-product' },
        ],
      },
    },
  ];
}

// Script and avatar follow-up responses for creative flow
const creativeFlowResponses: Record<string, (payload?: any) => SimResponse> = {
  'show-scripts': () => ({
    content: "I've generated 3 script options with different tones and angles. **Click one to select it** — you can always come back and change your mind.",
    artifacts: [
      {
        type: 'script-options' as ArtifactType,
        titleSuffix: 'Script Options',
        dataOverrides: {
          scripts: [
            {
              id: 'script-a',
              style: 'Conversational',
              label: 'Script A — Friendly & Casual',
              duration: '30s',
              script: "Hey! Looking for the perfect tee? We've got you. Our new collection is made from 100% organic cotton — super soft, great fit, and good for the planet. Available in 8 colors. Grab yours before they're gone!",
            },
            {
              id: 'script-b',
              style: 'Hype',
              label: 'Script B — Bold & Energetic',
              duration: '30s',
              script: "Stop scrolling. This is the tee you've been waiting for. Premium organic cotton. 8 fire colorways. A fit that hits different. This isn't just a t-shirt — it's a statement. Limited drop. Don't sleep on it.",
            },
            {
              id: 'script-c',
              style: 'Storytelling',
              label: 'Script C — Narrative',
              duration: '45s',
              script: "Every great outfit starts with the perfect t-shirt. That's why we spent 18 months perfecting ours. 100% organic cotton sourced from sustainable farms. A modern silhouette that flatters every body type. And 8 colors inspired by city sunsets. This is more than fashion — it's a feeling. Try it once, and you'll understand.",
            },
          ],
          selectedScriptId: null,
        },
      },
    ],
  }),
  'script-selected': (payload) => ({
    content: `Great choice! Now let's pick an AI avatar to present your product. **Click on an avatar** to select them — they'll deliver the script you chose.`,
    artifacts: [
      {
        type: 'avatar-selection' as ArtifactType,
        titleSuffix: 'Choose Your Avatar',
        dataOverrides: {
          avatars: AVATARS.slice(0, 8).map(a => ({
            id: a.id,
            name: a.name,
            style: a.style,
            imageUrl: a.imageUrl,
            selected: false,
          })),
          selectedAvatarId: null,
        },
      },
    ],
  }),
  'avatar-selected': (payload) => {
    const avatar = AVATARS.find(a => a.id === payload?.avatarId);
    const avatarName = avatar?.name || 'the avatar';
    return {
      content: `**${avatarName}** is locked in! 🎬 I'm now generating your creatives — a full image set plus a video ad with ${avatarName} delivering the script. This will take about a minute...`,
      artifacts: [
        {
          type: 'generation-progress' as ArtifactType,
          titleSuffix: 'Generating Creatives',
          dataOverrides: {
            stage: 'rendering',
            progress: 35,
            outputs: [
              { id: 'out-1', type: 'image', label: 'Hero Banner (Feed)', format: 'image', dimensions: '1200×628', status: 'generating' },
              { id: 'out-2', type: 'image', label: 'Instagram Story', format: 'image', dimensions: '1080×1920', status: 'generating' },
              { id: 'out-3', type: 'image', label: 'Square Post', format: 'image', dimensions: '1080×1080', status: 'generating' },
              { id: 'out-4', type: 'video', label: `Video Ad — ${avatarName}`, format: 'video', dimensions: '1080×1920', status: 'generating', duration: '30s' },
            ],
          },
        },
      ],
    };
  },
};


// Action chip follow-up responses
const chipResponses: Record<string, SimResponse> = {
  creative: {
    content: "I'm generating a creative set with multiple ad formats tailored to your campaign. Here's what I've put together — you can mix and match.",
    artifacts: [
      {
        type: 'creative-set',
        titleSuffix: 'Summer Campaign Creatives',
        dataOverrides: {
          name: 'Summer T-Shirt Creative Set',
          count: 4,
          items: [
            { id: 'cr-s1', label: 'Lifestyle Hero Shot', format: 'image', dimensions: '1200×628' },
            { id: 'cr-s2', label: 'Instagram Story', format: 'image', dimensions: '1080×1920' },
            { id: 'cr-s3', label: 'Carousel Card — Colors', format: 'image', dimensions: '1080×1080' },
            { id: 'cr-s4', label: 'Facebook Feed Square', format: 'image', dimensions: '1080×1080' },
          ],
        },
      },
    ],
    actionChips: [
      { label: '✏️ Generate variants', icon: 'variant', action: 'variant' },
      { label: '🎬 Add video creative', icon: 'video', action: 'video' },
    ],
  },
  video: {
    content: "I'm creating a 30-second video ad with an AI avatar. You can edit the script directly below — when you're happy with it, we can render the final video.",
    artifacts: [
      {
        type: 'video-creative',
        titleSuffix: 'Summer T-Shirt — Video Ad',
        dataOverrides: {
          name: 'Summer Collection Video',
          duration: '30s',
          avatar: 'Sophia',
          script: "Hey! Summer just got a whole lot cooler. Our new t-shirt collection is here — bold designs, premium cotton, and styles that turn heads. From beach days to city nights, we've got you covered. Shop now and get free shipping on your first order!",
          status: 'generating',
        },
      },
    ],
  },
  'refine-targeting': {
    content: "Let me analyze your audience further. I've surfaced some insights and a suggested lookalike audience that could boost your reach without diluting quality.",
    artifacts: [
      {
        type: 'ai-insights',
        titleSuffix: 'Targeting Insights',
        dataOverrides: {
          insights: [
            {
              type: 'opportunity',
              severity: 'high',
              title: 'Lookalike audience match',
              description: 'Your top buyers share strong overlap with "Streetwear Enthusiasts" aged 20-28. A 1% lookalike could increase conversions by ~30%.',
              metric: 'Conversions',
              change: 30,
              suggestedAction: 'Create a lookalike audience from your top 500 purchasers',
            },
            {
              type: 'trend',
              severity: 'medium',
              title: 'Peak engagement: evenings',
              description: 'Your audience engages most between 6PM–10PM. Consider dayparting your ad schedule.',
              metric: 'Engagement',
              change: 22,
              suggestedAction: 'Set ad schedule to 5PM–11PM in target time zones',
            },
          ],
        },
      },
    ],
  },
  'adjust-budget': {
    content: "Here's a budget optimization view. Based on similar campaigns, I'd recommend a slightly higher daily spend in the first two weeks to accelerate learning, then tapering down.",
    artifacts: [
      {
        type: 'performance-snapshot',
        titleSuffix: 'Budget Projection',
        dataOverrides: {
          dateRange: 'Jun 1 — Aug 31, 2026 (projected)',
          metrics: { spent: 1800, revenue: 7200, roi: 4.0, conversions: 180, ctr: 3.5, impressions: 95000 },
          topCampaign: 'Summer T-Shirt — Broad',
          recommendations: [
            'Front-load budget: $80/day for first 14 days',
            'Scale back to $50/day after learning phase',
            'Allocate 30% to retargeting ad set',
          ],
        },
      },
    ],
  },
  variant: {
    content: "Here's a creative variant with different copy angles. Edit the headline and text to test different messaging.",
    artifacts: [
      {
        type: 'creative-variant',
        titleSuffix: 'Copy Variant A',
        dataOverrides: {
          parentSetId: '',
          label: 'Variant A — Bold CTA',
          headline: 'Your Summer Wardrobe Starts Here',
          primaryText: 'Fresh drops just landed. Premium cotton tees in 12 colorways — designed for comfort, built for style. Free shipping today only.',
          cta: 'Shop the Collection',
          format: 'image',
          dimensions: '1200×628',
        },
      },
    ],
  },
};

const simpleResponses: Record<string, SimResponse> = {
  creative: chipResponses.creative,
  video: chipResponses.video,
  performance: {
    content: "Here's your performance snapshot with key metrics and recommendations.",
    artifacts: [{ type: 'performance-snapshot', titleSuffix: 'Performance Snapshot' }],
  },
  insights: {
    content: "I've analyzed your account and surfaced key insights. Here's what I found.",
    artifacts: [{ type: 'ai-insights', titleSuffix: 'AI Insights' }],
  },
  audit: {
    content: "Your 30-day audit is ready. I've summarized the signals and recommended actions below.",
    artifacts: [
      { type: 'performance-snapshot', titleSuffix: 'Audit Performance' },
      { type: 'ai-signals-summary', titleSuffix: 'Signal Summary' },
    ],
  },
  rule: {
    content: "I've set up an automation rule for you. Toggle it on when you're ready.",
    artifacts: [{ type: 'automation-rule', titleSuffix: 'Automation Rule' }],
  },
  publish: {
    content: "Ready to publish? Here's the confirmation. Review the details and confirm when ready.",
    artifacts: [{ type: 'publish-confirmation', titleSuffix: 'Publish Confirmation' }],
  },
  default: {
    content: "Got it! I'll work on that. What would you like me to focus on?",
  },
};

function detectIntent(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('publish') || lower.includes('go live')) return 'publish';
  // Creative creation flow detection — must come before simple 'creative'/'video'
  if ((lower.includes('create') || lower.includes('generate') || lower.includes('make') || lower.includes('design') || lower.includes('build'))
    && (lower.includes('creative') || lower.includes('ad') || lower.includes('video') || lower.includes('content'))) return 'create-flow';
  if (lower.includes('video') || lower.includes('avatar')) return 'video';
  if (lower.includes('creative') || lower.includes('image') || lower.includes('ad design') || lower.includes('banner')) return 'creative';
  if (lower.includes('campaign') || lower.includes('plan') || lower.includes('blueprint') || lower.includes('launch')) return 'campaign';
  if (lower.includes('performance') || lower.includes('metrics') || lower.includes('snapshot')) return 'performance';
  if (lower.includes('insight') || lower.includes('signal') || lower.includes('anomal')) return 'insights';
  if (lower.includes('audit') || lower.includes('review') || lower.includes('analyz')) return 'audit';
  if (lower.includes('rule') || lower.includes('automat') || lower.includes('trigger')) return 'rule';
  return 'default';
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
    // Cancel pending conversation steps
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
      id,
      title: 'New Thread',
      workspaceId,
      messages: [{
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: "Hi! I'm ready to help. What would you like to work on — campaigns, creatives, performance, or automation?",
        timestamp: new Date(),
      }],
      artifacts: [],
      rules: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };
    setThreads(prev => ({ ...prev, [id]: newThread }));
    setActiveThreadId(id);
  }, []);

  const appendMessage = useCallback((threadId: string, msg: ThreadMessage, newArtifacts: Artifact[] = []) => {
    setThreads(prev => {
      const thread = prev[threadId];
      if (!thread) return prev;
      return {
        ...prev,
        [threadId]: {
          ...thread,
          messages: [...thread.messages, msg],
          artifacts: [...thread.artifacts, ...newArtifacts],
          updatedAt: new Date(),
        },
      };
    });
  }, []);

  const runConversationSteps = useCallback((threadId: string, steps: ConversationStep[]) => {
    // Cancel any existing pending steps
    pendingStepsRef.current.forEach(clearTimeout);
    pendingStepsRef.current = [];

    steps.forEach((step, i) => {
      // Show typing before each step
      const typingTimer = setTimeout(() => {
        setIsTyping(true);
      }, i === 0 ? 0 : step.delay - 800);
      pendingStepsRef.current.push(typingTimer);

      const msgTimer = setTimeout(() => {
        const response = step.response;
        const { artifacts: newArtifacts, ids: artifactIds } = createArtifactsFromSpec(response.artifacts);

        const aiMsg: ThreadMessage = {
          id: `msg-${Date.now()}-${i}`,
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          artifactIds: artifactIds.length > 0 ? artifactIds : undefined,
          actionChips: response.actionChips,
        };

        appendMessage(threadId, aiMsg, newArtifacts);
        if (artifactIds.length > 0) setFocusedArtifactId(artifactIds[0]);

        // Hide typing after last step
        if (i === steps.length - 1) {
          setIsTyping(false);
        }
      }, step.delay);
      pendingStepsRef.current.push(msgTimer);
    });
  }, [appendMessage]);

  const sendMessage = useCallback((content: string) => {
    if (!activeThreadId) return;

    const userMsg: ThreadMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    appendMessage(activeThreadId, userMsg);
    setIsTyping(true);

    const intent = detectIntent(content);

    if (intent === 'campaign') {
      const steps = buildCampaignConversation(content);
      runConversationSteps(activeThreadId, steps);
    } else if (intent === 'create-flow') {
      const steps = buildCreativeConversation(content);
      runConversationSteps(activeThreadId, steps);
    } else {
      // Single-step response
      setTimeout(() => {
        const response = simpleResponses[intent] || simpleResponses.default;
        const { artifacts: newArtifacts, ids: artifactIds } = createArtifactsFromSpec(response.artifacts);

        const aiMsg: ThreadMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          artifactIds: artifactIds.length > 0 ? artifactIds : undefined,
          actionChips: response.actionChips,
        };

        appendMessage(activeThreadId, aiMsg, newArtifacts);
        setIsTyping(false);
        if (artifactIds.length > 0) setFocusedArtifactId(artifactIds[0]);
      }, 1200 + Math.random() * 800);
    }
  }, [activeThreadId, appendMessage, runConversationSteps]);

  const handleActionChip = useCallback((action: string) => {
    if (!activeThreadId) return;

    // Check creative flow responses first
    const creativeFlowFn = creativeFlowResponses[action];
    const response = creativeFlowFn ? creativeFlowFn() : chipResponses[action];
    if (!response) return;

    setIsTyping(true);

    setTimeout(() => {
      const { artifacts: newArtifacts, ids: artifactIds } = createArtifactsFromSpec(response.artifacts);

      const aiMsg: ThreadMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        artifactIds: artifactIds.length > 0 ? artifactIds : undefined,
        actionChips: response.actionChips,
      };

      appendMessage(activeThreadId, aiMsg, newArtifacts);
      setIsTyping(false);
      if (artifactIds.length > 0) setFocusedArtifactId(artifactIds[0]);
    }, 800 + Math.random() * 600);
  }, [activeThreadId, appendMessage]);

  // Handle artifact-level actions (script selection, avatar selection)
  const handleArtifactAction = useCallback((artifactId: string, action: string, payload?: any) => {
    if (!activeThreadId) return;

    const creativeFlowFn = creativeFlowResponses[action];
    if (!creativeFlowFn) return;

    const response = creativeFlowFn(payload);
    setIsTyping(true);

    setTimeout(() => {
      const { artifacts: newArtifacts, ids: artifactIds } = createArtifactsFromSpec(response.artifacts);

      const aiMsg: ThreadMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        artifactIds: artifactIds.length > 0 ? artifactIds : undefined,
        actionChips: response.actionChips,
      };

      appendMessage(activeThreadId, aiMsg, newArtifacts);
      setIsTyping(false);
      if (artifactIds.length > 0) setFocusedArtifactId(artifactIds[0]);

      // If this was avatar-selected, simulate progress updates
      if (action === 'avatar-selected' && artifactIds.length > 0) {
        const progressArtId = artifactIds[0];
        const progressSteps = [
          { delay: 2000, progress: 55, stage: 'rendering' },
          { delay: 4000, progress: 75, stage: 'rendering' },
          { delay: 6000, progress: 90, stage: 'rendering' },
          { delay: 8000, progress: 100, stage: 'complete' },
        ];
        progressSteps.forEach(({ delay, progress, stage }) => {
          const timer = setTimeout(() => {
            setThreads(prev => {
              const thread = prev[activeThreadId];
              if (!thread) return prev;
              return {
                ...prev,
                [activeThreadId]: {
                  ...thread,
                  artifacts: thread.artifacts.map(a =>
                    a.id === progressArtId
                      ? {
                          ...a,
                          data: {
                            ...a.data,
                            progress,
                            stage,
                            outputs: a.data.outputs?.map((o: any) => ({
                              ...o,
                              status: progress >= 100 ? 'ready' : o.status,
                            })),
                          },
                          updatedAt: new Date(),
                        }
                      : a
                  ),
                },
              };
            });
          }, delay);
          pendingStepsRef.current.push(timer);
        });
      }
    }, 800 + Math.random() * 600);
  }, [activeThreadId, appendMessage]);

  const toggleArtifactCollapse = useCallback((artifactId: string) => {
    if (!activeThreadId) return;
    setThreads(prev => {
      const thread = prev[activeThreadId];
      return {
        ...prev,
        [activeThreadId]: {
          ...thread,
          artifacts: thread.artifacts.map(a =>
            a.id === artifactId ? { ...a, isCollapsed: !a.isCollapsed } : a
          ),
        },
      };
    });
  }, [activeThreadId]);

  const updateArtifactData = useCallback((artifactId: string, data: Record<string, any>) => {
    if (!activeThreadId) return;
    setThreads(prev => {
      const thread = prev[activeThreadId];
      return {
        ...prev,
        [activeThreadId]: {
          ...thread,
          artifacts: thread.artifacts.map(a =>
            a.id === artifactId
              ? { ...a, data, version: a.version + 1, updatedAt: new Date() }
              : a
          ),
        },
      };
    });
  }, [activeThreadId]);

  const focusArtifact = useCallback((artifactId: string) => {
    if (!activeThreadId) return;
    setThreads(prev => {
      const thread = prev[activeThreadId];
      return {
        ...prev,
        [activeThreadId]: {
          ...thread,
          artifacts: thread.artifacts.map(a =>
            a.id === artifactId ? { ...a, isCollapsed: false } : a
          ),
        },
      };
    });
    setFocusedArtifactId(artifactId);
    setTimeout(() => {
      document.getElementById(`artifact-${artifactId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, [activeThreadId]);

  return {
    activeThread,
    activeThreadId,
    isTyping,
    sidebarCollapsed,
    focusedArtifactId,
    selectThread,
    createThread,
    sendMessage,
    handleActionChip,
    handleArtifactAction,
    toggleArtifactCollapse,
    updateArtifactData,
    focusArtifact,
    setSidebarCollapsed,
  };
}
