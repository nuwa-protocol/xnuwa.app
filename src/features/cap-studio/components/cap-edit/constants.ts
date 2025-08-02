export const predefinedTags = [
  'AI Model',
  'Developer',
  'Content Creator',
  'Research',
  'Crypto',
  'Others',
];

export const promptVariables = [
  { name: '{{user_geo}}', description: "The user's location" },
  { name: '{{context}}', description: 'Additional context from MCP servers' },
  { name: '{{date}}', description: 'Current date and time' },
  { name: '{{user_name}}', description: "The user's name" },
  {
    name: '{{previous_response}}',
    description: 'Previous AI response in the conversation',
  },
];
