export type UserRole = 'user' | 'admin';

export type CampusZone = 
  | 'North Quad' 
  | 'South Lawn' 
  | 'Botanical Garden' 
  | 'Science Complex' 
  | 'Central Park' 
  | 'East Lake';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Plant {
  id: string;
  species_name: string;
  common_name: string;
  family: string;
  photo_url: string;
  latitude: number;
  longitude: number;
  zone: CampusZone;
  verified: boolean;
  confidence_score: number;
  notes?: string;
  description?: string;
  submitted_by?: string; // Excluded in public_plants view
  created_at: string;
}

export interface PublicPlant {
  id: string;
  species_name: string;
  common_name: string;
  family: string;
  photo_url: string;
  latitude: number;
  longitude: number;
  zone: CampusZone;
  verified: boolean;
  confidence_score: number;
  notes?: string;
  description?: string;
  created_at: string;
}

export interface PlantNetPrediction {
  speciesName: string;
  commonName: string;
  family: string;
  score: number; // 0-100 percentage
}

export interface PlantFilterOptions {
  searchQuery: string;
  zone: string;
  family: string;
  verificationStatus: 'all' | 'verified' | 'unverified';
}

export interface CampusBoundary {
  name: string;
  coordinates: [number, number][]; // [lat, lng] array for polygon
  center: [number, number];
  zoom: number;
}
