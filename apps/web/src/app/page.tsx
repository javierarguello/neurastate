import { Navbar } from '@/components/sections/navbar';
import { Hero } from '@/components/sections/hero';
import { MarketStatsSection } from '@/components/sections/market-stats';
import { MarketAnalysisSection } from '@/components/sections/market-analysis';
import { AboutSection } from '@/components/sections/about';
import { ContactSection } from '@/components/sections/contact';
import { Footer } from '@/components/sections/footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <MarketStatsSection />
      <MarketAnalysisSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
