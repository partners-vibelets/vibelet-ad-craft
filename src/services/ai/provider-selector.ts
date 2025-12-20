import { BaseAIProvider } from './base-provider';
import { getProviderRegistry } from './provider-registry';
import { AITaskConfig, ProviderHealthStatus, ProviderSelectorOptions, ProviderType, TaskType } from '@/types/ai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const DEFAULT_PROVIDER_PRIORITY: Record<TaskType, ProviderType[]> = {
  'product-analysis': ['claude', 'openai'],
  'script-generation': ['openai', 'claude'],
  'image-generation': ['openai'],
  'recommendations': ['claude', 'openai'],
  'chat-assistant': ['openai', 'claude'],
  'embeddings': ['openai'],
};

export class ProviderSelector {
  private healthStatuses: Map<ProviderType, ProviderHealthStatus> = new Map();
  private lastHealthCheck: Map<ProviderType, number> = new Map();
  private readonly HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  async selectProvider(options: ProviderSelectorOptions): Promise<BaseAIProvider | null> {
    const { task_type, user_id, preferred_provider, fallback_chain } = options;

    const registry = getProviderRegistry();

    let providerPriority = await this.getUserTaskConfig(user_id, task_type);

    if (preferred_provider) {
      providerPriority = [preferred_provider, ...providerPriority];
    }

    if (fallback_chain) {
      providerPriority = fallback_chain;
    }

    if (providerPriority.length === 0) {
      providerPriority = DEFAULT_PROVIDER_PRIORITY[task_type];
    }

    for (const providerType of providerPriority) {
      const provider = registry.getProvider(providerType as ProviderType);

      if (!provider) {
        continue;
      }

      if (!provider.available) {
        continue;
      }

      const isHealthy = await this.checkProviderHealth(providerType as ProviderType);
      if (!isHealthy) {
        continue;
      }

      return provider;
    }

    return null;
  }

  private async getUserTaskConfig(userId: string, taskType: TaskType): Promise<ProviderType[]> {
    try {
      const { data } = await supabase
        .from('ai_task_config')
        .select('provider_priority')
        .eq('user_id', userId)
        .eq('task_type', taskType)
        .maybeSingle();

      if (data && Array.isArray(data.provider_priority)) {
        return data.provider_priority as ProviderType[];
      }
    } catch (error) {
      console.error('Error fetching user task config:', error);
    }

    return [];
  }

  private async checkProviderHealth(providerType: ProviderType): Promise<boolean> {
    const registry = getProviderRegistry();
    const provider = registry.getProvider(providerType);

    if (!provider) {
      return false;
    }

    const lastCheck = this.lastHealthCheck.get(providerType);
    const now = Date.now();

    if (lastCheck && now - lastCheck < this.HEALTH_CHECK_INTERVAL) {
      const cached = this.healthStatuses.get(providerType);
      return cached?.healthy ?? true;
    }

    try {
      const health = await provider.healthCheck();
      this.healthStatuses.set(providerType, health);
      this.lastHealthCheck.set(providerType, now);
      return health.healthy;
    } catch (error) {
      console.error(`Health check failed for ${providerType}:`, error);
      return false;
    }
  }

  getHealthStatus(providerType: ProviderType): ProviderHealthStatus | undefined {
    return this.healthStatuses.get(providerType);
  }

  getAllHealthStatuses(): ProviderHealthStatus[] {
    return Array.from(this.healthStatuses.values());
  }

  static getInstance(): ProviderSelector {
    if (!ProviderSelector.instance) {
      ProviderSelector.instance = new ProviderSelector();
    }
    return ProviderSelector.instance;
  }

  private static instance: ProviderSelector;
}

export const getProviderSelector = (): ProviderSelector => {
  return ProviderSelector.getInstance();
};
