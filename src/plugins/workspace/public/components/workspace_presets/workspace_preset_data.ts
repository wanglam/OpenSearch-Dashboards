export const CUSTOM_PRESET_ID = 'custom';

export const workspacePresetData = [
  {
    id: 'observability',
    title: 'observability',
    description: 'real time log analytics for operational data.',
    features: [] as string[],
  },
  {
    id: 'security-analytics',
    title: 'security analytics',
    description: 'real-time log analytics for security data.',
    features: ['searchRelevance'],
  },
  {
    id: 'search',
    title: 'search',
    description: 'build solutions for document and item search',
    features: [] as string[],
  },
  {
    id: 'analytics',
    title: 'analytics',
    description: 'lorem ipsum general analytics',
    features: [] as string[],
  },
  {
    id: CUSTOM_PRESET_ID,
    title: 'custom',
    description: 'mix and match based on your unique needs',
  },
];
