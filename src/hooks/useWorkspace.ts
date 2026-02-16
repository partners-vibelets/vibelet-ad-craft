import { useState, useCallback } from 'react';
import { Thread, ThreadMessage, Artifact, ArtifactType } from '@/types/workspace';
import { getThreadWithData, artifactTemplates } from '@/data/workspaceMockData';

interface SimResponse {
  content: string;
  artifacts?: { type: ArtifactType; titleSuffix?: string }[];
}

const simulatedResponses: Record<string, SimResponse> = {
  campaign: {
    content: "I've drafted a campaign blueprint. You can edit any field directly — click on a value to change it.",
    artifacts: [{ type: 'campaign-blueprint', titleSuffix: 'Campaign Blueprint' }],
  },
  creative: {
    content: "Here's a creative set with multiple ad formats. I can generate variants or videos once you're happy with the direction.",
    artifacts: [{ type: 'creative-set', titleSuffix: 'Creative Set' }],
  },
  video: {
    content: "I'm preparing a video creative with an AI avatar. You can edit the script directly in the artifact.",
    artifacts: [{ type: 'video-creative', titleSuffix: 'Video Creative' }],
  },
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
  if (lower.includes('publish') || lower.includes('go live') || lower.includes('launch')) return 'publish';
  if (lower.includes('video') || lower.includes('avatar')) return 'video';
  if (lower.includes('creative') || lower.includes('image') || lower.includes('ad design') || lower.includes('banner')) return 'creative';
  if (lower.includes('campaign') || lower.includes('plan') || lower.includes('blueprint')) return 'campaign';
  if (lower.includes('performance') || lower.includes('metrics') || lower.includes('how') || lower.includes('snapshot')) return 'performance';
  if (lower.includes('insight') || lower.includes('signal') || lower.includes('anomal')) return 'insights';
  if (lower.includes('audit') || lower.includes('review') || lower.includes('analyz')) return 'audit';
  if (lower.includes('rule') || lower.includes('automat') || lower.includes('trigger')) return 'rule';
  return 'default';
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

  const activeThread = activeThreadId ? threads[activeThreadId] : null;

  const selectThread = useCallback((id: string) => {
    setActiveThreadId(id);
    setFocusedArtifactId(null);
  }, []);

  const createThread = useCallback((workspaceId: string) => {
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

  const sendMessage = useCallback((content: string) => {
    if (!activeThreadId) return;

    const userMsg: ThreadMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setThreads(prev => ({
      ...prev,
      [activeThreadId]: {
        ...prev[activeThreadId],
        messages: [...prev[activeThreadId].messages, userMsg],
        updatedAt: new Date(),
      },
    }));

    setIsTyping(true);

    setTimeout(() => {
      const intent = detectIntent(content);
      const response = simulatedResponses[intent];
      const newArtifacts: Artifact[] = [];
      const artifactIds: string[] = [];

      if (response.artifacts) {
        response.artifacts.forEach((artSpec, idx) => {
          const artId = `art-${Date.now()}-${idx}`;
          artifactIds.push(artId);
          const template = artifactTemplates[artSpec.type];
          newArtifacts.push({
            id: artId,
            type: artSpec.type,
            title: artSpec.titleSuffix || template?.title || 'Artifact',
            status: 'draft',
            version: 1,
            isCollapsed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            data: { ...(template?.data || {}) },
          });
        });
      }

      const aiMsg: ThreadMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        artifactIds: artifactIds.length > 0 ? artifactIds : undefined,
      };

      setThreads(prev => {
        const thread = prev[activeThreadId];
        return {
          ...prev,
          [activeThreadId]: {
            ...thread,
            messages: [...thread.messages, aiMsg],
            artifacts: [...thread.artifacts, ...newArtifacts],
            updatedAt: new Date(),
          },
        };
      });

      setIsTyping(false);
      if (artifactIds.length > 0) setFocusedArtifactId(artifactIds[0]);
    }, 1200 + Math.random() * 800);
  }, [activeThreadId]);

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
    toggleArtifactCollapse,
    updateArtifactData,
    focusArtifact,
    setSidebarCollapsed,
  };
}
