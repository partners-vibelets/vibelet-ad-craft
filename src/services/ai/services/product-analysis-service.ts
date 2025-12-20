import {
  AIResponse,
  ProductAnalysisInput,
  ProductAnalysisOutput,
  ProviderSelectorOptions,
} from '@/types/ai';
import { getProviderRegistry } from '../provider-registry';
import { getProviderSelector } from '../provider-selector';
import { getCacheManager } from '../cache-manager';
import { getUsageTracker } from '../usage-tracker';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export class ProductAnalysisService {
  async analyzeProduct(
    input: ProductAnalysisInput,
    userId: string,
    options?: { preferred_provider?: string; cache_ttl_hours?: number }
  ): Promise<AIResponse<ProductAnalysisOutput>> {
    const startTime = Date.now();
    const cacheManager = getCacheManager();
    const usageTracker = getUsageTracker();
    const selector = getProviderSelector();
    const registry = getProviderRegistry();

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
        task_type: 'product-analysis',
        user_id: userId,
        preferred_provider: options?.preferred_provider,
        fallback_chain: ['claude', 'openai'],
      };

      const provider = await selector.selectProvider(selectorOptions);

      if (!provider) {
        return {
          success: false,
          error: 'No AI provider available for product analysis',
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

      const cached = await cacheManager.get(userId, providerId, 'product-analysis', inputHash);
      if (cached) {
        return {
          success: true,
          data: cached as ProductAnalysisOutput,
          provider: provider.name,
          model: provider.getModel?.() || 'unknown',
          tokens_used: 0,
          cost_usd: 0,
          response_time_ms: Date.now() - startTime,
          cached: true,
        };
      }

      const response = await provider.productAnalysis(input);

      if (response.success && response.data) {
        await cacheManager.set(
          userId,
          providerId,
          'product-analysis',
          inputHash,
          response.data,
          options?.cache_ttl_hours || 24
        );

        await usageTracker.logUsage(
          {
            user_id: userId,
            provider_id: providerId,
            task_type: 'product-analysis',
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
        error: `Product analysis service error: ${error}`,
        provider: 'unknown',
        model: 'unknown',
        tokens_used: 0,
        cost_usd: 0,
        response_time_ms: Date.now() - startTime,
        cached: false,
      };
    }
  }

  static getInstance(): ProductAnalysisService {
    if (!ProductAnalysisService.instance) {
      ProductAnalysisService.instance = new ProductAnalysisService();
    }
    return ProductAnalysisService.instance;
  }

  private static instance: ProductAnalysisService;
}

export const getProductAnalysisService = (): ProductAnalysisService => {
  return ProductAnalysisService.getInstance();
};
