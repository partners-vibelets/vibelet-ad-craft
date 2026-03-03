import { useState, useCallback } from 'react';
import {
  Target, Layers, ChevronDown, ChevronRight, Check, X, Edit3,
  Shield, AlertTriangle, Clock, Lightbulb, CheckCircle2, RefreshCw,
  DollarSign, Sparkles
} from 'lucide-react';
import { Artifact } from '@/types/workspace';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StrategyMapPanelProps {
  artifact: Artifact;
  onUpdateNode: (campaignIdx: number, field: string, value: any, adSetIdx?: number, adIdx?: number) => void;
  onArtifactAction?: (artifactId: string, action: string, payload?: any) => void;
}

type NodePath = { campaignIdx: number; adSetIdx?: number; adIdx?: number } | null;

// Inline editable text — click to edit, escape to cancel
const InlineEdit = ({ value, onSave, className }: { value: string; onSave: (v: string) => void; className?: string }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { onSave(draft); setEditing(false); }
            if (e.key === 'Escape') { setDraft(value); setEditing(false); }
          }}
          className="bg-muted/40 border border-border/60 rounded-md px-2 py-1 text-sm text-foreground outline-none focus:border-primary/50 w-full"
        />
        <button onClick={() => { onSave(draft); setEditing(false); }} className="text-secondary shrink-0"><Check className="w-3.5 h-3.5" /></button>
        <button onClick={() => { setDraft(value); setEditing(false); }} className="text-muted-foreground shrink-0"><X className="w-3.5 h-3.5" /></button>
      </div>
    );
  }

  return (
    <span
      className={cn("cursor-pointer group/edit inline-flex items-center gap-1 hover:text-primary transition-colors", className)}
      onClick={e => { e.stopPropagation(); setEditing(true); }}
    >
      {value}
      <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover/edit:opacity-60 transition-opacity" />
    </span>
  );
};

export const StrategyMapPanel = ({ artifact, onUpdateNode, onArtifactAction }: StrategyMapPanelProps) => {
  const [expandedNode, setExpandedNode] = useState<NodePath>(null);

  const d = artifact.data;
  const plan = d.strategyPlan || d;
  const campaigns = plan.campaigns || [];
  const planType = plan.planType || 'simple';
  const confidence = plan.confidenceScore || 0;
  const totalDaily = plan.totalDailyBudget || 0;
  const totalMonthly = plan.totalMonthlyBudget || 0;
  const rationale = plan.rationale || '';
  const guardrails = plan.guardrailNotes || [];
  const learningNotes = plan.learningPhaseNotes || '';

  const isExpanded = useCallback((ci: number, si?: number, ai?: number) => {
    if (!expandedNode) return false;
    return expandedNode.campaignIdx === ci && expandedNode.adSetIdx === si && expandedNode.adIdx === ai;
  }, [expandedNode]);

  const toggleNode = useCallback((ci: number, si?: number, ai?: number) => {
    if (isExpanded(ci, si, ai)) {
      setExpandedNode(null);
    } else {
      setExpandedNode({ campaignIdx: ci, adSetIdx: si, adIdx: ai });
    }
  }, [isExpanded]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Panel header */}
      <div className="px-5 py-3 border-b border-border/30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground">Campaign Architecture</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className={cn(
                "text-[9px] font-semibold uppercase tracking-wider h-4",
                planType === 'simple' ? "bg-secondary/15 text-secondary" : "bg-primary/15 text-primary"
              )}>
                {planType === 'simple' ? '⚡ Advantage+' : '🏗️ Multi-Campaign'}
              </Badge>
              {confidence > 0 && (
                <Badge variant="outline" className={cn(
                  "text-[9px] h-4",
                  confidence >= 80 ? "border-secondary/40 text-secondary" : confidence >= 60 ? "border-amber-500/40 text-amber-600" : "border-destructive/40 text-destructive"
                )}>
                  {confidence}% confidence
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-foreground">${totalDaily}/day</p>
            <p className="text-[10px] text-muted-foreground">${totalMonthly.toLocaleString()}/mo</p>
          </div>
        </div>
      </div>

      {/* Scrollable tree */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-4 space-y-2">
          {campaigns.map((campaign: any, ci: number) => (
            <div key={ci} className="rounded-xl border border-border/40 overflow-hidden bg-card/50">
              {/* Campaign node */}
              <button
                onClick={() => toggleNode(ci)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-4 py-3 transition-all text-left",
                  "hover:bg-muted/30",
                  isExpanded(ci) && "bg-primary/5 border-b border-border/30"
                )}
              >
                {isExpanded(ci) ? <ChevronDown className="w-3.5 h-3.5 text-primary shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                <Target className="w-4 h-4 text-primary shrink-0" />
                <span className="text-[13px] font-semibold text-foreground flex-1 truncate">{campaign.name}</span>
                <Badge variant="outline" className="text-[9px] h-4 shrink-0">{campaign.objective}</Badge>
                <span className="text-[11px] font-medium text-foreground/70 shrink-0 tabular-nums">${campaign.dailyBudget}/day</span>
              </button>

              {/* Campaign detail card (expanded) */}
              {isExpanded(ci) && (
                <div className="px-4 py-3 space-y-3 animate-fade-in bg-muted/5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Name</p>
                      <InlineEdit value={campaign.name} onSave={v => onUpdateNode(ci, 'name', v)} className="text-sm font-medium" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Objective</p>
                      <InlineEdit value={campaign.objective} onSave={v => onUpdateNode(ci, 'objective', v)} className="text-sm" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Daily Budget</p>
                      <InlineEdit value={`$${campaign.dailyBudget}`} onSave={v => onUpdateNode(ci, 'dailyBudget', parseInt(v.replace('$', '')))} className="text-sm font-medium" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Budget Type</p>
                      <InlineEdit value={campaign.budgetType || 'CBO'} onSave={v => onUpdateNode(ci, 'budgetType', v)} className="text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* Ad Sets */}
              <div className="px-2 pb-1">
                {(campaign.adSets || []).map((adSet: any, si: number) => (
                  <div key={si} className="ml-4 border-l-2 border-primary/15">
                    {/* Ad Set node */}
                    <button
                      onClick={() => toggleNode(ci, si)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 transition-all text-left",
                        "hover:bg-muted/20 rounded-r-lg",
                        isExpanded(ci, si) && "bg-primary/5"
                      )}
                    >
                      {isExpanded(ci, si) ? <ChevronDown className="w-3 h-3 text-primary shrink-0" /> : <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />}
                      <Layers className="w-3.5 h-3.5 text-primary/50 shrink-0" />
                      <span className="text-[12px] font-medium text-foreground flex-1 truncate">{adSet.name}</span>
                      <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">${adSet.budget}/day</span>
                    </button>

                    {/* Ad Set detail card */}
                    {isExpanded(ci, si) && (
                      <div className="ml-8 mr-2 mb-2 px-3 py-3 rounded-lg bg-muted/10 border border-border/20 space-y-2.5 animate-fade-in">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Name</p>
                            <InlineEdit value={adSet.name} onSave={v => onUpdateNode(ci, 'name', v, si)} className="text-[12px] font-medium" />
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Budget</p>
                            <InlineEdit value={`$${adSet.budget}`} onSave={v => onUpdateNode(ci, 'budget', parseInt(v.replace('$', '')), si)} className="text-[12px] font-medium" />
                          </div>
                        </div>
                        {adSet.targeting && (
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Targeting</p>
                            <InlineEdit value={adSet.targeting} onSave={v => onUpdateNode(ci, 'targeting', v, si)} className="text-[11px]" />
                          </div>
                        )}
                        {adSet.placements && (
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Placements</p>
                            <InlineEdit value={adSet.placements} onSave={v => onUpdateNode(ci, 'placements', v, si)} className="text-[11px]" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ads */}
                    {(adSet.ads || []).map((ad: any, ai: number) => (
                      <div key={ai} className="ml-6 border-l border-border/20">
                        <button
                          onClick={() => toggleNode(ci, si, ai)}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-1.5 transition-all text-left",
                            "hover:bg-muted/15 rounded-r-lg",
                            isExpanded(ci, si, ai) && "bg-primary/5"
                          )}
                        >
                          <span className="text-[10px] shrink-0">
                            {ad.format === 'Video' ? '🎬' : ad.format === 'Carousel' ? '🔄' : ad.format === 'Collection' ? '📦' : '🖼️'}
                          </span>
                          <span className="text-[11px] text-foreground flex-1 truncate">{ad.name}</span>
                          <Badge variant="outline" className="text-[8px] h-3.5 px-1 shrink-0">{ad.format}</Badge>
                        </button>

                        {/* Ad detail card */}
                        {isExpanded(ci, si, ai) && (
                          <div className="ml-6 mr-2 mb-2 px-3 py-3 rounded-lg bg-muted/10 border border-border/20 space-y-2 animate-fade-in">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Name</p>
                                <InlineEdit value={ad.name} onSave={v => onUpdateNode(ci, 'name', v, si, ai)} className="text-[11px] font-medium" />
                              </div>
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Format</p>
                                <InlineEdit value={ad.format} onSave={v => onUpdateNode(ci, 'format', v, si, ai)} className="text-[11px]" />
                              </div>
                            </div>
                            {ad.primaryText && (
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Primary Text</p>
                                <InlineEdit value={ad.primaryText} onSave={v => onUpdateNode(ci, 'primaryText', v, si, ai)} className="text-[11px]" />
                              </div>
                            )}
                            {ad.headline && (
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Headline</p>
                                <InlineEdit value={ad.headline} onSave={v => onUpdateNode(ci, 'headline', v, si, ai)} className="text-[11px]" />
                              </div>
                            )}
                            {ad.cta && (
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">CTA</p>
                                <InlineEdit value={ad.cta} onSave={v => onUpdateNode(ci, 'cta', v, si, ai)} className="text-[11px]" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Rationale */}
          {rationale && (
            <div className="px-3.5 py-3 rounded-xl bg-muted/15 border border-border/30 mt-3">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lightbulb className="w-3 h-3" /> Rationale
              </p>
              <p className="text-[12px] text-foreground/80 leading-relaxed">{rationale}</p>
            </div>
          )}

          {/* Learning phase */}
          {learningNotes && (
            <div className="px-3.5 py-3 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Learning Phase
              </p>
              <p className="text-[12px] text-foreground/80 leading-relaxed">{learningNotes}</p>
            </div>
          )}

          {/* Guardrails */}
          {guardrails.length > 0 && (
            <div className="space-y-1.5 mt-2">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 px-1">
                <Shield className="w-3 h-3" /> Guardrails
              </p>
              {guardrails.map((note: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-[11px] px-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{note}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom bar — budget summary + actions */}
      <div className="border-t border-border/30 bg-card/80 backdrop-blur-sm px-4 py-3 shrink-0 space-y-3">
        {/* Budget summary */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-[11px] text-muted-foreground">Total:</span>
            <span className="text-sm font-semibold text-foreground">${totalDaily}/day</span>
            <span className="text-[10px] text-muted-foreground">· ${totalMonthly.toLocaleString()}/mo</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-primary/50" />
            <span className="text-[10px] text-muted-foreground">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="text-xs h-9 gap-1.5 flex-1"
            onClick={() => onArtifactAction?.(artifact.id, 'approve-strategy-plan')}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approve & Execute
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-9 gap-1.5"
            onClick={() => onArtifactAction?.(artifact.id, 'tweak-strategy-plan')}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Tweak
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-9 gap-1.5"
            onClick={() => onArtifactAction?.(artifact.id, 'rethink-strategy-plan')}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Rethink
          </Button>
        </div>
      </div>
    </div>
  );
};
