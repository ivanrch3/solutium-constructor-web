import { getSupabase } from './supabaseClient';
import { Profile, Project, Customer, Product, Asset, WebBuilderSite, PublishedSite, RenderingContract, Page, PageSection, EngineEvolutionBuffer, TrustedCompanyLogo } from '../types/schema';
import { profileSchema, projectSchema, customerSchema, productSchema, webBuilderSiteSchema, publishedSiteSchema, assetSchema } from '../types/zodSchemas';
import { z } from 'zod';
import { getUploadAuthToken } from './authTokenProvider';
import { logDebug } from '../utils/debug';
import { requestFreshSupabaseConfig } from './handshakeService';
import { assertActiveSupabaseSession, resolveSupabaseUserIdentity, SupabaseSessionError } from './supabaseSessionService';

// Helper to handle validation and logging
const validateData = <T>(schema: z.ZodType<T>, data: unknown, context: string): T | null => {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`Zod Validation Error in ${context}:`, result.error.format());
    return null;
  }
  return result.data;
};

const isSupabaseAuthExpiredError = (error: any): boolean => {
  const message = String(error?.message || '').toLowerCase();
  const code = String(error?.code || '').toUpperCase();
  const status = Number(error?.status || error?.statusCode || 0);

  return (
    code === 'PGRST303' ||
    message.includes('jwt expired') ||
    message.includes('invalid jwt') ||
    message.includes('unauthorized') ||
    status === 401 ||
    status === 403
  );
};

const withSupabaseAuthRetry = async <T>(operation: () => Promise<T>, context: string): Promise<T> => {
  await assertActiveSupabaseSession();

  try {
    return await operation();
  } catch (error) {
    if (!isSupabaseAuthExpiredError(error)) {
      throw error;
    }

    logDebug(`[SIP AUTH RECOVERY] ${context} detected expired Supabase JWT. Requesting fresh config...`, {
      code: error?.code || null,
      message: error?.message || null,
      status: error?.status || error?.statusCode || null
    });

    try {
      await assertActiveSupabaseSession({ forceRefresh: true });
    } catch (sessionError) {
      if (sessionError instanceof SupabaseSessionError) {
        throw sessionError;
      }

      const refreshed = await requestFreshSupabaseConfig();
      if (!refreshed) {
        throw error;
      }
    }

    return await operation();
  }
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      console.warn('Supabase client not initialized. Waiting for handshake.');
      return null;
    }
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
      activeTheme: data.active_theme,
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

export const getProject = async (projectId: string): Promise<Project | null> => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      console.warn('Supabase client not initialized. Waiting for handshake.');
      return null;
    }
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) throw error;
    if (!data) return null;

    const mappedData = {
      id: data.id,
      name: data.name,
      ownerId: data.owner_id,
      industry: data.industry,
      whatsapp: data.whatsapp,
      email: data.email,
      address: data.address,
      website: data.website,
      logoUrl: data.logo_url,
      isoUrl: data.iso_url,
      projectIconUrl: data.project_icon_url,
      fontFamily: data.font_family,
      currency: data.currency,
      isMaster: data.is_master,
      brandColors: data.brand_colors,
      webConfig: data.web_config,
      socials: data.socials,
      integrations: data.integrations,
      imageMappings: data.image_mappings,
      schemaVersion: data.schema_version,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return validateData(projectSchema, mappedData, 'getProject') as Project | null;
  } catch (err) {
    console.error('Error in getProject:', err);
    return null;
  }
};

export const getProfiles = async (page: number, pageSize: number, projectId: string, currentUserId: string): Promise<Profile[]> => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      console.warn('Supabase client not initialized. Waiting for handshake.');
      return [];
    }
    const start = page * pageSize;
    const end = start + pageSize - 1;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`default_project_id.eq.${projectId},id.eq.${currentUserId}`)
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
      activeTheme: item.active_theme,
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
    if (!supabase) {
      console.warn('Supabase client not initialized. Waiting for handshake.');
      return [];
    }
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
      isoUrl: item.iso_url,
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
      .map(item => validateData(projectSchema, item, 'getProjects') as Project | null)
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
    if (!supabase) {
      console.warn('Supabase client not initialized. Waiting for handshake.');
      return [];
    }
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
      .map(item => validateData(customerSchema, item, 'getCustomers') as Customer | null)
      .filter((item): item is Customer => item !== null);

    return validData;
  } catch (err) {
    console.error('Error in getCustomers:', err);
    return [];
  }
};

const normalizeCompanyName = (value: any): string => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
};

export const normalizeTrustedCompanyLogos = (customers: Customer[]): TrustedCompanyLogo[] => {
  const deduped = new Map<string, { customer: Customer; updatedAt: number }>();

  customers.forEach((customer) => {
    const companyName = String(customer.company || '').trim();
    const logoUrl = String(customer.companyLogoUrl || '').trim();

    if (!companyName || !logoUrl) return;

    const normalizedName = normalizeCompanyName(companyName);
    const dedupeKey =
      (customer.businessId && String(customer.businessId).trim()) ||
      normalizedName ||
      String(customer.id);

    const updatedAt = customer.updatedAt ? new Date(customer.updatedAt).getTime() : 0;
    const existing = deduped.get(dedupeKey);

    if (!existing || updatedAt >= existing.updatedAt) {
      deduped.set(dedupeKey, { customer, updatedAt });
    }
  });

  return Array.from(deduped.values())
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map(({ customer }) => {
      const companyName = String(customer.company || customer.name || 'Empresa').trim();
      const anyCustomer = customer as any;
      const websiteUrl = anyCustomer.websiteUrl || anyCustomer.website || anyCustomer.web;

      return {
        company_id: String(customer.businessId || normalizeCompanyName(companyName) || customer.id),
        name: companyName,
        logo_url: String(customer.companyLogoUrl || '').trim(),
        ...(websiteUrl ? { website_url: String(websiteUrl).trim() } : {}),
        alt: `${companyName} logo`
      };
    });
};

export const getTrustedCompanyLogos = async (projectId: string): Promise<TrustedCompanyLogo[]> => {
  const customers = await getCustomers(0, 500, projectId);
  return normalizeTrustedCompanyLogos(customers);
};

export const getProducts = async (page: number, pageSize: number, projectId: string): Promise<Product[]> => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      // En modo publicado (sin handshake), fallamos silenciosamente ya que usamos el Snapshot del contrato (Opción A)
      return [];
    }
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
      price: item.price,
      priceReference: item.price_reference,
      category: item.category,
      sku: item.sku,
      status: item.status,
      imageUrl: item.image_url,
      image2Url: item.image2_url,
      stock: item.stock,
      ratingAverage: item.rating_average,
      reviewCount: item.review_count,
      badgeText: item.badge_text,
      businessId: item.business_id,
      projectId: item.project_id,
      schemaVersion: item.schema_version,
      appData: item.app_data,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    const validData = mappedData
      .map(item => validateData(productSchema, item, 'getProducts') as Product | null)
      .filter((item): item is Product => item !== null);

    return validData;
  } catch (err) {
    console.error('Error in getProducts:', err);
    return [];
  }
};

export const getAssets = async (projectId: string, type?: string): Promise<Asset[]> => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      console.warn('Supabase client not initialized. Waiting for handshake.');
      return [];
    }

    let query = supabase
      .from('assets')
      .select('*')
      .eq('project_id', projectId);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    const mappedData = data.map((item: any) => ({
      id: item.id,
      projectId: item.project_id,
      name: item.name,
      url: item.url,
      type: item.type,
      originApp: item.origin_app,
      metadata: item.metadata,
      size: item.size,
      updatedAt: item.updated_at,
    }));

    return mappedData
      .map(item => validateData(assetSchema, item, 'getAssets'))
      .filter((item): item is Asset => item !== null);
  } catch (err) {
    console.error('Error in getAssets:', err);
    return [];
  }
};

export const saveWebBuilderSiteDraft = async (site: Partial<WebBuilderSite>): Promise<WebBuilderSite | null> => {
  try {
    return await withSupabaseAuthRetry(async () => {
      const supabase = getSupabase();
      if (!supabase) return null;

      const resolvedUser = site.userId
        ? { userId: site.userId, source: 'payload' as const }
        : await resolveSupabaseUserIdentity();

      if (!resolvedUser.userId) {
        throw new SupabaseSessionError('missing_session', 'No hay una sesión válida para asociar el borrador al usuario actual.');
      }

      const dbData: any = {
        project_id: site.projectId,
        app_id: site.appId || '11111111-1111-1111-1111-111111111111',
        user_id: resolvedUser.userId,
        site_id: site.siteId,
        site_name: site.siteName || 'Mi Sitio Web',
        name: site.name || site.siteName || 'Mi Sitio Web',
        content_draft: site.contentDraft,
        status: site.status || 'draft',
        origin_app: 'Constructor Web',
        updated_at: new Date().toISOString()
      };

      if (site.previewImageUrl !== undefined || site.previewThumbnailUrl !== undefined || site.previewImagePath !== undefined || site.previewImageHash !== undefined) {
        console.log('[PREVIEW_OVERWRITE_AUDIT]', {
          source: 'constructor',
          table: 'web_builder_sites',
          operation: 'saveDraft',
          siteId: site.siteId,
          preview_image_url: site.previewImageUrl,
          preview_image_path: site.previewImagePath,
          preview_image_hash: site.previewImageHash
        });
      }

      if (site.previewImageUrl !== undefined) dbData.preview_image_url = site.previewImageUrl;
      if (site.previewThumbnailUrl !== undefined) dbData.preview_thumbnail_url = site.previewThumbnailUrl;
      if (site.previewImagePath !== undefined) dbData.preview_image_path = site.previewImagePath;
      if (site.previewImageUpdatedAt !== undefined) dbData.preview_image_updated_at = site.previewImageUpdatedAt;
      if (site.previewImageHash !== undefined) dbData.preview_image_hash = site.previewImageHash;

      if (site.id) dbData.id = site.id;

      const { data, error } = await supabase
        .from('web_builder_sites')
        .upsert(dbData, { onConflict: 'site_id' })
        .select()
        .single();

      if (error) throw error;
      
      const mapped = {
        id: data.id,
        projectId: data.project_id,
        appId: data.app_id,
        userId: data.user_id,
        siteId: data.site_id,
        siteName: data.site_name,
        name: data.name,
        contentDraft: data.content_draft,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        previewImageUrl: data.preview_image_url,
        previewThumbnailUrl: data.preview_thumbnail_url,
        previewImagePath: data.preview_image_path,
        previewImageUpdatedAt: data.preview_image_updated_at,
        previewImageHash: data.preview_image_hash,
      };

      return validateData(webBuilderSiteSchema, mapped, 'saveWebBuilderSiteDraft');
    }, 'saveWebBuilderSiteDraft');
  } catch (err) {
    if (err instanceof SupabaseSessionError) {
      throw err;
    }
    console.error('Error in saveWebBuilderSiteDraft:', err);
    return null;
  }
};

export const publishWebBuilderSite = async (site: Partial<PublishedSite>): Promise<PublishedSite | null> => {
  try {
    return await withSupabaseAuthRetry(async () => {
    const supabase = getSupabase();
    if (!supabase) return null;

    const resolvedUser = await resolveSupabaseUserIdentity();
    if (!resolvedUser.userId) {
      throw new SupabaseSessionError('missing_session', 'No hay una sesión válida para publicar este sitio.');
    }
    const now = new Date().toISOString();

    // 1. Actualizar estado y contenido publicado en web_builder_sites
    const builderUpdate: any = {
      project_id: site.projectId,
      app_id: site.appId || '11111111-1111-1111-1111-111111111111',
      site_id: site.siteId,
      site_name: site.siteName || 'Mi Sitio Web',
      content_published: site.content,
      status: 'published',
      origin_app: 'Constructor Web',
      updated_at: now
    };

    if (site.previewImageUrl !== undefined || site.previewThumbnailUrl !== undefined || site.previewImagePath !== undefined || site.previewImageHash !== undefined) {
      console.log('[PREVIEW_OVERWRITE_AUDIT]', {
        source: 'constructor',
        table: 'web_builder_sites',
        operation: 'publish',
        siteId: site.siteId,
        preview_image_url: site.previewImageUrl,
        preview_image_path: site.previewImagePath,
        preview_image_hash: site.previewImageHash
      });
    }

    if (site.previewImageUrl !== undefined) builderUpdate.preview_image_url = site.previewImageUrl;
    if (site.previewThumbnailUrl !== undefined) builderUpdate.preview_thumbnail_url = site.previewThumbnailUrl;
    if (site.previewImagePath !== undefined) builderUpdate.preview_image_path = site.previewImagePath;
    if (site.previewImageUpdatedAt !== undefined) builderUpdate.preview_image_updated_at = site.previewImageUpdatedAt;
    if (site.previewImageHash !== undefined) builderUpdate.preview_image_hash = site.previewImageHash;

    const { data: siteRecord, error: upsertError } = await supabase
      .from('web_builder_sites')
      .upsert(builderUpdate, { onConflict: 'site_id' })
      .select()
      .single();

    if (upsertError) throw upsertError;

    // 2. Registrar en published_sites (para el renderizador global)
    const dbData: any = {
      project_id: site.projectId,
      app_id: site.appId || '11111111-1111-1111-1111-111111111111',
      site_id: site.siteId,
      site_name: site.siteName || 'Mi Sitio Web',
      user_id: resolvedUser.userId,
      is_active: true,
      content: site.content,
      metadata: { 
        ...(site.metadata || {}), 
        site_id: site.siteId,
        origin_app: 'Constructor Web'
      },
      updated_at: now
    };

    if (site.previewImageUrl !== undefined) dbData.preview_image_url = site.previewImageUrl;
    if (site.previewThumbnailUrl !== undefined) dbData.preview_thumbnail_url = site.previewThumbnailUrl;
    if (site.previewImagePath !== undefined) dbData.preview_image_path = site.previewImagePath;
    if (site.previewImageUpdatedAt !== undefined) dbData.preview_image_updated_at = site.previewImageUpdatedAt;
    if (site.previewImageHash !== undefined) dbData.preview_image_hash = site.previewImageHash;

    if (site.id) dbData.id = site.id;

    // Output Validation: Verify that content is not empty
    if (!site.content || (typeof site.content === 'object' && Object.keys(site.content).length === 0)) {
      console.warn('[DataService] Intento de publicar sitio con contenido vacío. Operación cancelada.');
      return null;
    }

    const { data, error } = await supabase
      .from('published_sites')
      .upsert(dbData, { onConflict: 'project_id,app_id,site_id' })
      .select()
      .single();

    if (error) throw error;

    const mapped = {
      id: data.id,
      projectId: data.project_id,
      appId: data.app_id,
      siteId: data.site_id,
      siteName: data.site_name,
      isActive: data.is_active,
      content: data.content,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      previewImageUrl: data.preview_image_url,
      previewThumbnailUrl: data.preview_thumbnail_url,
      previewImagePath: data.preview_image_path,
      previewImageUpdatedAt: data.preview_image_updated_at,
      previewImageHash: data.preview_image_hash,
    };

    return validateData(publishedSiteSchema, mapped, 'publishWebBuilderSite');
    }, 'publishWebBuilderSite');
  } catch (err) {
    if (err instanceof SupabaseSessionError) {
      throw err;
    }
    console.error('Error in publishWebBuilderSite:', err);
    return null;
  }
};

export const getWebBuilderSites = async (projectId: string): Promise<WebBuilderSite[]> => {
  try {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('web_builder_sites')
      .select('*')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    const mappedData = data.map((item: any) => ({
      id: item.id,
      projectId: item.project_id,
      appId: item.app_id,
      userId: item.user_id,
      siteId: item.site_id,
      siteName: item.site_name,
      name: item.name,
      contentDraft: item.content_draft,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      previewImageUrl: item.preview_image_url,
      previewThumbnailUrl: item.preview_thumbnail_url,
      previewImagePath: item.preview_image_path,
      previewImageUpdatedAt: item.preview_image_updated_at,
      previewImageHash: item.preview_image_hash,
    }));

    return mappedData
      .map(item => validateData(webBuilderSiteSchema, item, 'getWebBuilderSites'))
      .filter((item): item is WebBuilderSite => item !== null);
  } catch (err) {
    console.error('Error in getWebBuilderSites:', err);
    return [];
  }
};

export const getPublishedSites = async (projectId: string): Promise<PublishedSite[]> => {
  try {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('published_sites')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    const mappedData = data.map((item: any) => ({
      id: item.id,
      projectId: item.project_id,
      appId: item.app_id,
      siteId: item.site_id,
      siteName: item.site_name,
      isActive: item.is_active,
      content: item.content,
      metadata: item.metadata,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      previewImageUrl: item.preview_image_url,
      previewThumbnailUrl: item.preview_thumbnail_url,
      previewImagePath: item.preview_image_path,
      previewImageUpdatedAt: item.preview_image_updated_at,
      previewImageHash: item.preview_image_hash,
    }));

    return mappedData
      .map(item => validateData(publishedSiteSchema, item, 'getPublishedSites'))
      .filter((item): item is PublishedSite => item !== null);
  } catch (err) {
    console.error('Error in getPublishedSites:', err);
    return [];
  }
};

export const renameWebBuilderSite = async (projectId: string, siteId: string, newName: string): Promise<boolean> => {
  try {
    const supabase = getSupabase();
    if (!supabase) return false;

    // Actualizar en web_builder_sites
    const { error: draftError } = await supabase
      .from('web_builder_sites')
      .update({ 
        site_name: newName,
        name: newName,
        updated_at: new Date().toISOString()
      })
      .eq('project_id', projectId)
      .eq('site_id', siteId);

    if (draftError) throw draftError;

    // Intentar actualizar en published_sites (si existe)
    await supabase
      .from('published_sites')
      .update({ 
        site_name: newName,
        updated_at: new Date().toISOString()
      })
      .eq('project_id', projectId)
      .eq('site_id', siteId);

    return true;
  } catch (err) {
    console.error('Error in renameWebBuilderSite:', err);
    return false;
  }
};

export const registerAsset = async (asset: Partial<Asset>): Promise<Asset | null> => {
  try {
    const supabase = getSupabase();
    if (!supabase) return null;

    const dbData = {
      project_id: asset.projectId,
      name: asset.name,
      url: asset.url,
      type: asset.type,
      origin_app: 'Constructor Web',
      metadata: asset.metadata,
      size: asset.size,
    };

    const { data, error } = await supabase
      .from('assets')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    const mapped = {
      id: data.id,
      projectId: data.project_id,
      name: data.name,
      url: data.url,
      type: data.type,
      originApp: data.origin_app,
      metadata: data.metadata,
      size: data.size,
      updatedAt: data.updated_at,
    };

    return validateData(assetSchema, mapped, 'registerAsset');
  } catch (err) {
    console.error('Error in registerAsset:', err);
    return null;
  }
};

/**
 * Realiza un upsert en la tabla pages para sincronizar el contenido con el motor de renderizado.
 */
export async function upsertPage(pageData: Partial<Page>): Promise<Page | null> {
  try {
    return await withSupabaseAuthRetry(async () => {
      const supabase = getSupabase();
      if (!supabase) return null;

      const resolvedUser = pageData.user_id
        ? { userId: pageData.user_id, source: 'payload' as const }
        : await resolveSupabaseUserIdentity();
      if (!resolvedUser.userId) {
        throw new SupabaseSessionError('missing_session', 'No hay una sesión válida para sincronizar la página.');
      }

      const now = new Date().toISOString();
      
      const payload = {
        ...pageData,
        user_id: resolvedUser.userId,
        updated_at: now
      };

      const { data, error } = await supabase
        .from('pages')
        .upsert(payload, { onConflict: 'web_builder_site_id,slug' })
        .select()
        .single();

      if (error) throw error;
      return data;
    }, 'upsertPage');
  } catch (error) {
    console.error('Error upserting page:', error);
    throw error;
  }
}

/**
 * Recupera una página por el ID del sitio o por proyecto/slug como respaldo (SIP v6.1).
 */
export async function getPageBySiteId(siteId: string, projectId?: string, slug: string = 'index'): Promise<Page | null> {
  try {
    const supabase = getSupabase();
    if (!supabase) return null;

    // First try by specific site ID
    let query = supabase
      .from('pages')
      .select('*')
      .eq('web_builder_site_id', siteId)
      .eq('slug', slug);

    let { data, error } = await query.maybeSingle();

    // If not found and we have a projectId, try the project default
    if (!data && projectId) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('pages')
        .select('*')
        .eq('project_id', projectId)
        .eq('slug', slug)
        .maybeSingle();
      
      if (!fallbackError) data = fallbackData;
    }

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      project_id: data.project_id,
      user_id: data.user_id,
      web_builder_site_id: data.web_builder_site_id,
      slug: data.slug,
      title: data.title,
      content: data.content,
      metadata: data.metadata,
      status: data.status,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error getting page:', error);
    return null;
  }
}

/**
 * Registra múltiples secciones de página (Serialización Atómica v1.5 + UUID Sync v2.0).
 */
export async function upsertPageSections(pageId: string, sections: Partial<PageSection>[]): Promise<PageSection[]> {
  try {
    return await withSupabaseAuthRetry(async () => {
      const supabase = getSupabase();
      if (!supabase) return [];

      const now = new Date().toISOString();
      const payload = sections.map((s, idx) => ({
        ...s,
        page_id: pageId,
        order_index: s.order_index ?? idx,
        updated_at: now
      }));

      // Use upsert to handle both new and existing records by ID
      // Note: We don't delete here to avoid losing UUIDs, but we might need a way to 
      // handle deleted sections from the UI. For now, we perform a clean sync.
      const { data, error } = await supabase
        .from('page_sections')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (error) throw error;
      return data || [];
    }, 'upsertPageSections');
  } catch (error) {
    console.error('Error upserting page sections:', error);
    throw error;
  }
}

/**
 * Registra una solicitud de evolución en el buffer para parches del motor de renderizado.
 * SIP v10.6: Envía la solicitud al backend (App Madre) en lugar de insertar directamente en Supabase.
 */
export async function logEvolutionRequest(feature: string, context: any): Promise<void> {
  try {
    const { token } = await getUploadAuthToken();
    if (!token) {
      console.warn('[EVOLUTION_LOG] No auth token available, skipping evolution log.');
      return;
    }

    // @ts-ignore
    const appMadreUrl = import.meta.env.VITE_APP_MADRE_API_URL;
    if (!appMadreUrl) {
      console.warn('[EVOLUTION_LOG] VITE_APP_MADRE_API_URL not configured');
      return;
    }

    const cleanUrl = appMadreUrl.endsWith('/') ? appMadreUrl.slice(0, -1) : appMadreUrl;
    const endpoint = `${cleanUrl}/api/previews/evolution`;

    // Intentamos recuperar IDs para el payload con prioridad: context -> globals -> window
    const project_id = context?.project_id || (window as any).PROJECT_ID || (window as any).currentProject?.id;
    const web_builder_site_id = context?.web_builder_site_id || (window as any).WEB_BUILDER_SITE_ID || (window as any).currentSite?.id || (window as any).webBuilderSite?.id;
    const site_id = context?.site_id || (window as any).SITE_ID || (window as any).currentSite?.site_id;

    console.log('[EVOLUTION_BACKEND_PAYLOAD_DEBUG]', { 
      project_id, 
      web_builder_site_id, 
      site_id,
      hasProjectId: Boolean(project_id),
      hasWebBuilderSiteId: Boolean(web_builder_site_id)
    });

    if (!project_id || !web_builder_site_id) {
      console.log('[EVOLUTION_BACKEND_SKIPPED] Missing IDs');
      return;
    }

    const payload = {
      project_id,
      web_builder_site_id,
      site_id,
      feature_request: feature,
      metadata: context,
      detected_changes: context?.detected_changes,
      generated_patch: context?.generated_patch,
      status: context?.status || 'pending'
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    logDebug('[EVOLUTION_LOGGING_SUCCESS]', { feature });
  } catch (error) {
    console.warn('Error logging evolution request to backend:', error);
    // No bloqueamos el flujo principal si el logging falla
  }
}

/**
 * Actualiza los metadatos de preview de un sitio en web_builder_sites y published_sites.
 */
export const updateSitePreview = async (
  siteId: string,
  previewData: {
    previewImageUrl: string;
    previewThumbnailUrl: string;
    previewImagePath?: string;
    previewImageHash?: string;
    previewImageUpdatedAt?: string;
  }
): Promise<boolean> => {
  try {
    const supabase = getSupabase();
    if (!supabase) return false;

    // [PREVIEW_OVERWRITE_AUDIT]
    console.log('[PREVIEW_OVERWRITE_AUDIT]', {
      source: 'constructor',
      table: 'web_builder_sites/published_sites',
      siteId,
      preview_image_url: previewData.previewImageUrl,
      preview_image_path: previewData.previewImagePath,
      preview_image_hash: previewData.previewImageHash,
      preview_image_updated_at: previewData.previewImageUpdatedAt
    });

    const now = new Date().toISOString();
    const updatePayload: any = {
      preview_image_url: previewData.previewImageUrl,
      preview_thumbnail_url: previewData.previewThumbnailUrl,
      preview_image_updated_at: previewData.previewImageUpdatedAt || now,
      updated_at: now
    };

    // Only include path and hash if they are provided (prevent overwrite with empty string)
    if (previewData.previewImagePath !== undefined) {
      updatePayload.preview_image_path = previewData.previewImagePath;
    }
    if (previewData.previewImageHash !== undefined) {
      updatePayload.preview_image_hash = previewData.previewImageHash;
    }

    // 1. Actualizar web_builder_sites
    const { error: webError } = await supabase
      .from('web_builder_sites')
      .update(updatePayload)
      .eq('site_id', siteId);

    if (webError) {
      console.warn('[DataService] Error actualizando preview en web_builder_sites:', webError);
    }

    // 2. Actualizar published_sites (puede no existir si nunca se publicó)
    const { error: pubError } = await supabase
      .from('published_sites')
      .update(updatePayload)
      .eq('site_id', siteId);

    if (pubError && pubError.code !== 'PGRST116') {
      console.warn('[DataService] Error actualizando preview en published_sites:', pubError);
    }
    
    return true;
  } catch (err) {
    console.error('Error in updateSitePreview:', err);
    return false;
  }
};

/**
 * Solicita la generación de un preview al servidor (App Madre) usando Playwright.
 */
export const generatePreviewServerSide = async (params: {
  project_id: string;
  site_id: string;
  web_builder_site_id: string;
  mode: 'thumbnail' | 'full';
}): Promise<{ 
  success: boolean; 
  skipped?: boolean;
  reason?: 'missing_region' | 'missing_storage_config' | 'preview_unavailable';
  preview_image_url?: string; 
  preview_thumbnail_url?: string;
  preview_image_path?: string;
  preview_image_hash?: string;
  preview_image_updated_at?: string;
  error?: string;
  errorCode?: 'preview_region_missing' | 'preview_missing_storage_config' | 'preview_request_failed';
}> => {
  const getPreviewDisableKey = (siteId: string) => `preview_generation_disabled_reason_${siteId}`;
  const readPreviewDisableReason = (siteId: string) => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(getPreviewDisableKey(siteId))
        || window.sessionStorage.getItem(getPreviewDisableKey(siteId));
    } catch {
      return null;
    }
  };

  let resolvedSiteId = params.site_id;

  try {
    const { token, source } = await getUploadAuthToken();
    
    // @ts-ignore
    const appMadreUrl = import.meta.env.VITE_APP_MADRE_API_URL;
    if (!appMadreUrl) throw new Error('VITE_APP_MADRE_API_URL not configured');

    const cleanUrl = appMadreUrl.endsWith('/') ? appMadreUrl.slice(0, -1) : appMadreUrl;
    const endpoint = `${cleanUrl}/api/previews/generate`;

    // SIP v10.6: Resolving IDs from window/globals if missing as requested
    const currentSite = (window as any).currentSite || {};
    const finalProjectId = params.project_id || (window as any).PROJECT_ID || (window as any).currentProject?.id;
    const finalSiteId = params.site_id || (window as any).SITE_ID || currentSite.site_id;
    const finalWebBuilderSiteId = params.web_builder_site_id || (window as any).WEB_BUILDER_SITE_ID || currentSite.id;
    resolvedSiteId = finalSiteId;

    const payload = {
      ...params,
      project_id: finalProjectId,
      site_id: finalSiteId,
      web_builder_site_id: finalWebBuilderSiteId
    };

    const previewDisableReason = finalSiteId ? readPreviewDisableReason(finalSiteId) : null;
    if (previewDisableReason === 'preview_region_missing' || previewDisableReason === 'preview_missing_storage_config') {
      logDebug('[SERVER_PREVIEW_CONFIG_WARNING]', {
        skipped: true,
        reason: previewDisableReason
      });
      return {
        success: false,
        skipped: true,
        reason: previewDisableReason === 'preview_missing_storage_config' ? 'missing_storage_config' : 'missing_region',
        error: previewDisableReason === 'preview_missing_storage_config'
          ? 'Preview generation skipped because backend storage configuration is missing.'
          : 'Preview generation skipped because backend storage region is missing.',
        errorCode: previewDisableReason === 'preview_missing_storage_config'
          ? 'preview_missing_storage_config'
          : 'preview_region_missing'
      };
    }

    // [SERVER_PREVIEW_REQUEST_DEBUG] - Audit requested by user
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    logDebug('[SERVER_PREVIEW_REQUEST_DEBUG]', {
      endpoint,
      method: 'POST',
      project_id: finalProjectId,
      site_id: finalSiteId,
      web_builder_site_id: finalWebBuilderSiteId,
      hasToken: Boolean(token),
      tokenPrefix: token ? token.slice(0, 12) : null,
      headersKeys: Object.keys(headers),
      authorizationHeaderPresent: Boolean(headers.Authorization || headers.authorization),
      contentType: headers['Content-Type'] || headers['content-type'],
      payloadKeys: Object.keys(payload)
    });

    if (!token) {
      console.warn('[SERVER_PREVIEW_REQUEST_DEBUG] Aborting: No auth token available for server-side preview generation');
      throw new Error('No auth token available for server-side preview generation');
    }

    // Perform the cross-origin request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    logDebug('[SERVER_PREVIEW_RESPONSE_DEBUG]', { status: response.status, data });

    if (!response.ok) {
      const isControlledSkip =
        (response.status === 409 || response.status === 422) &&
        (data?.skipped === true || typeof data?.reason === 'string');

      if (isControlledSkip) {
        const normalizedReason =
          data?.reason === 'missing_storage_config'
            ? 'missing_storage_config'
            : data?.reason === 'missing_region'
              ? 'missing_region'
              : 'preview_unavailable';

        if (typeof window !== 'undefined' && resolvedSiteId && normalizedReason !== 'preview_unavailable') {
          try {
            const key = getPreviewDisableKey(resolvedSiteId);
            const storedReason = normalizedReason === 'missing_storage_config'
              ? 'preview_missing_storage_config'
              : 'preview_region_missing';
            window.localStorage.setItem(key, storedReason);
            window.sessionStorage.setItem(key, storedReason);
          } catch {
            // ignore storage access issues
          }
        }

        return {
          success: false,
          skipped: true,
          reason: normalizedReason,
          error: data?.error || data?.message || 'Preview generation skipped by backend configuration.',
          errorCode: normalizedReason === 'missing_storage_config'
            ? 'preview_missing_storage_config'
            : normalizedReason === 'missing_region'
              ? 'preview_region_missing'
              : 'preview_request_failed'
        };
      }

      throw new Error(data.error || `Failed to generate server-side preview (HTTP ${response.status})`);
    }

    return { 
      success: true, 
      preview_image_url: data.preview_image_url,
      preview_thumbnail_url: data.preview_thumbnail_url || data.preview_image_url,
      preview_image_path: data.preview_image_path,
      preview_image_hash: data.preview_image_hash,
      preview_image_updated_at: data.preview_image_updated_at
    };
  } catch (error: any) {
    const message = String(error?.message || 'Unknown preview error');
    const isRegionMissing = /region is missing/i.test(message);
    const isMissingStorageConfig = /missing_storage_config|storage config/i.test(message);

    if (isRegionMissing) {
      console.warn('[SERVER_PREVIEW_CONFIG_WARNING] Preview generation skipped because backend storage region is missing.');
      if (typeof window !== 'undefined' && resolvedSiteId) {
        try {
          const key = getPreviewDisableKey(resolvedSiteId);
          window.localStorage.setItem(key, 'preview_region_missing');
          window.sessionStorage.setItem(key, 'preview_region_missing');
        } catch {
          // ignore storage access issues
        }
      }
    } else if (isMissingStorageConfig) {
      console.warn('[SERVER_PREVIEW_CONFIG_WARNING] Preview generation skipped because backend storage configuration is missing.');
      if (typeof window !== 'undefined' && resolvedSiteId) {
        try {
          const key = getPreviewDisableKey(resolvedSiteId);
          window.localStorage.setItem(key, 'preview_missing_storage_config');
          window.sessionStorage.setItem(key, 'preview_missing_storage_config');
        } catch {
          // ignore storage access issues
        }
      }
    } else {
      console.error('Error generating server-side preview:', error);
    }

    return {
      success: false,
      error: message,
      skipped: isRegionMissing || isMissingStorageConfig,
      reason: isRegionMissing ? 'missing_region' : isMissingStorageConfig ? 'missing_storage_config' : undefined,
      errorCode: isRegionMissing
        ? 'preview_region_missing'
        : isMissingStorageConfig
          ? 'preview_missing_storage_config'
          : 'preview_request_failed'
    };
  }
};
