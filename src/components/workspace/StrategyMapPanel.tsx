import { useState, useCallback } from 'react';
import {
  Target, Layers, ChevronDown, ChevronRight, Check, X, Edit3,
  DollarSign, Sparkles, Image as ImageIcon, Film, Lock, Unlock,
  User, FileText, Palette, Eye, CheckCircle2, Upload, Monitor, Smartphone, Square,
  ChevronLeft, ChevronRightIcon
} from 'lucide-react';
import { Artifact } from '@/types/workspace';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { AVATARS } from '@/data/avatars';
import { VIDEO_USE_CASE_TEMPLATES } from '@/data/workspaceMockData';

interface StrategyMapPanelProps {
  artifact: Artifact;
  onUpdateNode: (campaignIdx: number, field: string, value: any, adSetIdx?: number, adIdx?: number) => void;
}

type NodePath = { campaignIdx: number; adSetIdx?: number; adIdx?: number } | null;

// Inline editable field
const InlineEdit = ({ value, onSave, className, multiline }: { value: string; onSave: (v: string) => void; className?: string; multiline?: boolean }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <div className="flex items-start gap-1.5">
        {multiline ? (
          <textarea
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
            rows={3}
            className="flex-1 bg-muted/50 border border-primary/30 rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 resize-none transition-all"
          />
        ) : (
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { onSave(draft); setEditing(false); }
              if (e.key === 'Escape') { setDraft(value); setEditing(false); }
            }}
            className="flex-1 bg-muted/50 border border-primary/30 rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        )}
        <button onClick={() => { onSave(draft); setEditing(false); }} className="text-secondary shrink-0 p-1 rounded-md hover:bg-secondary/10 transition-colors mt-0.5"><Check className="w-3.5 h-3.5" /></button>
        <button onClick={() => { setDraft(value); setEditing(false); }} className="text-muted-foreground shrink-0 p-1 rounded-md hover:bg-muted/50 transition-colors mt-0.5"><X className="w-3.5 h-3.5" /></button>
      </div>
    );
  }

  return (
    <button
      className={cn(
        "text-left inline-flex items-start gap-1.5 px-2 py-1 -mx-2 rounded-lg",
        "border border-dashed border-border/40 hover:border-primary/40",
        "hover:bg-primary/5 transition-all cursor-text group/edit",
        className
      )}
      onClick={e => { e.stopPropagation(); setEditing(true); }}
      title="Click to edit"
    >
      <span className={cn("flex-1", multiline && "whitespace-pre-wrap")}>{value}</span>
      <Edit3 className="w-3 h-3 text-muted-foreground/40 group-hover/edit:text-primary/60 shrink-0 mt-0.5 transition-colors" />
    </button>
  );
};

// Creative brief card for Video ads — matches reference layout
const VideoCreativeBrief = ({ ad, frozenAds, onToggleFreeze, onUpdateField }: {
  ad: any;
  frozenAds: Set<string>;
  onToggleFreeze: (adKey: string) => void;
  onUpdateField: (field: string, value: any) => void;
}) => {
  const adKey = ad.name;
  const isFrozen = frozenAds.has(adKey);
  const brief = ad.creativeBrief || {};
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(brief.avatarId || null);
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(brief.useCaseId || null);
  const [avatarPage, setAvatarPage] = useState(0);
  const [description, setDescription] = useState(brief.productDescription || '');
  const avatars = AVATARS.slice(0, 9);
  const useCases = (VIDEO_USE_CASE_TEMPLATES || []).slice(0, 6);
  const avatarsPerPage = 3;
  const totalAvatarPages = Math.ceil(avatars.length / avatarsPerPage);
  const visibleAvatars = avatars.slice(avatarPage * avatarsPerPage, (avatarPage + 1) * avatarsPerPage);

  const selectedTemplate = useCases.find((uc: any) => uc.id === selectedUseCase);

  return (
    <div className={cn(
      "transition-all",
      isFrozen && "opacity-60 pointer-events-none"
    )}>
      {/* Main 2-column layout like reference */}
      <div className="grid grid-cols-[1fr_1fr] gap-3">
        {/* LEFT COLUMN: Template preview + Avatars + Parameters */}
        <div className="space-y-3">
          {/* Template Preview Card */}
          <div className="rounded-xl overflow-hidden bg-muted/30 border border-border/30">
            <div className="aspect-[4/3] relative overflow-hidden">
              {selectedTemplate ? (
                <img src={selectedTemplate.thumbnail} alt={selectedTemplate.label} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/50">
                  <Film className="w-8 h-8 text-muted-foreground/30" />
                </div>
              )}
            </div>
            <p className="text-[11px] font-medium text-foreground px-2.5 py-2">
              {selectedTemplate?.label || 'Select a template'}
            </p>
          </div>

          {/* Use Case Chips */}
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">Use Case</p>
            <div className="flex flex-wrap gap-1">
              {useCases.map((uc: any) => (
                <button
                  key={uc.id}
                  onClick={() => { setSelectedUseCase(uc.id); onUpdateField('useCaseId', uc.id); }}
                  className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-medium border transition-all",
                    selectedUseCase === uc.id
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border/40 text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {uc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Styles — paginated row */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">
                <User className="w-3 h-3" /> Avatar Styles <span className="text-destructive">*</span>
              </p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <button
                  onClick={() => setAvatarPage(p => Math.max(0, p - 1))}
                  disabled={avatarPage === 0}
                  className="p-0.5 rounded hover:bg-muted/50 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="tabular-nums">{avatarPage + 1}/{totalAvatarPages}</span>
                <button
                  onClick={() => setAvatarPage(p => Math.min(totalAvatarPages - 1, p + 1))}
                  disabled={avatarPage >= totalAvatarPages - 1}
                  className="p-0.5 rounded hover:bg-muted/50 disabled:opacity-30 transition-colors"
                >
                  <ChevronRightIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              {visibleAvatars.map(avatar => (
                <button
                  key={avatar.id}
                  onClick={() => { setSelectedAvatar(avatar.id); onUpdateField('avatarId', avatar.id); }}
                  className={cn(
                    "shrink-0 flex-1 rounded-lg border-2 p-1 transition-all",
                    selectedAvatar === avatar.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/30 hover:border-primary/30"
                  )}
                >
                  <div className="aspect-square rounded-md bg-muted overflow-hidden mb-1">
                    <img src={avatar.imageUrl} alt={avatar.name} className="w-full h-full object-cover" />
                  </div>
                  <p className={cn(
                    "text-[9px] text-center truncate font-medium",
                    selectedAvatar === avatar.id ? "text-primary" : "text-muted-foreground"
                  )}>{avatar.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Parameters — pill selectors */}
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-2 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Parameters
            </p>
            <div className="space-y-2">
              {/* Aspect */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-12 shrink-0 font-medium">Aspect</span>
                <div className="flex gap-1">
                  {[
                    { value: '9:16', icon: <Smartphone className="w-2.5 h-2.5 mr-0.5" /> },
                    { value: '16:9', icon: <Monitor className="w-2.5 h-2.5 mr-0.5" /> },
                    { value: '1:1', icon: <Square className="w-2.5 h-2.5 mr-0.5" /> },
                  ].map(r => (
                    <button key={r.value} className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium border transition-all",
                      (brief.aspectRatio || '16:9') === r.value
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border/30 text-muted-foreground hover:border-primary/20"
                    )} onClick={() => onUpdateField('aspectRatio', r.value)}>
                      {r.icon}{r.value}
                    </button>
                  ))}
                </div>
              </div>
              {/* Length */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-12 shrink-0 font-medium">Length</span>
                <div className="flex gap-1">
                  {['15s', '30s', '60s'].map(l => (
                    <button key={l} className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all",
                      (brief.duration || '30s') === l
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border/30 text-muted-foreground hover:border-primary/20"
                    )} onClick={() => onUpdateField('duration', l)}>{l}</button>
                  ))}
                </div>
              </div>
              {/* Model */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-12 shrink-0 font-medium">Model</span>
                <div className="flex gap-1">
                  {['VEO', 'KLING', 'SORA'].map(m => (
                    <button key={m} className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all",
                      (brief.model || 'VEO') === m
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border/30 text-muted-foreground hover:border-primary/20"
                    )} onClick={() => onUpdateField('model', m)}>{m}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Product Description + Script + Reference Image Upload */}
        <div className="space-y-3">
          {/* Product Description */}
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
              Product Description <span className="text-destructive">*</span>
            </p>
            <div className="relative">
              <textarea
                value={description}
                onChange={e => {
                  if (e.target.value.length <= 200) {
                    setDescription(e.target.value);
                    onUpdateField('productDescription', e.target.value);
                  }
                }}
                placeholder="Enter product details..."
                rows={4}
                className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-[11px] text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none placeholder:text-muted-foreground/50 transition-all"
              />
              <span className="absolute bottom-2 right-2.5 text-[9px] text-muted-foreground/50 tabular-nums">
                {description.length}/200
              </span>
            </div>
          </div>

          {/* Script */}
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium flex items-center gap-1">
              <FileText className="w-3 h-3" /> Script
            </p>
            <InlineEdit
              value={brief.script || `${ad.primaryText || ''}\n\n${ad.headline || ''}`}
              onSave={v => onUpdateField('script', v)}
              className="text-[11px] leading-relaxed"
              multiline
            />
          </div>

          {/* Reference Image Upload */}
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> Reference Image <span className="text-destructive">*</span>
            </p>
            {brief.productImages && brief.productImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-1.5">
                {brief.productImages.slice(0, 4).map((img: string, i: number) => (
                  <div key={i} className="aspect-square rounded-lg bg-muted overflow-hidden border border-border/30">
                    <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <button className="w-full aspect-[4/3] rounded-lg border-2 border-dashed border-border/40 hover:border-primary/30 flex flex-col items-center justify-center gap-2 transition-all bg-muted/10 hover:bg-muted/20 group">
                <Upload className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary/50 transition-colors" />
                <span className="text-[10px] font-medium text-muted-foreground/60 group-hover:text-foreground/60 transition-colors">Upload Product</span>
                <span className="text-[9px] text-muted-foreground/40">PNG, JPG, JPEG, WEBP • Max 10 MB</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Freeze Button — full width below */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFreeze(adKey); }}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all border mt-4",
          isFrozen
            ? "bg-secondary/10 border-secondary/30 text-secondary"
            : "bg-muted/30 border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
        )}
      >
        {isFrozen ? <><Lock className="w-3.5 h-3.5" /> Creative Locked</> : <><Unlock className="w-3.5 h-3.5" /> Lock Creative Strategy</>}
      </button>
    </div>
  );
};

// Creative brief card for Image ads — 2 column layout with preview + controls
const ImageCreativeBrief = ({ ad, frozenAds, onToggleFreeze, onUpdateField }: {
  ad: any;
  frozenAds: Set<string>;
  onToggleFreeze: (adKey: string) => void;
  onUpdateField: (field: string, value: any) => void;
}) => {
  const adKey = ad.name;
  const isFrozen = frozenAds.has(adKey);
  const brief = ad.creativeBrief || {};
  const productImages = brief.productImages || [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop',
  ];
  const [selectedImg, setSelectedImg] = useState<number>(brief.selectedImageIdx || 0);

  return (
    <div className={cn(
      "transition-all",
      isFrozen && "opacity-60 pointer-events-none"
    )}>
      <div className="grid grid-cols-[1fr_1fr] gap-3">
        {/* LEFT: Selected image preview + thumbnails */}
        <div className="space-y-2">
          {/* Main preview */}
          <div className="aspect-square rounded-xl overflow-hidden border border-border/30 bg-muted/20">
            <img
              src={productImages[selectedImg]}
              alt={`Product reference ${selectedImg + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Thumbnail strip */}
          <div className="grid grid-cols-4 gap-1.5">
            {productImages.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => { setSelectedImg(i); onUpdateField('selectedImageIdx', i); }}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                  selectedImg === i
                    ? "border-primary ring-1 ring-primary/20"
                    : "border-border/20 hover:border-primary/30 opacity-60 hover:opacity-100"
                )}
              >
                <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                {selectedImg === i && (
                  <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2 h-2 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground/50 text-center">Scraped from product page • Select reference for AI generation</p>
        </div>

        {/* RIGHT: Visual direction + style + upload */}
        <div className="space-y-3">
          {/* Visual Direction */}
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium flex items-center gap-1">
              <Palette className="w-3 h-3" /> Visual Direction
            </p>
            <InlineEdit
              value={brief.visualDirection || ad.visualDirection || 'Describe the visual style...'}
              onSave={v => onUpdateField('visualDirection', v)}
              className="text-[11px] leading-relaxed"
              multiline
            />
          </div>

          {/* Aspect Ratio */}
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">Output Format</p>
            <div className="flex gap-1">
              {[
                { value: '1:1', label: 'Square', icon: <Square className="w-2.5 h-2.5" /> },
                { value: '4:5', label: 'Portrait', icon: <Smartphone className="w-2.5 h-2.5" /> },
                { value: '1.91:1', label: 'Landscape', icon: <Monitor className="w-2.5 h-2.5" /> },
              ].map(f => (
                <button key={f.value} className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border transition-all",
                  (brief.outputFormat || '1:1') === f.value
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border/30 text-muted-foreground hover:border-primary/20"
                )} onClick={() => onUpdateField('outputFormat', f.value)}>
                  {f.icon}{f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Offer Hook */}
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">Offer Hook</p>
            <InlineEdit
              value={brief.offerHook || ad.offerHook || 'e.g. 25% off Spring Sale'}
              onSave={v => onUpdateField('offerHook', v)}
              className="text-[11px]"
            />
          </div>

          {/* Upload additional reference */}
          <button className="w-full py-3 rounded-lg border-2 border-dashed border-border/30 hover:border-primary/30 flex flex-col items-center justify-center gap-1 transition-all bg-muted/10 hover:bg-muted/20 group">
            <Upload className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/50 transition-colors" />
            <span className="text-[9px] font-medium text-muted-foreground/60 group-hover:text-foreground/60 transition-colors">Upload Additional Reference</span>
            <span className="text-[8px] text-muted-foreground/40">PNG, JPG • Max 10 MB</span>
          </button>
        </div>
      </div>

      {/* Freeze Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFreeze(adKey); }}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all border mt-4",
          isFrozen
            ? "bg-secondary/10 border-secondary/30 text-secondary"
            : "bg-muted/30 border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
        )}
      >
        {isFrozen ? <><Lock className="w-3.5 h-3.5" /> Creative Locked</> : <><Unlock className="w-3.5 h-3.5" /> Lock Creative Strategy</>}
      </button>
    </div>
  );
};

export const StrategyMapPanel = ({ artifact, onUpdateNode }: StrategyMapPanelProps) => {
  const [expandedNode, setExpandedNode] = useState<NodePath>(null);
  const [frozenAds, setFrozenAds] = useState<Set<string>>(new Set());

  const d = artifact.data;
  const plan = d.strategyPlan || d;
  const campaigns = plan.campaigns || [];
  const planType = plan.planType || 'simple';
  const confidence = plan.confidenceScore || 0;
  const totalDaily = plan.totalDailyBudget || 0;
  const totalMonthly = plan.totalMonthlyBudget || 0;

  // Count total ads and frozen ads
  let totalAds = 0;
  campaigns.forEach((c: any) => (c.adSets || []).forEach((s: any) => { totalAds += (s.ads || []).length; }));
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
                      const isFrozen = frozenAds.has(ad.name);
                      return (
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
                              {isVideoFormat(ad.format) ? '🎬' : isCarouselFormat(ad.format) ? '🔄' : '🖼️'}
                            </span>
                            <span className="text-[11px] text-foreground flex-1 truncate">{ad.name}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {isFrozen && <CheckCircle2 className="w-3 h-3 text-secondary" />}
                              <Badge variant="outline" className="text-[8px] h-3.5 px-1.5 shrink-0">{ad.format}</Badge>
                            </div>
                          </button>

                          {/* Ad detail card with creative brief */}
                          {isExpanded(ci, si, ai) && (
                            <div className="ml-6 mr-2 mb-2 px-3 py-3 rounded-lg bg-muted/10 border border-border/20 space-y-3 animate-fade-in">
                              {/* Ad Copy Fields */}
                              <div className="space-y-2.5">
                                <div className="grid grid-cols-2 gap-2.5">
                                  <div>
                                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">Ad Name</p>
                                    <InlineEdit value={ad.name} onSave={v => onUpdateNode(ci, 'name', v, si, ai)} className="text-[12px] font-medium" />
                                  </div>
                                  <div>
                                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">Format</p>
                                    <InlineEdit value={ad.format} onSave={v => onUpdateNode(ci, 'format', v, si, ai)} className="text-[12px]" />
                                  </div>
                                </div>
                                {ad.headline && (
                                  <div>
                                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">Headline</p>
                                    <InlineEdit value={ad.headline} onSave={v => onUpdateNode(ci, 'headline', v, si, ai)} className="text-[12px]" />
                                  </div>
                                )}
                                {ad.primaryText && (
                                  <div>
                                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">Primary Text</p>
                                    <InlineEdit value={ad.primaryText} onSave={v => onUpdateNode(ci, 'primaryText', v, si, ai)} className="text-[12px]" multiline />
                                  </div>
                                )}
                                {ad.cta && (
                                  <div>
                                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">CTA</p>
                                    <InlineEdit value={ad.cta} onSave={v => onUpdateNode(ci, 'cta', v, si, ai)} className="text-[12px]" />
                                  </div>
                                )}
                                {ad.angle && (
                                  <div>
                                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">Angle</p>
                                    <Badge variant="outline" className="text-[10px] h-5">{ad.angle}</Badge>
                                  </div>
                                )}
                              </div>

                              {/* Divider */}
                              <div className="border-t border-border/30 pt-3">
                                <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-3 flex items-center gap-1.5">
                                  <Sparkles className="w-3 h-3" /> Creative Brief
                                </p>

                                {isVideoFormat(ad.format) ? (
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

      {/* Bottom bar — progress + approve */}
      <div className="border-t border-border/30 bg-card/80 backdrop-blur-sm px-4 py-3 shrink-0 space-y-2.5">
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">
                {frozenCount}/{totalAds} creatives locked
              </span>
              <span className="text-[10px] font-medium text-foreground">
                {totalAds > 0 ? Math.round((frozenCount / totalAds) * 100) : 0}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  frozenCount === totalAds ? "bg-secondary" : "bg-primary/60"
                )}
                style={{ width: `${totalAds > 0 ? (frozenCount / totalAds) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Budget + Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <DollarSign className="w-3.5 h-3.5 text-primary/60 shrink-0" />
            <span className="text-[11px] font-semibold text-foreground">${totalDaily}/day</span>
            <span className="text-[10px] text-muted-foreground">· {totalAds} ads</span>
          </div>
          <Button
            size="sm"
            className="h-8 text-[11px] gap-1.5"
            disabled={frozenCount < totalAds}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {frozenCount < totalAds ? `Lock all to approve` : 'Approve & Execute'}
          </Button>
        </div>
      </div>
    </div>
  );
};
