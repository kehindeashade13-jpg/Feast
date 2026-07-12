export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  created_at?: string;
}

export interface AppConfig {
  isSupabaseConfigured: boolean;
  supabaseUrl: string | null;
  adminEmail: string;
}
