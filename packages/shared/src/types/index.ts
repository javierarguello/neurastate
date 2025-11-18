export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  imageUrl: string;
  status: 'available' | 'pending' | 'sold';
  featured: boolean;
  description?: string;
  yearBuilt?: number;
  propertyType: 'house' | 'condo' | 'apartment' | 'townhouse' | 'land';
}

export interface MarketStats {
  averagePrice: number;
  medianPrice: number;
  totalListings: number;
  averageDaysOnMarket: number;
  pricePerSqft: number;
  inventoryLevel: number;
  monthOverMonthChange: number;
  yearOverYearChange: number;
}

export interface MarketTrend {
  date: string;
  averagePrice: number;
  sales: number;
  inventory: number;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  subject?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface IPropertyPointViewRow {
  x: number | null;
  y: number | null;
  objectid: number;
  folio: string | null;
  ttrrss: number | null;
  x_coord: number | null;
  y_coord: number | null;
  true_site_addr: string | null;
  true_site_unit: string | null;
  true_site_city: string | null;
  true_site_zip_code: string | null;
  true_mailing_addr1: string | null;
  true_mailing_addr2: string | null;
  true_mailing_addr3: string | null;
  true_mailing_city: string | null;
  true_mailing_state: string | null;
  true_mailing_zip_code: string | null;
  true_mailing_country: string | null;
  true_owner1: string | null;
  true_owner2: string | null;
  true_owner3: string | null;
  condo_flag: string | null;
  parent_folio: string | null;
  dor_code_cur: number | null;
  dor_desc: string | null;
  subdivision: string | null;
  bedroom_count: number | null;
  bathroom_count: number | null;
  half_bathroom_count: number | null;
  floor_count: number | null;
  unit_count: number | null;
  building_actual_area: number | null;
  building_heated_area: number | null;
  lot_size: number | null;
  year_built: number | null;
  assessment_year_cur: number | null;
  assessed_val_cur: number | null;
  dos_1: Date | null;
  price_1: number | null;
  legal: string | null;
  pid: number | null;
  dateofsale_utc: Date | null;
}

export interface ISettings {
  id: number;
  datasetPointOfViewUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
