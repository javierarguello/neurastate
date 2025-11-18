import { NextResponse } from 'next/server';
import type { ApiResponse, MarketStats } from '@neurastate/shared';
import { getMarketStats } from '@/services/server';

export async function GET() {
  try {
    const stats = await getMarketStats();

    const response: ApiResponse<MarketStats> = {
      success: true,
      data: stats,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching market stats:', error);

    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch market statistics',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
