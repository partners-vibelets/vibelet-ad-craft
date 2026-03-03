import { useState, useCallback } from 'react';
import {
  Target, Layers, ChevronDown, ChevronRight, Check, X, Edit3,
  DollarSign, Sparkles
} from 'lucide-react';
import { Artifact } from '@/types/workspace';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StrategyMapPanelProps {
  artifact: Artifact;
  onUpdateNode: (campaignIdx: number, field: string, value: any, adSetIdx?: number, adIdx?: number) => void;
}

type NodePath = { campaignIdx: number; adSetIdx?: number; adIdx?: number } | null;

// Inline editable field — always shows edit affordance
const InlineEdit = ({ value, onSave, className, label }: { value: string; onSave: (v: string) => void; className?: string; label?: string }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { onSave(draft); setEditing(false); }
            if (e.key === 'Escape') { setDraft(value); setEditing(false); }
          }}
          className="bg-muted/50 border border-primary/30 rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 w-full transition-all"
        />
        <button onClick={() => { onSave(draft); setEditing(false); }} className="text-secondary shrink-0 p-1 rounded-md hover:bg-secondary/10 transition-colors"><Check className="w-4 h-4" /></button>
        <button onClick={() => { setDraft(value); setEditing(false); }} className="text-muted-foreground shrink-0 p-1 rounded-md hover:bg-muted/50 transition-colors"><X className="w-4 h-4" /></button>
      </div>
    );
  }

  return (
    <button
      className={cn(
        "text-left inline-flex items-center gap-1.5 px-2.5 py-1 -mx-2.5 rounded-lg",
        "border border-dashed border-border/50 hover:border-primary/40",
        "hover:bg-primary/5 transition-all cursor-text group/edit",
        className
      )}
      onClick={e => { e.stopPropagation(); setEditing(true); }}
      title="Click to edit"
    >
      <span className="truncate">{value}</span>
      <Edit3 className="w-3 h-3 text-muted-foreground/50 group-hover/edit:text-primary/60 shrink-0 transition-colors" />
    </button>
  );
};

export const StrategyMapPanel = ({ artifact, onUpdateNode }: StrategyMapPanelProps) => {
  const [expandedNode, setExpandedNode] = useState<NodePath>(null);

  const d = artifact.data;
  const plan = d.strategyPlan || d;
  const campaigns = plan.campaigns || [];
  const planType = plan.planType || 'simple';
  const confidence = plan.confidenceScore || 0;
  const totalDaily = plan.totalDailyBudget || 0;
  const totalMonthly = plan.totalMonthlyBudget || 0;

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
      <div className="px-6 py-4 border-b border-border/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground">Campaign Architecture</h2>
            <div className="flex items-center gap-2.5 mt-1">
              <Badge variant="secondary" className={cn(
                "text-[10px] font-semibold uppercase tracking-wider h-5",
                planType === 'simple' ? "bg-secondary/15 text-secondary" : "bg-primary/15 text-primary"
              )}>
                {planType === 'simple' ? '⚡ Advantage+' : '🏗️ Multi-Campaign'}
              </Badge>
              {confidence > 0 && (
                <Badge variant="outline" className={cn(
                  "text-[10px] h-5",
                  confidence >= 80 ? "border-secondary/40 text-secondary" : confidence >= 60 ? "border-amber-500/40 text-amber-600" : "border-destructive/40 text-destructive"
                )}>
                  {confidence}% confidence
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-base font-semibold text-foreground">${totalDaily}/day</p>
            <p className="text-xs text-muted-foreground">${totalMonthly.toLocaleString()}/mo</p>
          </div>
        </div>
      </div>

      {/* Scrollable tree */}
      <ScrollArea className="flex-1">
        <div className="px-5 py-5 space-y-3">
          {campaigns.map((campaign: any, ci: number) => (
            <div key={ci} className="rounded-xl border border-border/40 overflow-hidden bg-card/50">
              {/* Campaign node */}
              <button
                onClick={() => toggleNode(ci)}
                className={cn(
                  "w-full flex items-center gap-3 px-5 py-3.5 transition-all text-left",
                  "hover:bg-muted/30",
                  isExpanded(ci) && "bg-primary/5 border-b border-border/30"
                )}
              >
                {isExpanded(ci) ? <ChevronDown className="w-4 h-4 text-primary shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                <Target className="w-4.5 h-4.5 text-primary shrink-0" />
                <span className="text-sm font-semibold text-foreground flex-1 truncate">{campaign.name}</span>
                <Badge variant="outline" className="text-[10px] h-5 shrink-0">{campaign.objective}</Badge>
                <span className="text-xs font-medium text-foreground/70 shrink-0 tabular-nums">${campaign.dailyBudget}/day</span>
              </button>

              {/* Campaign detail card (expanded) */}
              {isExpanded(ci) && (
                <div className="px-5 py-4 space-y-4 animate-fade-in bg-muted/5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">Name</p>
                      <InlineEdit value={campaign.name} onSave={v => onUpdateNode(ci, 'name', v)} className="text-sm font-medium" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">Objective</p>
                      <InlineEdit value={campaign.objective} onSave={v => onUpdateNode(ci, 'objective', v)} className="text-sm" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">Daily Budget</p>
                      <InlineEdit value={`$${campaign.dailyBudget}`} onSave={v => onUpdateNode(ci, 'dailyBudget', parseInt(v.replace('$', '')))} className="text-sm font-medium" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">Budget Type</p>
                      <InlineEdit value={campaign.budgetType || 'CBO'} onSave={v => onUpdateNode(ci, 'budgetType', v)} className="text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* Ad Sets */}
              <div className="px-3 pb-2">
                {(campaign.adSets || []).map((adSet: any, si: number) => (
                  <div key={si} className="ml-5 border-l-2 border-primary/15">
                    {/* Ad Set node */}
                    <button
                      onClick={() => toggleNode(ci, si)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-4 py-2.5 transition-all text-left",
                        "hover:bg-muted/20 rounded-r-lg",
                        isExpanded(ci, si) && "bg-primary/5"
                      )}
                    >
                      {isExpanded(ci, si) ? <ChevronDown className="w-3.5 h-3.5 text-primary shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />}
                      <Layers className="w-4 h-4 text-primary/50 shrink-0" />
                      <span className="text-[13px] font-medium text-foreground flex-1 truncate">{adSet.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0">${adSet.budget}/day</span>
                    </button>

                    {/* Ad Set detail card */}
                    {isExpanded(ci, si) && (
                      <div className="ml-9 mr-3 mb-3 px-4 py-4 rounded-lg bg-muted/10 border border-border/20 space-y-3.5 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">Name</p>
                            <InlineEdit value={adSet.name} onSave={v => onUpdateNode(ci, 'name', v, si)} className="text-[13px] font-medium" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">Budget</p>
                            <InlineEdit value={`$${adSet.budget}`} onSave={v => onUpdateNode(ci, 'budget', parseInt(v.replace('$', '')), si)} className="text-[13px] font-medium" />
                          </div>
                        </div>
                        {adSet.targeting && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">Targeting</p>
                            <InlineEdit value={adSet.targeting} onSave={v => onUpdateNode(ci, 'targeting', v, si)} className="text-[13px]" />
                          </div>
                        )}
                        {adSet.placements && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">Placements</p>
                            <InlineEdit value={adSet.placements} onSave={v => onUpdateNode(ci, 'placements', v, si)} className="text-[13px]" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ads */}
                    {(adSet.ads || []).map((ad: any, ai: number) => (
                      <div key={ai} className="ml-7 border-l border-border/20">
                        <button
                          onClick={() => toggleNode(ci, si, ai)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-4 py-2 transition-all text-left",
                            "hover:bg-muted/15 rounded-r-lg",
                            isExpanded(ci, si, ai) && "bg-primary/5"
                          )}
                        >
                          <span className="text-xs shrink-0">
                            {ad.format === 'Video' ? '🎬' : ad.format === 'Carousel' ? '🔄' : ad.format === 'Collection' ? '📦' : '🖼️'}
                          </span>
                          <span className="text-[13px] text-foreground flex-1 truncate">{ad.name}</span>
                          <Badge variant="outline" className="text-[9px] h-4 px-1.5 shrink-0">{ad.format}</Badge>
                        </button>

                        {/* Ad detail card */}
                        {isExpanded(ci, si, ai) && (
                          <div className="ml-7 mr-3 mb-3 px-4 py-4 rounded-lg bg-muted/10 border border-border/20 space-y-3 animate-fade-in">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">Name</p>
                                <InlineEdit value={ad.name} onSave={v => onUpdateNode(ci, 'name', v, si, ai)} className="text-[13px] font-medium" />
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">Format</p>
                                <InlineEdit value={ad.format} onSave={v => onUpdateNode(ci, 'format', v, si, ai)} className="text-[13px]" />
                              </div>
                            </div>
                            {ad.primaryText && (
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">Primary Text</p>
                                <InlineEdit value={ad.primaryText} onSave={v => onUpdateNode(ci, 'primaryText', v, si, ai)} className="text-[13px]" />
                              </div>
                            )}
                            {ad.headline && (
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">Headline</p>
                                <InlineEdit value={ad.headline} onSave={v => onUpdateNode(ci, 'headline', v, si, ai)} className="text-[13px]" />
                              </div>
                            )}
                            {ad.cta && (
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">CTA</p>
                                <InlineEdit value={ad.cta} onSave={v => onUpdateNode(ci, 'cta', v, si, ai)} className="text-[13px]" />
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
        </div>
      </ScrollArea>

      {/* Bottom bar — budget summary only */}
      <div className="border-t border-border/30 bg-card/80 backdrop-blur-sm px-5 py-3.5 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary/60" />
            <span className="text-xs text-muted-foreground">Total:</span>
            <span className="text-base font-semibold text-foreground">${totalDaily}/day</span>
            <span className="text-xs text-muted-foreground">· ${totalMonthly.toLocaleString()}/mo</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary/50" />
            <span className="text-xs text-muted-foreground">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
