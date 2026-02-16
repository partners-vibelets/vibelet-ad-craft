import { useState } from 'react';
import { Plus, MessageSquare, ChevronDown, ChevronRight, ChevronLeft, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { mockWorkspaces, mockThreads } from '@/data/workspaceMockData';

interface WorkspaceSidebarProps {
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewThread: (workspaceId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const WorkspaceSidebar = ({
  activeThreadId,
  onSelectThread,
  onNewThread,
  isCollapsed,
  onToggleCollapse,
}: WorkspaceSidebarProps) => {
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(
    new Set(mockWorkspaces.map(w => w.id))
  );
  const [searchQuery, setSearchQuery] = useState('');

  const toggleWorkspace = (wsId: string) => {
    setExpandedWorkspaces(prev => {
      const next = new Set(prev);
      next.has(wsId) ? next.delete(wsId) : next.add(wsId);
      return next;
    });
  };

  const filteredThreads = (wsId: string) =>
    mockThreads
      .filter(t => t.workspaceId === wsId)
      .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isCollapsed) {
    return (
      <div className="w-14 bg-card border-r border-border flex flex-col items-center py-4 gap-3 shrink-0">
        <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="text-muted-foreground hover:text-foreground">
          <MessageSquare className="w-5 h-5" />
        </Button>
        <div className="w-8 h-px bg-border" />
        {mockWorkspaces.map(ws => (
          <button
            key={ws.id}
            onClick={onToggleCollapse}
            className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground hover:bg-accent transition-colors"
            title={ws.name}
          >
            {ws.name.charAt(0)}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col shrink-0">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <span className="font-semibold text-sm text-foreground">Workspaces</span>
        <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="h-7 w-7 text-muted-foreground">
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search threads..."
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {mockWorkspaces.map(ws => (
          <div key={ws.id} className="mb-1">
            <button
              onClick={() => toggleWorkspace(ws.id)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {expandedWorkspaces.has(ws.id) ? (
                <ChevronDown className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="truncate">{ws.name}</span>
            </button>

            {expandedWorkspaces.has(ws.id) && (
              <div className="ml-3 mt-0.5 space-y-0.5">
                {filteredThreads(ws.id).map(thread => (
                  <button
                    key={thread.id}
                    onClick={() => onSelectThread(thread.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors text-left",
                      activeThreadId === thread.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{thread.title}</span>
                  </button>
                ))}
                <button
                  onClick={() => onNewThread(ws.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span>New thread</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground gap-2">
          <Settings className="w-3.5 h-3.5" />
          Settings
        </Button>
      </div>
    </div>
  );
};
