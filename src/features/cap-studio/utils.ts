// Helper function to extract user-friendly error messages
export const getErrorMessage = (
  fieldErrors: any,
  fieldPath: string = '',
): string[] => {
  const messages: string[] = [];

  for (const [key, value] of Object.entries(fieldErrors)) {
    const currentPath = fieldPath ? `${fieldPath}.${key}` : key;

    if (value && typeof value === 'object' && 'message' in value) {
      // This is a field error with a message
      const fieldName = getFieldDisplayName(currentPath);
      messages.push(`${fieldName}: ${value.message}`);
    } else if (value && typeof value === 'object') {
      // This is a nested object, recurse into it
      messages.push(...getErrorMessage(value, currentPath));
    }
  }

  return messages;
};

// Helper function to convert field paths to user-friendly names
export const getFieldDisplayName = (path: string): string => {
  const fieldMap: Record<string, string> = {
    idName: 'Cap Name',
    'metadata.displayName': 'Display Name',
    'metadata.description': 'Description',
    'metadata.tags': 'Tags',
    'metadata.homepage': 'Homepage',
    'metadata.repository': 'Repository',
    'metadata.thumbnail': 'Thumbnail',
    'core.prompt.value': 'Prompt',
    'core.prompt.suggestions': 'Prompt Suggestions',
    'core.model.gatewayUrl': 'Gateway URL',
    'core.model.modelId': 'Model ID',
    'core.mcpServers': 'MCP Servers',
    'core.uiUrl': 'UI URL',
  };

  return fieldMap[path] || path;
};

export const getErrorDescription = (error: any) => {
  const errorMessages = getErrorMessage(error);
  return errorMessages.length > 0
    ? errorMessages.join('; ')
    : 'Please check all required fields';
};
