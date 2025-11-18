import type { MarketStats, MarketTrend, ApiResponse } from '@neurastate/shared';
import { API_ROUTES } from '@neurastate/shared';

/**
 * Client-side service for market data operations
 * Should be called from client components
 */

export async function fetchMarketStats(): Promise<MarketStats> {
  const response = await fetch(API_ROUTES.MARKET_STATS);

  if (!response.ok) {
    throw new Error('Failed to fetch market stats');
  }

  const data: ApiResponse<MarketStats> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch market stats');
  }

  return data.data;
}

export async function fetchMarketTrends(): Promise<MarketTrend[]> {
  const response = await fetch(API_ROUTES.MARKET_TRENDS);

  if (!response.ok) {
    throw new Error('Failed to fetch market trends');
  }

  const data: ApiResponse<MarketTrend[]> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch market trends');
  }

  return data.data;
}
