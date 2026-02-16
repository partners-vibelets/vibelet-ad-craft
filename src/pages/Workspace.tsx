import { useState, useRef, useEffect } from 'react';
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';
import { WorkspaceHome } from '@/components/workspace/WorkspaceHome';
import { ArtifactStream } from '@/components/workspace/ArtifactStream';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Sparkles, ArrowUp, Paperclip, FileText, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThreadMessage, ActionChip } from '@/types/workspace';

const Workspace = () => {
  const {
    activeThread, activeThreadId, isTyping, sidebarCollapsed, focusedArtifactId,
    selectThread, createThread, sendMessage, handleActionChip, handleArtifactAction,
    toggleArtifactCollapse, updateArtifactData, focusArtifact, setSidebarCollapsed,
    openSignalsDashboard, archiveThread, summarizeThread, pinArtifact, allThreads,
    isHomeMode, enterWorkspaceFromHome,
  } = useWorkspace();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [activeThread?.messages, isTyping]);

  const handleHomeMessage = (message: string) => {
    enterWorkspaceFromHome(message);
  };

  const showSuggestions = activeThread && activeThread.messages.length <= 1 && !isTyping;

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <WorkspaceSidebar
        activeThreadId={activeThreadId}
        onSelectThread={selectThread}
        onNewThread={createThread}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        activeWorkspaceId="ws-1"
        onSwitchWorkspace={() => {}}
        onSignalsClick={openSignalsDashboard}
        threads={allThreads}
        onArchiveThread={archiveThread}
        onSummarizeThread={summarizeThread}
        onGoHome={() => enterWorkspaceFromHome('')}
        isHomeMode={isHomeMode}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {isHomeMode ? (
          <WorkspaceHome
            onSendMessage={handleHomeMessage}
            userName="Alex Johnson"
            credits={247}
          />
        ) : (
          <>
            {activeThread && (
              <div className="h-11 border-b border-border/30 flex items-center px-5 gap-2.5 shrink-0">
                <span className="text-sm font-medium text-foreground truncate">{activeThread.title}</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full ml-1",
                  activeThread.status === 'live-campaign' ? "bg-amber-400/15 text-amber-500" :
                  activeThread.status === 'archived' ? "bg-muted text-muted-foreground" :
                  "bg-secondary/10 text-secondary"
                )}>
                  {activeThread.status === 'live-campaign' ? 'Live' : activeThread.status === 'archived' ? 'Archived' : 'Active'}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  {activeThread.artifacts.length > 0 && (
                    <span className="text-[10px] text-muted-foreground/60 mr-2">
                      {activeThread.artifacts.length} artifact{activeThread.artifacts.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  <button
                    onClick={() => summarizeThread(activeThread.id)}
                    className="h-7 px-2 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-1"
                    title="Summarize thread"
                  >
                    <FileText className="w-3 h-3" />
                    Summarize
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-hidden relative">
              {activeThread ? (
                <>
                  <div ref={scrollRef} className="h-full overflow-y-auto">
                    <div className="max-w-[720px] mx-auto px-5 pt-6 pb-48 space-y-5">
                      {activeThread.pinnedArtifactIds.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium flex items-center gap-1 px-1">
                            <Pin className="w-3 h-3" /> Pinned
                          </span>
                          <ArtifactStream
                            artifacts={activeThread.artifacts.filter(a => activeThread.pinnedArtifactIds.includes(a.id))}
                            onToggleCollapse={toggleArtifactCollapse}
                            onUpdateData={updateArtifactData}
                            onArtifactAction={handleArtifactAction}
                            focusedArtifactId={focusedArtifactId}
                            pinnedIds={activeThread.pinnedArtifactIds}
                            onPinArtifact={pinArtifact}
                          />
                        </div>
                      )}
                      {activeThread.messages.map((msg, msgIdx) => {
                        const relatedArtifacts = msg.artifactIds
                          ? activeThread.artifacts.filter(a => msg.artifactIds!.includes(a.id))
                          : [];
                        const isLastAssistantMsg = msg.role === 'assistant' &&
                          msgIdx === activeThread.messages.length - 1;

                        return (
                          <div
                            key={msg.id}
                            className="space-y-3 animate-fade-in"
                            style={{ animationDelay: `${msgIdx * 40}ms`, animationFillMode: 'backwards' }}
                          >
                            <MessageBubble msg={msg} />
                            {relatedArtifacts.length > 0 && (
                              <div className={cn(msg.role === 'assistant' ? "pl-9" : "")}>
                                <ArtifactStream
                                  artifacts={relatedArtifacts}
                                  onToggleCollapse={toggleArtifactCollapse}
                                  onUpdateData={updateArtifactData}
                                  onArtifactAction={handleArtifactAction}
                                  focusedArtifactId={focusedArtifactId}
                                  pinnedIds={activeThread.pinnedArtifactIds}
                                  onPinArtifact={pinArtifact}
                                />
                              </div>
                            )}
                            {msg.actionChips && msg.actionChips.length > 0 && isLastAssistantMsg && !isTyping && (
                              <div className={cn(msg.role === 'assistant' ? "pl-9" : "")}>
                                <ActionChips chips={msg.actionChips} onChipClick={handleActionChip} />
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {isTyping && <TypingIndicator />}
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-8 pb-4 px-4">
                    <div className="max-w-[720px] mx-auto">
                      {showSuggestions && (
                        <div className="flex flex-wrap gap-2 mb-3 justify-center">
                          {suggestionChips.map(chip => (
                            <button
                              key={chip}
                              onClick={() => {
                                const text = chip.replace(/^[^\w]*\s/, '');
                                sendMessage(text);
                              }}
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
          </>
        )}
      </div>
    </div>
  );
};

const suggestionChips = [
  '🎬 Run full demo',
  '📊 Plan a new campaign',
  '🎨 Create ad creative',
  '📈 Check performance',
  '🔍 Run a 30-day audit',
  '⚡ Set up automation rule',
];

// --- Action chips ---
const ActionChips = ({ chips, onChipClick }: { chips: ActionChip[]; onChipClick: (action: string) => void }) => (
  <div className="flex flex-wrap gap-2 pt-1">
    {chips.map((chip, i) => (
      <button
        key={chip.action}
        onClick={() => onChipClick(chip.action)}
        style={{ animationDelay: `${i * 60}ms` }}
        className={cn(
          "px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200",
          "bg-muted/40 border border-border/50 text-foreground",
          "hover:bg-muted hover:border-primary/30 hover:shadow-sm",
          "active:scale-[0.97]",
          "animate-fade-in"
        )}
      >
        {chip.label}
      </button>
    ))}
  </div>
);

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
      <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
    </div>
  </div>
);

function formatMarkdown(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

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

// --- Chat input ---
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
