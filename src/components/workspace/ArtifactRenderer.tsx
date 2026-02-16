import { useState } from 'react';
import {
  ChevronDown, ChevronRight, Edit3, Copy, Check, X,
  FileText, BarChart3, Zap, Settings2, Image as ImageIcon,
  Video, CheckCircle2, Send, Activity, AlertTriangle, Play, Pause,
  TrendingUp, Lightbulb, Target, Clock, Package, ScrollText, User,
  Loader2, Star, ShoppingBag, Download, RefreshCw, Wand2, ArrowRight, Eye,
  Facebook, Smartphone, Monitor, Globe, Shield, ExternalLink, Layers,
  CircleAlert, DollarSign, Gauge, Flame, ArrowUpRight, ChevronUp
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
  'creative-result': 'Results',
  'facebook-connect': 'Facebook',
  'campaign-config': 'Config',
  'device-preview': 'Preview',
  'ai-signals-dashboard': 'Signals',
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
  'creative-result': <Eye className="w-3.5 h-3.5" />,
  'facebook-connect': <Facebook className="w-3.5 h-3.5" />,
  'campaign-config': <Layers className="w-3.5 h-3.5" />,
  'device-preview': <Smartphone className="w-3.5 h-3.5" />,
  'ai-signals-dashboard': <Zap className="w-3.5 h-3.5" />,
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
    case 'creative-result': return <CreativeResultBody artifact={artifact} onUpdateData={onUpdateData} />;
    case 'facebook-connect': return <FacebookConnectBody artifact={artifact} onArtifactAction={onArtifactAction} />;
    case 'campaign-config': return <CampaignConfigBody artifact={artifact} onUpdateData={onUpdateData} />;
    case 'device-preview': return <DevicePreviewBody artifact={artifact} onUpdateData={onUpdateData} />;
    case 'ai-signals-dashboard': return <AISignalsDashboardBody artifact={artifact} onArtifactAction={onArtifactAction} />;
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
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                {out.status === 'ready' ? <><CheckCircle2 className="w-3 h-3 text-secondary" /> Ready</> : <><Loader2 className="w-3 h-3 animate-spin" /> Generating</>}
              </span>
              {out.duration && <span className="text-[10px] text-muted-foreground">{out.duration}</span>}
              <span className="text-[10px] text-muted-foreground">{out.dimensions}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ========== CREATIVE RESULT PREVIEW ==========

const CreativeResultBody = ({ artifact, onUpdateData }: { artifact: Artifact; onUpdateData: (id: string, d: Record<string, any>) => void }) => {
  const d = artifact.data;
  const outputs = d.outputs || [];
  const selectedIndex = d.selectedIndex || 0;
  const selectedOutput = outputs[selectedIndex];

  if (outputs.length === 0) return null;

  const isVideo = selectedOutput?.type === 'video';

  return (
    <div className="space-y-4">
      {/* Main preview */}
      <div className="rounded-xl overflow-hidden border border-border/40 bg-muted/20">
        <div className="aspect-video relative">
          {isVideo ? (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <img
                src={selectedOutput.thumbnailUrl || selectedOutput.url}
                alt={selectedOutput.label}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                </div>
              </div>
              {selectedOutput.duration && (
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {selectedOutput.duration}
                </span>
              )}
            </div>
          ) : (
            <img
              src={selectedOutput.url}
              alt={selectedOutput.label}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>

      {/* Variation thumbnails */}
      {outputs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {outputs.map((out: any, idx: number) => (
            <button
              key={out.id}
              onClick={() => onUpdateData(artifact.id, { ...d, selectedIndex: idx })}
              className={cn(
                "relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all",
                idx === selectedIndex
                  ? "border-primary ring-1 ring-primary/20"
                  : "border-border/40 hover:border-border"
              )}
            >
              <img
                src={out.thumbnailUrl || out.url}
                alt={out.label}
                className="w-full h-full object-cover"
              />
              {out.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Info & actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{selectedOutput.label}</p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
            {isVideo ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
            {selectedOutput.dimensions} · {selectedOutput.format.toUpperCase()}
            {selectedOutput.duration && ` · ${selectedOutput.duration}`}
          </p>
        </div>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
            <Download className="w-3 h-3" /> Download
          </Button>
          <Button size="sm" className="h-7 text-xs gap-1.5">
            <ArrowRight className="w-3 h-3" /> Use in Campaign
          </Button>
        </div>
      </div>
    </div>
  );
};

// ========== FACEBOOK CONNECT ==========

const FacebookConnectBody = ({ artifact, onArtifactAction }: { artifact: Artifact; onArtifactAction?: (artifactId: string, action: string, payload?: any) => void }) => {
  const d = artifact.data;
  const isConnected = d.status === 'connected';

  if (isConnected) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-secondary/30 shrink-0">
            {d.profileImage ? (
              <img src={d.profileImage} alt={d.accountName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center"><User className="w-5 h-5 text-primary" /></div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-foreground">{d.accountName}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Facebook account connected</p>
          </div>
          <Facebook className="w-5 h-5 text-[#1877F2]" />
        </div>

        {d.adAccounts?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ad Accounts</p>
            {d.adAccounts.map((acc: any) => (
              <div
                key={acc.id}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all",
                  acc.id === d.selectedAccountId
                    ? "border-primary/30 bg-primary/5 ring-1 ring-primary/10"
                    : "border-border/40 bg-muted/10"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full shrink-0", acc.id === d.selectedAccountId ? "bg-secondary" : "bg-muted-foreground/20")} />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{acc.name}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><Globe className="w-3 h-3" /> {acc.pageName}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5"><Shield className="w-3 h-3" /> Pixel: {acc.pixelId}</span>
                  </p>
                </div>
                {acc.id === d.selectedAccountId && <Check className="w-4 h-4 text-primary" />}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-14 h-14 rounded-2xl bg-[#1877F2]/10 flex items-center justify-center mb-3">
          <Facebook className="w-7 h-7 text-[#1877F2]" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">Connect your Facebook account</p>
        <p className="text-xs text-muted-foreground max-w-xs mb-4">
          We'll access your ad accounts, pages, and pixels to manage campaigns on your behalf.
        </p>
        <Button
          onClick={() => onArtifactAction?.(artifact.id, 'facebook-connect-auth')}
          className="gap-2"
          size="sm"
        >
          <Facebook className="w-4 h-4" />
          Connect with Facebook
        </Button>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 text-[10px] text-muted-foreground">
        <Shield className="w-3.5 h-3.5 shrink-0" />
        <span>Secure OAuth connection — we never store your password</span>
      </div>
    </div>
  );
};

// ========== CAMPAIGN CONFIG ==========

const CampaignConfigBody = ({ artifact, onUpdateData }: { artifact: Artifact; onUpdateData: (id: string, d: Record<string, any>) => void }) => {
  const d = artifact.data;
  const updateCampaign = (key: string, value: any) => onUpdateData(artifact.id, { ...d, campaignLevel: { ...d.campaignLevel, [key]: value } });
  const updateAdSet = (key: string, value: any) => onUpdateData(artifact.id, { ...d, adSetLevel: { ...d.adSetLevel, [key]: value } });
  const updateAd = (key: string, value: any) => onUpdateData(artifact.id, { ...d, adLevel: { ...d.adLevel, [key]: value } });

  return (
    <div className="space-y-4">
      {/* Campaign Level */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-primary">
          <Target className="w-3.5 h-3.5" />
          <span>Campaign Level</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pl-5">
          <EditableField label="Campaign Name" value={d.campaignLevel?.name} onSave={v => updateCampaign('name', v)} className="col-span-2" />
          <ReadOnlyField label="Objective" value={d.campaignLevel?.objective} />
          <ReadOnlyField label="Budget Type" value={d.campaignLevel?.budgetType} />
        </div>
      </div>

      {/* Ad Set Level */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-primary">
          <Layers className="w-3.5 h-3.5" />
          <span>Ad Set Level</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pl-5">
          <EditableField label="Ad Set Name" value={d.adSetLevel?.name} onSave={v => updateAdSet('name', v)} className="col-span-2" />
          <EditableField label="Budget" value={`$${d.adSetLevel?.budget}`} onSave={v => updateAdSet('budget', parseInt(v.replace('$', '')))} />
          <ReadOnlyField label="Duration" value={d.adSetLevel?.duration} />
          <ReadOnlyField label="Pixel ID" value={d.adSetLevel?.pixelId} />
          <ReadOnlyField label="Targeting" value={`${d.adSetLevel?.targeting?.ageRange}, ${d.adSetLevel?.targeting?.locations?.join(', ')}`} />
        </div>
      </div>

      {/* Ad Level */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-primary">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Ad Level</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pl-5">
          <EditableField label="Ad Name" value={d.adLevel?.name} onSave={v => updateAd('name', v)} className="col-span-2" />
          <ReadOnlyField label="Page" value={d.adLevel?.pageName} />
          <ReadOnlyField label="CTA" value={d.adLevel?.cta} />
          <EditableField label="Primary Text" value={d.adLevel?.primaryText} onSave={v => updateAd('primaryText', v)} className="col-span-2" />
          <EditableField label="Headline" value={d.adLevel?.headline} onSave={v => updateAd('headline', v)} className="col-span-2" />
          <ReadOnlyField label="Website" value={d.adLevel?.websiteUrl} />
        </div>

        {/* Creative preview */}
        {d.adLevel?.creative && (
          <div className="pl-5 mt-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Creative</p>
            <div className="rounded-lg overflow-hidden border border-border/40 w-48">
              <img src={d.adLevel.creative.url} alt={d.adLevel.creative.label} className="w-full aspect-video object-cover" />
              <div className="px-2 py-1.5 bg-muted/20">
                <p className="text-[10px] text-muted-foreground">{d.adLevel.creative.label}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ========== DEVICE PREVIEW ==========

const DevicePreviewBody = ({ artifact, onUpdateData }: { artifact: Artifact; onUpdateData: (id: string, d: Record<string, any>) => void }) => {
  const d = artifact.data;
  const isMobile = d.activeDevice === 'mobile';
  const ad = d.ad || {};

  return (
    <div className="space-y-3">
      {/* Device toggle */}
      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/30 w-fit">
        <button
          onClick={() => onUpdateData(artifact.id, { ...d, activeDevice: 'mobile' })}
          className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all", isMobile ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          <Smartphone className="w-3.5 h-3.5" /> Mobile
        </button>
        <button
          onClick={() => onUpdateData(artifact.id, { ...d, activeDevice: 'desktop' })}
          className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all", !isMobile ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          <Monitor className="w-3.5 h-3.5" /> Desktop
        </button>
      </div>

      {/* Device mockup */}
      <div className={cn("mx-auto border border-border/60 rounded-2xl overflow-hidden bg-card shadow-lg", isMobile ? "w-[260px]" : "w-full max-w-[440px]")}>
        {/* Facebook header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/30">
          <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center">
            <Facebook className="w-4 h-4 text-[#1877F2]" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-foreground">{ad.pageName}</p>
            <p className="text-[9px] text-muted-foreground">Sponsored · 🌍</p>
          </div>
        </div>

        {/* Primary text */}
        <div className="px-3 py-2">
          <p className="text-xs text-foreground leading-relaxed">{ad.primaryText}</p>
        </div>

        {/* Image */}
        <div className="aspect-[4/3] bg-muted/20 overflow-hidden">
          <img src={ad.imageUrl} alt="Ad preview" className="w-full h-full object-cover" />
        </div>

        {/* CTA bar */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border/30 bg-muted/10">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-muted-foreground uppercase truncate">{ad.websiteUrl}</p>
            <p className="text-[11px] font-semibold text-foreground truncate">{ad.headline}</p>
          </div>
          <div className="px-3 py-1.5 rounded-md bg-muted text-xs font-semibold text-foreground shrink-0">
            {ad.cta}
          </div>
        </div>

        {/* Reactions bar */}
        <div className="flex items-center gap-3 px-3 py-1.5 border-t border-border/20 text-[10px] text-muted-foreground">
          <span>👍 Like</span>
          <span>💬 Comment</span>
          <span>↗️ Share</span>
        </div>
      </div>
    </div>
  );
};

// ========== AI SIGNALS DASHBOARD ==========

const healthScoreColor = (score: number) => score >= 70 ? 'text-secondary' : score >= 40 ? 'text-amber-500' : 'text-destructive';
const healthScoreBg = (score: number) => score >= 70 ? 'bg-secondary/15' : score >= 40 ? 'bg-amber-500/10' : 'bg-destructive/10';
const healthScoreRing = (score: number) => score >= 70 ? 'stroke-secondary' : score >= 40 ? 'stroke-amber-500' : 'stroke-destructive';

const AISignalsDashboardBody = ({ artifact, onArtifactAction }: { artifact: Artifact; onArtifactAction?: (artifactId: string, action: string, payload?: any) => void }) => {
  const d = artifact.data;
  const healthScore = d.healthScore || 62;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  return (
    <div className="space-y-5">
      {/* Account Health */}
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
            <circle cx="50" cy="50" r="40" fill="none" strokeWidth="6" strokeLinecap="round"
              className={healthScoreRing(healthScore)}
              style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-xl font-bold", healthScoreColor(healthScore))}>{healthScore}</span>
            <span className="text-[9px] text-muted-foreground">Health</span>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          <p className="text-sm font-medium text-foreground">{d.verdict || 'Your account needs attention'}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{d.verdictDetail || 'Budget allocation is off, some ads are fatigued, and there\'s wasted spend on non-converting areas.'}</p>
          <div className="flex gap-2 mt-2">
            {d.healthMetrics?.map((m: any) => (
              <div key={m.label} className={cn("px-2 py-1 rounded-md text-[10px] font-medium", m.status === 'good' ? 'bg-secondary/10 text-secondary' : 'bg-amber-500/10 text-amber-500')}>
                {m.label}: {m.value}%
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why This Is Happening */}
      {d.reasons?.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CircleAlert className="w-3.5 h-3.5 text-amber-500" />
            <p className="text-xs font-medium text-foreground">Why This Is Happening</p>
          </div>
          <div className="space-y-2">
            {d.reasons.map((reason: any) => {
              const iconMap: Record<string, React.ReactNode> = {
                budget: <DollarSign className="w-4 h-4" />,
                fatigue: <Flame className="w-4 h-4" />,
                waste: <AlertTriangle className="w-4 h-4" />,
              };
              return (
                <div key={reason.id} className="p-3 rounded-xl bg-muted/20 border border-border/40 space-y-1.5">
                  <div className="flex items-start gap-2.5">
                    <span className="text-amber-500 mt-0.5 shrink-0">{iconMap[reason.icon] || <CircleAlert className="w-4 h-4" />}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{reason.title}</p>
                      {reason.explanation?.map((ex: string, i: number) => (
                        <p key={i} className="text-xs text-muted-foreground mt-0.5">• {ex}</p>
                      ))}
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span>{reason.dataWindow}</span>
                        <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {reason.confidence}% confidence</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Stack */}
      {d.actions?.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs font-medium text-foreground">Recommended Actions</p>
          </div>
          <div className="space-y-2">
            {d.actions.map((action: any, idx: number) => (
              <div key={action.id} className="p-3 rounded-xl border border-border/40 bg-card/60 space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">{idx + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{action.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px]">
                      <span className="text-secondary font-medium flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> {action.impact}</span>
                      <span className="text-muted-foreground">Risk: {action.risk}</span>
                      <span className="text-muted-foreground flex items-center gap-0.5"><Gauge className="w-3 h-3" /> {action.confidence}%</span>
                    </div>
                    {action.whyWorks?.length > 0 && (
                      <div className="mt-1.5 space-y-0.5">
                        {action.whyWorks.map((w: string, i: number) => (
                          <p key={i} className="text-[11px] text-muted-foreground">• {w}</p>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-amber-500/80 mt-1.5 italic">{action.consequence}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5 text-primary border-primary/20 hover:bg-primary/5"
                    onClick={() => onArtifactAction?.(artifact.id, 'act-on-signal', { actionId: action.id, title: action.title, impact: action.impact, confidence: action.confidence })}
                  >
                    <Zap className="w-3 h-3" /> Act on this signal
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Waste & Risk */}
      {d.wasteItems?.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <p className="text-xs font-medium text-foreground">Wasted Spend</p>
          </div>
          <div className="space-y-1.5">
            {d.wasteItems.map((w: any) => (
              <div key={w.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15">
                <DollarSign className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{w.name}</p>
                  <p className="text-[10px] text-muted-foreground">{w.reason}</p>
                </div>
                <span className="text-sm font-semibold text-amber-500">{w.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Alerts */}
      {d.liveAlerts?.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs font-medium text-foreground">Live Signals</p>
          </div>
          <div className="space-y-1.5">
            {d.liveAlerts.map((alert: any) => (
              <div key={alert.id} className={cn(
                "p-3 rounded-xl border space-y-1.5",
                alert.type === 'positive' ? "bg-secondary/5 border-secondary/20" : "bg-amber-500/5 border-amber-500/20"
              )}>
                <div className="flex items-start gap-2">
                  {alert.type === 'positive'
                    ? <TrendingUp className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                    : <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  }
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{alert.time} · {alert.metric} {alert.change}</p>
                  </div>
                </div>
                {alert.suggestedAction && (
                  <div className="ml-5.5 flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/10">
                    <div>
                      <p className="text-xs text-primary font-medium">💡 {alert.suggestedAction.title}</p>
                      <p className="text-[10px] text-muted-foreground">{alert.suggestedAction.impact}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] text-primary hover:bg-primary/10"
                      onClick={() => onArtifactAction?.(artifact.id, 'act-on-signal', {
                        actionId: alert.id,
                        title: alert.suggestedAction.title,
                        impact: alert.suggestedAction.impact,
                        confidence: 85,
                      })}
                    >
                      <Zap className="w-3 h-3 mr-1" /> Act
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Wins */}
      {d.quickWins?.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-secondary" />
            <p className="text-xs font-medium text-foreground">Quick Wins</p>
          </div>
          <div className="space-y-1.5">
            {d.quickWins.map((qw: any) => (
              <div key={qw.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted/20 border border-border/40">
                <div className="flex-1">
                  <p className="text-sm text-foreground">{qw.title}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span className="text-secondary font-medium">{qw.impact}</span>
                    <span>· {qw.timeToApply}</span>
                    <span>· {qw.confidence}% confidence</span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary"
                  onClick={() => onArtifactAction?.(artifact.id, 'act-on-signal', {
                    actionId: qw.id,
                    title: qw.title,
                    impact: qw.impact,
                    confidence: qw.confidence,
                  })}
                >
                  <Zap className="w-3 h-3 mr-1" /> Act
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
