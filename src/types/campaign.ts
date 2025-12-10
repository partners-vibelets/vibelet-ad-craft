export type CampaignStep = 
  | 'welcome'
  | 'product-url'
  | 'product-analysis'
  | 'script-selection'
  | 'avatar-selection'
  | 'creative-generation'
  | 'creative-review'
  | 'campaign-setup'
  | 'facebook-integration'
  | 'ad-account-selection'
  | 'campaign-preview'
  | 'publishing'
  | 'published';

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface InlineQuestion {
  id: string;
  question: string;
  options: QuestionOption[];
  multiSelect?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  inlineQuestion?: InlineQuestion;
  stepId?: CampaignStep;
  showCampaignSlider?: boolean;
  showFacebookConnect?: boolean;
}

export interface ProductData {
  title: string;
  price: string;
  description: string;
  images: string[];
  sku: string;
  category: string;
  pageScreenshot?: string;
  insights?: ProductInsight[];
}

export interface ProductInsight {
  label: string;
  value: string;
  icon: string;
}

export interface ScriptOption {
  id: string;
  name: string;
  description: string;
  duration: string;
  style: string;
  isCustom?: boolean;
  customContent?: {
    primaryText: string;
    headline: string;
    description: string;
  };
}

export interface AvatarOption {
  id: string;
  name: string;
  image: string;
  videoPreview?: string;
  style: string;
}

export interface CreativeOption {
  id: string;
  type: 'image' | 'video';
  thumbnail: string;
  name: string;
  isCustom?: boolean;
  file?: File;
}

export interface CampaignConfig {
  // Campaign Level
  campaignName: string;
  objective: string;
  budgetType: 'daily' | 'lifetime';
  
  // Ad Set Level
  adSetName: string;
  budgetAmount: string;
  duration: string;
  fbPixelId: string;
  fbPageId: string;
  
  // Ad Level
  adName: string;
  primaryText: string;
  cta: string;
  websiteUrl: string;
}

export interface AdAccount {
  id: string;
  name: string;
  status: string;
}

export interface StepInfo {
  id: CampaignStep;
  label: string;
  shortLabel: string;
  completed: boolean;
  current: boolean;
}

export interface CampaignState {
  step: CampaignStep;
  stepHistory: CampaignStep[];
  productUrl: string | null;
  productData: ProductData | null;
  selectedScript: ScriptOption | null;
  selectedAvatar: AvatarOption | null;
  creatives: CreativeOption[];
  selectedCreative: CreativeOption | null;
  campaignConfig: CampaignConfig | null;
  facebookConnected: boolean;
  selectedAdAccount: AdAccount | null;
  isStepLoading: boolean;
  isRegenerating: 'product' | 'scripts' | 'creatives' | null;
  isCustomScriptMode: boolean;
  isCustomCreativeMode: boolean;
}
