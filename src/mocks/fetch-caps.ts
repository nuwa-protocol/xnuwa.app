import type { CapFetchParams, CapSearchResponse } from '@/features/cap-store/services/cap-fetch';
import { mockRemoteCaps } from './mock-remote-caps';

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
