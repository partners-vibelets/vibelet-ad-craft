import { useState, useCallback } from 'react';
import { Thread, ThreadMessage, Artifact } from '@/types/workspace';
import { getThreadWithData, mockMessages, mockArtifacts } from '@/data/workspaceMockData';

const simulatedResponses: Record<string, { content: string; artifactType?: string }> = {
  campaign: {
    content: "I've drafted a campaign plan based on your request. You can review and edit the details in the artifact below.",
    artifactType: 'campaign-plan',
  },
  performance: {
    content: "Here's your latest performance report. Key metrics are highlighted and I've included recommendations.",
    artifactType: 'performance-report',
  },
  audit: {
    content: "I've completed a 30-day audit of your ad account. Check the findings and recommended actions below.",
    artifactType: 'audit-report',
  },
  default: {
    content: "Got it! I'll work on that for you. Is there anything specific you'd like me to focus on?",
  },
};

function detectIntent(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('campaign') || lower.includes('plan') || lower.includes('launch')) return 'campaign';
  if (lower.includes('performance') || lower.includes('metrics') || lower.includes('how')) return 'performance';
  if (lower.includes('audit') || lower.includes('review') || lower.includes('analyze')) return 'audit';
  return 'default';
}

export function useWorkspace() {
  const [activeThreadId, setActiveThreadId] = useState<string | null>('thread-1');
  const [threads, setThreads] = useState<Record<string, Thread>>(() => {
    const t1 = getThreadWithData('thread-1');
    const t2 = getThreadWithData('thread-2');
    const t3 = getThreadWithData('thread-3');
    const map: Record<string, Thread> = {};
    if (t1) map[t1.id] = t1;
    if (t2) map[t2.id] = t2;
    if (t3) map[t3.id] = t3;
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
        content: "Hi! I'm ready to help. What would you like to work on — campaign planning, creative generation, performance analysis, or something else?",
        timestamp: new Date(),
      }],
      artifacts: [],
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

    // Simulate AI response
    setTimeout(() => {
      const intent = detectIntent(content);
      const response = simulatedResponses[intent];
      let newArtifact: Artifact | undefined;
      const artifactIds: string[] = [];

      if (response.artifactType) {
        const artId = `art-${Date.now()}`;
        artifactIds.push(artId);
        const template = mockArtifacts.find(a => a.type === response.artifactType);
        newArtifact = {
          id: artId,
          type: response.artifactType as any,
          title: `${response.artifactType === 'campaign-plan' ? 'Campaign Plan' : response.artifactType === 'performance-report' ? 'Performance Report' : 'Audit Report'} — ${new Date().toLocaleDateString()}`,
          status: 'draft',
          version: 1,
          isCollapsed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          data: template?.data || {},
        };
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
            artifacts: newArtifact ? [...thread.artifacts, newArtifact] : thread.artifacts,
            updatedAt: new Date(),
          },
        };
      });

      setIsTyping(false);
      if (artifactIds.length > 0) setFocusedArtifactId(artifactIds[0]);
    }, 1500);
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

  const focusArtifact = useCallback((artifactId: string) => {
    if (!activeThreadId) return;
    // Expand it if collapsed
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
    // Scroll to it
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
    focusArtifact,
    setSidebarCollapsed,
  };
}
