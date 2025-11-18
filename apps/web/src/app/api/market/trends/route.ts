import { NextResponse } from 'next/server';
import type { ApiResponse, MarketTrend } from '@neurastate/shared';
import { getMarketTrends } from '@/services/server';

export async function GET() {
  try {
    const trends = await getMarketTrends();

    const response: ApiResponse<MarketTrend[]> = {
      success: true,
      data: trends,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching market trends:', error);

    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch market trends',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
