export interface Bookmark {
  id: string;
  title: string;
  url?: string;
  parentId?: string;
  dateAdded?: number;
}

export interface ClassificationResult {
  categories: string[];
  assignments: Record<string, string>;
}

export type Provider = 'deepseek' | 'openai' | 'claude' | 'custom';

export interface Settings {
  apiKey: string;
  model: string;
  baseUrl: string;
  provider: Provider;
}

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  model: 'deepseek-v4-flash',
  baseUrl: 'https://api.deepseek.com',
  provider: 'deepseek',
};

export const PROVIDER_CONFIGS: Record<Provider, { baseUrl: string; defaultModel: string }> = {
  deepseek: { baseUrl: 'https://api.deepseek.com', defaultModel: 'deepseek-v4-flash' },
  openai: { baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o' },
  claude: { baseUrl: 'https://api.anthropic.com/v1', defaultModel: 'claude-sonnet-4-6' },
  custom: { baseUrl: '', defaultModel: '' },
};
