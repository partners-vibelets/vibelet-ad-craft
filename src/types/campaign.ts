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

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface ProductData {
  title: string;
  price: string;
  description: string;
  images: string[];
  sku: string;
  category: string;
}

export interface ScriptOption {
  id: string;
  name: string;
  description: string;
  duration: string;
  style: string;
}

export interface AvatarOption {
  id: string;
  name: string;
  image: string;
  style: string;
}

export interface CreativeOption {
  id: string;
  type: 'image' | 'video';
  thumbnail: string;
  name: string;
}

export interface CampaignConfig {
  objective: string;
  budget: string;
  cta: string;
  duration: string;
}

export interface AdAccount {
  id: string;
  name: string;
  status: string;
}

export interface CampaignState {
  step: CampaignStep;
  productUrl: string | null;
  productData: ProductData | null;
  selectedScript: ScriptOption | null;
  selectedAvatar: AvatarOption | null;
  creatives: CreativeOption[];
  selectedCreative: CreativeOption | null;
  campaignConfig: CampaignConfig | null;
  facebookConnected: boolean;
  selectedAdAccount: AdAccount | null;
}
