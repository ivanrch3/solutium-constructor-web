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
  companyName: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  brandColors: brandColorsSchema.optional().nullable(),
  createdAt: z.string().optional().nullable(),
});

export const productSchema = z.object({
  id: z.string(),
  name: z.string().optional().nullable(),
  price: z.number().optional().nullable(),
  isActive: z.boolean().optional().nullable(),
  appData: appDataSchema.optional().nullable(),
  createdAt: z.string().optional().nullable(),
});
