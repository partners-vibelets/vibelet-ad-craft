// Workspace & Thread types for AI-native marketing OS

export interface Workspace {
  id: string;
  name: string;
  clientName: string;
  threads: Thread[];
  createdAt: Date;
}

export type ThreadStatus = 'active' | 'archived' | 'live-campaign';

export interface Thread {
  id: string;
  title: string;
  workspaceId: string;
  connectedAccount?: string;
  messages: ThreadMessage[];
  artifacts: Artifact[];
  rules: AutomationRuleData[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  status: ThreadStatus;
  pinnedArtifactIds: string[];
}

export interface ActionChip {
  label: string;
  icon?: string;
  action: string;
}

export interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  artifactIds?: string[];
  actionChips?: ActionChip[];
  isStreaming?: boolean;
}

export type ArtifactType =
  | 'campaign-blueprint'
  | 'campaign-live'
  | 'creative-set'
  | 'creative-variant'
  | 'video-creative'
  | 'performance-snapshot'
  | 'ai-insights'
  | 'automation-rule'
  | 'publish-confirmation'
  | 'ai-signals-summary'
  | 'product-analysis'
  | 'script-options'
  | 'avatar-selection'
  | 'generation-progress'
  | 'creative-result'
  | 'facebook-connect'
  | 'campaign-config'
  | 'device-preview'
  | 'ai-signals-dashboard';

export type ArtifactStatus = 'draft' | 'live' | 'archived';

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  status: ArtifactStatus;
  data: Record<string, any>;
  version: number;
  isCollapsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// --- Data shapes per artifact type ---

export interface CampaignBlueprintData {
  campaignName: string;
  objective: string;
  platform: string;
  budget: { daily: number; total: number };
  targeting: { ageRange: string; interests: string[]; locations: string[] };
  schedule: { startDate: string; endDate: string };
  adSets: number;
  primaryText: string;
  cta: string;
}

export interface CampaignLiveData {
  campaignName: string;
  objective: string;
  platform: string;
  budget: { daily: number; total: number; spent: number };
  status: 'active' | 'paused' | 'ended';
  publishedAt: string;
  adSets: number;
  activeAds: number;
}

export interface CreativeSetData {
  name: string;
  count: number;
  items: { id: string; label: string; format: string; dimensions: string }[];
}

export interface CreativeVariantData {
  parentSetId: string;
  label: string;
  headline: string;
  primaryText: string;
  cta: string;
  format: string;
  dimensions: string;
}

export interface VideoCreativeData {
  name: string;
  duration: string;
  avatar: string;
  script: string;
  status: 'generating' | 'ready' | 'approved';
}

export interface PerformanceSnapshotData {
  dateRange: string;
  metrics: {
    spent: number;
    revenue: number;
    roi: number;
    conversions: number;
    ctr: number;
    impressions: number;
  };
  topCampaign: string;
  recommendations: string[];
}

export interface AIInsightsData {
  insights: {
    type: 'anomaly' | 'opportunity' | 'trend';
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    metric: string;
    change: number;
    suggestedAction: string;
  }[];
}

export interface AutomationRuleData {
  name: string;
  trigger: string;
  condition: string;
  action: string;
  isActive: boolean;
  autoExecute: boolean;
  lastTriggered?: string;
}

export interface PublishConfirmationData {
  campaignName: string;
  platform: string;
  publishedAt: string;
  adCount: number;
  budget: { daily: number; total: number };
  status: 'pending' | 'confirmed' | 'failed';
}

export interface AISignalsSummaryData {
  period: string;
  signals: {
    type: 'anomaly' | 'opportunity' | 'trend' | 'alert';
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    metric: string;
    change: number;
  }[];
  actionsTaken: number;
  actionsRemaining: number;
}

export interface ProductAnalysisData {
  productName: string;
  productUrl?: string;
  imageUrl: string;
  price: string;
  category: string;
  description: string;
  keyFeatures: string[];
  targetAudience: string;
}

export interface ScriptOptionsData {
  scripts: {
    id: string;
    style: string;
    label: string;
    script: string;
    duration: string;
    selected?: boolean;
  }[];
  selectedScriptId?: string;
}

export interface AvatarSelectionData {
  avatars: {
    id: string;
    name: string;
    style: string;
    imageUrl: string;
    selected?: boolean;
  }[];
  selectedAvatarId?: string;
}

export interface GenerationProgressData {
  stage: 'analyzing' | 'scripting' | 'rendering' | 'complete';
  progress: number;
  outputs: {
    id: string;
    type: 'image' | 'video';
    label: string;
    format: string;
    dimensions: string;
    status: 'generating' | 'ready';
    duration?: string;
  }[];
}

export interface CreativeResultData {
  outputs: {
    id: string;
    type: 'image' | 'video';
    label: string;
    url: string;
    thumbnailUrl?: string;
    format: string;
    dimensions: string;
    duration?: string;
  }[];
  selectedIndex: number;
}

export interface FacebookConnectData {
  status: 'disconnected' | 'connecting' | 'connected';
  accountName?: string;
  profileImage?: string;
  adAccounts?: {
    id: string;
    name: string;
    pixelId: string;
    pageName: string;
    currency: string;
  }[];
  selectedAccountId?: string;
}

export interface CampaignConfigData {
  campaignLevel: {
    name: string;
    objective: string;
    budgetType: string;
    budget: number;
  };
  adSetLevel: {
    name: string;
    budget: number;
    duration: string;
    pixelId: string;
    targeting: { ageRange: string; locations: string[]; interests: string[] };
  };
  adLevel: {
    name: string;
    pageName: string;
    primaryText: string;
    headline: string;
    cta: string;
    websiteUrl: string;
    creative: { type: string; url: string; label: string };
  };
}

export interface DevicePreviewData {
  activeDevice: 'mobile' | 'desktop';
  ad: {
    pageName: string;
    primaryText: string;
    headline: string;
    cta: string;
    imageUrl: string;
    websiteUrl: string;
  };
}
