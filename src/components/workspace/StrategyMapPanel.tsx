import { useState, useCallback } from 'react';
import {
  Target, Layers, ChevronDown, ChevronRight, Check,
  DollarSign, Sparkles, Lock, CheckCircle2, X,
} from 'lucide-react';
import { Artifact } from '@/types/workspace';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { InlineEdit } from './strategy/InlineEdit';
import { VideoCreativeBrief } from './strategy/VideoCreativeBrief';
import { ImageCreativeBrief } from './strategy/ImageCreativeBrief';

// Meta CTA options for Sales objective
const META_CTA_OPTIONS = [
  'Shop Now', 'Learn More', 'Sign Up', 'Buy Now', 'Add to Cart',
  'Get Offer', 'Order Now', 'Subscribe', 'Download', 'Get Quote',
  'Contact Us', 'Book Now', 'Apply Now', 'Send Message',
];

interface StrategyMapPanelProps {
  artifact: Artifact;
  onUpdateNode: (campaignIdx: number, field: string, value: any, adSetIdx?: number, adIdx?: number) => void;
}

type NodePath = { campaignIdx: number; adSetIdx?: number; adIdx?: number } | null;

export const StrategyMapPanel = ({ artifact, onUpdateNode }: StrategyMapPanelProps) => {
  const [expandedNode, setExpandedNode] = useState<NodePath>(null);
  const [frozenAds, setFrozenAds] = useState<Set<string>>(new Set());
  const [removedAds, setRemovedAds] = useState<Set<string>>(new Set());

  const d = artifact.data;
  const plan = d.strategyPlan || d;
  const campaigns = plan.campaigns || [];
  const planType = plan.planType || 'simple';
  const confidence = plan.confidenceScore || 0;
  const totalDaily = plan.totalDailyBudget || 0;
  const totalMonthly = plan.totalMonthlyBudget || 0;

  let totalAds = 0;
  campaigns.forEach((c: any) => (c.adSets || []).forEach((s: any) => {
    (s.ads || []).forEach((ad: any) => {
      if (!removedAds.has(`${c.name}-${s.name}-${ad.name}`)) totalAds++;
    });
  }));
  const frozenCount = frozenAds.size;

  const isExpanded = useCallback((ci: number, si?: number, ai?: number) => {
    if (!expandedNode) return false;
    return expandedNode.campaignIdx === ci && expandedNode.adSetIdx === si && expandedNode.adIdx === ai;
  }, [expandedNode]);

  const toggleNode = useCallback((ci: number, si?: number, ai?: number) => {
    if (isExpanded(ci, si, ai)) setExpandedNode(null);
    else setExpandedNode({ campaignIdx: ci, adSetIdx: si, adIdx: ai });
  }, [isExpanded]);

  const toggleFreeze = useCallback((adKey: string) => {
    setFrozenAds(prev => {
      const next = new Set(prev);
      if (next.has(adKey)) next.delete(adKey);
      else next.add(adKey);
      return next;
    });
  }, []);

  const removeAd = useCallback((adKey: string) => {
    setRemovedAds(prev => {
      const next = new Set(prev);
      next.add(adKey);
      return next;
    });
    // Also remove from frozen if it was frozen
    setFrozenAds(prev => {
      const next = new Set(prev);
      next.delete(adKey);
      return next;
    });
  }, []);

  const isVideoFormat = (format: string) => /video/i.test(format);
  const isCarouselFormat = (format: string) => /carousel/i.test(format);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Panel header */}
      <div className="px-5 py-3.5 border-b border-border/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-primary" />
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
        <div className="px-4 py-4 space-y-2.5">
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

              {/* Campaign detail card */}
              {isExpanded(ci) && (
                <div className="px-4 py-3 space-y-3 animate-fade-in bg-muted/5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">Name</p>
                      <InlineEdit value={campaign.name} onSave={v => onUpdateNode(ci, 'name', v)} className="text-[12px] font-medium" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">Objective</p>
                      <InlineEdit value={campaign.objective} onSave={v => onUpdateNode(ci, 'objective', v)} className="text-[12px]" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">Daily Budget</p>
                      <InlineEdit value={`$${campaign.dailyBudget}`} onSave={v => onUpdateNode(ci, 'dailyBudget', parseInt(v.replace('$', '')))} className="text-[12px] font-medium" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">Budget Type</p>
                      <InlineEdit value={campaign.budgetType || 'CBO'} onSave={v => onUpdateNode(ci, 'budgetType', v)} className="text-[12px]" />
                    </div>
                  </div>
                  {campaign.bidStrategy && (
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">Bid Strategy</p>
                      <InlineEdit value={campaign.bidStrategy} onSave={v => onUpdateNode(ci, 'bidStrategy', v)} className="text-[12px]" />
                    </div>
                  )}
                </div>
              )}

              {/* Ad Sets */}
              <div className="px-2 pb-2">
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
                      <div className="ml-7 mr-2 mb-2 px-3 py-3 rounded-lg bg-muted/10 border border-border/20 space-y-3 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">Name</p>
                            <InlineEdit value={adSet.name} onSave={v => onUpdateNode(ci, 'name', v, si)} className="text-[12px] font-medium" />
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">Budget</p>
                            <InlineEdit value={`$${adSet.budget}`} onSave={v => onUpdateNode(ci, 'budget', parseInt(v.replace('$', '')), si)} className="text-[12px] font-medium" />
                          </div>
                        </div>
                        {adSet.targeting && (
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">Targeting</p>
                            <InlineEdit value={adSet.targeting} onSave={v => onUpdateNode(ci, 'targeting', v, si)} className="text-[12px]" />
                          </div>
                        )}
                        {adSet.placements && (
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">Placements</p>
                            <InlineEdit value={adSet.placements} onSave={v => onUpdateNode(ci, 'placements', v, si)} className="text-[12px]" />
                          </div>
                        )}
                        {adSet.optimization && (
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">Optimization</p>
                            <InlineEdit value={adSet.optimization} onSave={v => onUpdateNode(ci, 'optimization', v, si)} className="text-[12px]" />
                          </div>
                        )}
                        {adSet.schedule && (
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">Schedule</p>
                            <InlineEdit value={adSet.schedule} onSave={v => onUpdateNode(ci, 'schedule', v, si)} className="text-[12px]" />
                          </div>
                        )}
                        {adSet.exclusions && (
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">Exclusions</p>
                            <p className="text-[11px] text-muted-foreground">{adSet.exclusions}</p>
                          </div>
                        )}
                        {adSet.note && (
                          <div className="flex items-start gap-1.5 p-2 rounded-md bg-amber-500/5 border border-amber-500/20">
                            <span className="text-[10px]">⚠️</span>
                            <p className="text-[10px] text-amber-600 leading-relaxed">{adSet.note}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ads */}
                    {(adSet.ads || []).map((ad: any, ai: number) => {
                      const adCompositeKey = `${campaign.name}-${adSet.name}-${ad.name}`;
                      if (removedAds.has(adCompositeKey)) return null;
                      const isFrozen = frozenAds.has(ad.name);
                      const isVideo = isVideoFormat(ad.format);
                      return (
                        <div key={ai} className="ml-6 border-l border-border/20">
                          {/* Ad row with inline remove */}
                          <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 transition-all rounded-r-lg group",
                            "hover:bg-muted/15",
                            isExpanded(ci, si, ai) && "bg-primary/5"
                          )}>
                            <button
                              onClick={() => toggleNode(ci, si, ai)}
                              className="flex items-center gap-2 flex-1 min-w-0 text-left"
                            >
                              <span className="text-[10px] shrink-0">
                                {isVideo ? '🎬' : isCarouselFormat(ad.format) ? '🔄' : '🖼️'}
                              </span>
                              <span className="text-[11px] text-foreground flex-1 truncate">{ad.name}</span>
                            </button>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {isFrozen && <CheckCircle2 className="w-3 h-3 text-secondary" />}
                              <Badge variant="outline" className="text-[8px] h-3.5 px-1.5">{ad.format}</Badge>
                              {/* Remove button — always visible on hover */}
                              <button
                                onClick={(e) => { e.stopPropagation(); removeAd(adCompositeKey); }}
                                className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                                title="Remove this creative from ad"
                              >
                                <X className="w-3 h-3 text-destructive/60 hover:text-destructive" />
                              </button>
                            </div>
                          </div>

                          {/* Ad expanded — ad copy fields + creative brief */}
                          {isExpanded(ci, si, ai) && (
                            <div className="ml-6 mr-2 mb-2 rounded-lg bg-muted/10 border border-border/20 animate-fade-in overflow-hidden">
                              {/* Ad copy fields — readable, properly laid out */}
                              <div className="px-3 py-3 border-b border-border/20 bg-muted/5 space-y-2.5">
                                {/* Row 1: Headline + CTA side by side */}
                                <div className="grid grid-cols-[1fr_auto] gap-3">
                                  {ad.headline && (
                                    <div>
                                      <label className="text-[10px] text-muted-foreground font-medium block mb-1">Headline</label>
                                      <InlineEdit
                                        value={ad.headline}
                                        onSave={v => onUpdateNode(ci, 'headline', v, si, ai)}
                                        className="text-[12px] font-medium"
                                      />
                                      <span className="text-[8px] text-muted-foreground/50 mt-0.5 block">Max 40 chars</span>
                                    </div>
                                  )}
                                  {ad.cta && (
                                    <div className="min-w-[120px]">
                                      <label className="text-[10px] text-muted-foreground font-medium block mb-1">Call to Action</label>
                                      <select
                                        value={ad.cta}
                                        onChange={e => onUpdateNode(ci, 'cta', e.target.value, si, ai)}
                                        className="w-full text-[11px] font-medium bg-muted/30 border border-border/40 rounded-md px-2 py-1.5 text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', paddingRight: '24px' }}
                                      >
                                        {META_CTA_OPTIONS.map(cta => (
                                          <option key={cta} value={cta}>{cta}</option>
                                        ))}
                                      </select>
                                    </div>
                                  )}
                                </div>

                                {/* Row 2: Primary Text — full width */}
                                {ad.primaryText && (
                                  <div>
                                    <label className="text-[10px] text-muted-foreground font-medium block mb-1">Primary Text</label>
                                    <InlineEdit
                                      value={ad.primaryText}
                                      onSave={v => onUpdateNode(ci, 'primaryText', v, si, ai)}
                                      className="text-[12px] leading-relaxed"
                                      multiline
                                    />
                                    <span className="text-[8px] text-muted-foreground/50 mt-0.5 block">Max 125 chars for best performance</span>
                                  </div>
                                )}

                                {/* Row 3: Angle + Description side by side */}
                                <div className="grid grid-cols-2 gap-3">
                                  {ad.angle && (
                                    <div>
                                      <label className="text-[10px] text-muted-foreground font-medium block mb-1">Angle</label>
                                      <Badge variant="outline" className="text-[10px] h-5">{ad.angle}</Badge>
                                    </div>
                                  )}
                                  {ad.description && (
                                    <div>
                                      <label className="text-[10px] text-muted-foreground font-medium block mb-1">Description</label>
                                      <InlineEdit
                                        value={ad.description}
                                        onSave={v => onUpdateNode(ci, 'description', v, si, ai)}
                                        className="text-[11px]"
                                      />
                                      <span className="text-[8px] text-muted-foreground/50 mt-0.5 block">Max 30 chars</span>
                                    </div>
                                  )}
                                  {ad.websiteUrl && (
                                    <div>
                                      <label className="text-[10px] text-muted-foreground font-medium block mb-1">Destination URL</label>
                                      <InlineEdit
                                        value={ad.websiteUrl}
                                        onSave={v => onUpdateNode(ci, 'websiteUrl', v, si, ai)}
                                        className="text-[11px] text-primary/80"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Creative Brief */}
                              <div className="px-3 py-3">
                                <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-3 flex items-center gap-1.5">
                                  <Sparkles className="w-3 h-3" /> Creative Brief
                                </p>

                                {isVideo ? (
                                  <VideoCreativeBrief
                                    ad={ad}
                                    frozenAds={frozenAds}
                                    onToggleFreeze={toggleFreeze}
                                    onUpdateField={(field, value) => onUpdateNode(ci, `creativeBrief.${field}`, value, si, ai)}
                                  />
                                ) : (
                                  <ImageCreativeBrief
                                    ad={ad}
                                    frozenAds={frozenAds}
                                    onToggleFreeze={toggleFreeze}
                                    onUpdateField={(field, value) => onUpdateNode(ci, `creativeBrief.${field}`, value, si, ai)}
                                  />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom bar */}
      <div className="border-t border-border/30 bg-card/80 backdrop-blur-sm px-4 py-3 shrink-0 space-y-2.5">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">{frozenCount}/{totalAds} creatives locked</span>
              <span className="text-[10px] font-medium text-foreground">{totalAds > 0 ? Math.round((frozenCount / totalAds) * 100) : 0}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", frozenCount === totalAds ? "bg-secondary" : "bg-primary/60")}
                style={{ width: `${totalAds > 0 ? (frozenCount / totalAds) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <DollarSign className="w-3.5 h-3.5 text-primary/60 shrink-0" />
            <span className="text-[11px] font-semibold text-foreground">${totalDaily}/day</span>
            <span className="text-[10px] text-muted-foreground">· {totalAds} ads</span>
          </div>
          <Button size="sm" className="h-8 text-[11px] gap-1.5" disabled={frozenCount < totalAds}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {frozenCount < totalAds ? `Lock all to approve` : 'Approve & Execute'}
          </Button>
        </div>
      </div>
    </div>
  );
};
