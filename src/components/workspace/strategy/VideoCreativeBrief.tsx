import { useState } from 'react';
import {
  Film, User, Sparkles, Lock, Unlock, Upload, FileText, ImageIcon,
  Monitor, Smartphone, Square, ChevronLeft, ChevronRight, Check, Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AVATARS } from '@/data/avatars';
import { VIDEO_USE_CASE_TEMPLATES } from '@/data/workspaceMockData';

interface VideoCreativeBriefProps {
  ad: any;
  frozenAds: Set<string>;
  onToggleFreeze: (adKey: string) => void;
  onUpdateField: (field: string, value: any) => void;
}

export const VideoCreativeBrief = ({ ad, frozenAds, onToggleFreeze, onUpdateField }: VideoCreativeBriefProps) => {
  const adKey = ad.name;
  const isFrozen = frozenAds.has(adKey);
  const brief = ad.creativeBrief || {};
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(brief.avatarId || null);
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(brief.useCaseId || null);
  const [avatarPage, setAvatarPage] = useState(0);
  const [description, setDescription] = useState(brief.productDescription || '');
  const [script, setScript] = useState(brief.script || `${ad.primaryText || ''}\n\n${ad.headline || ''}`);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const avatars = AVATARS.slice(0, 9);
  const useCases = (VIDEO_USE_CASE_TEMPLATES || []).slice(0, 6);
  const avatarsPerPage = 3;
  const totalAvatarPages = Math.ceil(avatars.length / avatarsPerPage);
  const visibleAvatars = avatars.slice(avatarPage * avatarsPerPage, (avatarPage + 1) * avatarsPerPage);
  const selectedTemplate = useCases.find((uc: any) => uc.id === selectedUseCase);
  const selectedAvatarData = avatars.find(a => a.id === selectedAvatar);

  // Completion tracking
  const completedFields = [
    !!selectedUseCase,
    !!selectedAvatar,
    description.trim().length > 0,
    script.trim().length > 0,
  ];
  const completedCount = completedFields.filter(Boolean).length;
  const totalFields = completedFields.length;

  const handleGenerateScript = () => {
    setIsGeneratingScript(true);
    setTimeout(() => {
      const generated = `🎬 Introducing the ultimate ${description || ad.primaryText || 'product'}!\n\nAre you tired of settling for less? Meet the game-changer you've been waiting for.\n\n✨ Premium quality that speaks for itself\n🚀 Designed for those who demand the best\n💪 Built to exceed your expectations\n\nDon't just take our word for it – experience the difference yourself.\n\n🔥 Order now and transform your everyday life!`;
      setScript(generated);
      onUpdateField('script', generated);
      setIsGeneratingScript(false);
    }, 1500);
  };

  return (
    <div className={cn("transition-all", isFrozen && "opacity-60 pointer-events-none")}>
      {/* Completion indicator */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-0.5">
          {completedFields.map((done, i) => (
            <div key={i} className={cn("w-6 h-1 rounded-full transition-colors", done ? "bg-secondary" : "bg-muted/50")} />
          ))}
        </div>
        <span className="text-[9px] text-muted-foreground">{completedCount}/{totalFields} configured</span>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-[1fr_1fr] gap-3">
        {/* LEFT: Visual config */}
        <div className="space-y-3">
          {/* Template Preview */}
          <div className="rounded-xl overflow-hidden bg-muted/30 border border-border/30">
            <div className="aspect-[4/3] relative overflow-hidden">
              {selectedTemplate ? (
                <img src={selectedTemplate.thumbnail} alt={selectedTemplate.label} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/50">
                  <Film className="w-8 h-8 text-muted-foreground/30" />
                </div>
              )}
              {selectedAvatarData && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm rounded-full pl-1 pr-2.5 py-1 border border-border/30">
                  <img src={selectedAvatarData.imageUrl} alt={selectedAvatarData.name} className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-[9px] font-medium text-foreground">{selectedAvatarData.name}</span>
                </div>
              )}
            </div>
            <p className="text-[11px] font-medium text-foreground px-2.5 py-2">
              {selectedTemplate?.label || 'Select a template below'}
            </p>
          </div>

          {/* Use Case Chips */}
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
              Use Case {selectedUseCase && <Check className="w-2.5 h-2.5 text-secondary inline ml-0.5" />}
            </p>
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

          {/* Avatar row */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">
                <User className="w-3 h-3" /> Presenter {selectedAvatar && <Check className="w-2.5 h-2.5 text-secondary inline" />}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <button onClick={() => setAvatarPage(p => Math.max(0, p - 1))} disabled={avatarPage === 0} className="p-0.5 rounded hover:bg-muted/50 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="tabular-nums">{avatarPage + 1}/{totalAvatarPages}</span>
                <button onClick={() => setAvatarPage(p => Math.min(totalAvatarPages - 1, p + 1))} disabled={avatarPage >= totalAvatarPages - 1} className="p-0.5 rounded hover:bg-muted/50 disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-3 h-3" />
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
                  <p className={cn("text-[9px] text-center truncate font-medium", selectedAvatar === avatar.id ? "text-primary" : "text-muted-foreground")}>{avatar.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-2 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Parameters
            </p>
            <div className="space-y-2">
              {[
                { label: 'Aspect', field: 'aspectRatio', default: '16:9', options: [
                  { value: '9:16', icon: <Smartphone className="w-2.5 h-2.5 mr-0.5" /> },
                  { value: '16:9', icon: <Monitor className="w-2.5 h-2.5 mr-0.5" /> },
                  { value: '1:1', icon: <Square className="w-2.5 h-2.5 mr-0.5" /> },
                ]},
                { label: 'Length', field: 'duration', default: '30s', options: [
                  { value: '15s' }, { value: '30s' }, { value: '60s' },
                ]},
                { label: 'Model', field: 'model', default: 'VEO', options: [
                  { value: 'VEO' }, { value: 'KLING' }, { value: 'SORA' },
                ]},
              ].map(param => (
                <div key={param.label} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-12 shrink-0 font-medium">{param.label}</span>
                  <div className="flex gap-1">
                    {param.options.map(o => (
                      <button key={o.value} className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium border transition-all",
                        (brief[param.field] || param.default) === o.value
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border/30 text-muted-foreground hover:border-primary/20"
                      )} onClick={() => onUpdateField(param.field, o.value)}>
                        {'icon' in o && o.icon}{o.value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Content & context */}
        <div className="space-y-3">
          {/* Product Description */}
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
              Product Description {description.trim() && <Check className="w-2.5 h-2.5 text-secondary inline ml-0.5" />}
            </p>
            <div className="relative">
              <textarea
                value={description}
                onChange={e => { if (e.target.value.length <= 200) { setDescription(e.target.value); onUpdateField('productDescription', e.target.value); } }}
                placeholder="What makes this product special?"
                rows={3}
                className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-[11px] text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none placeholder:text-muted-foreground/50 transition-all"
              />
              <span className="absolute bottom-2 right-2.5 text-[9px] text-muted-foreground/50 tabular-nums">{description.length}/200</span>
            </div>
          </div>

          {/* Script — proper textarea with generate option */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">
                <FileText className="w-3 h-3" /> Script {script.trim() && <Check className="w-2.5 h-2.5 text-secondary inline" />}
              </p>
              <button
                onClick={handleGenerateScript}
                disabled={isGeneratingScript}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                {isGeneratingScript ? (
                  <><div className="w-2.5 h-2.5 border border-primary border-t-transparent rounded-full animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 className="w-2.5 h-2.5" /> Auto-generate</>
                )}
              </button>
            </div>
            <textarea
              value={script}
              onChange={e => { setScript(e.target.value); onUpdateField('script', e.target.value); }}
              placeholder="Write what the presenter should say..."
              rows={5}
              className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-[11px] text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none placeholder:text-muted-foreground/50 transition-all leading-relaxed"
            />
          </div>

          {/* Reference Image Upload */}
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> Reference Image
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
              <button className="w-full aspect-[3/2] rounded-lg border-2 border-dashed border-border/40 hover:border-primary/30 flex flex-col items-center justify-center gap-1.5 transition-all bg-muted/10 hover:bg-muted/20 group">
                <Upload className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary/50 transition-colors" />
                <span className="text-[10px] font-medium text-muted-foreground/60 group-hover:text-foreground/60 transition-colors">Upload Product Image</span>
                <span className="text-[8px] text-muted-foreground/40">PNG, JPG, WEBP</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lock button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFreeze(adKey); }}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all border mt-4",
          isFrozen
            ? "bg-secondary/10 border-secondary/30 text-secondary"
            : completedCount === totalFields
              ? "bg-primary/10 border-primary/40 text-primary hover:bg-primary/15"
              : "bg-muted/30 border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
        )}
      >
        {isFrozen ? <><Lock className="w-3.5 h-3.5" /> Creative Locked ✓</> : <><Unlock className="w-3.5 h-3.5" /> Lock Creative Strategy</>}
      </button>
    </div>
  );
};
