import { Rocket, Video, ImageIcon, Upload, Search, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionsGridProps {
  onAction: (action: string) => void;
}

const actions = [
  { id: 'create-campaign', label: 'Create Campaign', icon: Rocket, color: 'text-primary' },
  { id: 'generate-video', label: 'Generate Video', icon: Video, color: 'text-purple-500' },
  { id: 'generate-image', label: 'Generate Image', icon: ImageIcon, color: 'text-blue-500' },
  { id: 'upload-asset', label: 'Upload Asset', icon: Upload, color: 'text-emerald-500' },
  { id: 'run-audit', label: 'Run Audit', icon: Search, color: 'text-amber-500' },
  { id: 'connect-integrations', label: 'Integrations', icon: Link2, color: 'text-rose-500' },
];

export const QuickActionsGrid = ({ onAction }: QuickActionsGridProps) => (
  <div className="space-y-2.5">
    <h3 className="text-sm font-medium text-foreground">Quick Actions</h3>
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {actions.map((action, i) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          className={cn(
            "flex flex-col items-center gap-2 p-3.5 rounded-xl border border-border/40 bg-card/60",
            "hover:bg-muted/40 hover:border-border hover:shadow-sm transition-all active:scale-[0.97]",
            "animate-fade-in"
          )}
          style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}
        >
          <action.icon className={cn("w-5 h-5", action.color)} />
          <span className="text-[11px] font-medium text-muted-foreground text-center leading-tight">{action.label}</span>
        </button>
      ))}
    </div>
  </div>
);
