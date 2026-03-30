import { z } from 'zod';

export const brandColorsSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string().optional().nullable(),
});

export const webConfigSchema = z.object({
  domain: z.string(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

export const appDataSchema = z.object({
  version: z.string(),
  features: z.array(z.string()),
});

export const profileSchema = z.object({
  id: z.string(),
  role: z.string(),
  activeTheme: z.string(),
  fontFamily: z.string(),
  fullName: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
});

export const projectBrandingSchema = z.object({
  primaryColor: z.string(),
  secondaryColor: z.string(),
  logoUrl: z.string().optional().nullable(),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  customerId: z.string(),
  status: z.string(),
  createdAt: z.string(),
  webConfig: webConfigSchema.optional().nullable(),
  branding: projectBrandingSchema.optional().nullable(),
});

export const customerSchema = z.object({
  id: z.string(),
  companyName: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string().optional().nullable(),
  brandColors: brandColorsSchema.optional().nullable(),
  createdAt: z.string(),
});

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  isActive: z.boolean(),
  appData: appDataSchema.optional().nullable(),
  createdAt: z.string(),
});
