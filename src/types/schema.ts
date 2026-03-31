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
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
  language?: string;
  phone?: string;
  timezone?: string;
  currency?: string;
  businessName?: string;
  subscriptionPlan?: string;
  provider?: string;
  themePreference?: string;
  preferredTheme?: string;
  activeTheme?: string;
  fontFamily?: string;
  uiStyle?: string;
  baseSize?: string;
  borderRadius?: string;
  sidebarBg?: string;
  sidebarForeground?: string;
  sidebarAccent?: string;
  sidebarBorder?: string;
  coloredSidebarIcons?: boolean;
  onboardingCompleted?: boolean;
  hasCompletedTour?: boolean;
  needsPassword?: boolean;
  isTrialUser?: boolean;
  emailConfirmed?: boolean;
  verificationSent?: boolean;
  totalRequestsMade?: number;
  lastRequestAt?: string;
  updatedAt?: string;
  defaultProjectId?: string;
  systemRoleId?: string;
  emailItId?: string;
  schemaVersion?: string;
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
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  status?: string;
  source?: string;
  businessId?: string;
  projectId?: string;
  sourceAppId?: string;
  visibility?: string;
  notes?: string;
  companyLogoUrl?: string;
  profilePhotoUrl?: string;
  imageUrl?: string;
  schemaVersion?: string;
  appData?: any;
  assignedBusinessIds?: any;
  createdAt?: string;
  updatedAt?: string;
  lastActivity?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  unitCost?: number;
  type?: string;
  sku?: string;
  status?: string;
  imageUrl?: string;
  photoUrl?: string;
  businessId?: string;
  projectId?: string;
  schemaVersion?: string;
  appData?: any;
  createdAt?: string;
  updatedAt?: string;
}
