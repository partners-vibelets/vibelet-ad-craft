import { MessageSquare, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThreadItem {
  id: string;
  title: string;
  status: string;
  updatedAt: Date;
}

interface ThreadsActivityProps {
  threads: ThreadItem[];
  onResume: (threadId: string) => void;
}

export const ThreadsActivity = ({ threads, onResume }: ThreadsActivityProps) => {
  const recent = threads.slice(0, 3);

  if (recent.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">Recent Threads</h3>
      </div>

      <div className="space-y-1.5">
        {recent.map(thread => (
          <div
            key={thread.id}
            className="flex items-center gap-3 rounded-xl border border-border/30 bg-card/50 px-3.5 py-2.5 hover:bg-muted/30 hover:border-border/50 transition-all cursor-pointer group"
            onClick={() => onResume(thread.id)}
          >
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{thread.title}</p>
              <p className="text-[10px] text-muted-foreground">
                {thread.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
            <button className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-medium text-primary px-2 py-1 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all">
              <Play className="w-3 h-3" /> Resume
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
