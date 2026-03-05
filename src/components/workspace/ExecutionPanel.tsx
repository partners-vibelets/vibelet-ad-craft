import { Artifact } from '@/types/workspace';
import { StrategyMapPanel } from './StrategyMapPanel';
import { DeepWorkProgress, CREATIVE_GENERATION_STEPS, CAMPAIGN_CONFIG_STEPS } from './DeepWorkProgress';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AVATARS } from '@/data/avatars';
import { VIDEO_USE_CASE_TEMPLATES } from '@/data/workspaceMockData';
import { Sparkles, Check, Play, Image as ImageIcon, Film, Monitor, Smartphone, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export type ExecutionPanelContent =
  | 'strategy-map'
  | 'use-case-templates'
  | 'video-setup'
  | 'deep-work-creative'
  | 'deep-work-config'
  | 'creative-results'
  | 'facebook-connect'
  | 'campaign-config'
  | 'device-preview'
  | 'publish-success'
  | null;

interface ExecutionPanelProps {
  content: ExecutionPanelContent;
  artifact?: Artifact | null;
  onUpdateNode?: (ci: number, field: string, value: any, si?: number, ai?: number) => void;
  onExecutionAction?: (action: string, payload?: any) => void;
}

export const ExecutionPanel = ({ content, artifact, onUpdateNode, onExecutionAction }: ExecutionPanelProps) => {
  switch (content) {
    case 'strategy-map':
      return artifact && onUpdateNode ? (
        <StrategyMapPanel artifact={artifact} onUpdateNode={onUpdateNode} />
      ) : null;

    case 'use-case-templates':
      return <UseCaseTemplatesPanel onSelect={(id) => onExecutionAction?.('exec-template-selected', { templateId: id })} />;

    case 'video-setup':
      return <VideoSetupExecutionPanel onGenerate={(payload) => onExecutionAction?.('exec-generate-video', payload)} />;

    case 'deep-work-creative':
      return (
        <DeepWorkProgress
          steps={CREATIVE_GENERATION_STEPS}
          title="Generating Your Creatives"
          subtitle="AI is creating video + image ads optimized for Meta"
          onComplete={() => onExecutionAction?.('exec-creative-done')}
        />
      );

    case 'deep-work-config':
      return (
        <DeepWorkProgress
          steps={CAMPAIGN_CONFIG_STEPS}
          title="Configuring Your Campaign"
          subtitle="Building the campaign structure on Meta"
          onComplete={() => onExecutionAction?.('exec-config-done')}
        />
      );

    case 'creative-results':
      return <CreativeResultsPanel onAction={(action) => onExecutionAction?.(action)} />;

    case 'facebook-connect':
      return <FacebookConnectPanel onConnect={() => onExecutionAction?.('exec-fb-connected')} />;

    case 'campaign-config':
      return <CampaignConfigPanel onApprove={() => onExecutionAction?.('exec-config-approved')} />;

    case 'device-preview':
      return <DevicePreviewPanel onPublish={() => onExecutionAction?.('exec-publish')} />;

    case 'publish-success':
      return <PublishSuccessPanel />;

    default:
      return null;
  }
};

// ============ USE CASE TEMPLATES ============

const UseCaseTemplatesPanel = ({ onSelect }: { onSelect: (id: string) => void }) => {
  const templates = VIDEO_USE_CASE_TEMPLATES || [];
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-5 border-b border-border/30 shrink-0">
        <h2 className="text-lg font-semibold text-foreground">Choose a Video Template</h2>
        <p className="text-sm text-muted-foreground mt-1">AI recommends the best template for your product category</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 gap-4 p-6">
          {templates.map((tmpl: any, i: number) => (
            <button
              key={tmpl.id}
              onClick={() => onSelect(tmpl.id)}
              className={cn(
                "relative rounded-xl border-2 border-border/40 bg-card/50 p-5 text-left transition-all",
                "hover:border-primary/50 hover:shadow-md hover:bg-primary/5 group",
              )}
            >
              {i === 0 && (
                <Badge className="absolute -top-2.5 right-3 bg-secondary text-secondary-foreground text-[10px] gap-1">
                  <Sparkles className="w-3 h-3" /> AI Recommended
                </Badge>
              )}
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-lg">{tmpl.icon || '🎬'}</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{tmpl.label}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{tmpl.description}</p>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

// ============ VIDEO SETUP ============

const VideoSetupExecutionPanel = ({ onGenerate }: { onGenerate: (payload: any) => void }) => {
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [script, setScript] = useState("Hey! Looking for the perfect tee? Our new collection is 100% organic cotton — super soft, great fit, and good for the planet. Available in 8 colors. Grab yours!");
  const [aspect, setAspect] = useState('9:16');
  const [length, setLength] = useState('30s');

  const avatars = AVATARS.slice(0, 8);
  const aiRecommendedId = avatars[0]?.id;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-5 border-b border-border/30 shrink-0">
        <h2 className="text-lg font-semibold text-foreground">Video Setup</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure avatar, script, and parameters</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Avatar Selection */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Select Avatar</h3>
            <div className="grid grid-cols-4 gap-3">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatarId(avatar.id)}
                  className={cn(
                    "relative rounded-xl border-2 p-2 transition-all",
                    selectedAvatarId === avatar.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border/40 hover:border-primary/30 hover:bg-muted/30",
                  )}
                >
                  {avatar.id === aiRecommendedId && (
                    <Badge className="absolute -top-2 -right-1 bg-secondary text-secondary-foreground text-[8px] px-1.5 py-0 h-4">
                      <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Best
                    </Badge>
                  )}
                  <div className="aspect-square rounded-lg bg-muted mb-2 overflow-hidden">
                    <img src={avatar.imageUrl} alt={avatar.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[11px] font-medium text-foreground truncate">{avatar.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{avatar.style}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Script */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Script</h3>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-border/50 bg-muted/30 px-4 py-3 text-sm text-foreground resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            />
            <p className="text-[10px] text-muted-foreground mt-1">✨ AI-generated based on your product · Click to edit</p>
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Aspect Ratio</h3>
              <div className="flex gap-2">
                {['9:16', '16:9', '1:1'].map(r => (
                  <button key={r} onClick={() => setAspect(r)}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      aspect === r ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:border-primary/30"
                    )}>{r}</button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Length</h3>
              <div className="flex gap-2">
                {['15s', '30s', '60s'].map(l => (
                  <button key={l} onClick={() => setLength(l)}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      length === l ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:border-primary/30"
                    )}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Generate button */}
      <div className="border-t border-border/30 px-6 py-4 shrink-0">
        <Button
          className="w-full h-11 text-sm gap-2"
          disabled={!selectedAvatarId}
          onClick={() => onGenerate({ avatarId: selectedAvatarId, script, aspect, length })}
        >
          <Sparkles className="w-4 h-4" />
          Generate Video + Images
        </Button>
      </div>
    </div>
  );
};

// ============ CREATIVE RESULTS ============

const CreativeResultsPanel = ({ onAction }: { onAction: (action: string) => void }) => {
  const results = [
    { id: 'r1', type: 'image', label: 'Hero Banner (Feed)', dimensions: '1200×628', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=314&fit=crop' },
    { id: 'r2', type: 'image', label: 'Instagram Story', dimensions: '1080×1920', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=300&h=530&fit=crop' },
    { id: 'r3', type: 'image', label: 'Square Post', dimensions: '1080×1080', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop' },
    { id: 'r4', type: 'video', label: 'Video Ad — AI Avatar', dimensions: '1080×1920', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=530&fit=crop', duration: '30s' },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-5 border-b border-border/30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center">
            <Check className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Creatives Ready!</h2>
            <p className="text-xs text-muted-foreground">{results.length} assets generated</p>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 gap-4 p-6">
          {results.map((item) => (
            <div key={item.id} className="rounded-xl border border-border/40 overflow-hidden bg-card/50 group">
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                    <div className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center">
                      <Play className="w-4 h-4 text-foreground ml-0.5" />
                    </div>
                  </div>
                )}
                <Badge className="absolute top-2 left-2 text-[9px] h-5" variant="secondary">
                  {item.type === 'video' ? <Film className="w-3 h-3 mr-1" /> : <ImageIcon className="w-3 h-3 mr-1" />}
                  {item.type === 'video' ? item.duration : item.dimensions}
                </Badge>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.dimensions}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t border-border/30 px-6 py-4 shrink-0 flex gap-2">
        <Button className="flex-1 h-10 text-sm gap-2" onClick={() => onAction('exec-approve-creatives')}>
          <Check className="w-4 h-4" /> Approve All
        </Button>
        <Button variant="outline" className="h-10 text-sm" onClick={() => onAction('exec-regenerate')}>
          Regenerate
        </Button>
      </div>
    </div>
  );
};

// ============ FACEBOOK CONNECT ============

const FacebookConnectPanel = ({ onConnect }: { onConnect: () => void }) => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      setTimeout(() => onConnect(), 1000);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-8 bg-background">
      <div className="w-16 h-16 rounded-2xl bg-[#1877F2]/10 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        {connected ? 'Connected!' : 'Connect Facebook'}
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-8">
        {connected
          ? 'Your ad account is linked and ready to publish'
          : 'Link your Facebook Business account to publish campaigns directly'}
      </p>
      {!connected ? (
        <Button
          className="h-12 px-8 text-sm gap-2"
          onClick={handleConnect}
          disabled={connecting}
        >
          {connecting ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4" />
              Connect with Facebook
            </>
          )}
        </Button>
      ) : (
        <div className="flex items-center gap-2 text-secondary">
          <Check className="w-5 h-5" />
          <span className="font-medium">Primary Ad Account · Connected</span>
        </div>
      )}
    </div>
  );
};

// ============ CAMPAIGN CONFIG ============

const CampaignConfigPanel = ({ onApprove }: { onApprove: () => void }) => {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-5 border-b border-border/30 shrink-0">
        <h2 className="text-lg font-semibold text-foreground">Campaign Configuration</h2>
        <p className="text-sm text-muted-foreground mt-1">Auto-configured from your strategy · All fields editable</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-5">
          {/* Campaign Level */}
          <ConfigSection title="Campaign" icon="📣" items={[
            { label: 'Name', value: 'Summer Collection 2026' },
            { label: 'Objective', value: 'Sales (Conversions)' },
            { label: 'Budget Type', value: 'Daily · $60/day' },
            { label: 'Schedule', value: 'Jun 1 – Aug 31, 2026' },
          ]} />
          {/* Ad Set Level */}
          <ConfigSection title="Ad Set — Core Audience" icon="🎯" items={[
            { label: 'Budget', value: '$60/day' },
            { label: 'Targeting', value: '18-35, US/UK/CA' },
            { label: 'Interests', value: 'Fashion, Streetwear, Summer Style' },
            { label: 'Placements', value: 'Automatic (Feed, Stories, Reels)' },
            { label: 'Pixel', value: 'px_987654' },
          ]} />
          {/* Ad Level */}
          <ConfigSection title="Ad — Hero Banner" icon="🖼️" items={[
            { label: 'Page', value: 'Summer Style Co.' },
            { label: 'Primary Text', value: 'Summer is here ☀️ Fresh styles, bold designs.' },
            { label: 'Headline', value: 'Premium Organic Tees' },
            { label: 'CTA', value: 'Shop Now' },
            { label: 'Website URL', value: 'summerstyle.co/tees' },
          ]} />
        </div>
      </ScrollArea>
      <div className="border-t border-border/30 px-6 py-4 shrink-0">
        <Button className="w-full h-11 text-sm gap-2" onClick={onApprove}>
          <Check className="w-4 h-4" /> Approve Configuration
        </Button>
      </div>
    </div>
  );
};

const ConfigSection = ({ title, icon, items }: { title: string; icon: string; items: { label: string; value: string }[] }) => (
  <div className="rounded-xl border border-border/40 overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-3 bg-muted/20 border-b border-border/20">
      <span>{icon}</span>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
    <div className="divide-y divide-border/10">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between px-5 py-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{item.label}</span>
          <span className="text-sm text-foreground font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);

// ============ DEVICE PREVIEW ============

const DevicePreviewPanel = ({ onPublish }: { onPublish: () => void }) => {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-5 border-b border-border/30 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Ad Preview</h2>
          <div className="flex rounded-lg border border-border/40 overflow-hidden">
            <button onClick={() => setDevice('mobile')}
              className={cn("px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all",
                device === 'mobile' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
              )}>
              <Smartphone className="w-3.5 h-3.5" /> Mobile
            </button>
            <button onClick={() => setDevice('desktop')}
              className={cn("px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all",
                device === 'desktop' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
              )}>
              <Monitor className="w-3.5 h-3.5" /> Desktop
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className={cn(
          "rounded-2xl border-2 border-border/60 bg-card overflow-hidden shadow-xl",
          device === 'mobile' ? "w-[320px]" : "w-[500px]",
        )}>
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/20">
            <div className="w-8 h-8 rounded-full bg-primary/20" />
            <div>
              <p className="text-xs font-semibold text-foreground">Summer Style Co.</p>
              <p className="text-[10px] text-muted-foreground">Sponsored</p>
            </div>
          </div>
          {/* Text */}
          <div className="px-4 py-2">
            <p className="text-sm text-foreground">Summer is here ☀️ Fresh styles, bold designs. Shop now and get free shipping!</p>
          </div>
          {/* Image */}
          <div className="aspect-[4/3] bg-muted">
            <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=450&fit=crop" alt="Ad preview" className="w-full h-full object-cover" />
          </div>
          {/* CTA */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/20">
            <div>
              <p className="text-[10px] text-muted-foreground">SUMMERSTYLE.CO</p>
              <p className="text-xs font-semibold text-foreground">Premium Organic Tees</p>
            </div>
            <Button size="sm" className="h-8 text-xs">Shop Now</Button>
          </div>
        </div>
      </div>
      <div className="border-t border-border/30 px-6 py-4 shrink-0">
        <Button className="w-full h-11 text-sm gap-2" onClick={onPublish}>
          🚀 Publish to Facebook
        </Button>
      </div>
    </div>
  );
};

// ============ PUBLISH SUCCESS ============

const PublishSuccessPanel = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center px-8 bg-background">
      <div className="text-6xl mb-6 animate-bounce">🎉</div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Campaign Published!</h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        Your ads are now live on Facebook & Instagram. AI will monitor performance and send you insights.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/10 border border-secondary/20">
          <Check className="w-5 h-5 text-secondary" />
          <div>
            <p className="text-sm font-medium text-foreground">4 ads published</p>
            <p className="text-[10px] text-muted-foreground">3 images + 1 video</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/15">
          <Sparkles className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">AI monitoring active</p>
            <p className="text-[10px] text-muted-foreground">First insights in 24-48 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};
