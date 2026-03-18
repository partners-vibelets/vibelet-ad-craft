import { useState } from 'react';
import { Check, X, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const InlineEdit = ({ value, onSave, className, multiline }: { value: string; onSave: (v: string) => void; className?: string; multiline?: boolean }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <div className="flex items-start gap-1.5">
        {multiline ? (
          <textarea
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
            rows={3}
            className="flex-1 bg-muted/50 border border-primary/30 rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 resize-none transition-all"
          />
        ) : (
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { onSave(draft); setEditing(false); }
              if (e.key === 'Escape') { setDraft(value); setEditing(false); }
            }}
            className="flex-1 bg-muted/50 border border-primary/30 rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        )}
        <button onClick={() => { onSave(draft); setEditing(false); }} className="text-secondary shrink-0 p-1 rounded-md hover:bg-secondary/10 transition-colors mt-0.5"><Check className="w-3.5 h-3.5" /></button>
        <button onClick={() => { setDraft(value); setEditing(false); }} className="text-muted-foreground shrink-0 p-1 rounded-md hover:bg-muted/50 transition-colors mt-0.5"><X className="w-3.5 h-3.5" /></button>
      </div>
    );
  }

  return (
    <button
      className={cn(
        "text-left inline-flex items-start gap-1.5 px-2 py-1 -mx-2 rounded-lg",
        "border border-dashed border-border/40 hover:border-primary/40",
        "hover:bg-primary/5 transition-all cursor-text group/edit",
        className
      )}
      onClick={e => { e.stopPropagation(); setEditing(true); }}
      title="Click to edit"
    >
      <span className={cn("flex-1", multiline && "whitespace-pre-wrap")}>{value}</span>
      <Edit3 className="w-3 h-3 text-muted-foreground/40 group-hover/edit:text-primary/60 shrink-0 mt-0.5 transition-colors" />
    </button>
  );
};
