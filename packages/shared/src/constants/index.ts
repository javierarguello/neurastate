export const PROPERTY_TYPES = {
  HOUSE: 'house',
  CONDO: 'condo',
  APARTMENT: 'apartment',
  TOWNHOUSE: 'townhouse',
  LAND: 'land',
} as const;

export const PROPERTY_STATUS = {
  AVAILABLE: 'available',
  PENDING: 'pending',
  SOLD: 'sold',
} as const;

export const MIAMI_NEIGHBORHOODS = [
  'Brickell',
  'South Beach',
  'Wynwood',
  'Coconut Grove',
  'Coral Gables',
  'Downtown Miami',
  'Edgewater',
  'Design District',
  'Midtown',
  'Key Biscayne',
] as const;

export const API_ROUTES = {
  PROPERTIES: '/api/properties',
  MARKET_STATS: '/api/market/stats',
  MARKET_TRENDS: '/api/market/trends',
  CONTACT: '/api/contact',
} as const;

export const PROPERTY_POINT_VIEW_TABLE = 'neurastate.property_point_view' as const;
