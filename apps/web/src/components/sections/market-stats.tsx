'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Home, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MarketStats } from '@neurastate/shared';
import { formatCurrency, formatNumber, formatPercentage } from '@neurastate/shared';
import { fetchMarketStats } from '@/services/client';

export function MarketStatsSection() {
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const statsData = [
    {
      title: 'Average Price',
      value: formatCurrency(stats.averagePrice),
      change: stats.monthOverMonthChange,
      icon: Home,
      color: 'text-ocean-600',
      bgColor: 'bg-ocean-100',
    },
    {
      title: 'Price per Sq Ft',
      value: formatCurrency(stats.pricePerSqft),
      change: 4.2,
      icon: TrendingUp,
      color: 'text-turquoise-600',
      bgColor: 'bg-turquoise-100',
    },
    {
      title: 'Total Listings',
      value: formatNumber(stats.totalListings),
      change: -2.1,
      icon: Home,
      color: 'text-coral-600',
      bgColor: 'bg-coral-100',
    },
    {
      title: 'Avg Days on Market',
      value: stats.averageDaysOnMarket.toString(),
      change: -8.5,
      icon: Clock,
      color: 'text-ocean-600',
      bgColor: 'bg-ocean-100',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Market Overview</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-time insights into Miami&apos;s luxury real estate market
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            const isPositive = stat.change > 0;
            const TrendIcon = isPositive ? TrendingUp : TrendingDown;

            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`${stat.bgColor} p-2 rounded-lg`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    <div
                      className={`flex items-center text-sm ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      <TrendIcon className="w-4 h-4 mr-1" />
                      {formatPercentage(Math.abs(stat.change))} vs last month
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
