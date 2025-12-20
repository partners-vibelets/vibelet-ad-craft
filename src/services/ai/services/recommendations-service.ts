import {
  AIResponse,
  RecommendationInput,
  RecommendationOutput,
  ProviderSelectorOptions,
} from '@/types/ai';
import { getProviderSelector } from '../provider-selector';
import { getCacheManager } from '../cache-manager';
import { getUsageTracker } from '../usage-tracker';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export class RecommendationsService {
  async generateRecommendations(
    input: RecommendationInput,
    userId: string,
    options?: { preferred_provider?: string; cache_ttl_hours?: number }
  ): Promise<AIResponse<RecommendationOutput[]>> {
    const startTime = Date.now();
    const cacheManager = getCacheManager();
    const usageTracker = getUsageTracker();
    const selector = getProviderSelector();

    try {
      const inputHash = JSON.stringify(input);

      const getProviderId = async (providerName: string) => {
        const { data } = await supabase
          .from('ai_providers')
          .select('id')
          .eq('name', providerName)
          .maybeSingle();
        return data?.id;
      };

      const selectorOptions: ProviderSelectorOptions = {
        task_type: 'recommendations',
        user_id: userId,
        preferred_provider: options?.preferred_provider,
        fallback_chain: ['claude', 'openai'],
      };

      const provider = await selector.selectProvider(selectorOptions);

      if (!provider) {
        return {
          success: false,
          error: 'No AI provider available for recommendations',
          provider: 'none',
          model: 'none',
          tokens_used: 0,
          cost_usd: 0,
          response_time_ms: 0,
          cached: false,
        };
      }

      const providerId = await getProviderId(provider.name);
      if (!providerId) {
        return {
          success: false,
          error: `Provider ${provider.name} not found in database`,
          provider: provider.name,
          model: provider.getModel?.() || 'unknown',
          tokens_used: 0,
          cost_usd: 0,
          response_time_ms: 0,
          cached: false,
        };
      }

      const cached = await cacheManager.get(userId, providerId, 'recommendations', inputHash);
      if (cached) {
        return {
          success: true,
          data: cached as RecommendationOutput[],
          provider: provider.name,
          model: provider.getModel?.() || 'unknown',
          tokens_used: 0,
          cost_usd: 0,
          response_time_ms: Date.now() - startTime,
          cached: true,
        };
      }

      const response = await provider.generateRecommendations(input);

      if (response.success && response.data) {
        await cacheManager.set(
          userId,
          providerId,
          'recommendations',
          inputHash,
          response.data,
          options?.cache_ttl_hours || 12
        );

        await usageTracker.logUsage(
          {
            user_id: userId,
            provider_id: providerId,
            task_type: 'recommendations',
            model: response.model,
          },
          response,
          startTime
        );
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: `Recommendations service error: ${error}`,
        provider: 'unknown',
        model: 'unknown',
        tokens_used: 0,
        cost_usd: 0,
        response_time_ms: Date.now() - startTime,
        cached: false,
      };
    }
  }

  static getInstance(): RecommendationsService {
    if (!RecommendationsService.instance) {
      RecommendationsService.instance = new RecommendationsService();
    }
    return RecommendationsService.instance;
  }

  private static instance: RecommendationsService;
}

export const getRecommendationsService = (): RecommendationsService => {
  return RecommendationsService.getInstance();
};
