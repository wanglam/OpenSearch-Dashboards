/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * A single starter suggestion card shown on the chat empty screen.
 */
export interface StarterSuggestionItem {
  /** Optional stable identifier, used by providers that want to filter specific default items. */
  id?: string;
  icon: string;
  iconColor?: string;
  text: string;
  /** Prompt text filled into the chat input when this suggestion is clicked. */
  prompt?: string;
  /** Optional custom action invoked instead of filling the input. */
  action?: () => void;
}

/**
 * Context passed to a provider's getSuggestions() call.
 */
export interface StarterSuggestionsContext {
  appId: string;
  pathname: string;
  dataSourceId?: string;
  /** Page context published via usePageContext / useDynamicContext, if any. */
  pageContext?: Record<string, any>;
  /** The current default suggestion items. Providers may spread/filter these into their result. */
  defaults: StarterSuggestionItem[];
}

/**
 * A plugin-provided source of starter suggestions for the chat empty screen.
 * Providers register once (typically at plugin setup/start) and remain
 * registered for the app's lifetime — activation is scoped by appId.
 */
export interface StarterSuggestionsProvider {
  /** Unique identifier for the provider. */
  id: string;
  /** Which app(s) this provider is active for. Inactive on all other pages. */
  appId: string | string[];
  /**
   * Compute the suggestions to show. May be async (e.g. calling an agent).
   * The chat plugin races this against a timeout and falls back on error.
   */
  getSuggestions: (
    context: StarterSuggestionsContext
  ) => StarterSuggestionItem[] | Promise<StarterSuggestionItem[]>;
}

/**
 * Handle returned from registerProvider().
 */
export interface StarterSuggestionsRegistration {
  /** Force the chat plugin to re-invoke this provider's getSuggestions() now. */
  invalidate(): void;
  /** Remove this provider. Call from the owning plugin's stop() lifecycle. */
  unregister(): void;
}

export interface StarterSuggestionsServiceContract {
  registerProvider(provider: StarterSuggestionsProvider): StarterSuggestionsRegistration;
  getSuggestions(context: StarterSuggestionsContext): Promise<StarterSuggestionItem[] | null>;
  onInvalidate(callback: (appId: string) => void): () => void;
}
