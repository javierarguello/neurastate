'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import type { IMapPropertyLight, IMapProperty } from '@neurastate/shared';
import type L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Default center coordinates for Miami, Florida
 */
const MIAMI_CENTER_LAT = 25.7617;
const MIAMI_CENTER_LNG = -80.1918;
const DEFAULT_ZOOM = 11;

/**
 * API endpoint for fetching map properties (coordinates only)
 */
const MAP_PROPERTIES_API_URL = '/api/map/properties';

/**
 * API endpoint for fetching full property details
 */
const MAP_PROPERTY_DETAILS_API_URL = '/api/map/properties';

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
 * Property popup content that loads details on open
 */
function PropertyPopupContent({
  property,
  onFetchDetails,
  isLoading,
  formatCurrency,
  formatNumber,
}: {
  property: IMapPropertyLight;
  onFetchDetails: (objectId: number) => Promise<IMapProperty | null>;
  isLoading: boolean;
  formatCurrency: (value: number | null) => string;
  formatNumber: (value: number | null) => string;
}) {
  const [details, setDetails] = useState<IMapProperty | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadDetails = async () => {
      try {
        const data = await onFetchDetails(property.objectId);
        if (mounted) {
          setDetails(data);
          if (!data) {
            setError(true);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(true);
        }
      }
    };

    loadDetails();

    return () => {
      mounted = false;
    };
  }, [property.objectId, onFetchDetails]);

  if (error) {
    return (
      <div className="min-w-[250px] p-4 text-center text-red-600">
        Failed to load property details
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-w-[250px] p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-ocean-600 border-t-transparent"></div>
          <span className="text-sm text-gray-600">Loading property details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-[250px]">
      <h3 className="font-bold text-lg mb-2 text-ocean-900">
        {details.address || 'Address not available'}
      </h3>

      <div className="space-y-1 text-sm">
        {details.city && (
          <p className="text-gray-700">
            <span className="font-medium">City:</span> {details.city}
            {details.zipCode && `, ${details.zipCode}`}
          </p>
        )}

        {details.owner && (
          <p className="text-gray-700">
            <span className="font-medium">Owner:</span> {details.owner}
          </p>
        )}

        {details.propertyType && (
          <p className="text-gray-700">
            <span className="font-medium">Type:</span> {details.propertyType}
          </p>
        )}

        <div className="border-t border-gray-200 my-2 pt-2">
          {details.assessedValue !== null && (
            <p className="text-gray-700">
              <span className="font-medium">Assessed Value:</span>{' '}
              {formatCurrency(details.assessedValue)}
            </p>
          )}

          {details.lastSalePrice !== null && (
            <p className="text-gray-700">
              <span className="font-medium">Last Sale:</span>{' '}
              {formatCurrency(details.lastSalePrice)}
            </p>
          )}
        </div>

        <div className="flex gap-4 text-xs text-gray-600">
          {details.bedrooms !== null && (
            <span>{formatNumber(details.bedrooms)} bed</span>
          )}
          {details.bathrooms !== null && (
            <span>{formatNumber(details.bathrooms)} bath</span>
          )}
          {details.buildingArea !== null && (
            <span>{formatNumber(details.buildingArea)} sqft</span>
          )}
        </div>

        {details.yearBuilt !== null && (
          <p className="text-xs text-gray-600 mt-1">Built: {details.yearBuilt}</p>
        )}
      </div>
    </div>
  );
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
  const [properties, setProperties] = useState<IMapPropertyLight[]>([]);
  const [propertyDetails, setPropertyDetails] = useState<Map<number, IMapProperty>>(
    new Map()
  );
  const [loadingPropertyId, setLoadingPropertyId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoomMessage, setZoomMessage] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const currentBoundsRef = useRef<L.LatLngBounds | null>(null);
  const currentZoomRef = useRef<number | null>(null);

  /**
   * Fetches properties within the given map bounds.
   * Clears existing properties and starts fresh pagination.
   */
  const _fetchProperties = useCallback(
    async (bounds: L.LatLngBounds, zoom: number) => {
      setIsLoading(true);
      setError(null);
      setZoomMessage(null);
      currentBoundsRef.current = bounds;
      currentZoomRef.current = zoom;

      try {
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        const bbox = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;
        const url = `${MAP_PROPERTIES_API_URL}?bbox=${bbox}&zoom=${zoom}&limit=1000&offset=0`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.data) {
          setProperties(data.data);

          // If we got a full page, there might be more data - load it progressively
          if (data.data.length === 1000) {
            _loadMoreProperties(bounds, zoom, 1000);
          }
        } else if (response.status === 400 && data.message) {
          // Zoom level insufficient
          setZoomMessage(data.message);
          setProperties([]);
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
   * Loads additional pages of properties progressively.
   */
  const _loadMoreProperties = useCallback(
    async (bounds: L.LatLngBounds, zoom: number, currentOffset: number) => {
      setIsLoadingMore(true);

      try {
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        const bbox = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;
        const url = `${MAP_PROPERTIES_API_URL}?bbox=${bbox}&zoom=${zoom}&limit=1000&offset=${currentOffset}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
          setProperties((prev) => [...prev, ...data.data]);

          // If we got another full page, continue loading
          if (data.data.length === 1000) {
            // Use setTimeout to avoid blocking the main thread
            setTimeout(() => {
              _loadMoreProperties(bounds, zoom, currentOffset + 1000);
            }, 100);
          } else {
            setIsLoadingMore(false);
          }
        } else {
          setIsLoadingMore(false);
        }
      } catch (err) {
        console.error('Error loading more properties:', err);
        setIsLoadingMore(false);
      }
    },
    []
  );

  /**
   * Fetches full details for a specific property.
   */
  const _fetchPropertyDetails = useCallback(
    async (objectId: number): Promise<IMapProperty | null> => {
      // Check if already loaded
      const cached = propertyDetails.get(objectId);
      if (cached) {
        return cached;
      }

      setLoadingPropertyId(objectId);

      try {
        const url = `${MAP_PROPERTY_DETAILS_API_URL}/${objectId}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.data) {
          setPropertyDetails((prev) => {
            const newMap = new Map(prev);
            newMap.set(objectId, data.data);
            return newMap;
          });
          return data.data;
        }

        return null;
      } catch (err) {
        console.error('Error fetching property details:', err);
        return null;
      } finally {
        setLoadingPropertyId(null);
      }
    },
    [propertyDetails]
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

      {zoomMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-ocean-600 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
            <span className="text-sm font-medium">{zoomMessage}</span>
          </div>
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

      {isLoadingMore && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-ocean-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
            <span className="text-xs font-medium">Loading more properties...</span>
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
          <CircleMarker
            key={property.objectId}
            center={[property.lat, property.lng]}
            radius={8}
            pathOptions={{
              fillColor: '#38bdf8',
              fillOpacity: 0.6,
              color: '#0ea5e9',
              weight: 2,
              opacity: 0.8,
            }}
          >
            <Popup>
              <PropertyPopupContent
                property={property}
                onFetchDetails={_fetchPropertyDetails}
                isLoading={loadingPropertyId === property.objectId}
                formatCurrency={_formatCurrency}
                formatNumber={_formatNumber}
              />
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}


export default PropertyMap;
