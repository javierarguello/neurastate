import type { MarketStats, Property } from '@neurastate/shared';
import { calculatePercentageChange } from '@neurastate/shared';

/**
 * Calculate market statistics from properties
 */
export async function calculateMarketStats(properties: Property[]): Promise<MarketStats> {
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
  const pricePerSqft = averagePrice / (totalSqft / properties.length);

  // Mock calculations for time-based metrics
  const monthOverMonthChange = calculatePercentageChange(averagePrice * 0.97, averagePrice);
  const yearOverYearChange = calculatePercentageChange(averagePrice * 0.85, averagePrice);

  return {
    averagePrice,
    medianPrice,
    totalListings: properties.length,
    averageDaysOnMarket: 45, // Mock value
    pricePerSqft,
    inventoryLevel: properties.length,
    monthOverMonthChange,
    yearOverYearChange,
  };
}

/**
 * Process market data update
 */
export async function processMarketDataUpdate(): Promise<void> {
  console.log('Processing market data update...');
  // Would integrate with data sources, databases, etc.
  // This is a mock implementation
}
