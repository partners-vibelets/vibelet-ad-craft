import { BaseAIProvider } from '../base-provider';
import {
  AIResponse,
  ChatAssistantInput,
  ChatAssistantOutput,
  ProductAnalysisInput,
  ProductAnalysisOutput,
  ProviderHealthStatus,
  RecommendationInput,
  RecommendationOutput,
  ScriptGenerationInput,
  ScriptGenerationOutput,
} from '@/types/ai';

const OPENAI_API_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4-turbo';

export class OpenAIProvider extends BaseAIProvider {
  name = 'openai' as const;
  available = true;
  private model = DEFAULT_MODEL;

  async productAnalysis(input: ProductAnalysisInput): Promise<AIResponse<ProductAnalysisOutput>> {
    const startTime = Date.now();

    try {
      const prompt = `Analyze this product and provide comprehensive insights:
Title: ${input.title}
Price: ${input.price}
Description: ${input.description}

Provide a detailed JSON response with market positioning, target audience, competitive insights, recommendations and key highlights.`;

      const response = await this.callOpenAI(prompt, 2000);

      if (!response.success || !response.data) {
        return this.createErrorResponse('Failed to analyze product');
      }

      const parsedData = JSON.parse(response.data);
      const tokensUsed = response.tokens_used;
      const costUsd = this.calculateCost(tokensUsed);
      const responseTime = Date.now() - startTime;

      return this.createResponse(parsedData as ProductAnalysisOutput, tokensUsed, costUsd, responseTime);
    } catch (error) {
      return this.createErrorResponse(`Product analysis error: ${error}`);
    }
  }

  async generateScript(input: ScriptGenerationInput): Promise<AIResponse<ScriptGenerationOutput>> {
    const startTime = Date.now();

    try {
      const prompt = `Create an engaging advertising script for this product:
Product: ${input.product.title}
Description: ${input.product.description}
Style: ${input.style}
Duration: ${input.duration || '15-30 seconds'}
Tone: ${input.tone || 'professional'}

Provide a JSON response with primaryText, headline, description, and callToAction fields.`;

      const response = await this.callOpenAI(prompt, 1500);

      if (!response.success || !response.data) {
        return this.createErrorResponse('Failed to generate script');
      }

      const parsedData = JSON.parse(response.data);
      const tokensUsed = response.tokens_used;
      const costUsd = this.calculateCost(tokensUsed);
      const responseTime = Date.now() - startTime;

      return this.createResponse(parsedData as ScriptGenerationOutput, tokensUsed, costUsd, responseTime);
    } catch (error) {
      return this.createErrorResponse(`Script generation error: ${error}`);
    }
  }

  async generateRecommendations(input: RecommendationInput): Promise<AIResponse<RecommendationOutput[]>> {
    const startTime = Date.now();

    try {
      const prompt = `Based on these campaign metrics, provide optimization recommendations:
${JSON.stringify(input.campaignMetrics, null, 2)}

Provide a JSON array of recommendations with type, priority, title, reasoning, and confidenceScore.`;

      const response = await this.callOpenAI(prompt, 2000);

      if (!response.success || !response.data) {
        return this.createErrorResponse('Failed to generate recommendations');
      }

      const parsedData = JSON.parse(response.data);
      const tokensUsed = response.tokens_used;
      const costUsd = this.calculateCost(tokensUsed);
      const responseTime = Date.now() - startTime;

      return this.createResponse(parsedData as RecommendationOutput[], tokensUsed, costUsd, responseTime);
    } catch (error) {
      return this.createErrorResponse(`Recommendation error: ${error}`);
    }
  }

  async chat(input: ChatAssistantInput): Promise<AIResponse<ChatAssistantOutput>> {
    const startTime = Date.now();

    try {
      const messages = [
        ...(input.conversationHistory || []),
        { role: 'user' as const, content: input.message },
      ];

      const response = await this.callOpenAIChat(messages, 1000);

      if (!response.success || !response.data) {
        return this.createErrorResponse('Failed to generate chat response');
      }

      const chatResponse: ChatAssistantOutput = {
        message: response.data,
        suggestions: [],
      };

      const tokensUsed = response.tokens_used;
      const costUsd = this.calculateCost(tokensUsed);
      const responseTime = Date.now() - startTime;

      return this.createResponse(chatResponse, tokensUsed, costUsd, responseTime);
    } catch (error) {
      return this.createErrorResponse(`Chat error: ${error}`);
    }
  }

  async generateEmbeddings(text: string): Promise<AIResponse<number[]>> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${OPENAI_API_URL}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return this.createErrorResponse(`Embedding error: ${error.error?.message}`);
      }

      const data = await response.json();
      const embedding = data.data[0].embedding;
      const tokensUsed = data.usage?.total_tokens || 0;
      const costUsd = this.calculateCost(tokensUsed, 'embedding');
      const responseTime = Date.now() - startTime;

      return this.createResponse(embedding, tokensUsed, costUsd, responseTime);
    } catch (error) {
      return this.createErrorResponse(`Embedding error: ${error}`);
    }
  }

  async healthCheck(): Promise<ProviderHealthStatus> {
    try {
      const response = await fetch(`${OPENAI_API_URL}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      const healthy = response.ok;
      const error = !healthy ? await response.text() : undefined;

      return {
        provider: 'openai',
        healthy,
        lastCheck: new Date(),
        error,
      };
    } catch (error) {
      return {
        provider: 'openai',
        healthy: false,
        lastCheck: new Date(),
        error: `Health check error: ${error}`,
      };
    }
  }

  async getRemainingQuota(): Promise<number> {
    return 9999;
  }

  protected getModel(): string {
    return this.model;
  }

  private async callOpenAI(prompt: string, maxTokens: number): Promise<AIResponse<string>> {
    try {
      const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return this.createErrorResponse(`OpenAI API error: ${error.error?.message}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const tokensUsed = data.usage.total_tokens;
      const costUsd = this.calculateCost(tokensUsed);

      return this.createResponse(content, tokensUsed, costUsd, 0);
    } catch (error) {
      return this.createErrorResponse(`OpenAI call error: ${error}`);
    }
  }

  private async callOpenAIChat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    maxTokens: number
  ): Promise<AIResponse<string>> {
    try {
      const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: maxTokens,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return this.createErrorResponse(`OpenAI API error: ${error.error?.message}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const tokensUsed = data.usage.total_tokens;
      const costUsd = this.calculateCost(tokensUsed);

      return this.createResponse(content, tokensUsed, costUsd, 0);
    } catch (error) {
      return this.createErrorResponse(`OpenAI chat call error: ${error}`);
    }
  }

  private calculateCost(tokens: number, type: 'chat' | 'embedding' = 'chat'): number {
    if (type === 'embedding') {
      return (tokens / 1000000) * 0.02;
    }

    const inputCost = (tokens * 0.6) / 1000 * 0.01;
    const outputCost = (tokens * 0.4) / 1000 * 0.03;
    return inputCost + outputCost;
  }
}
