import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown, ChevronRight, Edit3, Copy, Check, X,
  FileText, BarChart3, Zap, Settings2, Image as ImageIcon,
  Video, CheckCircle2, Send, Activity, AlertTriangle, Play, Pause,
  TrendingUp, Lightbulb, Target, Clock, Package, ScrollText, User,
  Loader2, Star, ShoppingBag, Download, RefreshCw, Wand2, ArrowRight, Eye,
  Facebook, Smartphone, Monitor, Globe, Shield, ExternalLink, Layers,
  CircleAlert, DollarSign, Gauge, Flame, ArrowUpRight, ChevronUp, Sparkles, PartyPopper
} from 'lucide-react';
import { Artifact, ArtifactType, LifecycleStage } from '@/types/workspace';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/ui/star-rating';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

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
  'data-table': 'Data',
  'post-publish-feedback': 'Feedback',
  'performance-dashboard': 'Dashboard',
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
  'data-table': <BarChart3 className="w-3.5 h-3.5" />,
  'post-publish-feedback': <PartyPopper className="w-3.5 h-3.5" />,
  'performance-dashboard': <Activity className="w-3.5 h-3.5" />,
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

      {/* Body — animated expand */}
      {!artifact.isCollapsed && (
        <div className="px-4 pb-3 border-t border-border/30 animate-fade-in" style={{ animationDuration: '0.25s' }}>
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
    case 'data-table': return <DataTableBody data={artifact.data} />;
    case 'post-publish-feedback': return <PostPublishFeedbackBody artifact={artifact} onUpdateData={onUpdateData} onArtifactAction={onArtifactAction} />;
    case 'performance-dashboard': return <PerformanceDashboardBody artifact={artifact} onUpdateData={onUpdateData} onArtifactAction={onArtifactAction} />;
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
    <div className="space-y-4">
      {/* Narrative summary */}
      <div className="text-sm text-foreground leading-relaxed">
        <p>
          <span className="font-semibold">{d.campaignName}</span> — a <span className="font-medium text-primary">{d.objective}</span> campaign
          on {d.platform}, running <span className="font-medium">{d.schedule?.startDate} → {d.schedule?.endDate}</span> with{' '}
          <span className="font-medium">{d.adSets} ad set{d.adSets !== 1 ? 's' : ''}</span>.
        </p>
      </div>

      {/* Key editable fields */}
      <div className="space-y-2">
        <EditableField label="Campaign Name" value={d.campaignName} onSave={v => update('campaignName', v)} />
        <div className="flex gap-4">
          <EditableField label="Daily Budget" value={`$${d.budget?.daily}`} onSave={v => updateNested('budget', 'daily', parseInt(v.replace('$', '')))} className="flex-1" />
          <EditableField label="Total Budget" value={`$${d.budget?.total}`} onSave={v => updateNested('budget', 'total', parseInt(v.replace('$', '')))} className="flex-1" />
        </div>
        {d.budgetStrategy && (
          <ReadOnlyField label="Budget Strategy" value={d.budgetStrategy} />
        )}
      </div>

      {/* Facebook Account Info */}
      {d.facebookAccount && (
        <div className="px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/20 space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Facebook className="w-3 h-3" /> Facebook Account</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-foreground">
              <span className="font-medium">{d.facebookAccount.name}</span> · {d.facebookAccount.pageName}
            </p>
            <Badge variant="secondary" className="text-[10px]">Pixel: {d.facebookAccount.pixelId}</Badge>
          </div>
        </div>
      )}

      {/* Targeting narrative */}
      <div className="px-3 py-2.5 rounded-lg bg-muted/15 border border-border/30 space-y-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Target className="w-3 h-3" /> Targeting</p>
        <p className="text-xs text-foreground">
          Ages {d.targeting?.ageRange} interested in <span className="font-medium">{d.targeting?.interests?.join(', ')}</span> in {d.targeting?.locations?.join(', ')}.
        </p>
      </div>

      {/* Ad Set Breakdown (multi-variant) */}
      {d.adSetBreakdown && d.adSetBreakdown.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Layers className="w-3 h-3" /> Ad Sets ({d.adSetBreakdown.length})</p>
          <div className="space-y-1.5">
            {d.adSetBreakdown.map((adSet: any, i: number) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border/20">
                <Package className="w-3.5 h-3.5 text-primary/50 shrink-0" />
                <span className="text-xs text-foreground font-medium flex-1">{adSet.name}</span>
                <span className="text-[10px] text-muted-foreground">{adSet.ads} ads · min {adSet.minBudget}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ad copy */}
      <EditableField label="Primary Text" value={d.primaryText} onSave={v => update('primaryText', v)} />
      <EditableField label="CTA" value={d.cta} onSave={v => update('cta', v)} />

      {/* Suggested creatives */}
      {d.suggestedCreatives && d.suggestedCreatives.length > 0 && (
        <div>
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

const PerformanceBody = ({ data: d }: { data: Record<string, any> }) => {
  const m = d.metrics || {};
  const roiColor = m.roi >= 3 ? 'text-secondary' : m.roi >= 1.5 ? 'text-foreground' : 'text-amber-500';

  return (
    <div className="space-y-3">
      {/* Narrative summary */}
      <div className="text-sm text-foreground leading-relaxed">
        <p>
          Over <span className="font-medium">{d.dateRange || 'the last 7 days'}</span>, you spent{' '}
          <span className="font-semibold">${m.spent?.toLocaleString()}</span> and generated{' '}
          <span className="font-semibold">${m.revenue?.toLocaleString()}</span> in revenue — a{' '}
          <span className={cn("font-bold", roiColor)}>{m.roi}x return</span>.
        </p>
        {m.conversions && (
          <p className="mt-1.5 text-muted-foreground text-xs">
            {m.conversions} conversions · {m.ctr}% click rate · {m.impressions?.toLocaleString()} impressions
          </p>
        )}
      </div>

      {/* Top campaign */}
      {d.topCampaign && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/5 border border-secondary/15 text-xs">
          <TrendingUp className="w-3.5 h-3.5 text-secondary shrink-0" />
          <span className="text-foreground">Top performer: <span className="font-medium">{d.topCampaign}</span></span>
        </div>
      )}

      {/* Recommendations as narrative */}
      {d.recommendations?.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">What I'd do next</p>
          {d.recommendations.map((r: string, i: number) => (
            <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <Lightbulb className="w-3.5 h-3.5 text-primary/50 mt-0.5 shrink-0" />
              <span>{r}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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

const ProductAnalysisBody = ({ data: d }: { data: Record<string, any> }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images: string[] = d.images || (d.imageUrl ? [d.imageUrl] : []);
  const variants: { id: string; label: string; value: string; image?: string }[] = d.variants || [];

  return (
    <div className="space-y-3">
      {/* Image carousel */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="relative w-full aspect-[4/3] rounded-lg bg-muted/30 border border-border/40 overflow-hidden">
            <img
              src={images[currentImageIndex]}
              alt={`${d.productName} — ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-background transition-colors"
                >
                  <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => (prev + 1) % images.length)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-background transition-colors"
                >
                  <ChevronDown className="w-3.5 h-3.5 rotate-90" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-background/70 backdrop-blur-sm text-[10px] text-foreground border border-border/30">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={cn(
                    "w-12 h-12 rounded-md border overflow-hidden shrink-0 transition-all",
                    idx === currentImageIndex ? "border-primary ring-1 ring-primary/30" : "border-border/40 opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product info */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{d.productName}</p>
        <p className="text-xs text-muted-foreground">{d.category}</p>
        {d.price && <p className="text-sm font-semibold text-secondary">{d.price}</p>}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{d.description}</p>

      {/* Variants */}
      {variants.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Variants Detected</p>
          <div className="flex flex-wrap gap-1.5">
            {variants.map((v) => (
              <span key={v.id} className="px-2.5 py-1 rounded-lg text-[11px] bg-muted/30 text-foreground border border-border/40 flex items-center gap-1.5">
                {v.image && <img src={v.image} alt={v.label} className="w-4 h-4 rounded-sm object-cover" />}
                <span className="font-medium">{v.label}</span>
                {v.value && <span className="text-muted-foreground">· {v.value}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

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
};

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
      {/* Narrative summary */}
      <div className="text-sm text-foreground leading-relaxed">
        <p>
          <span className="font-semibold">{d.campaignLevel?.name}</span> optimizing for{' '}
          <span className="font-medium text-primary">{d.campaignLevel?.objective}</span> at{' '}
          <span className="font-medium">${d.adSetLevel?.budget}/day</span> for {d.adSetLevel?.duration}, targeting{' '}
          ages {d.adSetLevel?.targeting?.ageRange} in {d.adSetLevel?.targeting?.locations?.join(', ')}.
        </p>
      </div>

      {/* Progressive disclosure sections */}
      <DisclosureSection icon={<Target className="w-3.5 h-3.5" />} title="Campaign" defaultOpen>
        <div className="space-y-2 pt-1">
          <EditableField label="Campaign Name" value={d.campaignLevel?.name} onSave={v => updateCampaign('name', v)} />
          <div className="flex gap-4">
            <ReadOnlyField label="Objective" value={d.campaignLevel?.objective} className="flex-1" />
            <ReadOnlyField label="Budget Type" value={d.campaignLevel?.budgetType} className="flex-1" />
          </div>
        </div>
      </DisclosureSection>

      <DisclosureSection icon={<Layers className="w-3.5 h-3.5" />} title={`Ad Set${d.adSetLevel?.adSetBreakdown ? 's (' + d.adSetLevel.adSetBreakdown.length + ')' : ''}`}>
        <div className="space-y-2 pt-1">
          <EditableField label="Ad Set Name" value={d.adSetLevel?.name} onSave={v => updateAdSet('name', v)} />
          <EditableField label="Budget" value={`$${d.adSetLevel?.budget}`} onSave={v => updateAdSet('budget', parseInt(v.replace('$', '')))} />
          <p className="text-xs text-muted-foreground">
            {d.adSetLevel?.duration} · Pixel: {d.adSetLevel?.pixelId} · {d.adSetLevel?.targeting?.ageRange}, {d.adSetLevel?.targeting?.locations?.join(', ')}
          </p>
          {d.adSetLevel?.adSetBreakdown && (
            <div className="space-y-1 mt-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Per-Variant Ad Sets</p>
              {d.adSetLevel.adSetBreakdown.map((adSet: any, i: number) => (
                <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/20 text-xs">
                  <Package className="w-3 h-3 text-primary/50 shrink-0" />
                  <span className="font-medium text-foreground flex-1">{adSet.name}</span>
                  <span className="text-muted-foreground">{adSet.ads} ads</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DisclosureSection>

      <DisclosureSection icon={<ImageIcon className="w-3.5 h-3.5" />} title="Ad Creative & Copy">
        <div className="space-y-2 pt-1">
          <EditableField label="Ad Name" value={d.adLevel?.name} onSave={v => updateAd('name', v)} />
          <EditableField label="Primary Text" value={d.adLevel?.primaryText} onSave={v => updateAd('primaryText', v)} />
          <EditableField label="Headline" value={d.adLevel?.headline} onSave={v => updateAd('headline', v)} />
          <div className="flex gap-4">
            <ReadOnlyField label="Page" value={d.adLevel?.pageName} className="flex-1" />
            <ReadOnlyField label="CTA" value={d.adLevel?.cta} className="flex-1" />
          </div>
          {d.adLevel?.creative && (
            <div className="mt-2">
              <div className="rounded-lg overflow-hidden border border-border/40 w-48">
                <img src={d.adLevel.creative.url} alt={d.adLevel.creative.label} className="w-full aspect-video object-cover" />
                <div className="px-2 py-1.5 bg-muted/20">
                  <p className="text-[10px] text-muted-foreground">{d.adLevel.creative.label}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DisclosureSection>
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
const healthScoreRing = (score: number) => score >= 70 ? 'stroke-secondary' : score >= 40 ? 'stroke-amber-500' : 'stroke-destructive';

// Progressive disclosure section
const DisclosureSection = ({ icon, title, badge, defaultOpen = false, children }: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/30 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-muted/10 transition-colors text-left"
      >
        <span className="text-primary/60 shrink-0">{icon}</span>
        <span className="text-xs font-medium text-foreground flex-1">{title}</span>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/8 text-primary font-medium">{badge}</span>
        )}
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        }
      </button>
      {open && (
        <div className="px-3.5 pb-3 animate-fade-in" style={{ animationDuration: '0.2s' }}>
          {children}
        </div>
      )}
    </div>
  );
};

const AISignalsDashboardBody = ({ artifact, onArtifactAction }: { artifact: Artifact; onArtifactAction?: (artifactId: string, action: string, payload?: any) => void }) => {
  const d = artifact.data;
  const healthScore = d.healthScore || 62;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Account Health — always visible narrative */}
      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
            <circle cx="50" cy="50" r="40" fill="none" strokeWidth="6" strokeLinecap="round"
              className={healthScoreRing(healthScore)}
              style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-lg font-bold", healthScoreColor(healthScore))}>{healthScore}</span>
            <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Health</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{d.verdict || 'Your account needs attention'}</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">{d.verdictDetail}</p>
          {d.healthMetrics && (
            <div className="flex gap-1.5 mt-2">
              {d.healthMetrics.map((m: any) => (
                <span key={m.label} className={cn("px-2 py-0.5 rounded-md text-[10px] font-medium", m.status === 'good' ? 'bg-secondary/10 text-secondary' : 'bg-amber-500/10 text-amber-500')}>
                  {m.label} {m.value}%
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progressive disclosure sections */}
      {d.actions?.length > 0 && (
        <DisclosureSection
          icon={<Zap className="w-3.5 h-3.5" />}
          title="Recommended Actions"
          badge={`${d.actions.length} actions`}
          defaultOpen
        >
          <div className="space-y-2 pt-1">
            {d.actions.map((action: any, idx: number) => (
              <div key={action.id} className="p-3 rounded-xl border border-border/40 bg-card/60 space-y-2 animate-fade-in" style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'backwards' }}>
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">{idx + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{action.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Expected <span className="text-secondary font-medium">{action.impact}</span> · {action.risk} risk · {action.confidence}% confidence
                    </p>
                    <p className="text-[10px] text-amber-500/70 mt-1 italic">{action.consequence}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 text-primary border-primary/20 hover:bg-primary/5"
                    onClick={() => onArtifactAction?.(artifact.id, 'act-on-signal', { actionId: action.id, title: action.title, impact: action.impact, confidence: action.confidence })}
                  >
                    <Zap className="w-3 h-3" /> Act on this signal
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DisclosureSection>
      )}

      {d.reasons?.length > 0 && (
        <DisclosureSection
          icon={<CircleAlert className="w-3.5 h-3.5" />}
          title="Why This Is Happening"
          badge={`${d.reasons.length} factors`}
        >
          <div className="space-y-2 pt-1">
            {d.reasons.map((reason: any) => {
              const iconMap: Record<string, React.ReactNode> = {
                budget: <DollarSign className="w-4 h-4" />,
                fatigue: <Flame className="w-4 h-4" />,
                waste: <AlertTriangle className="w-4 h-4" />,
              };
              return (
                <div key={reason.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/10">
                  <span className="text-amber-500 mt-0.5 shrink-0">{iconMap[reason.icon] || <CircleAlert className="w-4 h-4" />}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{reason.title}</p>
                    {reason.explanation?.map((ex: string, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground mt-0.5">• {ex}</p>
                    ))}
                    <p className="text-[10px] text-muted-foreground mt-1">{reason.dataWindow} · {reason.confidence}% confidence</p>
                  </div>
                </div>
              );
            })}
          </div>
        </DisclosureSection>
      )}

      {d.wasteItems?.length > 0 && (
        <DisclosureSection
          icon={<AlertTriangle className="w-3.5 h-3.5" />}
          title="Wasted Spend"
          badge={`${d.wasteItems.length} items`}
        >
          <div className="space-y-1.5 pt-1">
            {d.wasteItems.map((w: any) => (
              <div key={w.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <DollarSign className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{w.name}</p>
                  <p className="text-[10px] text-muted-foreground">{w.reason}</p>
                </div>
                <span className="text-sm font-semibold text-amber-500 shrink-0">{w.amount}</span>
              </div>
            ))}
          </div>
        </DisclosureSection>
      )}

      {d.liveAlerts?.length > 0 && (
        <DisclosureSection
          icon={<Activity className="w-3.5 h-3.5" />}
          title="Live Signals"
          badge={`${d.liveAlerts.length} signals`}
          defaultOpen
        >
          <div className="space-y-1.5 pt-1">
            {d.liveAlerts.map((alert: any) => (
              <div key={alert.id} className={cn(
                "p-3 rounded-xl border space-y-1.5",
                alert.type === 'positive' ? "bg-secondary/5 border-secondary/15" : "bg-amber-500/5 border-amber-500/15"
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
                  <div className="ml-5 flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/10">
                    <div>
                      <p className="text-xs text-primary font-medium">💡 {alert.suggestedAction.title}</p>
                      <p className="text-[10px] text-muted-foreground">{alert.suggestedAction.impact}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary hover:bg-primary/10"
                      onClick={() => onArtifactAction?.(artifact.id, 'act-on-signal', {
                        actionId: alert.id, title: alert.suggestedAction.title,
                        impact: alert.suggestedAction.impact, confidence: 85,
                      })}
                    >
                      <Zap className="w-3 h-3 mr-1" /> Act
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DisclosureSection>
      )}

      {d.quickWins?.length > 0 && (
        <DisclosureSection
          icon={<Lightbulb className="w-3.5 h-3.5" />}
          title="Quick Wins"
          badge={`${d.quickWins.length} wins`}
        >
          <div className="space-y-1.5 pt-1">
            {d.quickWins.map((qw: any) => (
              <div key={qw.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/15 border border-border/30">
                <div className="flex-1">
                  <p className="text-sm text-foreground">{qw.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    <span className="text-secondary font-medium">{qw.impact}</span> · {qw.timeToApply} · {qw.confidence}% confidence
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-primary"
                  onClick={() => onArtifactAction?.(artifact.id, 'act-on-signal', {
                    actionId: qw.id, title: qw.title, impact: qw.impact, confidence: qw.confidence,
                  })}
                >
                  <Zap className="w-3 h-3 mr-1" /> Act
                </Button>
              </div>
            ))}
          </div>
        </DisclosureSection>
      )}
    </div>
  );
};

// ========== DATA TABLE ARTIFACT BODY ==========

const DataTableBody = ({ data: d }: { data: Record<string, any> }) => {
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const columns: { key: string; label: string; align?: string; highlight?: boolean }[] = d.columns || [];
  const rows: any[][] = d.rows || [];
  const summary = d.summary || '';
  const highlights = d.highlights || [];

  const handleSort = (colIdx: number) => {
    if (sortCol === colIdx) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(colIdx);
      setSortAsc(true);
    }
  };

  const sortedRows = sortCol !== null
    ? [...rows].sort((a, b) => {
        const aVal = a[sortCol];
        const bVal = b[sortCol];
        const aNum = typeof aVal === 'string' ? parseFloat(aVal.replace(/[^0-9.-]/g, '')) : aVal;
        const bNum = typeof bVal === 'string' ? parseFloat(bVal.replace(/[^0-9.-]/g, '')) : bVal;
        if (!isNaN(aNum) && !isNaN(bNum)) return sortAsc ? aNum - bNum : bNum - aNum;
        return sortAsc ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
      })
    : rows;

  // Detect top performer (first row by default or marked)
  const topRowIdx = d.topRowIndex ?? 0;

  return (
    <div className="space-y-3">
      {/* Narrative summary */}
      {summary && (
        <p className="text-sm text-foreground leading-relaxed">{summary}</p>
      )}

      {/* Highlights as insight pills */}
      {highlights.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {highlights.map((h: { label: string; value: string; trend?: 'up' | 'down' | 'neutral' }, i: number) => (
            <div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/30 border border-border/30 text-xs">
              <span className="text-muted-foreground">{h.label}</span>
              <span className={cn(
                "font-semibold",
                h.trend === 'up' ? 'text-secondary' : h.trend === 'down' ? 'text-amber-500' : 'text-foreground'
              )}>
                {h.value}
              </span>
              {h.trend === 'up' && <ArrowUpRight className="w-3 h-3 text-secondary" />}
              {h.trend === 'down' && <ArrowUpRight className="w-3 h-3 text-amber-500 rotate-90" />}
            </div>
          ))}
        </div>
      )}

      {/* Modern data table */}
      <div className="rounded-lg border border-border/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/15">
                <th className="w-8 px-3 py-2.5 text-[10px] text-muted-foreground/60 font-normal">#</th>
                {columns.map((col, ci) => (
                  <th
                    key={ci}
                    onClick={() => handleSort(ci)}
                    className={cn(
                      "px-3 py-2.5 text-[10px] uppercase tracking-wider font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none",
                      col.align === 'right' && 'text-right'
                    )}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortCol === ci && (
                        sortAsc
                          ? <ChevronUp className="w-2.5 h-2.5" />
                          : <ChevronDown className="w-2.5 h-2.5" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, ri) => {
                const isTop = ri === topRowIdx && sortCol === null;
                return (
                  <tr
                    key={ri}
                    className={cn(
                      "border-t border-border/20 transition-colors hover:bg-muted/10",
                      isTop && "bg-secondary/5"
                    )}
                  >
                    <td className="px-3 py-2 text-[10px] text-muted-foreground/40 tabular-nums">{ri + 1}</td>
                    {row.map((cell: any, ci: number) => {
                      const col = columns[ci];
                      const isHighlightCol = col?.highlight;
                      // Detect trend values like "+23%" or "-5%"
                      const cellStr = String(cell);
                      const isPositive = cellStr.startsWith('+');
                      const isNegative = cellStr.startsWith('-') && cellStr.includes('%');

                      return (
                        <td
                          key={ci}
                          className={cn(
                            "px-3 py-2 text-xs",
                            col?.align === 'right' && 'text-right tabular-nums',
                            isHighlightCol ? 'font-semibold text-foreground' : 'text-muted-foreground',
                            ci === 0 && 'font-medium text-foreground',
                            isPositive && 'text-secondary',
                            isNegative && 'text-amber-500'
                          )}
                        >
                          <span className="inline-flex items-center gap-1">
                            {isTop && ci === 0 && <Flame className="w-3 h-3 text-secondary shrink-0" />}
                            {cell}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer note */}
      {d.footnote && (
        <p className="text-[10px] text-muted-foreground/50 italic">{d.footnote}</p>
      )}
    </div>
  );
};

// ========== POST-PUBLISH FEEDBACK ==========

const lowRatingReasons = [
  "Confusing flow", "Too many steps", "Slow response",
  "Unclear options", "Missing features", "Technical issues"
];

const quickTags = [
  { label: "Super easy", icon: "✨" },
  { label: "Fast process", icon: "⚡" },
  { label: "Great AI suggestions", icon: "🤖" },
  { label: "Loved the creatives", icon: "🎨" }
];

const PostPublishFeedbackBody = ({ artifact, onUpdateData, onArtifactAction }: {
  artifact: Artifact;
  onUpdateData: (id: string, d: Record<string, any>) => void;
  onArtifactAction?: (artifactId: string, action: string, payload?: any) => void;
}) => {
  const d = artifact.data;
  const [showForm, setShowForm] = useState(false);

  // Trigger confetti on mount
  useEffect(() => {
    if (d.submitted) return;
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#6ebc46', '#5d58a6', '#fbbf24', '#60a5fa'];

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors });

    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  if (d.submitted) {
    return (
      <div className="flex flex-col items-center py-6 animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-3">
          <CheckCircle2 className="h-6 w-6 text-secondary" />
        </div>
        <p className="text-sm font-medium text-foreground">Thank you for your feedback!</p>
        <p className="text-xs text-muted-foreground mt-1">Taking you to performance...</p>
      </div>
    );
  }

  const handleRating = (value: number) => {
    onUpdateData(artifact.id, { ...d, rating: value });
    setShowForm(true);
  };

  const toggleTag = (tag: string) => {
    const tags = d.selectedTags || [];
    onUpdateData(artifact.id, {
      ...d,
      selectedTags: tags.includes(tag) ? tags.filter((t: string) => t !== tag) : [...tags, tag],
    });
  };

  const toggleReason = (reason: string) => {
    const reasons = d.selectedReasons || [];
    onUpdateData(artifact.id, {
      ...d,
      selectedReasons: reasons.includes(reason) ? reasons.filter((r: string) => r !== reason) : [...reasons, reason],
    });
  };

  const handleSubmit = () => {
    onUpdateData(artifact.id, { ...d, submitted: true });
    onArtifactAction?.(artifact.id, 'feedback-submitted', { rating: d.rating, tags: d.selectedTags, reasons: d.selectedReasons });
  };

  const handleSkip = () => {
    onUpdateData(artifact.id, { ...d, submitted: true });
    onArtifactAction?.(artifact.id, 'feedback-skipped');
  };

  return (
    <div className="space-y-4">
      {/* Success header */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-secondary/20 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Campaign Published! 🎉</p>
            <p className="text-xs text-muted-foreground">{d.campaignName} · {d.platform} · {d.adCount} ads · ${d.budget?.daily}/day</p>
          </div>
        </div>
      </div>

      {/* What happens next */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-foreground">What happens next?</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Your campaign is in <span className="text-primary font-medium">learning phase</span>. AI recommendations appear in 24-48 hours once enough data is collected.
            </p>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="text-center space-y-3">
        <div className="flex items-center gap-2 justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="text-sm font-medium text-foreground">How was your experience?</p>
        </div>
        <div className="flex justify-center">
          <StarRating value={d.rating || 0} onChange={handleRating} size="lg" />
        </div>
        {!showForm && <p className="text-[11px] text-muted-foreground">Tap a star to rate</p>}
      </div>

      {/* Feedback form */}
      {showForm && (
        <div className="space-y-3 animate-fade-in border-t border-border/30 pt-3">
          {(d.rating || 0) >= 4 ? (
            <div>
              <p className="text-xs text-muted-foreground mb-2">What did you love?</p>
              <div className="flex flex-wrap gap-1.5">
                {quickTags.map(tag => (
                  <button
                    key={tag.label}
                    onClick={() => toggleTag(tag.label)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-full text-xs transition-all",
                      (d.selectedTags || []).includes(tag.label)
                        ? "bg-secondary/20 text-secondary border border-secondary/30"
                        : "bg-muted/30 text-muted-foreground border border-transparent hover:bg-muted/50"
                    )}
                  >
                    <span className="mr-1">{tag.icon}</span>{tag.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-2">What could we improve?</p>
              <div className="flex flex-wrap gap-1.5">
                {lowRatingReasons.map(reason => (
                  <button
                    key={reason}
                    onClick={() => toggleReason(reason)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-full text-xs transition-all",
                      (d.selectedReasons || []).includes(reason)
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        : "bg-muted/30 text-muted-foreground border border-transparent hover:bg-muted/50"
                    )}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Tell us more (optional)..."
                value={d.feedback || ''}
                onChange={e => onUpdateData(artifact.id, { ...d, feedback: e.target.value })}
                className="resize-none h-16 text-xs bg-background/50"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" className="flex-1 h-8 text-xs" onClick={handleSubmit}>
              Submit Feedback
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={handleSkip}>
              Skip
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ========== PERFORMANCE DASHBOARD ==========

const lifecycleStageConfig: Record<LifecycleStage, { label: string; color: string; icon: React.ReactNode }> = {
  testing: { label: 'Testing', color: 'text-amber-500', icon: <Gauge className="w-3.5 h-3.5" /> },
  optimizing: { label: 'Optimizing', color: 'text-primary', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  scaling: { label: 'Scaling', color: 'text-secondary', icon: <Zap className="w-3.5 h-3.5" /> },
};

const PerformanceDashboardBody = ({ artifact, onUpdateData, onArtifactAction }: {
  artifact: Artifact;
  onUpdateData: (id: string, d: Record<string, any>) => void;
  onArtifactAction?: (artifactId: string, action: string, payload?: any) => void;
}) => {
  const d = artifact.data;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const stage = lifecycleStageConfig[d.lifecycleStage as LifecycleStage] || lifecycleStageConfig.testing;

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate refresh with slightly updated metrics
    setTimeout(() => {
      const jitter = () => 1 + (Math.random() - 0.5) * 0.1;
      const m = d.metrics;
      onUpdateData(artifact.id, {
        ...d,
        previousMetrics: { ...m },
        metrics: {
          spent: Math.round(m.spent * jitter()),
          revenue: Math.round(m.revenue * jitter()),
          roi: +(m.roi * jitter()).toFixed(1),
          conversions: Math.round(m.conversions * jitter()),
          ctr: +(m.ctr * jitter()).toFixed(1),
          aov: +(m.aov * jitter()).toFixed(2),
        },
        lastRefreshed: new Date().toISOString(),
      });
      setIsRefreshing(false);
    }, 1500);
  }, [artifact.id, d, onUpdateData]);

  // Auto-refresh every 30s
  useEffect(() => {
    if (!d.isAutoRefreshing) return;
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, [d.isAutoRefreshing, handleRefresh]);

  const m = d.metrics || {};
  const prev = d.previousMetrics || {};
  const trend = (val: number, prevVal: number) => {
    if (!prevVal) return '';
    const pct = ((val - prevVal) / prevVal * 100).toFixed(1);
    return Number(pct) >= 0 ? `+${pct}%` : `${pct}%`;
  };
  const trendColor = (val: number, prevVal: number, invert = false) => {
    if (!prevVal) return 'text-muted-foreground';
    const isUp = val >= prevVal;
    return (invert ? !isUp : isUp) ? 'text-secondary' : 'text-destructive';
  };

  const metricCells = [
    { label: 'Spend', value: `$${m.spent?.toLocaleString()}`, prev: prev.spent, raw: m.spent, icon: <DollarSign className="w-3 h-3" />, invert: true },
    { label: 'Revenue', value: `$${m.revenue?.toLocaleString()}`, prev: prev.revenue, raw: m.revenue, icon: <TrendingUp className="w-3 h-3" /> },
    { label: 'ROI', value: `${m.roi}x`, prev: prev.roi, raw: m.roi, icon: <BarChart3 className="w-3 h-3" /> },
    { label: 'Conversions', value: m.conversions, prev: prev.conversions, raw: m.conversions, icon: <Target className="w-3 h-3" /> },
    { label: 'CTR', value: `${m.ctr}%`, prev: prev.ctr, raw: m.ctr, icon: <Activity className="w-3 h-3" /> },
    { label: 'AOV', value: `$${m.aov}`, prev: prev.aov, raw: m.aov, icon: <ShoppingBag className="w-3 h-3" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{d.campaignName}</p>
          <p className="text-[10px] text-muted-foreground">{d.dateRange}</p>
        </div>
        <div className="flex items-center gap-2">
          {d.isAutoRefreshing && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              Auto-refresh
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("w-3 h-3", isRefreshing && "animate-spin")} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Lifecycle stage */}
      <div className="p-3 rounded-lg bg-muted/15 border border-border/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={stage.color}>{stage.icon}</span>
            <span className={cn("text-xs font-medium", stage.color)}>{stage.label} Phase</span>
            <span className="text-[10px] text-muted-foreground">· Day {d.daysSincePublish}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">{d.stageProgress}%</span>
        </div>
        <Progress value={d.stageProgress} className="h-1.5" />
        <p className="text-[10px] text-muted-foreground mt-1.5">{d.stageDescription}</p>
      </div>

      {/* Metrics grid */}
      <div className={cn(
        "rounded-xl border border-border/30 overflow-hidden transition-all duration-300",
        isRefreshing && "ring-2 ring-primary/20 opacity-70"
      )}>
        <div className="grid grid-cols-3 divide-x divide-border/20">
          {metricCells.map((cell, i) => (
            <div key={i} className="text-center py-3 px-2">
              <div className="flex items-center gap-1 justify-center text-muted-foreground mb-1">
                {cell.icon}
                <span className="text-[10px] font-medium">{cell.label}</span>
              </div>
              <p className={cn("text-base font-bold text-foreground", isRefreshing && "animate-pulse")}>{cell.value}</p>
              {cell.prev !== undefined && cell.prev > 0 && (
                <p className={cn("text-[10px] font-medium", trendColor(cell.raw, cell.prev, cell.invert))}>
                  {trend(cell.raw, cell.prev)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent changes */}
      {d.recentChanges?.length > 0 && (
        <DisclosureSection icon={<Clock className="w-3.5 h-3.5" />} title="Recent Changes" badge={`${d.recentChanges.length}`}>
          <div className="space-y-1.5 pt-1">
            {d.recentChanges.map((change: any, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                  change.type === 'positive' ? 'bg-secondary' : change.type === 'negative' ? 'bg-destructive' : 'bg-muted-foreground'
                )} />
                <div className="flex-1">
                  <p className="text-foreground">{change.message}</p>
                  <p className="text-[10px] text-muted-foreground">{change.time}</p>
                </div>
              </div>
            ))}
          </div>
        </DisclosureSection>
      )}

      {/* Inline recommendations */}
      {d.recommendations?.length > 0 && (
        <DisclosureSection
          icon={<Lightbulb className="w-3.5 h-3.5" />}
          title="AI Recommendations"
          badge={`${d.recommendations.filter((r: any) => r.state === 'pending').length} pending`}
          defaultOpen
        >
          <div className="space-y-2 pt-1">
            {d.recommendations.map((rec: any) => {
              const isPending = rec.state === 'pending';
              const isApplied = rec.state === 'applied';
              return (
                <div key={rec.id} className={cn(
                  "p-3 rounded-xl border space-y-2 transition-all",
                  isApplied ? "border-secondary/20 bg-secondary/5 opacity-80" :
                  rec.state === 'dismissed' ? "border-border/20 opacity-50" :
                  "border-border/40 bg-card/60"
                )}>
                  <div className="flex items-start gap-2">
                    <span className={cn(
                      "mt-0.5 shrink-0",
                      rec.priority === 'high' ? 'text-amber-500' : rec.priority === 'medium' ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      <Lightbulb className="w-3.5 h-3.5" />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{rec.title}</p>
                        {isApplied && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Applied</Badge>}
                        {rec.state === 'deferred' && <Badge variant="outline" className="text-[9px] px-1.5 py-0">Deferred</Badge>}
                        {rec.state === 'dismissed' && <Badge variant="outline" className="text-[9px] px-1.5 py-0 opacity-50">Dismissed</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                      <p className="text-[10px] mt-1">
                        <span className="text-secondary font-medium">{rec.impact}</span>
                        <span className="text-muted-foreground"> · {rec.confidence}% confidence</span>
                      </p>
                    </div>
                  </div>
                  {isPending && (
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground"
                        onClick={() => onArtifactAction?.(artifact.id, 'dismiss-rec', { recId: rec.id })}>
                        Dismiss
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground"
                        onClick={() => onArtifactAction?.(artifact.id, 'defer-rec', { recId: rec.id })}>
                        Defer
                      </Button>
                      <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 text-primary border-primary/20 hover:bg-primary/5"
                        onClick={() => onArtifactAction?.(artifact.id, 'apply-rec', { recId: rec.id, title: rec.title, impact: rec.impact })}>
                        <Zap className="w-3 h-3" /> Apply
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </DisclosureSection>
      )}
    </div>
  );
};
