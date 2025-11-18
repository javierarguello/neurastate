import type { MarketStats, MarketTrend } from '@neurastate/shared';
import { getProperties } from './properties.service';

/**
 * Server-side service for market data operations
 * Should only be called from API routes or server components
 */

export async function getMarketStats(): Promise<MarketStats> {
  const properties = await getProperties({ status: 'available' });

  if (properties.length === 0) {
    return {
      averagePrice: 0,
      medianPrice: 0,
      totalListings: 0,
      averageDaysOnMarket: 0,
      pricePerSqft: 0,
      inventoryLevel: 0,
      monthOverMonthChange: 0,
      yearOverYearChange: 0,
    };
  }

  const prices = properties.map((p) => p.price).sort((a, b) => a - b);
  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const medianPrice = prices[Math.floor(prices.length / 2)];

  const totalSqft = properties.reduce((sum, p) => sum + p.sqft, 0);
  const avgSqft = totalSqft / properties.length;
  const pricePerSqft = averagePrice / avgSqft;

  return {
    averagePrice,
    medianPrice,
    totalListings: properties.length,
    averageDaysOnMarket: 42,
    pricePerSqft,
    inventoryLevel: properties.length,
    monthOverMonthChange: 5.2,
    yearOverYearChange: 18.7,
  };
}

export async function getMarketTrends(): Promise<MarketTrend[]> {
  // Mock data - would come from database in real implementation
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const basePrice = 4500000;

  return months.map((month, index) => ({
    date: month,
    averagePrice: basePrice + index * 200000 + Math.random() * 100000,
    sales: 120 + Math.floor(Math.random() * 40),
    inventory: 850 + Math.floor(Math.random() * 100),
  }));
}
