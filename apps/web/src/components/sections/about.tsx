'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Brain, TrendingUp, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function AboutSection() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analytics',
      description:
        'Advanced machine learning algorithms analyze market trends and predict future price movements with unprecedented accuracy.',
      color: 'text-ocean-600',
      bgColor: 'bg-ocean-100',
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Market Data',
      description:
        "Access up-to-the-minute market statistics, pricing trends, and comprehensive insights across Miami's luxury market.",
      color: 'text-turquoise-600',
      bgColor: 'bg-turquoise-100',
    },
    {
      icon: Shield,
      title: 'Verified Listings',
      description:
        'Every property is thoroughly vetted and verified, ensuring you only see legitimate, high-quality listings.',
      color: 'text-coral-600',
      bgColor: 'bg-coral-100',
    },
    {
      icon: Zap,
      title: 'Instant Insights',
      description:
        'Get immediate access to property valuations, neighborhood analytics, and investment potential assessments.',
      color: 'text-ocean-600',
      bgColor: 'bg-ocean-100',
    },
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">About Neurastate</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We combine cutting-edge artificial intelligence with deep real estate expertise to
            deliver unparalleled market insights for Miami&apos;s luxury property sector. Our platform
            empowers buyers, sellers, and investors with data-driven intelligence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className={`${feature.bgColor} w-14 h-14 rounded-lg flex items-center justify-center mb-6`}>
                      <Icon className={`w-7 h-7 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-ocean-900 via-ocean-800 to-ocean-900 rounded-2xl p-12 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Properties Analyzed' },
              { value: '95%', label: 'Prediction Accuracy' },
              { value: '$2.5B+', label: 'Total Value Tracked' },
              { value: '24/7', label: 'Market Monitoring' },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-ocean-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
