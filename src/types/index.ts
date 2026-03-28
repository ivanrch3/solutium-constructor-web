export interface Project {
  id: string;
  ownerId: string;
  name: string;
  industry?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  website?: string;
  socials?: any;
  brandColors?: string[];
  logoUrl?: string;
  uiStyle?: string;
  activeTheme?: string;
  fontFamily?: string;
  baseSize?: number;
  borderRadius?: number;
  imageMappings?: any;
  isMaster?: boolean;
  currency?: string;
  webConfig?: any;
  integrations?: any;
  schemaVersion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: 'super-admin' | 'admin' | 'user';
  language?: string;
  phone?: string;
  uiStyle?: string;
  activeTheme?: string;
  fontFamily?: string;
  baseSize?: number;
  borderRadius?: number;
  themePreference?: string;
  coloredSidebarIcons?: boolean;
  subscriptionPlan?: string;
  onboardingCompleted?: boolean;
  hasCompletedTour?: boolean;
  emailItId?: string;
  isTrialUser?: boolean;
  emailConfirmed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  projectId: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  status?: string;
  source?: string;
  sourceAppId?: string;
  businessId?: string;
  visibility?: string;
  assignedBusinessIds?: string[];
  imageUrl?: string;
  lastActivity?: string;
  notes?: string;
  app?: any; // Renamed from app_data to avoid 'data' suffix and use camelCase
  schemaVersion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  unitCost?: number;
  type?: string;
  sku?: string;
  status?: string;
  imageUrl?: string;
  businessId?: string;
  app?: any; // Renamed from app_data
  schemaVersion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  projectId: string;
  name: string;
  type: string;
  url: string;
  originApp: string;
  author?: string;
  status?: string;
  tags?: string[];
  content?: any; // Renamed from data to avoid 'data' suffix
  metadata?: any;
  schemaVersion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: Profile | null;
  project: Project | null;
  projectId: string | null;
  products: Product[];
  customers: Customer[];
  members: any[];
  integrations: any[];
  assets: Asset[];
  loading: boolean;
  isDemo: boolean;
  isEmbedded: boolean;
  setDemoMode: () => void;
}
