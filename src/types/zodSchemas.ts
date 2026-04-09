import { z } from 'zod';

export const brandColorsSchema = z.object({
  primary: z.string().optional().nullable(),
  secondary: z.string().optional().nullable(),
  accent: z.string().optional().nullable(),
});

export const webConfigSchema = z.object({
  domain: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

export const appDataSchema = z.object({
  version: z.string().optional().nullable(),
  features: z.array(z.string()).optional().nullable(),
});

export const profileSchema = z.object({
  id: z.string(),
  fullName: z.any().optional().nullable(),
  email: z.any().optional().nullable(),
  avatarUrl: z.any().optional().nullable(),
  role: z.any().optional().nullable(),
  language: z.any().optional().nullable(),
  phone: z.any().optional().nullable(),
  timezone: z.any().optional().nullable(),
  currency: z.any().optional().nullable(),
  businessName: z.any().optional().nullable(),
  subscriptionPlan: z.any().optional().nullable(),
  provider: z.any().optional().nullable(),
  activeTheme: z.any().optional().nullable(),
  onboardingCompleted: z.any().optional().nullable(),
  hasCompletedTour: z.any().optional().nullable(),
  needsPassword: z.any().optional().nullable(),
  isTrialUser: z.any().optional().nullable(),
  emailConfirmed: z.any().optional().nullable(),
  verificationSent: z.any().optional().nullable(),
  totalRequestsMade: z.any().optional().nullable(),
  lastRequestAt: z.any().optional().nullable(),
  updatedAt: z.any().optional().nullable(),
  defaultProjectId: z.any().optional().nullable(),
  systemRoleId: z.any().optional().nullable(),
  emailItId: z.any().optional().nullable(),
  schemaVersion: z.any().optional().nullable(),
});

export const projectBrandingSchema = z.object({
  primaryColor: z.string().optional().nullable(),
  secondaryColor: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.any().optional().nullable(),
  ownerId: z.any().optional().nullable(),
  industry: z.any().optional().nullable(),
  whatsapp: z.any().optional().nullable(),
  email: z.any().optional().nullable(),
  address: z.any().optional().nullable(),
  website: z.any().optional().nullable(),
  logoUrl: z.any().optional().nullable(),
  isoUrl: z.any().optional().nullable(),
  projectIconUrl: z.any().optional().nullable(),
  fontFamily: z.any().optional().nullable(),
  currency: z.any().optional().nullable(),
  isMaster: z.any().optional().nullable(),
  brandColors: z.any().optional().nullable(),
  webConfig: z.any().optional().nullable(),
  socials: z.any().optional().nullable(),
  integrations: z.any().optional().nullable(),
  imageMappings: z.any().optional().nullable(),
  schemaVersion: z.any().optional().nullable(),
  createdAt: z.any().optional().nullable(),
  updatedAt: z.any().optional().nullable(),
});

export const customerSchema = z.object({
  id: z.string(),
  name: z.any().optional().nullable(),
  email: z.any().optional().nullable(),
  phone: z.any().optional().nullable(),
  company: z.any().optional().nullable(),
  role: z.any().optional().nullable(),
  status: z.any().optional().nullable(),
  source: z.any().optional().nullable(),
  businessId: z.any().optional().nullable(),
  projectId: z.any().optional().nullable(),
  sourceAppId: z.any().optional().nullable(),
  visibility: z.any().optional().nullable(),
  notes: z.any().optional().nullable(),
  companyLogoUrl: z.any().optional().nullable(),
  profilePhotoUrl: z.any().optional().nullable(),
  imageUrl: z.any().optional().nullable(),
  schemaVersion: z.any().optional().nullable(),
  appData: z.any().optional().nullable(),
  assignedBusinessIds: z.any().optional().nullable(),
  createdAt: z.any().optional().nullable(),
  updatedAt: z.any().optional().nullable(),
  lastActivity: z.any().optional().nullable(),
});

export const productSchema = z.object({
  id: z.string(),
  name: z.any().optional().nullable(),
  description: z.any().optional().nullable(),
  price: z.any().optional().nullable(),
  priceReference: z.any().optional().nullable(),
  category: z.any().optional().nullable(),
  sku: z.any().optional().nullable(),
  status: z.any().optional().nullable(),
  imageUrl: z.any().optional().nullable(),
  image2Url: z.any().optional().nullable(),
  stock: z.any().optional().nullable(),
  ratingAverage: z.any().optional().nullable(),
  reviewCount: z.any().optional().nullable(),
  badgeText: z.any().optional().nullable(),
  businessId: z.any().optional().nullable(),
  projectId: z.any().optional().nullable(),
  schemaVersion: z.any().optional().nullable(),
  appData: z.any().optional().nullable(),
  createdAt: z.any().optional().nullable(),
  updatedAt: z.any().optional().nullable(),
});

export const webBuilderSiteSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  userId: z.string().optional().nullable(),
  siteId: z.string().optional().nullable(),
  siteName: z.string().optional().nullable(),
  isPublish: z.boolean().optional().nullable(),
  name: z.string(),
  contentDraft: z.any(),
  status: z.enum(['draft', 'published', 'modified']),
  subdomain: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
});

export const publishedSiteSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  appId: z.string(),
  siteId: z.string().optional().nullable(),
  siteName: z.string().optional().nullable(),
  isPublish: z.boolean().optional().nullable(),
  isActive: z.boolean().optional().nullable(),
  content: z.any(), // RenderingContract
  metadata: z.any().optional().nullable(),
  subdomainId: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
});

export const assetSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  url: z.string(),
  type: z.string(),
  originApp: z.literal('solutium constructor web'),
  metadata: z.any().optional().nullable(),
  size: z.number().optional().nullable(),
  updatedAt: z.any().optional().nullable(),
});
