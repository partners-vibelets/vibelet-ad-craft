import { CampaignConfig, CreativeOption, AdStrategy, ProductVariant, VariantCreativeAssignment, ScriptOption, AvatarOption } from './campaign';

// Individual campaign within a multi-campaign flow
export interface CampaignDraft {
  id: string;
  name: string;
  objective: string;
  status: 'draft' | 'configuring' | 'ready' | 'published';
  
  // Campaign-specific selections
  selectedScript: ScriptOption | null;
  selectedAvatar: AvatarOption | null;
  creatives: CreativeOption[];
  selectedCreative: CreativeOption | null;
  
  // Campaign config
  config: CampaignConfig | null;
  
  // Multi-variant support per campaign
  selectedVariants: ProductVariant[];
  adStrategy: AdStrategy;
  variantCreativeAssignments: VariantCreativeAssignment[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Campaign objective with visual metadata
export interface CampaignObjectiveOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  examples: string[];
  recommended?: boolean;
}

// Multi-campaign state extension
export interface MultiCampaignState {
  isMultiCampaignMode: boolean;
  campaigns: CampaignDraft[];
  activeCampaignId: string | null;
  hasShownMultiCampaignPrompt: boolean;
}

// Campaign objective options with rich metadata
export const campaignObjectiveOptions: CampaignObjectiveOption[] = [
  {
    id: 'sales',
    name: 'Sales',
    description: 'Drive purchases and conversions on your website',
    icon: '🛒',
    color: 'emerald',
    examples: ['Product purchases', 'Add to cart', 'Checkout completions'],
    recommended: true
  },
  {
    id: 'leads',
    name: 'Lead Generation',
    description: 'Collect contact info from interested customers',
    icon: '📋',
    color: 'blue',
    examples: ['Email signups', 'Form submissions', 'Quote requests']
  },
  {
    id: 'traffic',
    name: 'Website Traffic',
    description: 'Send more visitors to your website or landing page',
    icon: '🌐',
    color: 'purple',
    examples: ['Blog visits', 'Product page views', 'Site engagement']
  },
  {
    id: 'awareness',
    name: 'Brand Awareness',
    description: 'Reach new people and build recognition',
    icon: '📢',
    color: 'amber',
    examples: ['Video views', 'Brand recall', 'New audience reach']
  },
  {
    id: 'engagement',
    name: 'Engagement',
    description: 'Get more likes, comments, and shares',
    icon: '💬',
    color: 'pink',
    examples: ['Post engagement', 'Page likes', 'Event responses']
  },
  {
    id: 'app-installs',
    name: 'App Installs',
    description: 'Get more people to install your mobile app',
    icon: '📱',
    color: 'cyan',
    examples: ['App downloads', 'In-app actions', 'App engagement']
  }
];

// Utility functions
export const createNewCampaignDraft = (objective: string, productName: string): CampaignDraft => ({
  id: crypto.randomUUID(),
  name: `${productName} - ${objective}`,
  objective,
  status: 'draft',
  selectedScript: null,
  selectedAvatar: null,
  creatives: [],
  selectedCreative: null,
  config: null,
  selectedVariants: [],
  adStrategy: 'single',
  variantCreativeAssignments: [],
  createdAt: new Date(),
  updatedAt: new Date()
});

export const getObjectiveByName = (name: string): CampaignObjectiveOption | undefined => {
  return campaignObjectiveOptions.find(
    o => o.name.toLowerCase() === name.toLowerCase() || o.id === name.toLowerCase()
  );
};
