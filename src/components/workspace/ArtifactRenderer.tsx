import { useState } from 'react';
import {
  ChevronDown, ChevronRight, Edit3, Copy, Check, X,
  FileText, BarChart3, Zap, Settings2, Image as ImageIcon,
  Video, CheckCircle2, Send, Activity, AlertTriangle, Play, Pause,
  TrendingUp, Lightbulb, Target, Clock, Package, ScrollText, User,
  Loader2, Star, ShoppingBag
} from 'lucide-react';
import { Artifact, ArtifactType } from '@/types/workspace';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ArtifactRendererProps {
  artifact: Artifact;
  onToggleCollapse: (id: string) => void;
  onUpdateData: (id: string, data: Record<string, any>) => void;
  onArtifactAction?: (artifactId: string, action: string, payload?: any) => void;
}

const typeLabels: Record<ArtifactType, string> = {
  'campaign-blueprint': 'Blueprint',
  'campaign-live': 'Live Campaign',
  'creative-set': 'Creative Set',
  'creative-variant': 'Variant',
  'video-creative': 'Video',
  'performance-snapshot': 'Performance',
  'ai-insights': 'Insights',
  'automation-rule': 'Rule',
  'publish-confirmation': 'Published',
  'ai-signals-summary': 'Signals',
  'product-analysis': 'Product',
  'script-options': 'Scripts',
  'avatar-selection': 'Avatars',
  'generation-progress': 'Generating',
};

const typeIcons: Record<ArtifactType, React.ReactNode> = {
  'campaign-blueprint': <Target className="w-3.5 h-3.5" />,
  'campaign-live': <Play className="w-3.5 h-3.5" />,
  'creative-set': <ImageIcon className="w-3.5 h-3.5" />,
  'creative-variant': <ImageIcon className="w-3.5 h-3.5" />,
  'video-creative': <Video className="w-3.5 h-3.5" />,
  'performance-snapshot': <BarChart3 className="w-3.5 h-3.5" />,
  'ai-insights': <Lightbulb className="w-3.5 h-3.5" />,
  'automation-rule': <Settings2 className="w-3.5 h-3.5" />,
  'publish-confirmation': <CheckCircle2 className="w-3.5 h-3.5" />,
  'ai-signals-summary': <Activity className="w-3.5 h-3.5" />,
  'product-analysis': <ShoppingBag className="w-3.5 h-3.5" />,
  'script-options': <ScrollText className="w-3.5 h-3.5" />,
  'avatar-selection': <User className="w-3.5 h-3.5" />,
  'generation-progress': <Loader2 className="w-3.5 h-3.5" />,
};

const statusStyles: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  live: 'bg-secondary/15 text-secondary',
  archived: 'bg-muted/60 text-muted-foreground/60',
};

export const ArtifactRenderer = ({ artifact, onToggleCollapse, onUpdateData, onArtifactAction }: ArtifactRendererProps) => {
  return (
    <div className={cn(
      "border border-border/60 rounded-xl overflow-hidden transition-all duration-200",
      "bg-card/80 backdrop-blur-sm",
      !artifact.isCollapsed && "shadow-sm"
    )}>
      {/* Header */}
      <button
        onClick={() => onToggleCollapse(artifact.id)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted/20 transition-colors text-left"
      >
        {artifact.isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}
        <span className="text-primary/60">{typeIcons[artifact.type]}</span>
        <span className="font-medium text-[13px] text-foreground flex-1 truncate">{artifact.title}</span>
        <span className="text-[10px] text-muted-foreground/60 mr-1">{typeLabels[artifact.type]}</span>
        <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 font-normal", statusStyles[artifact.status])}>
          {artifact.status}
        </Badge>
        <span className="text-[10px] text-muted-foreground/40 ml-0.5">v{artifact.version}</span>
      </button>

      {/* Body */}
      {!artifact.isCollapsed && (
        <div className="px-4 pb-3 border-t border-border/30">
          <div className="pt-3">
            <ArtifactBody artifact={artifact} onUpdateData={onUpdateData} onArtifactAction={onArtifactAction} />
          </div>
          <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border/20">
            <span className="text-[10px] text-muted-foreground/50">
              Updated {artifact.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Dynamic body renderer ---
const ArtifactBody = ({ artifact, onUpdateData, onArtifactAction }: { artifact: Artifact; onUpdateData: (id: string, data: Record<string, any>) => void; onArtifactAction?: (artifactId: string, action: string, payload?: any) => void }) => {
  switch (artifact.type) {
    case 'campaign-blueprint': return <CampaignBlueprintBody artifact={artifact} onUpdateData={onUpdateData} />;
    case 'campaign-live': return <CampaignLiveBody data={artifact.data} />;
    case 'creative-set': return <CreativeSetBody data={artifact.data} />;
    case 'creative-variant': return <CreativeVariantBody artifact={artifact} onUpdateData={onUpdateData} />;
    case 'video-creative': return <VideoCreativeBody artifact={artifact} onUpdateData={onUpdateData} />;
    case 'performance-snapshot': return <PerformanceBody data={artifact.data} />;
    case 'ai-insights': return <AIInsightsBody data={artifact.data} />;
    case 'automation-rule': return <AutomationRuleBody artifact={artifact} onUpdateData={onUpdateData} />;
    case 'publish-confirmation': return <PublishConfirmationBody data={artifact.data} />;
    case 'ai-signals-summary': return <AISignalsSummaryBody data={artifact.data} />;
    case 'product-analysis': return <ProductAnalysisBody data={artifact.data} />;
    case 'script-options': return <ScriptOptionsBody artifact={artifact} onUpdateData={onUpdateData} onArtifactAction={onArtifactAction} />;
    case 'avatar-selection': return <AvatarSelectionBody artifact={artifact} onUpdateData={onUpdateData} onArtifactAction={onArtifactAction} />;
    case 'generation-progress': return <GenerationProgressBody data={artifact.data} />;
    default: return <pre className="text-xs text-muted-foreground">{JSON.stringify(artifact.data, null, 2)}</pre>;
  }
};

// --- Editable field component ---
const EditableField = ({ label, value, onSave, className }: { label: string; value: string; onSave: (v: string) => void; className?: string }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <div className={cn("group", className)}>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { onSave(draft); setEditing(false); } if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
            className="flex-1 text-sm text-foreground bg-muted/30 border border-border/60 rounded-md px-2 py-1 outline-none focus:border-primary/40"
          />
          <button onClick={() => { onSave(draft); setEditing(false); }} className="text-secondary hover:text-secondary/80"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => { setDraft(value); setEditing(false); }} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("group cursor-pointer", className)} onClick={() => setEditing(true)}>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <div className="flex items-center gap-1">
        <p className="text-sm text-foreground">{value || '—'}</p>
        <Edit3 className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-opacity" />
      </div>
    </div>
  );
};

const ReadOnlyField = ({ label, value, className }: { label: string; value: any; className?: string }) => (
  <div className={className}>
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-sm text-foreground">{value}</p>
  </div>
);

const MetricCard = ({ label, value, accent }: { label: string; value: any; accent?: boolean }) => (
  <div className="bg-muted/20 rounded-lg p-2.5 text-center">
    <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
    <p className={cn("text-sm font-semibold", accent ? "text-secondary" : "text-foreground")}>{value}</p>
  </div>
);

// ========== ARTIFACT BODIES ==========

const CampaignBlueprintBody = ({ artifact, onUpdateData }: { artifact: Artifact; onUpdateData: (id: string, d: Record<string, any>) => void }) => {
  const d = artifact.data;
  const update = (key: string, value: any) => onUpdateData(artifact.id, { ...d, [key]: value });
  const updateNested = (parent: string, key: string, value: any) => onUpdateData(artifact.id, { ...d, [parent]: { ...d[parent], [key]: value } });

  return (
    <div className="grid grid-cols-2 gap-3">
      <EditableField label="Campaign Name" value={d.campaignName} onSave={v => update('campaignName', v)} className="col-span-2" />
      <ReadOnlyField label="Objective" value={d.objective} />
      <ReadOnlyField label="Platform" value={d.platform} />
      <EditableField label="Daily Budget" value={`$${d.budget?.daily}`} onSave={v => updateNested('budget', 'daily', parseInt(v.replace('$', '')))} />
      <EditableField label="Total Budget" value={`$${d.budget?.total}`} onSave={v => updateNested('budget', 'total', parseInt(v.replace('$', '')))} />
      <ReadOnlyField label="Age Range" value={d.targeting?.ageRange} />
      <ReadOnlyField label="Ad Sets" value={d.adSets} />
      <ReadOnlyField label="Locations" value={d.targeting?.locations?.join(', ')} />
      <ReadOnlyField label="Schedule" value={`${d.schedule?.startDate} → ${d.schedule?.endDate}`} />
      <EditableField label="Primary Text" value={d.primaryText} onSave={v => update('primaryText', v)} className="col-span-2" />
      <EditableField label="CTA" value={d.cta} onSave={v => update('cta', v)} />
      {d.suggestedCreatives && d.suggestedCreatives.length > 0 && (
        <div className="col-span-2 mt-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Suggested Creatives</p>
          <div className="space-y-1">
            {d.suggestedCreatives.map((cr: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <ImageIcon className="w-3.5 h-3.5 text-primary/40 mt-0.5 shrink-0" />
                <span>{cr}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CampaignLiveBody = ({ data: d }: { data: Record<string, any> }) => {
  const statusColor = d.status === 'active' ? 'text-secondary' : d.status === 'paused' ? 'text-amber-500' : 'text-muted-foreground';
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={cn("flex items-center gap-1 text-xs font-medium", statusColor)}>
          {d.status === 'active' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          {d.status}
        </span>
        <span className="text-[10px] text-muted-foreground">Published {new Date(d.publishedAt).toLocaleDateString()}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <MetricCard label="Daily Budget" value={`$${d.budget?.daily}`} />
        <MetricCard label="Spent" value={`$${d.budget?.spent}`} />
        <MetricCard label="Active Ads" value={d.activeAds} accent />
      </div>
    </div>
  );
};

const CreativeSetBody = ({ data: d }: { data: Record<string, any> }) => (
  <div className="space-y-2">
    <p className="text-xs text-muted-foreground">{d.count} creative{d.count !== 1 ? 's' : ''}</p>
    <div className="space-y-1">
      {d.items?.map((item: any) => (
        <div key={item.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/20">
          <ImageIcon className="w-3.5 h-3.5 text-primary/50" />
          <span className="text-sm text-foreground flex-1">{item.label}</span>
          <span className="text-[10px] text-muted-foreground">{item.format} · {item.dimensions}</span>
        </div>
      ))}
    </div>
  </div>
);

const CreativeVariantBody = ({ artifact, onUpdateData }: { artifact: Artifact; onUpdateData: (id: string, d: Record<string, any>) => void }) => {
  const d = artifact.data;
  const update = (key: string, value: any) => onUpdateData(artifact.id, { ...d, [key]: value });
  return (
    <div className="grid grid-cols-2 gap-3">
      <EditableField label="Headline" value={d.headline} onSave={v => update('headline', v)} className="col-span-2" />
      <EditableField label="Primary Text" value={d.primaryText} onSave={v => update('primaryText', v)} className="col-span-2" />
      <EditableField label="CTA" value={d.cta} onSave={v => update('cta', v)} />
      <ReadOnlyField label="Format" value={`${d.format} · ${d.dimensions}`} />
    </div>
  );
};

const VideoCreativeBody = ({ artifact, onUpdateData }: { artifact: Artifact; onUpdateData: (id: string, d: Record<string, any>) => void }) => {
  const d = artifact.data;
  const update = (key: string, value: any) => onUpdateData(artifact.id, { ...d, [key]: value });
  const vidStatus = d.status === 'ready' ? 'text-secondary' : d.status === 'approved' ? 'text-primary' : 'text-amber-500';
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={cn("text-xs font-medium", vidStatus)}>{d.status}</span>
        <span className="text-[10px] text-muted-foreground">{d.duration} · {d.avatar}</span>
      </div>
      <div className="bg-muted/20 rounded-lg p-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Script</p>
        <EditableField label="" value={d.script} onSave={v => update('script', v)} />
      </div>
    </div>
  );
};

const PerformanceBody = ({ data: d }: { data: Record<string, any> }) => (
  <div className="space-y-3">
    <p className="text-xs text-muted-foreground">{d.dateRange}</p>
    <div className="grid grid-cols-3 gap-2">
      <MetricCard label="Spent" value={`$${d.metrics?.spent}`} />
      <MetricCard label="Revenue" value={`$${d.metrics?.revenue}`} />
      <MetricCard label="ROI" value={`${d.metrics?.roi}x`} accent />
      <MetricCard label="Conversions" value={d.metrics?.conversions} />
      <MetricCard label="CTR" value={`${d.metrics?.ctr}%`} />
      <MetricCard label="Impressions" value={d.metrics?.impressions?.toLocaleString()} />
    </div>
    {d.recommendations?.length > 0 && (
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">Recommendations</p>
        {d.recommendations.map((r: string, i: number) => (
          <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-secondary mt-0.5 shrink-0" />
            <span>{r}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const AIInsightsBody = ({ data: d }: { data: Record<string, any> }) => {
  const severityColor: Record<string, string> = { high: 'text-amber-500', medium: 'text-amber-400/80', low: 'text-muted-foreground' };
  const typeIcon: Record<string, React.ReactNode> = {
    anomaly: <AlertTriangle className="w-3.5 h-3.5" />,
    opportunity: <TrendingUp className="w-3.5 h-3.5" />,
    trend: <Activity className="w-3.5 h-3.5" />,
  };
  return (
    <div className="space-y-2.5">
      {d.insights?.map((ins: any, i: number) => (
        <div key={i} className="bg-muted/20 rounded-lg p-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className={severityColor[ins.severity]}>{typeIcon[ins.type]}</span>
            <span className="text-sm font-medium text-foreground flex-1">{ins.title}</span>
            <span className="text-[10px] text-muted-foreground">{ins.metric} {ins.change > 0 ? '+' : ''}{ins.change}%</span>
          </div>
          <p className="text-xs text-muted-foreground">{ins.description}</p>
          <div className="bg-primary/5 border border-primary/10 rounded-md px-2.5 py-1.5">
            <p className="text-xs text-primary">💡 {ins.suggestedAction}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const AutomationRuleBody = ({ artifact, onUpdateData }: { artifact: Artifact; onUpdateData: (id: string, d: Record<string, any>) => void }) => {
  const d = artifact.data;
  const toggleActive = () => onUpdateData(artifact.id, { ...d, isActive: !d.isActive });
  const toggleAutoExec = () => onUpdateData(artifact.id, { ...d, autoExecute: !d.autoExecute });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2">
        <ReadOnlyField label="Trigger" value={d.trigger} />
        <ReadOnlyField label="Condition" value={d.condition} />
        <ReadOnlyField label="Action" value={d.action} />
      </div>
      <div className="flex items-center gap-4 pt-1">
        <button onClick={toggleActive} className="flex items-center gap-2 text-xs">
          <span className={cn("w-8 h-4 rounded-full flex items-center px-0.5 transition-colors", d.isActive ? "bg-secondary justify-end" : "bg-muted-foreground/20 justify-start")}>
            <span className="w-3 h-3 rounded-full bg-card shadow-sm" />
          </span>
          <span className="text-muted-foreground">{d.isActive ? 'Active' : 'Inactive'}</span>
        </button>
        <button onClick={toggleAutoExec} className="flex items-center gap-2 text-xs">
          <span className={cn("w-8 h-4 rounded-full flex items-center px-0.5 transition-colors", d.autoExecute ? "bg-primary justify-end" : "bg-muted-foreground/20 justify-start")}>
            <span className="w-3 h-3 rounded-full bg-card shadow-sm" />
          </span>
          <span className="text-muted-foreground">{d.autoExecute ? 'Auto-execute' : 'Manual'}</span>
        </button>
      </div>
      {d.lastTriggered && (
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Last triggered {new Date(d.lastTriggered).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

const PublishConfirmationBody = ({ data: d }: { data: Record<string, any> }) => {
  const statusColor = d.status === 'confirmed' ? 'text-secondary' : d.status === 'failed' ? 'text-destructive' : 'text-amber-500';
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className={cn("w-5 h-5", statusColor)} />
        <span className={cn("text-sm font-medium", statusColor)}>
          {d.status === 'confirmed' ? 'Published successfully' : d.status === 'pending' ? 'Awaiting confirmation' : 'Publish failed'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ReadOnlyField label="Campaign" value={d.campaignName} />
        <ReadOnlyField label="Platform" value={d.platform} />
        <ReadOnlyField label="Ads" value={d.adCount} />
        <ReadOnlyField label="Budget" value={`$${d.budget?.daily}/day · $${d.budget?.total} total`} />
      </div>
      {d.publishedAt && <p className="text-[10px] text-muted-foreground">Published {new Date(d.publishedAt).toLocaleString()}</p>}
    </div>
  );
};

const AISignalsSummaryBody = ({ data: d }: { data: Record<string, any> }) => {
  const severityDot: Record<string, string> = { high: 'bg-amber-500', medium: 'bg-amber-400/60', low: 'bg-secondary' };
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{d.period}</span>
        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-secondary" /> {d.actionsTaken} acted</span>
        <span>{d.actionsRemaining} remaining</span>
      </div>
      <div className="space-y-1.5">
        {d.signals?.map((sig: any, i: number) => (
          <div key={i} className="flex items-center gap-2.5 text-xs">
            <span className={cn("w-2 h-2 rounded-full shrink-0", severityDot[sig.severity])} />
            <span className="flex-1 text-foreground">{sig.title}</span>
            <span className="text-muted-foreground">{sig.metric} {sig.change > 0 ? '+' : ''}{sig.change}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ========== CREATIVE FLOW ARTIFACT BODIES ==========

const ProductAnalysisBody = ({ data: d }: { data: Record<string, any> }) => (
  <div className="space-y-3">
    <div className="flex gap-3">
      <div className="w-20 h-20 rounded-lg bg-muted/30 border border-border/40 flex items-center justify-center shrink-0 overflow-hidden">
        {d.imageUrl ? (
          <img src={d.imageUrl} alt={d.productName} className="w-full h-full object-cover" />
        ) : (
          <ShoppingBag className="w-6 h-6 text-muted-foreground/40" />
        )}
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-foreground">{d.productName}</p>
        <p className="text-xs text-muted-foreground">{d.category}</p>
        {d.price && <p className="text-sm font-semibold text-secondary">{d.price}</p>}
      </div>
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed">{d.description}</p>
    {d.keyFeatures?.length > 0 && (
      <div className="space-y-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Key Features</p>
        <div className="flex flex-wrap gap-1.5">
          {d.keyFeatures.map((f: string, i: number) => (
            <span key={i} className="px-2 py-0.5 rounded-full text-[11px] bg-primary/8 text-primary border border-primary/10">
              {f}
            </span>
          ))}
        </div>
      </div>
    )}
    {d.targetAudience && (
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Target Audience</p>
        <p className="text-xs text-foreground">{d.targetAudience}</p>
      </div>
    )}
  </div>
);

const ScriptOptionsBody = ({ artifact, onUpdateData, onArtifactAction }: { artifact: Artifact; onUpdateData: (id: string, d: Record<string, any>) => void; onArtifactAction?: (artifactId: string, action: string, payload?: any) => void }) => {
  const d = artifact.data;
  const selectedId = d.selectedScriptId;

  const handleSelect = (scriptId: string) => {
    const updated = {
      ...d,
      selectedScriptId: scriptId,
      scripts: d.scripts.map((s: any) => ({ ...s, selected: s.id === scriptId })),
    };
    onUpdateData(artifact.id, updated);
    onArtifactAction?.(artifact.id, 'script-selected', { scriptId });
  };

  return (
    <div className="space-y-2">
      {d.scripts?.map((script: any) => (
        <button
          key={script.id}
          onClick={() => handleSelect(script.id)}
          className={cn(
            "w-full text-left rounded-lg p-3 border transition-all duration-200",
            script.id === selectedId
              ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
              : "border-border/40 bg-muted/10 hover:border-border hover:bg-muted/20"
          )}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
              script.id === selectedId ? "border-primary bg-primary" : "border-muted-foreground/30"
            )}>
              {script.id === selectedId && <Check className="w-3 h-3 text-primary-foreground" />}
            </span>
            <span className="text-sm font-medium text-foreground">{script.label}</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal ml-auto">
              {script.style}
            </Badge>
            <span className="text-[10px] text-muted-foreground">{script.duration}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pl-7 line-clamp-3">
            {script.script}
          </p>
        </button>
      ))}
    </div>
  );
};

const AvatarSelectionBody = ({ artifact, onUpdateData, onArtifactAction }: { artifact: Artifact; onUpdateData: (id: string, d: Record<string, any>) => void; onArtifactAction?: (artifactId: string, action: string, payload?: any) => void }) => {
  const d = artifact.data;
  const selectedId = d.selectedAvatarId;

  const handleSelect = (avatarId: string) => {
    const updated = {
      ...d,
      selectedAvatarId: avatarId,
      avatars: d.avatars.map((a: any) => ({ ...a, selected: a.id === avatarId })),
    };
    onUpdateData(artifact.id, updated);
    onArtifactAction?.(artifact.id, 'avatar-selected', { avatarId });
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {d.avatars?.map((avatar: any) => (
        <button
          key={avatar.id}
          onClick={() => handleSelect(avatar.id)}
          className={cn(
            "relative rounded-xl overflow-hidden border-2 transition-all duration-200 group",
            avatar.id === selectedId
              ? "border-primary ring-2 ring-primary/20 scale-[1.02]"
              : "border-transparent hover:border-border"
          )}
        >
          <div className="aspect-[3/4] bg-muted/30 overflow-hidden">
            <img
              src={avatar.imageUrl}
              alt={avatar.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
            <p className="text-[11px] font-medium text-white">{avatar.name}</p>
            <p className="text-[9px] text-white/70">{avatar.style}</p>
          </div>
          {avatar.id === selectedId && (
            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

const GenerationProgressBody = ({ data: d }: { data: Record<string, any> }) => {
  const stageLabels: Record<string, string> = {
    analyzing: 'Analyzing product...',
    scripting: 'Writing scripts...',
    rendering: 'Rendering creatives...',
    complete: 'Generation complete!',
  };
  const isComplete = d.stage === 'complete';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {!isComplete && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
        {isComplete && <CheckCircle2 className="w-4 h-4 text-secondary" />}
        <span className="text-sm text-foreground">{stageLabels[d.stage] || 'Processing...'}</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{d.progress}%</span>
      </div>
      <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", isComplete ? "bg-secondary" : "bg-primary")}
          style={{ width: `${d.progress}%` }}
        />
      </div>
      {d.outputs?.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {d.outputs.map((out: any) => (
            <div key={out.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/20">
              {out.type === 'video' ? <Video className="w-3.5 h-3.5 text-primary/50" /> : <ImageIcon className="w-3.5 h-3.5 text-primary/50" />}
              <span className="text-sm text-foreground flex-1">{out.label}</span>
              <span className="text-[10px] text-muted-foreground">
                {out.status === 'ready' ? '✓ Ready' : '⏳ Generating'}
              </span>
              {out.duration && <span className="text-[10px] text-muted-foreground">{out.duration}</span>}
              <span className="text-[10px] text-muted-foreground">{out.format} · {out.dimensions}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
