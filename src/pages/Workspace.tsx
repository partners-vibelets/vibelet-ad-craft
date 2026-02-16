import { useState, useRef, useEffect } from 'react';
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';
import { ArtifactStream } from '@/components/workspace/ArtifactStream';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Sparkles, Send, ArrowUp, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThreadMessage } from '@/types/workspace';

const suggestionChips = [
  '📊 Plan a new campaign',
  '🎨 Create ad creative',
  '📈 Check performance',
  '🔍 Run a 30-day audit',
  '⚡ Set up automation rule',
  '🎯 Optimize targeting',
];

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
    updateArtifactData,
    focusArtifact,
    setSidebarCollapsed,
  } = useWorkspace();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [activeThread?.messages, isTyping]);

  const handleChipClick = (chip: string) => {
    // Strip emoji prefix
    const text = chip.replace(/^[^\w]*\s/, '');
    sendMessage(text);
  };

  const showSuggestions = activeThread && activeThread.messages.length <= 1 && !isTyping;

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <WorkspaceSidebar
        activeThreadId={activeThreadId}
        onSelectThread={selectThread}
        onNewThread={createThread}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        activeWorkspaceId="ws-1"
        onSwitchWorkspace={() => {}}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Minimal thread header */}
        {activeThread && (
          <div className="h-11 border-b border-border/30 flex items-center px-5 gap-2.5 shrink-0">
            <span className="text-sm font-medium text-foreground truncate">{activeThread.title}</span>
            <span className="text-[10px] text-muted-foreground/60 ml-auto">
              {activeThread.artifacts.length > 0 && `${activeThread.artifacts.length} artifact${activeThread.artifacts.length !== 1 ? 's' : ''}`}
            </span>
          </div>
        )}

        {/* Scrollable conversation + artifacts */}
        <div className="flex-1 overflow-hidden relative">
          {activeThread ? (
            <>
              <div ref={scrollRef} className="h-full overflow-y-auto">
                <div className="max-w-[720px] mx-auto px-5 pt-6 pb-48 space-y-5">
                  {activeThread.messages.map(msg => {
                    const relatedArtifacts = msg.artifactIds
                      ? activeThread.artifacts.filter(a => msg.artifactIds!.includes(a.id))
                      : [];

                    return (
                      <div key={msg.id} className="space-y-3">
                        <MessageBubble msg={msg} />
                        {relatedArtifacts.length > 0 && (
                          <div className={cn(msg.role === 'assistant' ? "pl-9" : "")}>
                            <ArtifactStream
                              artifacts={relatedArtifacts}
                              onToggleCollapse={toggleArtifactCollapse}
                              onUpdateData={updateArtifactData}
                              focusedArtifactId={focusedArtifactId}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {isTyping && <TypingIndicator />}
                </div>
              </div>

              {/* Bottom input area — fixed */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-8 pb-4 px-4">
                <div className="max-w-[720px] mx-auto">
                  {/* Suggestion chips */}
                  {showSuggestions && (
                    <div className="flex flex-wrap gap-2 mb-3 justify-center">
                      {suggestionChips.map(chip => (
                        <button
                          key={chip}
                          onClick={() => handleChipClick(chip)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground bg-muted/50 border border-border/50 hover:bg-muted hover:text-foreground hover:border-border transition-all"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}

                  <ChatInput onSendMessage={sendMessage} />
                </div>
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
};

// --- Message bubble ---
const MessageBubble = ({ msg }: { msg: ThreadMessage }) => (
  <div className={cn("flex gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
    {msg.role === 'assistant' && (
      <div className="w-7 h-7 rounded-full bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
      </div>
    )}
    <div className={cn(
      "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
      msg.role === 'user'
        ? "bg-primary text-primary-foreground max-w-[75%] rounded-br-sm"
        : "text-foreground max-w-[85%]"
    )}>
      <p className="whitespace-pre-wrap">{msg.content}</p>
    </div>
  </div>
);

// --- Typing indicator ---
const TypingIndicator = () => (
  <div className="flex gap-3">
    <div className="w-7 h-7 rounded-full bg-primary/8 flex items-center justify-center shrink-0">
      <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
    </div>
    <div className="px-4 py-3">
      <div className="flex gap-1.5">
        {[0, 150, 300].map(delay => (
          <span
            key={delay}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
);

// --- GPT-style input ---
const ChatInput = ({ onSendMessage }: { onSendMessage: (content: string) => void }) => {
  const [input, setInput] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
    if (ref.current) ref.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const autoResize = () => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = Math.min(ref.current.scrollHeight, 150) + 'px';
    }
  };

  return (
    <div className="relative">
      <div className={cn(
        "flex items-end gap-2 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3",
        "shadow-sm focus-within:border-primary/30 focus-within:shadow-md transition-all"
      )}>
        <button className="h-8 w-8 shrink-0 flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground transition-colors rounded-lg">
          <Paperclip className="w-4 h-4" />
        </button>
        <textarea
          ref={ref}
          value={input}
          onChange={e => { setInput(e.target.value); autoResize(); }}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything — campaigns, creatives, performance, automation..."
          rows={1}
          className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground/60 min-h-[32px] max-h-[150px] py-1"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
            input.trim()
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "bg-muted/50 text-muted-foreground/30"
          )}
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// --- Empty state ---
const EmptyState = () => (
  <div className="h-full flex flex-col items-center justify-center text-center px-8">
    <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
      <Sparkles className="w-7 h-7 text-primary" />
    </div>
    <h2 className="text-base font-medium text-foreground mb-1.5">Select a thread</h2>
    <p className="text-sm text-muted-foreground max-w-xs">
      Pick a thread from the sidebar or create a new one to start.
    </p>
  </div>
);

export default Workspace;
