import fs from 'fs';
import path from 'path';
import type { RemoteCap } from '@/features/cap-store/types';
import type { LocalCap } from '@/features/cap-studio/types';
import remoteCapsMockData from './remote-caps.json';

export interface CapSubmitRequest {
  cap: LocalCap;
  metadata: {
    name: string;
    description: string;
    tags: string[];
    author: string;
    homepage?: string;
    repository?: string;
    changelog?: string;
  };
}

export interface CapSubmitResponse {
  success: boolean;
  capId?: string;
  message: string;
  errors?: string[];
}

/**
 * Mock implementation of cap submission to remote server
 * In production, this would make an actual API call to submit the cap
 * For now, we'll simulate success/failure and store in a local file
 */
export const mockSubmitCap = async (
  request: CapSubmitRequest,
): Promise<CapSubmitResponse> => {
  // Simulate network delay
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 2000),
  );

  // Basic validation
  const errors: string[] = [];

  if (!request.metadata.name.trim()) {
    errors.push('Cap name is required');
  }

  if (!request.metadata.description.trim()) {
    errors.push('Cap description is required');
  }

  if (!request.metadata.author.trim()) {
    errors.push('Author name is required');
  }

  if (!request.cap.prompt.trim()) {
    errors.push('Cap prompt is required');
  }

  if (errors.length > 0) {
    return {
      success: false,
      message: 'Validation failed',
      errors,
    };
  }

  // Simulate random failure (10% chance)
  if (Math.random() < 0.1) {
    return {
      success: false,
      message: 'Server error occurred. Please try again later.',
      errors: ['Internal server error'],
    };
  }

  // Simulate successful submission
  const submittedCapId = `remote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const remoteCap = convertLocalToRemoteCap(request.cap, request.metadata);
  remoteCap.id = submittedCapId;

  // Add to JSON file
  try {
    const currentData = [...(remoteCapsMockData as RemoteCap[]), remoteCap];
    const jsonPath = path.join(__dirname, 'remote-caps.json');
    fs.writeFileSync(jsonPath, JSON.stringify(currentData, null, 2));
  } catch (error) {
    console.warn('Could not write to JSON file, using in-memory mock:', error);
  }

  // For mock purposes, we'll just log the submission
  console.log('Mock cap submitted:', {
    capId: submittedCapId,
    name: request.metadata.name,
    author: request.metadata.author,
    description: request.metadata.description,
  });
  return {
    success: true,
    capId: submittedCapId,
    message: `Cap "${request.metadata.name}" has been successfully submitted to the store!`,
  };
};

/**
 * Mock function to convert LocalCap to RemoteCap format
 * This would typically be handled by the server
 */
export const convertLocalToRemoteCap = (
  localCap: LocalCap,
  metadata: CapSubmitRequest['metadata'],
): RemoteCap => {
  return {
    id: `remote_${localCap.id}`,
    name: metadata.name,
    description: metadata.description,
    tags: metadata.tags,
    version: '0.0.0',
    author: metadata.author,
    downloads: 0, // New caps start with 0 downloads
    createdAt: Date.now(),
    updatedAt: Date.now(),
    prompt: localCap.prompt,
    model: localCap.model,
    mcpServers: localCap.mcpServers,
  };
};
