/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-console */

import {
  StarterSuggestionItem,
  StarterSuggestionsContext,
  StarterSuggestionsProvider,
  StarterSuggestionsRegistration,
  StarterSuggestionsServiceContract,
} from './types';

const DEFAULT_TIMEOUT_MS = 4000;

export class StarterSuggestionsService implements StarterSuggestionsServiceContract {
  private providersByAppId: Map<string, StarterSuggestionsProvider> = new Map();
  private appIdsByProviderId: Map<string, Set<string>> = new Map();
  private invalidateListeners: Set<(appId: string) => void> = new Set();
  private readonly timeoutMs: number;

  constructor(timeoutMs: number = DEFAULT_TIMEOUT_MS) {
    this.timeoutMs = timeoutMs;
  }

  registerProvider(provider: StarterSuggestionsProvider): StarterSuggestionsRegistration {
    if (!provider || typeof provider !== 'object') {
      throw new Error('Provider must be an object');
    }
    if (!provider.id || typeof provider.id !== 'string' || provider.id.trim() === '') {
      throw new Error('Provider must have a valid id');
    }
    if (!provider.getSuggestions || typeof provider.getSuggestions !== 'function') {
      throw new Error('Provider must have a getSuggestions method');
    }

    const appIds = Array.isArray(provider.appId) ? provider.appId : [provider.appId];
    if (appIds.length === 0 || appIds.some((id) => !id)) {
      throw new Error('Provider must have a valid appId or non-empty appId array');
    }

    appIds.forEach((appId) => {
      if (this.providersByAppId.has(appId)) {
        console.warn(
          `StarterSuggestionsService: provider '${this.providersByAppId.get(appId)?.id}' ` +
            `for appId '${appId}' is being replaced by '${provider.id}'`
        );
      }
      this.providersByAppId.set(appId, provider);
    });
    this.appIdsByProviderId.set(provider.id, new Set(appIds));

    return {
      invalidate: () => {
        appIds.forEach((appId) => this.notifyInvalidate(appId));
      },
      unregister: () => {
        const registeredAppIds = this.appIdsByProviderId.get(provider.id);
        registeredAppIds?.forEach((appId) => {
          if (this.providersByAppId.get(appId) === provider) {
            this.providersByAppId.delete(appId);
          }
        });
        this.appIdsByProviderId.delete(provider.id);
      },
    };
  }

  async getSuggestions(
    context: StarterSuggestionsContext
  ): Promise<StarterSuggestionItem[] | null> {
    const provider = this.providersByAppId.get(context.appId);
    if (!provider) {
      return null;
    }

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Provider '${provider.id}' timed out after ${this.timeoutMs}ms`));
        }, this.timeoutMs);
      });

      const suggestionsPromise = Promise.resolve(provider.getSuggestions(context));
      const suggestions = await Promise.race([suggestionsPromise, timeoutPromise]);

      if (!Array.isArray(suggestions)) {
        throw new Error(`Provider '${provider.id}' must return an array`);
      }
      return suggestions;
    } catch (error) {
      console.error(`StarterSuggestionsService: error from provider '${provider.id}':`, error);
      return null;
    }
  }

  onInvalidate(callback: (appId: string) => void): () => void {
    this.invalidateListeners.add(callback);
    return () => {
      this.invalidateListeners.delete(callback);
    };
  }

  private notifyInvalidate(appId: string): void {
    this.invalidateListeners.forEach((listener) => {
      try {
        listener(appId);
      } catch (error) {
        console.error('StarterSuggestionsService: invalidate listener threw:', error);
      }
    });
  }

  getRegisteredAppIds(): string[] {
    return Array.from(this.providersByAppId.keys());
  }

  clear(): void {
    this.providersByAppId.clear();
    this.appIdsByProviderId.clear();
    this.invalidateListeners.clear();
  }
}
