export type ProviderType = 'openai' | 'claude' | 'google' | 'cohere';
export type TaskType =
  | 'product-analysis'
  | 'script-generation'
  | 'image-generation'
  | 'recommendations'
  | 'chat-assistant'
  | 'embeddings';

export interface AIProviderConfig {
  id: string;
  name: string;
  enabled: boolean;
  provider_type: ProviderType;
  default_model: string;
  base_url?: string;
  documentation_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AIApiKey {
  id: string;
  provider_id: string;
  user_id: string;
  encrypted_key: string;
  key_name?: string;
  is_active: boolean;
  quota_limit?: number;
  quota_used: number;
  quota_reset_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AIUsageLog {
  id: string;
  user_id: string;
  provider_id: string;
  api_key_id?: string;
  task_type: TaskType;
  model_used: string;
  campaign_id?: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  response_time_ms: number;
  status: 'success' | 'failure' | 'rate_limited';
  error_message?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface AIProviderMetrics {
  id: string;
  provider_id: string;
  user_id: string;
  task_type: TaskType;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  total_tokens_used: number;
  total_cost_usd: number;
  avg_response_time_ms: number;
  quality_score?: number;
  metric_date: string;
  created_at: string;
  updated_at: string;
}

export interface AITaskConfig {
  id: string;
  user_id: string;
  task_type: TaskType;
  provider_priority: string[];
  preferred_model?: string;
  temperature?: number;
  max_tokens?: number;
  cost_priority: 'cost' | 'balanced' | 'quality';
  quality_priority: 'cost' | 'balanced' | 'quality';
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AICacheEntry {
  id: string;
  user_id: string;
  provider_id: string;
  task_type: TaskType;
  input_hash: string;
  response_data: unknown;
  metadata?: Record<string, unknown>;
  expires_at?: string;
  hit_count: number;
  created_at: string;
}

export interface AIRequest {
  task_type: TaskType;
  input: string | Record<string, unknown>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  cache_enabled?: boolean;
}

export interface AIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  provider: string;
  model: string;
  tokens_used: number;
  cost_usd: number;
  response_time_ms: number;
  cached: boolean;
  metadata?: Record<string, unknown>;
}

export interface ProductAnalysisInput {
  url: string;
  title: string;
  description: string;
  price: string;
  images?: string[];
  screenshot?: string;
}

export interface ProductAnalysisOutput {
  title: string;
  price: string;
  description: string;
  images: string[];
  sku: string;
  category: string;
  marketPosition: {
    positioning: string;
    pricePoint: string;
    valueProposition: string;
  };
  targetAudience: {
    primary: string;
    demographics: string;
    interests: string[];
  };
  competitiveInsight: {
    differentiator: string;
    brandStrength: string;
    marketOpportunity: string;
  };
  recommendations: string[];
  keyHighlights: string[];
}

export interface ScriptGenerationInput {
  product: ProductAnalysisOutput;
  style: string;
  duration?: string;
  tone?: string;
}

export interface ScriptGenerationOutput {
  primaryText: string;
  headline: string;
  description: string;
  callToAction: string;
  style: string;
  duration: string;
  variations?: ScriptGenerationOutput[];
  providerUsed: string;
  model: string;
}

export interface RecommendationInput {
  campaignMetrics: Record<string, unknown>;
  campaignHistory?: Record<string, unknown>;
  performanceData?: Record<string, unknown>;
}

export interface RecommendationOutput {
  type: string;
  priority: 'high' | 'medium' | 'suggestion';
  title: string;
  reasoning: string;
  confidenceScore: number;
  currentValue?: number;
  recommendedValue?: number;
  projectedImpact?: Array<{ label: string; value: string }>;
}

export interface ChatAssistantInput {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: Record<string, unknown>;
}

export interface ChatAssistantOutput {
  message: string;
  suggestions?: string[];
  metadata?: Record<string, unknown>;
}

export interface ProviderHealthStatus {
  provider: string;
  healthy: boolean;
  lastCheck: Date;
  availableQuota?: number;
  totalQuota?: number;
  error?: string;
}

export interface ProviderSelectorOptions {
  task_type: TaskType;
  user_id: string;
  fallback_chain?: string[];
  preferred_provider?: string;
}

export interface AIProviderInterface {
  name: ProviderType;
  available: boolean;

  productAnalysis(input: ProductAnalysisInput): Promise<AIResponse<ProductAnalysisOutput>>;
  generateScript(input: ScriptGenerationInput): Promise<AIResponse<ScriptGenerationOutput>>;
  generateRecommendations(input: RecommendationInput): Promise<AIResponse<RecommendationOutput[]>>;
  chat(input: ChatAssistantInput): Promise<AIResponse<ChatAssistantOutput>>;
  generateEmbeddings(text: string): Promise<AIResponse<number[]>>;

  healthCheck(): Promise<ProviderHealthStatus>;
  getRemainingQuota(): Promise<number>;
}
