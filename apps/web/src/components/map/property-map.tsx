'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { IMapProperty } from '@neurastate/shared';
import 'leaflet/dist/leaflet.css';

/**
 * Default center coordinates for Miami, Florida
 */
const MIAMI_CENTER_LAT = 25.7617;
const MIAMI_CENTER_LNG = -80.1918;
const DEFAULT_ZOOM = 11;

/**
 * API endpoint for fetching map properties
 */
const MAP_PROPERTIES_API_URL = '/api/map/properties';

/**
 * Properties for the PropertyMap component
 */
interface IPropertyMapProps {
  /** Optional CSS class name for styling */
  className?: string;
}

/**
 * Component that handles map move/zoom events and fetches properties
 */
function MapEventHandler({
  onBoundsChange,
}: {
  onBoundsChange: (bounds: L.LatLngBounds, zoom: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const handleMoveEnd = () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      onBoundsChange(bounds, zoom);
    };

    // Fetch initial properties
    handleMoveEnd();

    // Listen to map events
    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleMoveEnd);
    };
  }, [map, onBoundsChange]);

  return null;
}

/**
 * Main map component for displaying Miami real estate properties.
 *
 * Features:
 * - Interactive Leaflet map centered on Miami
 * - Dynamic property loading based on visible map bounds
 * - Property markers with detailed popups
 * - Automatic data refresh on map move/zoom
 */
function PropertyMap({ className }: IPropertyMapProps) {
  const [properties, setProperties] = useState<IMapProperty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches properties within the given map bounds.
   */
  const _fetchProperties = useCallback(
    async (bounds: L.LatLngBounds, zoom: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        const bbox = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;
        const url = `${MAP_PROPERTIES_API_URL}?bbox=${bbox}&zoom=${zoom}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.data) {
          setProperties(data.data);
        } else {
          setError(data.error || 'Failed to load properties');
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Formats a number as currency (USD).
   */
  const _formatCurrency = (value: number | null): string => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  /**
   * Formats a number with thousand separators.
   */
  const _formatNumber = (value: number | null): string => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className={className}>
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="absolute top-4 right-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-ocean-600 border-t-transparent"></div>
            <span className="text-sm text-gray-700">Loading properties...</span>
          </div>
        </div>
      )}

      <MapContainer
        center={[MIAMI_CENTER_LAT, MIAMI_CENTER_LNG]}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventHandler onBoundsChange={_fetchProperties} />
        {properties.map((property) => (
          <Marker
            key={property.objectId}
            position={[property.lat, property.lng]}
            icon={L.icon({
              iconUrl: '/marker-icon.png',
              iconRetinaUrl: '/marker-icon-2x.png',
              shadowUrl: '/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            })}
          >
            <Popup>
              <div className="min-w-[250px]">
                <h3 className="font-bold text-lg mb-2 text-ocean-900">
                  {property.address || 'Address not available'}
                </h3>

                <div className="space-y-1 text-sm">
                  {property.city && (
                    <p className="text-gray-700">
                      <span className="font-medium">City:</span> {property.city}
                      {property.zipCode && `, ${property.zipCode}`}
                    </p>
                  )}

                  {property.owner && (
                    <p className="text-gray-700">
                      <span className="font-medium">Owner:</span> {property.owner}
                    </p>
                  )}

                  {property.propertyType && (
                    <p className="text-gray-700">
                      <span className="font-medium">Type:</span>{' '}
                      {property.propertyType}
                    </p>
                  )}

                  <div className="border-t border-gray-200 my-2 pt-2">
                    {property.assessedValue !== null && (
                      <p className="text-gray-700">
                        <span className="font-medium">Assessed Value:</span>{' '}
                        {_formatCurrency(property.assessedValue)}
                      </p>
                    )}

                    {property.lastSalePrice !== null && (
                      <p className="text-gray-700">
                        <span className="font-medium">Last Sale:</span>{' '}
                        {_formatCurrency(property.lastSalePrice)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4 text-xs text-gray-600">
                    {property.bedrooms !== null && (
                      <span>{_formatNumber(property.bedrooms)} bed</span>
                    )}
                    {property.bathrooms !== null && (
                      <span>{_formatNumber(property.bathrooms)} bath</span>
                    )}
                    {property.buildingArea !== null && (
                      <span>{_formatNumber(property.buildingArea)} sqft</span>
                    )}
                  </div>

                  {property.yearBuilt !== null && (
                    <p className="text-xs text-gray-600 mt-1">
                      Built: {property.yearBuilt}
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}


export default PropertyMap;
