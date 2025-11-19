import { Navbar } from '@/components/sections/navbar';
import { Footer } from '@/components/sections/footer';
import dynamic from 'next/dynamic';

/**
 * Dynamically import PropertyMap with SSR disabled.
 * Leaflet requires browser APIs that are not available during SSR.
 */
const PropertyMap = dynamic(
  () => import('@/components/map/property-map'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-ocean-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    ),
  }
);

/**
 * Map page displaying Miami real estate properties on an interactive map.
 *
 * Features:
 * - Full-screen interactive map powered by Leaflet
 * - Properties are loaded dynamically based on visible map bounds
 * - Detailed property information in marker popups
 */
export default function MapPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Map container - takes remaining viewport height */}
      <div className="flex-1 relative" style={{ height: 'calc(100vh - 80px)' }}>
        <PropertyMap className="absolute inset-0" />
      </div>

      <Footer />
    </main>
  );
}
