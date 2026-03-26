export interface Project {
  id: string;
  owner_id: string;
  name: string;
  industry?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  website?: string;
  socials?: any;
  brand_colors?: string[];
  logo_url?: string;
  ui_style?: string;
  active_theme?: string;
  image_mappings?: any;
  is_master?: boolean;
  currency?: string;
  web_config?: any;
  integrations?: any;
  schema_version?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: 'super-admin' | 'admin' | 'user';
  language?: string;
  phone?: string;
  ui_style?: string;
  active_theme?: string;
  font_family?: string;
  base_size?: number;
  border_radius?: number;
  theme_preference?: string;
  colored_sidebar_icons?: boolean;
  subscription_plan?: string;
  onboarding_completed?: boolean;
  has_completed_tour?: boolean;
  email_it_id?: string;
  is_trial_user?: boolean;
  email_confirmed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  project_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  status?: string;
  source?: string;
  source_app_id?: string;
  business_id?: string;
  visibility?: string;
  assigned_business_ids?: string[];
  image_url?: string;
  last_activity?: string;
  notes?: string;
  app_data?: any;
  schema_version?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  unit_cost?: number;
  type?: string;
  sku?: string;
  status?: string;
  image_url?: string;
  business_id?: string;
  app_data?: any;
  schema_version?: string;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  project_id: string;
  name: string;
  type: string;
  url: string;
  origin_app: string;
  author?: string;
  status?: string;
  tags?: string[];
  data?: any;
  metadata?: any;
  schema_version?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: Profile | null;
  project: Project | null;
  projectId: string | null;
  loading: boolean;
  isDemo: boolean;
  setDemoMode: () => void;
}
