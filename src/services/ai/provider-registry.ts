import { BaseAIProvider } from './base-provider';
import { ProviderType } from '@/types/ai';
import { OpenAIProvider } from './providers/openai-provider';
import { ClaudeProvider } from './providers/claude-provider';

export class ProviderRegistry {
  private providers: Map<ProviderType, BaseAIProvider> = new Map();

  registerProvider(type: ProviderType, provider: BaseAIProvider): void {
    this.providers.set(type, provider);
  }

  getProvider(type: ProviderType): BaseAIProvider | undefined {
    return this.providers.get(type);
  }

  getAvailableProviders(): ProviderType[] {
    return Array.from(this.providers.entries())
      .filter(([, provider]) => provider.available)
      .map(([type]) => type);
  }

  getAllProviders(): BaseAIProvider[] {
    return Array.from(this.providers.values());
  }

  hasProvider(type: ProviderType): boolean {
    return this.providers.has(type);
  }

  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
      ProviderRegistry.instance.initializeDefaultProviders();
    }
    return ProviderRegistry.instance;
  }

  private static instance: ProviderRegistry;

  private initializeDefaultProviders(): void {
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const claudeKey = import.meta.env.VITE_CLAUDE_API_KEY;

    if (openaiKey) {
      this.registerProvider('openai', new OpenAIProvider(openaiKey));
    }

    if (claudeKey) {
      this.registerProvider('claude', new ClaudeProvider(claudeKey));
    }
  }
}

export const getProviderRegistry = (): ProviderRegistry => {
  return ProviderRegistry.getInstance();
};
