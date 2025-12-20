import { AIProviderInterface, AIResponse, ChatAssistantInput, ChatAssistantOutput, ProductAnalysisInput, ProductAnalysisOutput, ProviderHealthStatus, ProviderType, RecommendationInput, RecommendationOutput, ScriptGenerationInput, ScriptGenerationOutput } from '@/types/ai';

export abstract class BaseAIProvider implements AIProviderInterface {
  abstract name: ProviderType;
  abstract available: boolean;
  protected apiKey: string;
  protected baseUrl?: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  protected createResponse<T>(
    data: T,
    tokensUsed: number,
    costUsd: number,
    responseTimeMs: number,
    cached: boolean = false
  ): AIResponse<T> {
    return {
      success: true,
      data,
      provider: this.name,
      model: this.getModel(),
      tokens_used: tokensUsed,
      cost_usd: costUsd,
      response_time_ms: responseTimeMs,
      cached,
    };
  }

  protected createErrorResponse(error: string): AIResponse {
    return {
      success: false,
      error,
      provider: this.name,
      model: this.getModel(),
      tokens_used: 0,
      cost_usd: 0,
      response_time_ms: 0,
      cached: false,
    };
  }

  protected getModel(): string {
    return 'unknown';
  }

  abstract productAnalysis(input: ProductAnalysisInput): Promise<AIResponse<ProductAnalysisOutput>>;
  abstract generateScript(input: ScriptGenerationInput): Promise<AIResponse<ScriptGenerationOutput>>;
  abstract generateRecommendations(input: RecommendationInput): Promise<AIResponse<RecommendationOutput[]>>;
  abstract chat(input: ChatAssistantInput): Promise<AIResponse<ChatAssistantOutput>>;
  abstract generateEmbeddings(text: string): Promise<AIResponse<number[]>>;
  abstract healthCheck(): Promise<ProviderHealthStatus>;
  abstract getRemainingQuota(): Promise<number>;
}
