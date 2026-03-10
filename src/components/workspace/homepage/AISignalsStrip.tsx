import { useState } from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, ChevronDown, ChevronUp, ExternalLink, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DemoAlert } from '@/data/homepageDemoData';

// Rich recommendation data extending DemoAlert
export interface AIRecommendation {
  id: string;
  type: 'prune' | 'scale' | 'pause' | 'refresh' | 'restructure';
  level: 'ad' | 'adset' | 'campaign';
  title: string;
  subtitle: string;
  rationale: string;
  severity: 'high' | 'medium' | 'low';
  current: string;
  proposed: string;
  estimatedImpact: string;
  confidence: number;
  campaignName: string;
  status: 'pending' | 'approved' | 'dismissed';
}

// Generate rich recommendations from alerts
export function generateRecommendations(alerts: DemoAlert[]): AIRecommendation[] {
  const recs: AIRecommendation[] = [];

  const cpaAlert = alerts.find(a => a.kpi === 'CPA');
  if (cpaAlert) {
    recs.push({
      id: 'rec-prune-retarget',
      type: 'prune',
      level: 'ad',
      title: 'PRUNE AD: Retarget_Static_v4 (consumer)',
      subtitle: `Ad-level CAC $${(18.4).toFixed(0)} for 3 consecutive days (target: ≤$15). Killing this ad will not reset campaign learnings — other ads in the ad set continue running.`,
      rationale: cpaAlert.rationale,
      severity: 'high',
      current: `Ad spend $380/day, CAC $${(18.4).toFixed(0)}`,
      proposed: 'Kill ad, reallocate to top performers',
      estimatedImpact: `Save ~$380/day waste, campaign CAC ↓ to ~$12`,
      confidence: 87,
      campaignName: cpaAlert.campaignName,
      status: 'pending',
    });
  }

  const ctrAlert = alerts.find(a => a.kpi === 'CTR');
  if (ctrAlert) {
    recs.push({
      id: 'rec-prune-creative',
      type: 'refresh',
      level: 'ad',
      title: 'PRUNE AD: Lifestyle_Static_v3 (creative fatigue)',
      subtitle: `CTR declined 2.8% → 2.1% over 21 days. Frequency 4.2x indicates saturation. Ad-level prune — campaign and other ads unaffected.`,
      rationale: ctrAlert.rationale,
      severity: 'medium',
      current: `CTR 2.1%, Freq 4.2, CAC $18`,
      proposed: 'Kill ad + rotate in UGC_Cut3',
      estimatedImpact: 'Expected ad set CTR recovery to ~2.6%',
      confidence: 72,
      campaignName: ctrAlert.campaignName,
      status: 'pending',
    });
  }

  const roasAlert = alerts.find(a => a.kpi === 'ROAS');
  if (roasAlert) {
    recs.push({
      id: 'rec-scale-winner',
      type: 'scale',
      level: 'ad',
      title: 'SCALE AD: Spring_UGC_v2 +18%',
      subtitle: `Top performing ad for 5 days at CAC $12 (target ≤$15). Scaling at ad level by +18% stays within the 20% safety guardrail.`,
      rationale: roasAlert.rationale,
      severity: 'medium',
      current: `Ad spend $1,200/day, CAC $12`,
      proposed: '$1,416/day (+18%)',
      estimatedImpact: '+18% volume at estimated CAC ~$13',
      confidence: 81,
      campaignName: roasAlert.campaignName,
      status: 'pending',
    });
  }

  // Always add a bonus recommendation
  recs.push({
    id: 'rec-pause-audience',
    type: 'pause',
    level: 'adset',
    title: 'PAUSE ADSET: Broad_Interest_18-34',
    subtitle: 'No conversions in 72 hours with $240 spent. Audience may be exhausted or misaligned with offer.',
    rationale: 'Zero conversion rate over 3 days suggests audience-offer mismatch',
    severity: 'high',
    current: 'Spend $240, Conversions 0, CTR 0.3%',
    proposed: 'Pause adset, reallocate budget to Lookalike_TopPurchasers',
    estimatedImpact: 'Save $80/day, improve overall ROAS by ~0.2x',
    confidence: 93,
    campaignName: 'Spring Sale 2026',
    status: 'pending',
  });

  return recs;
}

interface AISignalsStripProps {
  alerts: DemoAlert[];
  isSample: boolean;
  pausedAlerts: string[];
  onMicroAction: (alertId: string, action: string, campaignName: string) => void;
  onViewAllRecommendations?: () => void;
}

export const AISignalsStrip = ({ alerts, isSample, pausedAlerts, onMicroAction, onViewAllRecommendations }: AISignalsStripProps) => {
  const recommendations = generateRecommendations(alerts);
  const [recStates, setRecStates] = useState<Record<string, 'pending' | 'approved' | 'dismissed'>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getRecStatus = (id: string) => recStates[id] || 'pending';

  const handleApprove = (rec: AIRecommendation) => {
    setRecStates(prev => ({ ...prev, [rec.id]: 'approved' }));
    onMicroAction(rec.id, rec.type === 'pause' ? 'pause' : rec.type === 'scale' ? 'adjust-budget' : 'regenerate', rec.campaignName);
  };

  const handleDismiss = (rec: AIRecommendation) => {
    setRecStates(prev => ({ ...prev, [rec.id]: 'dismissed' }));
  };

  const pendingCount = recommendations.filter(r => getRecStatus(r.id) === 'pending').length;

  if (recommendations.length === 0) return null;

  const getTypeColor = (type: string, severity: string) => {
    if (type === 'scale') return 'border-l-emerald-500';
    if (severity === 'high') return 'border-l-amber-500';
    return 'border-l-amber-400';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'prune': return 'PRUNE';
      case 'scale': return 'SCALE';
      case 'pause': return 'PAUSE';
      case 'refresh': return 'REFRESH';
      default: return 'ACTION';
    }
  };

  const getSeverityBadge = (severity: string) => {
    if (severity === 'high') return { label: 'WARNING', className: 'text-amber-500' };
    return { label: 'INFO', className: 'text-primary' };
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-medium text-foreground">Pending Approvals</h3>
          {pendingCount > 0 && (
            <span className="text-[10px] w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
              {pendingCount}
            </span>
          )}
          {isSample && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 font-medium">
              sample
            </span>
          )}
        </div>
        {onViewAllRecommendations && (
          <button
            onClick={onViewAllRecommendations}
            className="text-[11px] text-primary hover:underline flex items-center gap-1"
          >
            View all recommendations <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Recommendation cards */}
      <div className="space-y-3">
        {recommendations.map((rec, i) => {
          const status = getRecStatus(rec.id);
          const isExpanded = expandedId === rec.id;
          const severityBadge = getSeverityBadge(rec.severity);

          return (
            <div
              key={rec.id}
              className={cn(
                "rounded-xl border border-border/40 bg-card/80 overflow-hidden transition-all animate-fade-in border-l-[3px]",
                getTypeColor(rec.type, rec.severity),
                status === 'approved' && "opacity-60 border-l-emerald-500",
                status === 'dismissed' && "opacity-40",
              )}
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}
            >
              {/* Main content */}
              <div className="p-4 space-y-3">
                {/* Title row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{rec.subtitle}</p>
                  </div>
                  <span className={cn("text-[10px] font-bold tracking-wider shrink-0", severityBadge.className)}>
                    {severityBadge.label}
                  </span>
                </div>

                {/* Current / Proposed / Est. Impact row */}
                <div className="flex items-start gap-6 px-3 py-2.5 rounded-lg bg-muted/30 border border-border/20">
                  <div className="space-y-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Current</p>
                    <p className="text-xs font-medium text-foreground">{rec.current}</p>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Proposed</p>
                    <p className="text-xs font-medium text-foreground">{rec.proposed}</p>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Est. Impact</p>
                    <p className="text-xs font-medium text-foreground">{rec.estimatedImpact}</p>
                  </div>
                </div>

                {/* Confidence + Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Confidence bar */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">Confidence</span>
                      <div className="w-16 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            rec.confidence >= 80 ? "bg-emerald-500" : rec.confidence >= 60 ? "bg-amber-500" : "bg-muted-foreground"
                          )}
                          style={{ width: `${rec.confidence}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-foreground">{rec.confidence}%</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDismiss(rec)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleApprove(rec)}
                        className="text-xs font-medium px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors active:scale-[0.97]"
                      >
                        Approve
                      </button>
                    </div>
                  ) : status === 'approved' ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approved
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <XCircle className="w-3.5 h-3.5" />
                      Dismissed
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
