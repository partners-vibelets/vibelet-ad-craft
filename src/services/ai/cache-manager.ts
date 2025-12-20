import { AICacheEntry, ProviderType, TaskType } from '@/types/ai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export class CacheManager {
  private inMemoryCache: Map<string, AICacheEntry> = new Map();
  private readonly MAX_MEMORY_CACHE = 100;
  private readonly DEFAULT_TTL_HOURS = 24;

  async get(
    userId: string,
    providerId: string,
    taskType: TaskType,
    input: string | Record<string, unknown>
  ): Promise<unknown | null> {
    const inputHash = this.hashInput(input);
    const cacheKey = `${userId}:${providerId}:${taskType}:${inputHash}`;

    const memoryEntry = this.inMemoryCache.get(cacheKey);
    if (memoryEntry && (!memoryEntry.expires_at || new Date(memoryEntry.expires_at) > new Date())) {
      await this.updateHitCount(memoryEntry.id);
      return memoryEntry.response_data;
    }

    try {
      const { data, error } = await supabase
        .from('ai_cache')
        .select('*')
        .eq('user_id', userId)
        .eq('provider_id', providerId)
        .eq('task_type', taskType)
        .eq('input_hash', inputHash)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        await this.delete(data.id);
        return null;
      }

      this.inMemoryCache.set(cacheKey, data as AICacheEntry);
      await this.updateHitCount(data.id);

      return data.response_data;
    } catch (error) {
      console.error('Error retrieving from cache:', error);
      return null;
    }
  }

  async set(
    userId: string,
    providerId: string,
    taskType: TaskType,
    input: string | Record<string, unknown>,
    response: unknown,
    ttlHours?: number
  ): Promise<AICacheEntry | null> {
    const inputHash = this.hashInput(input);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (ttlHours || this.DEFAULT_TTL_HOURS));

    const cacheEntry = {
      user_id: userId,
      provider_id: providerId,
      task_type: taskType,
      input_hash: inputHash,
      response_data: response,
      expires_at: expiresAt.toISOString(),
      metadata: {
        cached_at: new Date().toISOString(),
      },
    };

    try {
      const { data, error } = await supabase
        .from('ai_cache')
        .upsert([cacheEntry], { onConflict: 'user_id,provider_id,task_type,input_hash' })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error setting cache:', error);
        return null;
      }

      const cacheKey = `${userId}:${providerId}:${taskType}:${inputHash}`;

      if (this.inMemoryCache.size >= this.MAX_MEMORY_CACHE) {
        const firstKey = this.inMemoryCache.keys().next().value;
        if (firstKey) {
          this.inMemoryCache.delete(firstKey);
        }
      }

      if (data) {
        this.inMemoryCache.set(cacheKey, data as AICacheEntry);
      }

      return data as AICacheEntry | null;
    } catch (error) {
      console.error('Error setting cache:', error);
      return null;
    }
  }

  async delete(cacheId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('ai_cache').delete().eq('id', cacheId);

      if (error) {
        console.error('Error deleting cache:', error);
        return false;
      }

      this.inMemoryCache.forEach((entry, key) => {
        if (entry.id === cacheId) {
          this.inMemoryCache.delete(key);
        }
      });

      return true;
    } catch (error) {
      console.error('Error deleting cache:', error);
      return false;
    }
  }

  async clearExpired(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('ai_cache')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id');

      if (error) {
        console.error('Error clearing expired cache:', error);
        return 0;
      }

      if (data) {
        data.forEach((entry: any) => {
          this.inMemoryCache.forEach((cacheEntry, key) => {
            if (cacheEntry.id === entry.id) {
              this.inMemoryCache.delete(key);
            }
          });
        });
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error clearing expired cache:', error);
      return 0;
    }
  }

  private async updateHitCount(cacheId: string): Promise<void> {
    try {
      await supabase
        .from('ai_cache')
        .update({ hit_count: supabase.rpc('increment_hit_count', { cache_id: cacheId }) })
        .eq('id', cacheId);
    } catch (error) {
      console.error('Error updating hit count:', error);
    }
  }

  private hashInput(input: string | Record<string, unknown>): string {
    const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
    let hash = 0;
    for (let i = 0; i < inputStr.length; i++) {
      const char = inputStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private static instance: CacheManager;
}

export const getCacheManager = (): CacheManager => {
  return CacheManager.getInstance();
};
