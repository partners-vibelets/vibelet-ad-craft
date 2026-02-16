import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit3, Copy, Trash2, MoreHorizontal, CheckCircle2, Clock, FileText, BarChart3, Zap, Settings2, Image } from 'lucide-react';
import { Artifact, ArtifactType } from '@/types/workspace';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ArtifactRendererProps {
  artifact: Artifact;
  onToggleCollapse: (id: string) => void;
  onEdit?: (id: string) => void;
}

const artifactIcons: Record<ArtifactType, React.ReactNode> = {
  'campaign-plan': <FileText className="w-4 h-4" />,
  'creative-image': <Image className="w-4 h-4" />,
  'creative-video': <Image className="w-4 h-4" />,
  'performance-report': <BarChart3 className="w-4 h-4" />,
  'audit-report': <BarChart3 className="w-4 h-4" />,
  'ai-signals': <Zap className="w-4 h-4" />,
  'automation-rule': <Settings2 className="w-4 h-4" />,
  'ad-preview': <Image className="w-4 h-4" />,
};

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  ready: 'bg-secondary/20 text-secondary',
  published: 'bg-primary/20 text-primary',
  archived: 'bg-muted text-muted-foreground',
};

export const ArtifactRenderer = ({ artifact, onToggleCollapse, onEdit }: ArtifactRendererProps) => {
  const renderBody = () => {
    switch (artifact.type) {
      case 'campaign-plan':
        return <CampaignPlanBody data={artifact.data} />;
      case 'performance-report':
        return <PerformanceBody data={artifact.data} />;
      case 'ai-signals':
        return <SignalBody data={artifact.data} />;
      default:
        return <pre className="text-xs text-muted-foreground overflow-auto">{JSON.stringify(artifact.data, null, 2)}</pre>;
    }
  };

  return (
    <div className={cn(
      "border border-border rounded-xl overflow-hidden transition-all",
      "bg-card hover:shadow-md",
      artifact.isCollapsed ? "hover:border-primary/30" : "shadow-sm"
    )}>
      {/* Header */}
      <button
        onClick={() => onToggleCollapse(artifact.id)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
      >
        {artifact.isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <span className="text-primary/70">{artifactIcons[artifact.type]}</span>
        <span className="font-medium text-sm text-foreground flex-1 truncate">{artifact.title}</span>
        <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", statusColors[artifact.status])}>
          {artifact.status}
        </Badge>
        <span className="text-[10px] text-muted-foreground">v{artifact.version}</span>
      </button>

      {/* Body */}
      {!artifact.isCollapsed && (
        <div className="px-4 pb-4 border-t border-border/50">
          <div className="pt-3">{renderBody()}</div>
          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-border/30">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground gap-1.5" onClick={() => onEdit?.(artifact.id)}>
              <Edit3 className="w-3 h-3" /> Edit
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground gap-1.5">
              <Copy className="w-3 h-3" /> Duplicate
            </Button>
            <div className="flex-1" />
            <span className="text-[10px] text-muted-foreground">
              Updated {artifact.updatedAt.toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-components for artifact types ---

const CampaignPlanBody = ({ data }: { data: Record<string, any> }) => (
  <div className="grid grid-cols-2 gap-3">
    <InfoField label="Objective" value={data.objective} />
    <InfoField label="Platform" value={data.platform} />
    <InfoField label="Daily Budget" value={`$${data.budget?.daily}`} />
    <InfoField label="Total Budget" value={`$${data.budget?.total}`} />
    <InfoField label="Age Range" value={data.targeting?.ageRange} />
    <InfoField label="Ad Sets" value={data.adSets} />
    <InfoField label="Interests" value={data.targeting?.interests?.join(', ')} className="col-span-2" />
    <InfoField label="Locations" value={data.targeting?.locations?.join(', ')} />
    <InfoField label="Schedule" value={`${data.schedule?.startDate} → ${data.schedule?.endDate}`} />
  </div>
);

const PerformanceBody = ({ data }: { data: Record<string, any> }) => (
  <div className="space-y-3">
    <p className="text-xs text-muted-foreground">{data.dateRange}</p>
    <div className="grid grid-cols-3 gap-2">
      <MetricCard label="Spent" value={`$${data.metrics?.spent}`} />
      <MetricCard label="Revenue" value={`$${data.metrics?.revenue}`} />
      <MetricCard label="ROI" value={`${data.metrics?.roi}x`} accent />
      <MetricCard label="Conversions" value={data.metrics?.conversions} />
      <MetricCard label="CTR" value={`${data.metrics?.ctr}%`} />
      <MetricCard label="Impressions" value={data.metrics?.impressions?.toLocaleString()} />
    </div>
    {data.recommendations?.length > 0 && (
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">Recommendations</p>
        {data.recommendations.map((r: string, i: number) => (
          <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-secondary mt-0.5 shrink-0" />
            <span>{r}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const SignalBody = ({ data }: { data: Record<string, any> }) => {
  const severityColors = { high: 'text-destructive', medium: 'text-amber-500', low: 'text-muted-foreground' };
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={cn("text-[10px]", severityColors[data.severity as keyof typeof severityColors])}>
          {data.severity} priority
        </Badge>
        <span className="text-xs text-muted-foreground">{data.metric} {data.change > 0 ? '+' : ''}{data.change}%</span>
      </div>
      <p className="text-sm text-foreground">{data.description}</p>
      <div className="bg-primary/5 border border-primary/10 rounded-lg px-3 py-2">
        <p className="text-xs font-medium text-primary">💡 {data.suggestedAction}</p>
      </div>
    </div>
  );
};

const InfoField = ({ label, value, className }: { label: string; value: any; className?: string }) => (
  <div className={className}>
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-sm text-foreground">{value}</p>
  </div>
);

const MetricCard = ({ label, value, accent }: { label: string; value: any; accent?: boolean }) => (
  <div className="bg-muted/30 rounded-lg p-2.5 text-center">
    <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
    <p className={cn("text-sm font-semibold", accent ? "text-secondary" : "text-foreground")}>{value}</p>
  </div>
);
