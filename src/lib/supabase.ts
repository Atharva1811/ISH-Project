import { createClient } from '@supabase/supabase-js';
import { Plant, UserProfile, UserRole } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-campusflora.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Let SDK auto refresh session without manual localStorage manipulation
    autoRefreshToken: true,
  }
});

// Check if live Supabase instance is configured
export const isLiveSupabaseConfigured = (): boolean => {
  return (
    Boolean(import.meta.env.VITE_SUPABASE_URL) &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://demo-campusflora.supabase.co' &&
    Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY) &&
    !import.meta.env.VITE_SUPABASE_ANON_KEY.startsWith('demo-')
  );
};

// ============================================================================
// DEMO MOCK STORE & LOCAL RLS SIMULATOR
// Provides seamless out-of-the-box demoing when live Supabase is not connected
// ============================================================================

const SEED_PLANTS: Plant[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    species_name: 'Delonix regia',
    common_name: 'Royal Poinciana / Gulmohar',
    family: 'Fabaceae',
    photo_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop',
    latitude: 18.5532,
    longitude: 73.8268,
    zone: 'North Quad',
    verified: true,
    confidence_score: 98.5,
    notes: 'Large shade tree with vibrant scarlet flowers near the main administrative building.',
    description: 'Delonix regia is a species of flowering plant in the bean family Fabaceae, noted for its fern-like leaves and flamboyant display of orange-red flowers.',
    submitted_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 86400000 * 12).toISOString()
  },
  {
    id: 'c9bf9e57-1685-4c89-bafb-ff5af830be8a',
    species_name: 'Azadirachta indica',
    common_name: 'Neem Tree',
    family: 'Meliaceae',
    photo_url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1200&auto=format&fit=crop',
    latitude: 18.5524,
    longitude: 73.8255,
    zone: 'Botanical Garden',
    verified: true,
    confidence_score: 96.2,
    notes: 'Medicinal tree with high canopy cover. Native evergreen species.',
    description: 'Neem is a tree in the mahogany family Meliaceae. It is native to the Indian subcontinent and renowned for medicinal properties.',
    submitted_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString()
  },
  {
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    species_name: 'Ficus religiosa',
    common_name: 'Sacred Fig / Peepal',
    family: 'Moraceae',
    photo_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop',
    latitude: 18.5541,
    longitude: 73.8279,
    zone: 'Central Park',
    verified: true,
    confidence_score: 99.1,
    notes: 'Historic specimen tree near the central library quad, estimated 60 years old.',
    description: 'Ficus religiosa or sacred fig is a species of fig native to the Indian subcontinent and Indochina.',
    submitted_by: '00000000-0000-0000-0000-000000000002',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString()
  },
  {
    id: '7b9e8f42-3a11-4e89-91c2-5509ba1130e9',
    species_name: 'Plumeria rubra',
    common_name: 'Frangipani / Champa',
    family: 'Apocynaceae',
    photo_url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=1200&auto=format&fit=crop',
    latitude: 18.5515,
    longitude: 73.8282,
    zone: 'South Lawn',
    verified: true,
    confidence_score: 94.0,
    notes: 'Fragrant pink and yellow blossoms along the pedestrian walkway.',
    description: 'Plumeria rubra is a deciduous plant species belonging to the genus Plumeria, known for fragrant flowers.',
    submitted_by: '00000000-0000-0000-0000-000000000002',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'a12bc34d-56ef-7890-abcd-ef1234567890',
    species_name: 'Jacaranda mimosifolia',
    common_name: 'Blue Jacaranda',
    family: 'Bignoniaceae',
    photo_url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200&auto=format&fit=crop',
    latitude: 18.5538,
    longitude: 73.8242,
    zone: 'Science Complex',
    verified: true,
    confidence_score: 97.4,
    notes: 'Stunning violet blooms during springtime near the chemistry department.',
    description: 'Jacaranda mimosifolia is a sub-tropical tree native to south-central South America that has been widely planted elsewhere because of its beautiful and long-lasting blue flowers.',
    submitted_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'e89f1234-5678-490a-bcde-f12345678901',
    species_name: 'Cassia fistula',
    common_name: 'Golden Shower Tree / Amaltas',
    family: 'Fabaceae',
    photo_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
    latitude: 18.5508,
    longitude: 73.8260,
    zone: 'East Lake',
    verified: false, // Unverified demo record to test RLS!
    confidence_score: 89.2,
    notes: 'Yellow pendulous racemes near the lakeside trail. Pending admin confirmation.',
    description: 'Cassia fistula, commonly known as golden shower, is a flowering plant in the family Fabaceae.',
    submitted_by: 'demo-user-id-12345',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

class MockStore {
  private plants: Plant[] = [...SEED_PLANTS];
  private currentUser: UserProfile | null = {
    id: 'demo-user-id-12345',
    full_name: 'Dr. Sarah Lin (Botanist)',
    email: 'sarah.lin@campus.edu',
    role: 'user', // Default role
    created_at: new Date().toISOString()
  };

  getPlants(userRole: UserRole = 'user', currentUserId: string = 'demo-user-id-12345'): Plant[] {
    // Mirror Postgres RLS logic:
    // SELECT: verified = true OR submitted_by = auth.uid() OR role = 'admin'
    return this.plants.filter(p => {
      if (p.verified) return true;
      if (userRole === 'admin') return true;
      if (p.submitted_by === currentUserId) return true;
      return false;
    });
  }

  getPublicPlant(id: string): Plant | null {
    const plant = this.plants.find(p => p.id === id);
    if (!plant || !plant.verified) return null;
    // Exclude submitted_by for privacy
    const { submitted_by, ...publicPlant } = plant;
    return publicPlant as Plant;
  }

  addPlant(newPlant: Omit<Plant, 'id' | 'created_at' | 'verified'>): Plant {
    const created: Plant = {
      ...newPlant,
      id: crypto.randomUUID(),
      verified: false, // Default unverified until admin review
      created_at: new Date().toISOString(),
      submitted_by: this.currentUser?.id || 'demo-user-id-12345'
    };
    this.plants.unshift(created);
    return created;
  }

  verifyPlant(id: string, verifiedStatus: boolean, role: UserRole): boolean {
    // Mirror Postgres RLS: UPDATE allowed only for admin
    if (role !== 'admin') {
      throw new Error('RLS Violation: Only admin role can update plant verification status');
    }
    const plant = this.plants.find(p => p.id === id);
    if (plant) {
      plant.verified = verifiedStatus;
      return true;
    }
    return false;
  }

  deletePlant(id: string, role: UserRole): boolean {
    if (role !== 'admin') {
      throw new Error('RLS Violation: Only admin role can delete plants');
    }
    this.plants = this.plants.filter(p => p.id !== id);
    return true;
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  setUserRole(role: UserRole) {
    if (this.currentUser) {
      this.currentUser.role = role;
    }
  }
}

export const mockStore = new MockStore();
