import { useState, useRef, useCallback } from 'react';
import {
  Film, User, Sparkles, Lock, Unlock, Upload, FileText, ImageIcon,
  Smartphone, Square, ChevronLeft, ChevronRight, Check, Wand2, Monitor,
  FolderOpen, Eye, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AVATARS } from '@/data/avatars';
import { VIDEO_USE_CASE_TEMPLATES } from '@/data/workspaceMockData';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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
  const [useCasePage, setUseCasePage] = useState(0);
  const [avatarPage, setAvatarPage] = useState(0);
  const [description, setDescription] = useState(brief.productDescription || '');
  const [script, setScript] = useState(brief.script || `${ad.primaryText || ''}\n\n${ad.headline || ''}`);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [selectedRefImg, setSelectedRefImg] = useState<number>(brief.selectedRefImgIdx ?? 0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview lightbox state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<{ type: 'usecase' | 'avatar'; data: any } | null>(null);

  const defaultImages = [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop',
  ];
  const defaultImageCount = defaultImages.length;
  const [productImages, setProductImages] = useState<string[]>(brief.productImages || defaultImages);

  const avatars = AVATARS.slice(0, 9);
  const useCases = (VIDEO_USE_CASE_TEMPLATES || []).slice(0, 8);
  const avatarsPerPage = 3;
  const useCasesPerPage = 3;
  const totalAvatarPages = Math.ceil(avatars.length / avatarsPerPage);
  const totalUseCasePages = Math.ceil(useCases.length / useCasesPerPage);
  const visibleAvatars = avatars.slice(avatarPage * avatarsPerPage, (avatarPage + 1) * avatarsPerPage);
  const visibleUseCases = useCases.slice(useCasePage * useCasesPerPage, (useCasePage + 1) * useCasesPerPage);

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

  const handleGenerateDesc = () => {
    setIsGeneratingDesc(true);
    setTimeout(() => {
      const generated = `Premium quality ${ad.name || 'product'} designed for the modern consumer. Crafted with attention to detail, combining style and functionality for everyday use.`;
      setDescription(generated);
      onUpdateField('productDescription', generated);
      setIsGeneratingDesc(false);
    }, 1000);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const newImages = [...productImages, url];
    setProductImages(newImages);
    setSelectedRefImg(newImages.length - 1);
    onUpdateField('productImages', newImages);
    onUpdateField('selectedRefImgIdx', newImages.length - 1);
    // Reset file input so same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteImage = (index: number) => {
    if (productImages.length <= 1) return;
    const newImages = productImages.filter((_, i) => i !== index);
    setProductImages(newImages);
    const newSelected = selectedRefImg >= newImages.length
      ? newImages.length - 1
      : selectedRefImg > index
        ? selectedRefImg - 1
        : selectedRefImg === index
          ? Math.min(index, newImages.length - 1)
          : selectedRefImg;
    setSelectedRefImg(newSelected);
    onUpdateField('productImages', newImages);
    onUpdateField('selectedRefImgIdx', newSelected);
  };

  // User-added images are appended after default images
  const isUserAdded = (index: number) => index >= defaultImageCount;

  const openPreview = (type: 'usecase' | 'avatar', data: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewContent({ type, data });
    setPreviewOpen(true);
  };

  return (
    <div className={cn("transition-all", isFrozen && "opacity-60 pointer-events-none")}>
      {/* Completion indicator */}
      <div className="flex items-center gap-2.5 mb-7">
        <div className="flex gap-1">
          {completedFields.map((done, i) => (
            <div key={i} className={cn("w-10 h-1.5 rounded-full transition-colors", done ? "bg-secondary" : "bg-muted/40")} />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">{completedCount}/{totalFields} configured</span>
      </div>

      {/* Video Style — visual carousel cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5" /> Video Style {selectedUseCase && <Check className="w-3 h-3 text-secondary inline" />}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <button onClick={() => setUseCasePage(p => Math.max(0, p - 1))} disabled={useCasePage === 0} className="p-1 rounded-md hover:bg-muted/50 disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="tabular-nums">{useCasePage + 1}/{totalUseCasePages}</span>
            <button onClick={() => setUseCasePage(p => Math.min(totalUseCasePages - 1, p + 1))} disabled={useCasePage >= totalUseCasePages - 1} className="p-1 rounded-md hover:bg-muted/50 disabled:opacity-30 transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {visibleUseCases.map((uc: any) => (
            <div
              key={uc.id}
              onClick={() => { setSelectedUseCase(uc.id); onUpdateField('useCaseId', uc.id); }}
              className={cn(
                "rounded-xl border-2 overflow-hidden transition-all text-left relative group cursor-pointer",
                selectedUseCase === uc.id
                  ? "border-primary shadow-md ring-1 ring-primary/20"
                  : "border-border/30 hover:border-primary/30"
              )}
            >
              <div className="aspect-[4/3] bg-muted overflow-hidden relative">
                <img src={uc.thumbnail} alt={uc.label} className="w-full h-full object-cover" />
                {uc.recommended && (
                  <span className="absolute top-1.5 left-1.5 text-[8px] bg-secondary/90 text-secondary-foreground px-2 py-0.5 rounded-full font-semibold uppercase z-10">Best</span>
                )}
                {/* Preview eye — small corner button */}
                <button
                  onClick={(e) => openPreview('usecase', uc, e)}
                  className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 z-10 hover:bg-background shadow-sm border border-border/30"
                >
                  <Eye className="w-3.5 h-3.5 text-foreground" />
                </button>
              </div>
              <div className="px-3 py-2.5">
                <p className={cn("text-[11px] font-semibold truncate", selectedUseCase === uc.id ? "text-primary" : "text-foreground")}>{uc.label}</p>
                <p className="text-[9px] text-muted-foreground/60 line-clamp-1 mt-0.5">{uc.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-2 gap-8">
        {/* LEFT: Visual config */}
        <div className="divide-y divide-border/15 [&>*]:py-6 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
          {/* Avatar / Presenter */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Presenter {selectedAvatar && <Check className="w-3 h-3 text-secondary inline" />}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <button onClick={() => setAvatarPage(p => Math.max(0, p - 1))} disabled={avatarPage === 0} className="p-1 rounded-md hover:bg-muted/50 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="tabular-nums">{avatarPage + 1}/{totalAvatarPages}</span>
                <button onClick={() => setAvatarPage(p => Math.min(totalAvatarPages - 1, p + 1))} disabled={avatarPage >= totalAvatarPages - 1} className="p-1 rounded-md hover:bg-muted/50 disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {visibleAvatars.map(avatar => (
                <div
                  key={avatar.id}
                  onClick={() => { setSelectedAvatar(avatar.id); onUpdateField('avatarId', avatar.id); }}
                  className={cn(
                    "rounded-xl border-2 p-2 transition-all relative group cursor-pointer",
                    selectedAvatar === avatar.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border/30 hover:border-primary/30"
                  )}
                >
                  <div className="aspect-square rounded-lg bg-muted overflow-hidden mb-2 relative">
                    <img src={avatar.imageUrl} alt={avatar.name} className="w-full h-full object-cover" />
                    {/* Preview eye — small corner button */}
                    <button
                      onClick={(e) => openPreview('avatar', avatar, e)}
                      className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 z-10 hover:bg-background shadow-sm border border-border/30"
                    >
                      <Eye className="w-3 h-3 text-foreground" />
                    </button>
                  </div>
                  <p className={cn("text-[10px] text-center truncate font-medium", selectedAvatar === avatar.id ? "text-primary" : "text-muted-foreground")}>{avatar.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reference Image — large preview + thumbnail strip (matching Image Brief UX) */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2.5 font-medium flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Reference Image
            </p>
            {/* Large preview */}
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-border/25 bg-muted/10 relative group mb-3">
              <img
                src={productImages[selectedRefImg]}
                alt={`Product reference ${selectedRefImg + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
              </div>
              {/* Delete badge for user-added images */}
              {isUserAdded(selectedRefImg) && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteImage(selectedRefImg); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/90 hover:bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow-md"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5 text-destructive-foreground" />
                </button>
              )}
            </div>
            {/* Thumbnail strip */}
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((img: string, i: number) => (
                <div
                  key={i}
                  onClick={() => { setSelectedRefImg(i); onUpdateField('selectedRefImgIdx', i); }}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer group/thumb",
                    selectedRefImg === i
                      ? "border-primary ring-1 ring-primary/20"
                      : "border-border/20 hover:border-primary/30 opacity-50 hover:opacity-100"
                  )}
                >
                  <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                  {selectedRefImg === i && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                  {/* Delete button for user-added thumbnails */}
                  {isUserAdded(i) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteImage(i); }}
                      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-destructive/90 hover:bg-destructive flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-all z-10 shadow-sm"
                      title="Remove image"
                    >
                      <X className="w-2.5 h-2.5 text-destructive-foreground" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[9px] text-muted-foreground/40 mt-1.5">From product page · Click to select</p>
            {/* Upload + Library */}
            <div className="grid grid-cols-2 gap-2 mt-2.5">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 rounded-xl border-2 border-dashed border-border/25 hover:border-primary/30 flex items-center justify-center gap-1.5 transition-all bg-muted/5 hover:bg-muted/15 group/upload"
              >
                <Upload className="w-3 h-3 text-muted-foreground/40 group-hover/upload:text-primary/50 transition-colors" />
                <span className="text-[10px] font-medium text-muted-foreground/50 group-hover/upload:text-foreground/60 transition-colors">Upload</span>
              </button>
              <button className="py-2.5 rounded-xl border-2 border-dashed border-border/25 hover:border-primary/30 flex items-center justify-center gap-1.5 transition-all bg-muted/5 hover:bg-muted/15 group/lib">
                <FolderOpen className="w-3 h-3 text-muted-foreground/40 group-hover/lib:text-primary/50 transition-colors" />
                <span className="text-[10px] font-medium text-muted-foreground/50 group-hover/lib:text-foreground/60 transition-colors">From Library</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Content & context */}
        <div className="divide-y divide-border/15 [&>*]:py-6 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
          {/* Product Description */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Product Description {description.trim() && <Check className="w-3 h-3 text-secondary inline ml-1" />}
              </p>
              <button
                onClick={handleGenerateDesc}
                disabled={isGeneratingDesc}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                {isGeneratingDesc ? (
                  <><div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 className="w-3 h-3" /> {description.trim() ? 'Regenerate' : 'Auto-generate'}</>
                )}
              </button>
            </div>
            <div className="relative">
              <textarea
                value={description}
                onChange={e => { if (e.target.value.length <= 200) { setDescription(e.target.value); onUpdateField('productDescription', e.target.value); } }}
                placeholder="What makes this product special?"
                rows={3}
                className="w-full bg-muted/20 border border-border/30 rounded-xl px-4 py-3 text-[12px] text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none placeholder:text-muted-foreground/40 transition-all leading-relaxed"
              />
              <span className="absolute bottom-3 right-3 text-[9px] text-muted-foreground/40 tabular-nums">{description.length}/200</span>
            </div>
          </div>

          {/* Script */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Script {script.trim() && <Check className="w-3 h-3 text-secondary inline" />}
              </p>
              <button
                onClick={handleGenerateScript}
                disabled={isGeneratingScript}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                {isGeneratingScript ? (
                  <><div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 className="w-3 h-3" /> {script.trim() ? 'Regenerate' : 'Auto-generate'}</>
                )}
              </button>
            </div>
            <textarea
              value={script}
              onChange={e => { setScript(e.target.value); onUpdateField('script', e.target.value); }}
              placeholder="Write what the presenter should say..."
              rows={7}
              className="w-full bg-muted/20 border border-border/30 rounded-xl px-4 py-3 text-[12px] text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none placeholder:text-muted-foreground/40 transition-all leading-relaxed"
            />
          </div>

          {/* Parameters — under Script */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Parameters
            </p>
            <div className="space-y-3.5">
              {[
                { label: 'Aspect', field: 'aspectRatio', default: '9:16', options: [
                  { value: '9:16', icon: <Smartphone className="w-3.5 h-3.5 mr-1" /> },
                  { value: '16:9', icon: <Monitor className="w-3.5 h-3.5 mr-1" /> },
                  { value: '1:1', icon: <Square className="w-3.5 h-3.5 mr-1" /> },
                ]},
                { label: 'Length', field: 'duration', default: '30s', options: [
                  { value: '15s' }, { value: '30s' }, { value: '60s' },
                ]},
              ].map(param => (
                <div key={param.label} className="flex items-center gap-3">
                  <span className="text-[11px] text-muted-foreground w-14 shrink-0 font-medium">{param.label}</span>
                  <div className="flex gap-2">
                    {param.options.map(o => (
                      <button key={o.value} className={cn(
                        "inline-flex items-center px-3.5 py-2 rounded-full text-[11px] font-medium border transition-all",
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
      </div>

      {/* Lock button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFreeze(adKey); }}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-medium transition-all border mt-8",
          isFrozen
            ? "bg-secondary/10 border-secondary/30 text-secondary"
            : completedCount === totalFields
              ? "bg-primary/10 border-primary/40 text-primary hover:bg-primary/15"
              : "bg-muted/20 border-border/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
        )}
      >
        {isFrozen ? <><Lock className="w-3.5 h-3.5" /> Creative Locked ✓</> : <><Unlock className="w-3.5 h-3.5" /> Lock Creative Strategy</>}
      </button>

      {/* Preview Lightbox */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg w-[90vw] p-0 bg-background/95 backdrop-blur-sm border-border overflow-hidden">
          <button
            onClick={() => setPreviewOpen(false)}
            className="absolute top-3 right-3 z-50 p-2 rounded-full bg-background/80 hover:bg-background border border-border shadow-md transition-colors"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
          {previewContent?.type === 'usecase' && (
            <div>
              <div className="aspect-video bg-muted overflow-hidden">
                <img src={previewContent.data.thumbnail} alt={previewContent.data.label} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 space-y-2">
                <p className="text-sm font-semibold text-foreground">{previewContent.data.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{previewContent.data.description}</p>
                {previewContent.data.recommended && (
                  <span className="inline-block text-[10px] bg-secondary/15 text-secondary px-2.5 py-1 rounded-full font-medium">✨ Recommended</span>
                )}
                <button
                  onClick={() => { setSelectedUseCase(previewContent.data.id); onUpdateField('useCaseId', previewContent.data.id); setPreviewOpen(false); }}
                  className="mt-3 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  {selectedUseCase === previewContent.data.id ? 'Selected ✓' : 'Select This Style'}
                </button>
              </div>
            </div>
          )}
          {previewContent?.type === 'avatar' && (
            <div>
              <div className="aspect-[3/4] bg-muted overflow-hidden max-h-[50vh]">
                <img src={previewContent.data.imageUrl} alt={previewContent.data.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 space-y-2">
                <p className="text-sm font-semibold text-foreground">{previewContent.data.name}</p>
                <p className="text-xs text-muted-foreground">{previewContent.data.style}</p>
                <button
                  onClick={() => { setSelectedAvatar(previewContent.data.id); onUpdateField('avatarId', previewContent.data.id); setPreviewOpen(false); }}
                  className="mt-3 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  {selectedAvatar === previewContent.data.id ? 'Selected ✓' : 'Select This Presenter'}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
