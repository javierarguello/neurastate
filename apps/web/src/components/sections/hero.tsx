'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image - Miami skyline and coast */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=2400"
          alt="Miami Skyline and Coast"
          fill
          priority
          className="object-cover object-center scale-105"
          quality={90}
        />
        {/* Gradient overlay to blend with ocean blue theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-900/90 via-ocean-800/85 to-ocean-900/90" />
        {/* Additional gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ocean-900/50 to-ocean-900/80" />
        {/* Blur effect on edges */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      {/* Animated background accents */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-turquoise-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-ocean-600/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-turquoise-500/10 border border-turquoise-500/20"
          >
            <TrendingUp className="w-4 h-4 text-turquoise-400" />
            <span className="text-sm text-turquoise-300">AI-Powered Market Intelligence</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Premium Real Estate
            <br />
            <span className="bg-gradient-to-r from-turquoise-400 to-ocean-300 bg-clip-text text-transparent">
              Analytics & Insights
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-ocean-100 mb-8 max-w-2xl mx-auto"
          >
            Discover Miami&apos;s most exclusive properties with advanced market analytics and
            data-driven insights powered by artificial intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-turquoise-500 to-turquoise-600 hover:from-turquoise-600 hover:to-turquoise-700 text-white border-0 group"
            >
              <a href="#contact">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-ocean-400 text-ocean-100 hover:bg-ocean-800/50"
            >
              <a href="#market">
                <Building2 className="mr-2 w-4 h-4" />
                Market Analysis
              </a>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-ocean-700"
          >
            {[
              { value: '$8.5M', label: 'Avg Price' },
              { value: '2,450+', label: 'Properties' },
              { value: '18.7%', label: 'YoY Growth' },
              { value: '42', label: 'Days on Market' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-ocean-300">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-ocean-400 rounded-full p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-turquoise-400 rounded-full mx-auto"
          />
        </div>
      </motion.div>
    </section>
  );
}
