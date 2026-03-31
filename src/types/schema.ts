export interface BrandColors {
  primary?: string;
  secondary?: string;
  accent?: string;
}

export interface WebConfig {
  domain?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface AppData {
  version?: string;
  features?: string[];
}

export interface Profile {
  id: string;
  role?: string;
  activeTheme?: string;
  fontFamily?: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface ProjectBranding {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
}

export interface Project {
  id: string;
  name?: string;
  description?: string;
  customerId?: string;
  status?: string;
  createdAt?: string;
  webConfig?: WebConfig;
  branding?: ProjectBranding;
}

export interface Customer {
  id: string;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  brandColors?: BrandColors;
  createdAt?: string;
}

export interface Product {
  id: string;
  name?: string;
  price?: number;
  isActive?: boolean;
  appData?: AppData;
  createdAt?: string;
}
