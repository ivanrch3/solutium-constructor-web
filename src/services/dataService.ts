import { getSupabase } from './supabaseClient';
import { Profile, Project, Customer, Product } from '../types/schema';
import { profileSchema, projectSchema, customerSchema, productSchema } from '../types/zodSchemas';
import { z } from 'zod';

// Helper to handle validation and logging
const validateData = <T>(schema: z.ZodType<T>, data: unknown, context: string): T | null => {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`Zod Validation Error in ${context}:`, result.error.format());
    return null;
  }
  return result.data;
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) return null;

    const mappedData = {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      avatarUrl: data.avatar_url,
      role: (typeof data.role === 'string') ? data.role.toLowerCase().replace('-', '') : 'user',
      language: data.language,
      phone: data.phone,
      timezone: data.timezone,
      currency: data.currency,
      businessName: data.business_name,
      subscriptionPlan: data.subscription_plan,
      provider: data.provider,
      themePreference: data.theme_preference,
      preferredTheme: data.preferred_theme,
      activeTheme: data.active_theme,
      fontFamily: data.font_family,
      uiStyle: data.ui_style,
      baseSize: data.base_size,
      borderRadius: data.border_radius,
      sidebarBg: data.sidebar_bg,
      sidebarForeground: data.sidebar_foreground,
      sidebarAccent: data.sidebar_accent,
      sidebarBorder: data.sidebar_border,
      coloredSidebarIcons: data.colored_sidebar_icons,
      onboardingCompleted: data.onboarding_completed,
      hasCompletedTour: data.has_completed_tour,
      needsPassword: data.needs_password,
      isTrialUser: data.is_trial_user,
      emailConfirmed: data.email_confirmed,
      verificationSent: data.verification_sent,
      totalRequestsMade: data.total_requests_made,
      lastRequestAt: data.last_request_at,
      updatedAt: data.updated_at,
      defaultProjectId: data.default_project_id,
      systemRoleId: data.system_role_id,
      emailItId: data.email_it_id,
      schemaVersion: data.schema_version,
    };

    return validateData(profileSchema, mappedData, 'getProfile');
  } catch (err) {
    console.error('Error in getProfile:', err);
    return null;
  }
};

export const getProfiles = async (page: number, pageSize: number, projectId: string): Promise<Profile[]> => {
  try {
    const supabase = getSupabase();
    const start = page * pageSize;
    const end = start + pageSize - 1;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('default_project_id', projectId)
      .range(start, end);

    if (error) throw error;
    if (!data) return [];

    const mappedData = data.map((item: any) => ({
      id: item.id,
      fullName: item.full_name,
      email: item.email,
      avatarUrl: item.avatar_url,
      role: (typeof item.role === 'string') ? item.role.toLowerCase().replace('-', '') : 'user',
      language: item.language,
      phone: item.phone,
      timezone: item.timezone,
      currency: item.currency,
      businessName: item.business_name,
      subscriptionPlan: item.subscription_plan,
      provider: item.provider,
      themePreference: item.theme_preference,
      preferredTheme: item.preferred_theme,
      activeTheme: item.active_theme,
      fontFamily: item.font_family,
      uiStyle: item.ui_style,
      baseSize: item.base_size,
      borderRadius: item.border_radius,
      sidebarBg: item.sidebar_bg,
      sidebarForeground: item.sidebar_foreground,
      sidebarAccent: item.sidebar_accent,
      sidebarBorder: item.sidebar_border,
      coloredSidebarIcons: item.colored_sidebar_icons,
      onboardingCompleted: item.onboarding_completed,
      hasCompletedTour: item.has_completed_tour,
      needsPassword: item.needs_password,
      isTrialUser: item.is_trial_user,
      emailConfirmed: item.email_confirmed,
      verificationSent: item.verification_sent,
      totalRequestsMade: item.total_requests_made,
      lastRequestAt: item.last_request_at,
      updatedAt: item.updated_at,
      defaultProjectId: item.default_project_id,
      systemRoleId: item.system_role_id,
      emailItId: item.email_it_id,
      schemaVersion: item.schema_version,
    }));

    const validData = mappedData
      .map(item => validateData(profileSchema, item, 'getProfiles'))
      .filter((item): item is Profile => item !== null);

    return validData;
  } catch (err) {
    console.error('Error in getProfiles:', err);
    return [];
  }
};

export const getProjects = async (page: number, pageSize: number, projectId: string): Promise<Project[]> => {
  try {
    const supabase = getSupabase();
    const start = page * pageSize;
    const end = start + pageSize - 1;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .range(start, end);

    if (error) throw error;
    if (!data) return [];

    const mappedData = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      ownerId: item.owner_id,
      industry: item.industry,
      whatsapp: item.whatsapp,
      email: item.email,
      address: item.address,
      website: item.website,
      logoUrl: item.logo_url,
      projectIconUrl: item.project_icon_url,
      fontFamily: item.font_family,
      currency: item.currency,
      isMaster: item.is_master,
      brandColors: item.brand_colors,
      webConfig: item.web_config,
      socials: item.socials,
      integrations: item.integrations,
      imageMappings: item.image_mappings,
      schemaVersion: item.schema_version,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    const validData = mappedData
      .map(item => validateData(projectSchema, item, 'getProjects'))
      .filter((item): item is Project => item !== null);

    return validData;
  } catch (err) {
    console.error('Error in getProjects:', err);
    return [];
  }
};

export const getCustomers = async (page: number, pageSize: number, projectId: string): Promise<Customer[]> => {
  try {
    const supabase = getSupabase();
    const start = page * pageSize;
    const end = start + pageSize - 1;

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('project_id', projectId)
      .range(start, end);

    if (error) throw error;
    if (!data) return [];

    const mappedData = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      company: item.company,
      role: item.role,
      status: item.status,
      source: item.source,
      businessId: item.business_id,
      projectId: item.project_id,
      sourceAppId: item.source_app_id,
      visibility: item.visibility,
      notes: item.notes,
      companyLogoUrl: item.company_logo_url,
      profilePhotoUrl: item.profile_photo_url,
      imageUrl: item.image_url,
      schemaVersion: item.schema_version,
      appData: item.app_data,
      assignedBusinessIds: item.assigned_business_ids,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      lastActivity: item.last_activity,
    }));

    const validData = mappedData
      .map(item => validateData(customerSchema, item, 'getCustomers'))
      .filter((item): item is Customer => item !== null);

    return validData;
  } catch (err) {
    console.error('Error in getCustomers:', err);
    return [];
  }
};

export const getProducts = async (page: number, pageSize: number, projectId: string): Promise<Product[]> => {
  try {
    const supabase = getSupabase();
    const start = page * pageSize;
    const end = start + pageSize - 1;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('project_id', projectId)
      .range(start, end);

    if (error) throw error;
    if (!data) return [];

    const mappedData = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      unitCost: item.unit_cost,
      type: item.type,
      sku: item.sku,
      status: item.status,
      imageUrl: item.image_url,
      photoUrl: item.photo_url,
      businessId: item.business_id,
      projectId: item.project_id,
      schemaVersion: item.schema_version,
      appData: item.app_data,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    const validData = mappedData
      .map(item => validateData(productSchema, item, 'getProducts'))
      .filter((item): item is Product => item !== null);

    return validData;
  } catch (err) {
    console.error('Error in getProducts:', err);
    return [];
  }
};
