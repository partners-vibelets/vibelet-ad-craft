import { useState, useCallback, useRef } from 'react';
import {
  Target, Layers, ChevronDown, ChevronRight, Check,
  DollarSign, Sparkles, Lock, CheckCircle2, X,
  Upload, FolderOpen, Wand2, CalendarDays, Link2,
} from 'lucide-react';
import { format } from 'date-fns';
import { Artifact } from '@/types/workspace';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { InlineEdit } from './strategy/InlineEdit';
import { CreativeSourceTabs } from './strategy/CreativeSourceTabs';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
} from '@/components/ui/dropdown-menu';

// Meta CTA options for inline ad copy editing
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
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  const d = artifact.data;
  const plan = d.strategyPlan || d;
  const campaigns = plan.campaigns || [];
  const planType = plan.planType || 'simple';
  const confidence = plan.confidenceScore || 0;
  const totalDaily = plan.totalDailyBudget || 0;
  const totalMonthly = plan.totalMonthlyBudget || 0;

  // Collect all ads for batch ops
  const allAds: { key: string; ad: any; ci: number; si: number; ai: number }[] = [];
  let totalAds = 0;
  campaigns.forEach((c: any, ci: number) => (c.adSets || []).forEach((s: any, si: number) => {
    (s.ads || []).forEach((ad: any, ai: number) => {
      const key = `${c.name}-${s.name}-${ad.name}`;
      if (!removedAds.has(key)) {
        totalAds++;
        allAds.push({ key, ad, ci, si, ai });
      }
    });
  }));
  const frozenCount = frozenAds.size;
  const unlockedCount = totalAds - frozenCount;

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
    setFrozenAds(prev => {
      const next = new Set(prev);
      next.delete(adKey);
      return next;
    });
  }, []);

  const isVideoFormat = (format: string) => /video/i.test(format);
  const isCarouselFormat = (format: string) => /carousel/i.test(format);

  // Get creative status for an ad
  const getAdStatus = (ad: any) => {
    const adKey = ad.name;
    if (frozenAds.has(adKey)) return 'locked';
    if (ad.attachedCreative) return 'ready';
    return 'empty';
  };

  // Batch Upload All — auto-map files to unlocked ads in order
  const handleBatchUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const unlocked = allAds.filter(a => !frozenAds.has(a.ad.name));
    files.forEach((file, i) => {
      if (i >= unlocked.length) return;
      const { ci, si, ai } = unlocked[i];
      const url = URL.createObjectURL(file);
      const creative = {
        url,
        type: file.type.startsWith('video') ? 'video' as const : 'image' as const,
        fileName: file.name,
      };
      onUpdateNode(ci, 'attachedCreative', creative, si, ai);
      onUpdateNode(ci, 'creativeSource', 'upload', si, ai);
    });
    if (batchFileInputRef.current) batchFileInputRef.current.value = '';
  }, [allAds, frozenAds, onUpdateNode]);

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
                      const status = getAdStatus(ad);
                      return (
                        <div key={ai} className="ml-6 border-l border-border/20">
                          {/* Ad row with thumbnail + status badge */}
                          <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 transition-all rounded-r-lg group",
                            "hover:bg-muted/15",
                            isExpanded(ci, si, ai) && "bg-primary/5"
                          )}>
                            <button
                              onClick={() => toggleNode(ci, si, ai)}
                              className="flex items-center gap-2 flex-1 min-w-0 text-left"
                            >
                              {/* Thumbnail or placeholder */}
                              {ad.attachedCreative ? (
                                <div className="w-6 h-6 rounded-md overflow-hidden shrink-0 border border-border/30">
                                  <img src={ad.attachedCreative.url} alt="" className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <span className="text-[10px] shrink-0 w-6 text-center">
                                  {isVideo ? '🎬' : isCarouselFormat(ad.format) ? '🔄' : '🖼️'}
                                </span>
                              )}
                              <span className="text-[11px] text-foreground flex-1 truncate">{ad.name}</span>
                            </button>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Status badge */}
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[8px] h-4 px-1.5 border",
                                  status === 'locked' && "bg-secondary/10 border-secondary/30 text-secondary",
                                  status === 'ready' && "bg-amber-500/10 border-amber-500/30 text-amber-600",
                                  status === 'empty' && "bg-muted/20 border-border/30 text-muted-foreground/50"
                                )}
                              >
                                {status === 'locked' && <><Lock className="w-2.5 h-2.5 mr-0.5" />Locked</>}
                                {status === 'ready' && 'Ready'}
                                {status === 'empty' && 'Not set'}
                              </Badge>
                              <Badge variant="outline" className="text-[8px] h-3.5 px-1.5">{ad.format}</Badge>
                              {/* Remove button */}
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
                            <div className="px-3 pb-4 pt-3 animate-fade-in space-y-5">
                              {/* Ad copy fields */}
                              <div className="space-y-4">
                                {/* Headline + CTA */}
                                <div className="grid grid-cols-[1fr_160px] gap-4 items-start">
                                  {ad.headline && (
                                    <div>
                                      <label className="text-[11px] text-muted-foreground font-medium block mb-1.5">Headline</label>
                                      <InlineEdit
                                        value={ad.headline}
                                        onSave={v => onUpdateNode(ci, 'headline', v, si, ai)}
                                        className="text-[13px] font-medium"
                                      />
                                      <span className="text-[9px] text-muted-foreground/40 mt-1 block">Max 40 chars</span>
                                    </div>
                                  )}
                                  {ad.cta && (
                                    <div>
                                      <label className="text-[11px] text-muted-foreground font-medium block mb-1.5">Call to Action</label>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <button className="w-full flex items-center justify-between text-[12px] font-medium bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-foreground hover:border-primary/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer">
                                            <span>{ad.cta}</span>
                                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 ml-2" />
                                          </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[180px] max-h-[280px] overflow-y-auto">
                                          {META_CTA_OPTIONS.map(cta => (
                                            <DropdownMenuItem
                                              key={cta}
                                              onClick={() => onUpdateNode(ci, 'cta', cta, si, ai)}
                                              className={cn("text-[12px] cursor-pointer", ad.cta === cta && "bg-primary/10 text-primary font-medium")}
                                            >
                                              {ad.cta === cta && <Check className="w-3 h-3 mr-2 shrink-0" />}
                                              {cta}
                                            </DropdownMenuItem>
                                          ))}
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  )}
                                </div>

                                {/* Primary Text */}
                                {ad.primaryText && (
                                  <div>
                                    <label className="text-[11px] text-muted-foreground font-medium block mb-1.5">Primary Text</label>
                                    <InlineEdit
                                      value={ad.primaryText}
                                      onSave={v => onUpdateNode(ci, 'primaryText', v, si, ai)}
                                      className="text-[13px] leading-relaxed"
                                      multiline
                                    />
                                    <span className="text-[9px] text-muted-foreground/40 mt-1 block">Max 125 chars for best performance</span>
                                  </div>
                                )}

                                {/* Angle + Description */}
                                <div className="grid grid-cols-2 gap-4">
                                  {ad.angle && (
                                    <div>
                                      <label className="text-[11px] text-muted-foreground font-medium block mb-1.5">Angle</label>
                                      <Badge variant="outline" className="text-[10px] h-6 px-3">{ad.angle}</Badge>
                                    </div>
                                  )}
                                  {ad.description && (
                                    <div>
                                      <label className="text-[11px] text-muted-foreground font-medium block mb-1.5">Description</label>
                                      <InlineEdit
                                        value={ad.description}
                                        onSave={v => onUpdateNode(ci, 'description', v, si, ai)}
                                        className="text-[12px]"
                                      />
                                      <span className="text-[9px] text-muted-foreground/40 mt-1 block">Max 30 chars</span>
                                    </div>
                                  )}
                                </div>
                                {ad.websiteUrl && (
                                  <div>
                                    <label className="text-[11px] text-muted-foreground font-medium block mb-1.5">Destination URL</label>
                                    <InlineEdit
                                      value={ad.websiteUrl}
                                      onSave={v => onUpdateNode(ci, 'websiteUrl', v, si, ai)}
                                      className="text-[12px] text-primary/80"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Divider */}
                              <div className="border-t border-border/15" />

                              {/* Creative Brief — Upload-first with tabs */}
                              <div>
                                <p className="text-[11px] uppercase tracking-wider text-primary font-semibold mb-5 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5" /> Creative
                                </p>

                                <CreativeSourceTabs
                                  ad={ad}
                                  isVideo={isVideo}
                                  frozenAds={frozenAds}
                                  onToggleFreeze={toggleFreeze}
                                  onUpdateField={(field, value) => onUpdateNode(ci, `creativeBrief.${field}`, value, si, ai)}
                                  onUpdateAdCopy={(field, value) => onUpdateNode(ci, field, value, si, ai)}
                                  productImages={ad.productImages || ad.brief?.productImages}
                                />
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

      {/* Hidden batch file input */}
      <input
        ref={batchFileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={handleBatchUpload}
      />

      {/* Batch operations bar — shown when 2+ unlocked ads */}
      {unlockedCount >= 2 && (
        <div className="border-t border-border/20 bg-background/80 backdrop-blur-md px-4 py-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/60 shrink-0">Batch:</span>
            <div className="flex items-center gap-1.5 flex-1">
              <button
                onClick={() => batchFileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/20 hover:bg-muted/40 border border-border/20 hover:border-primary/30 text-[10px] font-medium text-foreground/70 hover:text-foreground transition-all"
              >
                <Upload className="w-3 h-3" />
                Upload All
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/20 hover:bg-muted/40 border border-border/20 hover:border-primary/30 text-[10px] font-medium text-foreground/70 hover:text-foreground transition-all">
                <FolderOpen className="w-3 h-3" />
                Use Same
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 hover:bg-primary/15 border border-primary/20 hover:border-primary/30 text-[10px] font-medium text-primary/80 hover:text-primary transition-all">
                <Wand2 className="w-3 h-3" />
                AI Generate All
              </button>
            </div>
            <span className="text-[9px] text-muted-foreground/40 tabular-nums shrink-0">{unlockedCount} unlocked</span>
          </div>
        </div>
      )}

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
