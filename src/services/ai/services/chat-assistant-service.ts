import {
  AIResponse,
  ChatAssistantInput,
  ChatAssistantOutput,
  ProviderSelectorOptions,
} from '@/types/ai';
import { getProviderSelector } from '../provider-selector';
import { getUsageTracker } from '../usage-tracker';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export class ChatAssistantService {
  async chat(
    input: ChatAssistantInput,
    userId: string,
    options?: { preferred_provider?: string }
  ): Promise<AIResponse<ChatAssistantOutput>> {
    const startTime = Date.now();
    const usageTracker = getUsageTracker();
    const selector = getProviderSelector();

    try {
      const getProviderId = async (providerName: string) => {
        const { data } = await supabase
          .from('ai_providers')
          .select('id')
          .eq('name', providerName)
          .maybeSingle();
        return data?.id;
      };

      const selectorOptions: ProviderSelectorOptions = {
        task_type: 'chat-assistant',
        user_id: userId,
        preferred_provider: options?.preferred_provider,
        fallback_chain: ['openai', 'claude'],
      };

      const provider = await selector.selectProvider(selectorOptions);

      if (!provider) {
        return {
          success: false,
          error: 'No AI provider available for chat',
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

      const response = await provider.chat(input);

      if (response.success) {
        await usageTracker.logUsage(
          {
            user_id: userId,
            provider_id: providerId,
            task_type: 'chat-assistant',
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
        error: `Chat assistant service error: ${error}`,
        provider: 'unknown',
        model: 'unknown',
        tokens_used: 0,
        cost_usd: 0,
        response_time_ms: Date.now() - startTime,
        cached: false,
      };
    }
  }

  static getInstance(): ChatAssistantService {
    if (!ChatAssistantService.instance) {
      ChatAssistantService.instance = new ChatAssistantService();
    }
    return ChatAssistantService.instance;
  }

  private static instance: ChatAssistantService;
}

export const getChatAssistantService = (): ChatAssistantService => {
  return ChatAssistantService.getInstance();
};
