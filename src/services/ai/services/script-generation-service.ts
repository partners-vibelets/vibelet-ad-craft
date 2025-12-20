import {
  AIResponse,
  ScriptGenerationInput,
  ScriptGenerationOutput,
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

export class ScriptGenerationService {
  async generateScript(
    input: ScriptGenerationInput,
    userId: string,
    options?: { preferred_provider?: string; cache_ttl_hours?: number }
  ): Promise<AIResponse<ScriptGenerationOutput>> {
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
        task_type: 'script-generation',
        user_id: userId,
        preferred_provider: options?.preferred_provider,
        fallback_chain: ['openai', 'claude'],
      };

      const provider = await selector.selectProvider(selectorOptions);

      if (!provider) {
        return {
          success: false,
          error: 'No AI provider available for script generation',
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

      const cached = await cacheManager.get(userId, providerId, 'script-generation', inputHash);
      if (cached) {
        return {
          success: true,
          data: cached as ScriptGenerationOutput,
          provider: provider.name,
          model: provider.getModel?.() || 'unknown',
          tokens_used: 0,
          cost_usd: 0,
          response_time_ms: Date.now() - startTime,
          cached: true,
        };
      }

      const response = await provider.generateScript(input);

      if (response.success && response.data) {
        await cacheManager.set(
          userId,
          providerId,
          'script-generation',
          inputHash,
          response.data,
          options?.cache_ttl_hours || 24
        );

        await usageTracker.logUsage(
          {
            user_id: userId,
            provider_id: providerId,
            task_type: 'script-generation',
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
        error: `Script generation service error: ${error}`,
        provider: 'unknown',
        model: 'unknown',
        tokens_used: 0,
        cost_usd: 0,
        response_time_ms: Date.now() - startTime,
        cached: false,
      };
    }
  }

  static getInstance(): ScriptGenerationService {
    if (!ScriptGenerationService.instance) {
      ScriptGenerationService.instance = new ScriptGenerationService();
    }
    return ScriptGenerationService.instance;
  }

  private static instance: ScriptGenerationService;
}

export const getScriptGenerationService = (): ScriptGenerationService => {
  return ScriptGenerationService.getInstance();
};
