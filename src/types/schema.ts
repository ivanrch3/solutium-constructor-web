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

export interface Theme {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    card: string;
    border: string;
    sidebar_bg?: string;
    sidebar_foreground?: string;
    sidebar_accent?: string;
    sidebar_border?: string;
  };
  uiTheme: 'light' | 'dark' | 'alt';
  fontFamily?: string;
  borderRadius?: string;
  baseSize?: string;
  uiStyle?: 'windows' | 'solutium';
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
  activeTheme?: string;
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
  name: string;
  ownerId?: string;
  industry?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  website?: string;
  logoUrl?: string;
  isoUrl?: string;
  projectIconUrl?: string;
  fontFamily?: string;
  currency?: string;
  isMaster?: boolean;
  brandColors?: BrandColors;
  webConfig?: any;
  socials?: any;
  integrations?: any;
  imageMappings?: any;
  schemaVersion?: string;
  createdAt?: string;
  updatedAt?: string;
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
