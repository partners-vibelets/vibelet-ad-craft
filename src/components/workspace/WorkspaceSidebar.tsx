import { useState } from 'react';
import {
  Plus, MessageSquare, ChevronDown, ChevronRight, ChevronLeft,
  Search, Settings, Image, Zap, Workflow, Link2, Building2,
  Sparkles, PanelLeftClose, PanelLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { mockWorkspaces, mockThreads } from '@/data/workspaceMockData';

type SidebarSection = 'threads' | 'creatives' | 'signals' | 'rules' | 'accounts';

interface WorkspaceSidebarProps {
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewThread: (workspaceId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeWorkspaceId: string;
  onSwitchWorkspace: (id: string) => void;
  onSignalsClick?: () => void;
}

const sectionConfig: { id: SidebarSection; label: string; icon: React.ElementType }[] = [
  { id: 'threads', label: 'Threads', icon: MessageSquare },
  { id: 'creatives', label: 'Creative Library', icon: Image },
  { id: 'signals', label: 'AI Signals', icon: Zap },
  { id: 'rules', label: 'Rules & Automation', icon: Workflow },
  { id: 'accounts', label: 'Connected Accounts', icon: Link2 },
];

// Mock data for non-thread sections
const mockCreatives = [
  { id: 'cr-1', name: 'Spring Banner v2', type: 'image', date: 'Feb 14' },
  { id: 'cr-2', name: 'Product Showcase', type: 'video', date: 'Feb 12' },
  { id: 'cr-3', name: 'Sale Announcement', type: 'image', date: 'Feb 10' },
];

const mockSignals = [
  { id: 'sig-1', title: 'CPA spike detected', severity: 'high' as const, time: '2h ago' },
  { id: 'sig-2', title: 'CTR improving on Ad Set 2', severity: 'low' as const, time: '5h ago' },
  { id: 'sig-3', title: 'Budget pacing ahead', severity: 'medium' as const, time: '1d ago' },
];

const mockRules = [
  { id: 'rule-1', name: 'Pause if CPA > $20', active: true },
  { id: 'rule-2', name: 'Scale budget on ROAS > 3x', active: true },
  { id: 'rule-3', name: 'Alert on spend anomaly', active: false },
];

const mockAccounts = [
  { id: 'acc-1', name: 'Facebook Ads', status: 'connected' as const, icon: '📘' },
  { id: 'acc-2', name: 'Google Ads', status: 'disconnected' as const, icon: '🔍' },
  { id: 'acc-3', name: 'TikTok Ads', status: 'disconnected' as const, icon: '🎵' },
];

const severityDot: Record<string, string> = {
  high: 'bg-amber-500',
  medium: 'bg-amber-400/60',
  low: 'bg-secondary',
};

export const WorkspaceSidebar = ({
  activeThreadId,
  onSelectThread,
  onNewThread,
  isCollapsed,
  onToggleCollapse,
  activeWorkspaceId,
  onSwitchWorkspace,
  onSignalsClick,
}: WorkspaceSidebarProps) => {
  const [activeSection, setActiveSection] = useState<SidebarSection>('threads');
  const [searchQuery, setSearchQuery] = useState('');

  const activeWs = mockWorkspaces.find(w => w.id === activeWorkspaceId) || mockWorkspaces[0];

  const filteredThreads = mockThreads
    .filter(t => t.workspaceId === activeWorkspaceId)
    .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Collapsed state — icon rail
  if (isCollapsed) {
    return (
      <div className="w-[52px] bg-card/50 border-r border-border/50 flex flex-col items-center py-3 gap-1 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors mb-2"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
        <div className="w-6 h-px bg-border/50 mb-1" />

        {sectionConfig.map(sec => (
          <button
            key={sec.id}
            onClick={() => { setActiveSection(sec.id); onToggleCollapse(); }}
            title={sec.label}
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
              activeSection === sec.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <sec.icon className="w-4 h-4" />
          </button>
        ))}

        <div className="flex-1" />
        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 bg-card/50 border-r border-border/50 flex flex-col shrink-0">
      {/* Workspace switcher + collapse */}
      <div className="px-3 py-3 border-b border-border/50">
        <div className="flex items-center justify-between mb-2">
          <button className="flex items-center gap-2 hover:bg-muted/50 rounded-lg px-2 py-1.5 transition-colors -ml-2 flex-1 min-w-0">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground truncate">{activeWs.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Section nav */}
        <div className="flex flex-col gap-0.5">
          {sectionConfig.map(sec => (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSection(sec.id);
                if (sec.id === 'signals' && onSignalsClick) onSignalsClick();
              }}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors w-full text-left",
                activeSection === sec.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              <sec.icon className="w-3.5 h-3.5 shrink-0" />
              <span>{sec.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search (threads only) */}
      {activeSection === 'threads' && (
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search threads..."
              className="pl-8 h-8 text-xs bg-muted/30 border-border/50"
            />
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {activeSection === 'threads' && (
          <div className="space-y-0.5 mt-1">
            {filteredThreads.map(thread => (
              <button
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all text-left group",
                  activeThreadId === thread.id
                    ? "bg-primary/8 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                <MessageSquare className={cn(
                  "w-3.5 h-3.5 shrink-0 transition-colors",
                  activeThreadId === thread.id ? "text-primary" : ""
                )} />
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "block truncate",
                    activeThreadId === thread.id ? "font-medium" : ""
                  )}>{thread.title}</span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">
                    {thread.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </button>
            ))}
            <button
              onClick={() => onNewThread(activeWorkspaceId)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>New thread</span>
            </button>
          </div>
        )}

        {activeSection === 'creatives' && (
          <div className="space-y-0.5 mt-1">
            {mockCreatives.map(c => (
              <div key={c.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors cursor-pointer">
                <Image className="w-3.5 h-3.5 shrink-0 text-primary/60" />
                <div className="flex-1 min-w-0">
                  <span className="block truncate">{c.name}</span>
                  <span className="text-[10px] text-muted-foreground">{c.type} · {c.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'signals' && (
          <div className="space-y-0.5 mt-1">
            {mockSignals.map(s => (
              <div key={s.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors cursor-pointer">
                <span className={cn("w-2 h-2 rounded-full shrink-0", severityDot[s.severity])} />
                <div className="flex-1 min-w-0">
                  <span className="block truncate">{s.title}</span>
                  <span className="text-[10px] text-muted-foreground">{s.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'rules' && (
          <div className="space-y-0.5 mt-1">
            {mockRules.map(r => (
              <div key={r.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors cursor-pointer">
                <Workflow className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 truncate">{r.name}</span>
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  r.active ? "bg-secondary" : "bg-muted-foreground/30"
                )} />
              </div>
            ))}
          </div>
        )}

        {activeSection === 'accounts' && (
          <div className="space-y-0.5 mt-1">
            {mockAccounts.map(a => (
              <div key={a.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors cursor-pointer">
                <span className="text-sm">{a.icon}</span>
                <span className="flex-1 truncate">{a.name}</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full",
                  a.status === 'connected'
                    ? "bg-secondary/10 text-secondary"
                    : "bg-muted text-muted-foreground"
                )}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-border/50">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};
