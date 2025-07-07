import type { RemoteCap } from '../types';
import type { CapFetchParams, CapSearchResponse } from './cap-fetch';

// Mock data for development (will be replaced with real API calls)
export const mockRemoteCaps: RemoteCap[] = [
  {
    id: '1',
    name: 'Code Generator',
    tag: 'development',
    description:
      'Generate high-quality code snippets and functions for various programming languages.',
    downloads: 1250,
    version: '1.2.0',
    author: 'CodeCraft Team',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    prompt: "You're a code generation assistant helping with programming tasks.",
    modelId: "gpt-4",
    mcpUrl: ["https://api.example.com/mcp/code-generator"]
  },
  {
    id: '2',
    name: 'UI Designer',
    tag: 'design',
    description:
      'Create beautiful user interfaces and design systems with modern components.',
    downloads: 890,
    version: '2.1.0',
    author: 'DesignLab',
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    prompt: "You're a UI design assistant helping with creating user interfaces.",
    modelId: "gpt-4",
    mcpUrl: ["https://api.example.com/mcp/ui-designer"]
  },
  {
    id: '3',
    name: 'Data Analyzer',
    tag: 'analytics',
    description:
      'Analyze complex datasets and generate insightful reports and visualizations.',
    downloads: 567,
    version: '1.0.3',
    author: 'DataViz Pro',
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    prompt: "You're a data analysis assistant helping with interpreting data.",
    modelId: "claude-3-opus",
    mcpUrl: ["https://api.example.com/mcp/data-analyzer"]
  },
  {
    id: '4',
    name: 'Content Writer',
    tag: 'productivity',
    description:
      'Write engaging content, articles, and marketing copy with AI assistance.',
    downloads: 2100,
    version: '3.0.1',
    author: 'ContentAI',
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    prompt: "You're a content writing assistant helping create engaging articles and copy.",
    modelId: "gpt-4",
    mcpUrl: ["https://api.example.com/mcp/content-writer"]
  },
  {
    id: '5',
    name: 'Image Editor',
    tag: 'design',
    description:
      'Edit and enhance images with advanced AI-powered tools and filters.',
    downloads: 1850,
    version: '1.5.2',
    author: 'PixelCraft',
    createdAt: Date.now() - 75 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    prompt: "You're an image editing assistant helping enhance visuals.",
    modelId: "dalle-3",
    mcpUrl: ["https://api.example.com/mcp/image-editor"]
  },
  {
    id: '6',
    name: 'API Builder',
    tag: 'development',
    description:
      'Build and test REST APIs with automatic documentation generation.',
    downloads: 923,
    version: '2.0.0',
    author: 'APITools Inc',
    createdAt: Date.now() - 120 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    prompt: "You're an API design assistant helping create RESTful services.",
    modelId: "gpt-4",
    mcpUrl: ["https://api.example.com/mcp/api-builder"]
  },
  {
    id: '7',
    name: 'Task Manager',
    tag: 'productivity',
    description:
      'Organize tasks, set priorities, and track project progress efficiently.',
    downloads: 1567,
    version: '1.3.1',
    author: 'ProductivePro',
    createdAt: Date.now() - 50 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    prompt: "You're a productivity assistant helping organize tasks and projects.",
    modelId: "gpt-3.5-turbo",
    mcpUrl: ["https://api.example.com/mcp/task-manager"]
  },
  {
    id: '8',
    name: 'Chart Builder',
    tag: 'analytics',
    description:
      'Create interactive charts and graphs from your data with ease.',
    downloads: 734,
    version: '1.1.0',
    author: 'ChartMaster',
    createdAt: Date.now() - 35 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
    prompt: "You're a data visualization assistant helping create charts and graphs.",
    modelId: "gpt-4",
    mcpUrl: ["https://api.example.com/mcp/chart-builder"]
  },
  {
    id: '9',
    name: 'Password Generator',
    tag: 'security',
    description: 'Generate secure passwords and manage credentials safely.',
    downloads: 2890,
    version: '2.2.4',
    author: 'SecureTech',
    createdAt: Date.now() - 100 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    prompt: "You're a security assistant helping create and manage secure passwords.",
    modelId: "gpt-3.5-turbo",
    mcpUrl: ["https://api.example.com/mcp/password-generator"]
  },
  {
    id: '10',
    name: 'Color Palette',
    tag: 'design',
    description: 'Generate beautiful color palettes for your design projects.',
    downloads: 1290,
    version: '1.4.0',
    author: 'ColorGenius',
    createdAt: Date.now() - 65 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
    prompt: "You're a design assistant helping create harmonious color palettes.",
    modelId: "gpt-4",
    mcpUrl: ["https://api.example.com/mcp/color-palette"]
  },
  {
    id: '11',
    name: 'Database Query',
    tag: 'development',
    description: 'Write and optimize SQL queries with AI-powered suggestions.',
    downloads: 456,
    version: '1.0.1',
    author: 'QueryCraft',
    createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    prompt: "You're a database assistant helping write and optimize SQL queries.",
    modelId: "gpt-4",
    mcpUrl: ["https://api.example.com/mcp/database-query"]
  },
  {
    id: '12',
    name: 'Security Scanner',
    tag: 'security',
    description:
      'Scan your applications for security vulnerabilities and threats.',
    downloads: 678,
    version: '1.6.0',
    author: 'SecScan Labs',
    createdAt: Date.now() - 80 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    prompt: "You're a security assistant helping identify and fix vulnerabilities.",
    modelId: "claude-3-sonnet",
    mcpUrl: ["https://api.example.com/mcp/security-scanner"]
  },
];

/**
 * Mock implementation of fetchRemoteCaps that reads from mockRemoteCaps
 * 
 * This function simulates the behavior of the actual fetchRemoteCaps by:
 * 1. Filtering based on query, category, author, timeRange, and minDownloads
 * 2. Sorting based on sortBy and sortOrder
 * 3. Paginating based on limit and offset
 * 
 * @param filters - The parameters to filter, sort and paginate the caps
 * @returns A promise resolving to a CapSearchResponse object
 */
export const mockFetchRemoteCaps = async (filters: CapFetchParams): Promise<CapSearchResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let filtered = [...mockRemoteCaps];
  
  // Apply text search
  if (filters.query) {
    const query = filters.query.toLowerCase();
    filtered = filtered.filter(cap => 
      cap.name.toLowerCase().includes(query) || 
      cap.description.toLowerCase().includes(query)
    );
  }
  
  // Filter by category (tag in our mock data)
  if (filters.category) {
    filtered = filtered.filter(cap => cap.tag === filters.category);
  }
  
  // Filter by author
  if (filters.author) {
    filtered = filtered.filter(cap => 
      cap.author.toLowerCase().includes(filters.author!.toLowerCase())
    );
  }
  
  // Filter by time range
  if (filters.timeRange) {
    const now = Date.now();
    let timeThreshold = now;
    
    switch (filters.timeRange) {
      case 'day':
        timeThreshold = now - 24 * 60 * 60 * 1000;
        break;
      case 'week':
        timeThreshold = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        timeThreshold = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case 'year':
        timeThreshold = now - 365 * 24 * 60 * 60 * 1000;
        break;
      // 'all' means no filtering
    }
    
    if (filters.timeRange !== 'all') {
      filtered = filtered.filter(cap => cap.updatedAt >= timeThreshold);
    }
  }
  
  // Apply sorting
  const sortBy = filters.sortBy || 'downloads';
  const sortOrder = filters.sortOrder || 'desc';
  
  filtered.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'downloads':
        comparison = a.downloads - b.downloads;
        break;
      case 'updated':
        comparison = a.updatedAt - b.updatedAt;
        break;
      case 'created':
        comparison = a.createdAt - b.createdAt;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  // Apply pagination
  const limit = filters.limit || 10;
  const offset = filters.offset || 0;
  const paginatedResults = filtered.slice(offset, offset + limit);
  
  // Calculate pagination info
  const total = filtered.length;
  const page = Math.floor(offset / limit) + 1;
  const hasMore = offset + limit < total;
  
  // Return formatted response
  return {
    caps: paginatedResults,
    total,
    hasMore,
    page
  };
};
