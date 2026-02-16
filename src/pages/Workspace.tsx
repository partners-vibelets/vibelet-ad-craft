import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';
import { WorkspaceChat } from '@/components/workspace/WorkspaceChat';
import { ArtifactStream } from '@/components/workspace/ArtifactStream';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Sparkles } from 'lucide-react';

const Workspace = () => {
  const {
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
  } = useWorkspace();

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <WorkspaceSidebar
        activeThreadId={activeThreadId}
        onSelectThread={selectThread}
        onNewThread={createThread}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Thread header */}
        {activeThread && (
          <div className="h-12 border-b border-border bg-background/80 backdrop-blur-sm flex items-center px-4 gap-3 shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
            <h1 className="font-semibold text-sm text-foreground truncate">{activeThread.title}</h1>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {activeThread.artifacts.length} artifact{activeThread.artifacts.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Chat + inline artifacts */}
        <div className="flex-1 overflow-hidden">
          {activeThread ? (
            <div className="h-full flex flex-col">
              {/* Scrollable content: messages interleaved with artifacts */}
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                  {activeThread.messages.map(msg => {
                    const relatedArtifacts = msg.artifactIds
                      ? activeThread.artifacts.filter(a => msg.artifactIds!.includes(a.id))
                      : [];

                    return (
                      <div key={msg.id} className="space-y-3">
                        {/* Message bubble */}
                        <MessageBubble msg={msg} onArtifactClick={focusArtifact} />

                        {/* Inline artifacts after the message that spawned them */}
                        {relatedArtifacts.length > 0 && (
                          <div className="ml-10">
                            <ArtifactStream
                              artifacts={relatedArtifacts}
                              onToggleCollapse={toggleArtifactCollapse}
                              focusedArtifactId={focusedArtifactId}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                      </div>
                      <div className="bg-muted/60 rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input bar at bottom */}
              <ChatInputBar onSendMessage={sendMessage} />
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---

import { Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThreadMessage } from '@/types/workspace';
import { useState, useRef } from 'react';

const MessageBubble = ({ msg, onArtifactClick }: { msg: ThreadMessage; onArtifactClick?: (id: string) => void }) => (
  <div className={cn("flex gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
    {msg.role === 'assistant' && (
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
      </div>
    )}
    <div className={cn(
      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
      msg.role === 'user'
        ? "bg-primary text-primary-foreground rounded-br-md"
        : "bg-muted/60 text-foreground rounded-bl-md"
    )}>
      <p className="whitespace-pre-wrap">{msg.content}</p>
    </div>
    {msg.role === 'user' && (
      <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-xs font-bold text-foreground">U</span>
      </div>
    )}
  </div>
);

const ChatInputBar = ({ onSendMessage }: { onSendMessage: (content: string) => void }) => {
  const [input, setInput] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
    if (ref.current) ref.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  };

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-3">
        <div className="relative flex items-end gap-2 bg-muted/40 border border-border rounded-2xl px-3 py-2 focus-within:border-primary/50 transition-colors">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground">
            <Paperclip className="w-4 h-4" />
          </Button>
          <textarea
            ref={ref}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={() => { if (ref.current) { ref.current.style.height = 'auto'; ref.current.style.height = Math.min(ref.current.scrollHeight, 160) + 'px'; }}}
            placeholder="Plan a campaign, create an ad, check performance..."
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground min-h-[36px] max-h-[160px] py-1.5"
          />
          <Button type="submit" size="icon" disabled={!input.trim()} className="h-8 w-8 shrink-0 rounded-xl">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-1.5">
          Vibelets AI · campaigns, creatives, performance, automation — all in one thread
        </p>
      </form>
    </div>
  );
};

const EmptyState = () => (
  <div className="h-full flex flex-col items-center justify-center text-center px-8">
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
      <Sparkles className="w-8 h-8 text-primary" />
    </div>
    <h2 className="text-lg font-semibold text-foreground mb-2">Select a thread to get started</h2>
    <p className="text-sm text-muted-foreground max-w-sm">
      Choose an existing thread from the sidebar or create a new one to start working with your AI marketing assistant.
    </p>
  </div>
);

export default Workspace;
