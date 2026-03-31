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
  role: z.string().optional().nullable(),
  activeTheme: z.string().optional().nullable(),
  fontFamily: z.string().optional().nullable(),
  fullName: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
});

export const projectBrandingSchema = z.object({
  primaryColor: z.string().optional().nullable(),
  secondaryColor: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  customerId: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  webConfig: webConfigSchema.optional().nullable(),
  branding: projectBrandingSchema.optional().nullable(),
});

export const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  businessId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  sourceAppId: z.string().optional().nullable(),
  visibility: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  companyLogoUrl: z.string().optional().nullable(),
  profilePhotoUrl: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  schemaVersion: z.string().optional().nullable(),
  appData: z.any().optional().nullable(),
  assignedBusinessIds: z.any().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
  lastActivity: z.string().optional().nullable(),
});

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  unitCost: z.number().optional().nullable(),
  type: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  businessId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  schemaVersion: z.string().optional().nullable(),
  appData: z.any().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
});
