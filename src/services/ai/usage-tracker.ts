import { AIResponse, AIUsageLog, ProviderType, TaskType } from '@/types/ai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface UsageTrackingOptions {
  user_id: string;
  provider_id: string;
  task_type: TaskType;
  model: string;
  campaign_id?: string;
  api_key_id?: string;
}

export class UsageTracker {
  async logUsage(
    options: UsageTrackingOptions,
    response: AIResponse,
    startTime: number
  ): Promise<AIUsageLog | null> {
    const { user_id, provider_id, task_type, model, campaign_id, api_key_id } = options;
    const endTime = Date.now();
    const responseTimeMs = endTime - startTime;

    const usageLog: Omit<AIUsageLog, 'id' | 'created_at'> = {
      user_id,
      provider_id,
      task_type,
      model_used: model,
      campaign_id,
      api_key_id,
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: response.tokens_used,
      cost_usd: response.cost_usd,
      response_time_ms: responseTimeMs,
      status: response.success ? 'success' : 'failure',
      error_message: response.error,
      metadata: response.metadata,
      created_at: new Date().toISOString(),
    };

    try {
      const { data } = await supabase
        .from('ai_usage_logs')
        .insert([usageLog])
        .select()
        .maybeSingle();

      return data;
    } catch (error) {
      console.error('Error logging usage:', error);
      return null;
    }
  }

  async getUserMetrics(
    userId: string,
    taskType?: TaskType,
    days: number = 30
  ): Promise<{
    totalCost: number;
    totalTokens: number;
    successRate: number;
    avgResponseTime: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from('ai_usage_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString());

      if (taskType) {
        query = query.eq('task_type', taskType);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          totalCost: 0,
          totalTokens: 0,
          successRate: 0,
          avgResponseTime: 0,
        };
      }

      const totalCost = data.reduce((sum, log) => sum + (log.cost_usd || 0), 0);
      const totalTokens = data.reduce((sum, log) => sum + (log.total_tokens || 0), 0);
      const successCount = data.filter((log) => log.status === 'success').length;
      const successRate = (successCount / data.length) * 100;
      const avgResponseTime =
        data.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / data.length;

      return {
        totalCost,
        totalTokens,
        successRate,
        avgResponseTime,
      };
    } catch (error) {
      console.error('Error fetching user metrics:', error);
      return {
        totalCost: 0,
        totalTokens: 0,
        successRate: 0,
        avgResponseTime: 0,
      };
    }
  }

  async getProviderMetrics(
    userId: string,
    providerType: ProviderType,
    taskType?: TaskType,
    days: number = 30
  ): Promise<{
    totalRequests: number;
    successRequests: number;
    totalTokens: number;
    totalCost: number;
    avgResponseTime: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: providers } = await supabase
        .from('ai_providers')
        .select('id')
        .eq('name', providerType)
        .maybeSingle();

      if (!providers) {
        return {
          totalRequests: 0,
          successRequests: 0,
          totalTokens: 0,
          totalCost: 0,
          avgResponseTime: 0,
        };
      }

      let query = supabase
        .from('ai_usage_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('provider_id', providers.id)
        .gte('created_at', startDate.toISOString());

      if (taskType) {
        query = query.eq('task_type', taskType);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          totalRequests: 0,
          successRequests: 0,
          totalTokens: 0,
          totalCost: 0,
          avgResponseTime: 0,
        };
      }

      const successRequests = data.filter((log) => log.status === 'success').length;
      const totalTokens = data.reduce((sum, log) => sum + (log.total_tokens || 0), 0);
      const totalCost = data.reduce((sum, log) => sum + (log.cost_usd || 0), 0);
      const avgResponseTime =
        data.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / data.length;

      return {
        totalRequests: data.length,
        successRequests,
        totalTokens,
        totalCost,
        avgResponseTime,
      };
    } catch (error) {
      console.error('Error fetching provider metrics:', error);
      return {
        totalRequests: 0,
        successRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        avgResponseTime: 0,
      };
    }
  }

  static getInstance(): UsageTracker {
    if (!UsageTracker.instance) {
      UsageTracker.instance = new UsageTracker();
    }
    return UsageTracker.instance;
  }

  private static instance: UsageTracker;
}

export const getUsageTracker = (): UsageTracker => {
  return UsageTracker.getInstance();
};
