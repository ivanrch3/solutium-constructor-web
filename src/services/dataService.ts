import { getSupabase } from './supabaseClient';
import { Profile, Project, Customer, Product, Asset, WebBuilderSite, PublishedSite, RenderingContract, Page, PageSection, EngineEvolutionBuffer } from '../types/schema';
import { profileSchema, projectSchema, customerSchema, productSchema, webBuilderSiteSchema, publishedSiteSchema, assetSchema } from '../types/zodSchemas';
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

export const getProducts = async (page: number, pageSize: number, projectId: string): Promise<Product[]> => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      console.warn('Supabase client not initialized. Waiting for handshake.');
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
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data: userData } = await supabase.auth.getUser();

    const dbData: any = {
      project_id: site.projectId,
      app_id: site.appId || '11111111-1111-1111-1111-111111111111',
      user_id: site.userId || userData.user?.id,
      site_id: site.siteId,
      site_name: site.siteName || 'Mi Sitio Web',
      name: site.name || site.siteName || 'Mi Sitio Web',
      content_draft: site.contentDraft,
      status: site.status || 'draft',
      preview_image_url: site.previewImageUrl,
      preview_image_path: site.previewImagePath,
      preview_image_updated_at: site.previewImageUpdatedAt,
      preview_image_hash: site.previewImageHash,
      origin_app: 'Constructor Web',
      updated_at: new Date().toISOString()
    };

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
      previewImagePath: data.preview_image_path,
      previewImageUpdatedAt: data.preview_image_updated_at,
      previewImageHash: data.preview_image_hash,
    };

    return validateData(webBuilderSiteSchema, mapped, 'saveWebBuilderSiteDraft');
  } catch (err) {
    console.error('Error in saveWebBuilderSiteDraft:', err);
    return null;
  }
};

export const publishWebBuilderSite = async (site: Partial<PublishedSite>): Promise<PublishedSite | null> => {
  try {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data: userData } = await supabase.auth.getUser();
    const now = new Date().toISOString();

    // 1. Actualizar estado y contenido publicado en web_builder_sites
    const { data: siteRecord, error: upsertError } = await supabase
      .from('web_builder_sites')
      .upsert({
        project_id: site.projectId,
        app_id: site.appId || '11111111-1111-1111-1111-111111111111',
        site_id: site.siteId,
        site_name: site.siteName || 'Mi Sitio Web',
        content_published: site.content,
        status: 'published',
        preview_image_url: site.previewImageUrl,
        preview_image_path: site.previewImagePath,
        preview_image_updated_at: site.previewImageUpdatedAt,
        preview_image_hash: site.previewImageHash,
        origin_app: 'Constructor Web',
        updated_at: now
      }, { onConflict: 'site_id' })
      .select()
      .single();

    if (upsertError) throw upsertError;

    // 2. Registrar en published_sites (para el renderizador global)
    const dbData: any = {
      project_id: site.projectId,
      app_id: site.appId || '11111111-1111-1111-1111-111111111111',
      site_id: site.siteId,
      site_name: site.siteName || 'Mi Sitio Web',
      user_id: userData.user?.id,
      is_active: true,
      content: site.content,
      preview_image_url: site.previewImageUrl,
      preview_image_path: site.previewImagePath,
      preview_image_updated_at: site.previewImageUpdatedAt,
      preview_image_hash: site.previewImageHash,
      metadata: { 
        ...(site.metadata || {}), 
        site_id: site.siteId,
        origin_app: 'Constructor Web'
      },
      updated_at: now
    };

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
      previewImagePath: data.preview_image_path,
      previewImageUpdatedAt: data.preview_image_updated_at,
      previewImageHash: data.preview_image_hash,
    };

    return validateData(publishedSiteSchema, mapped, 'publishWebBuilderSite');
  } catch (err) {
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
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const now = new Date().toISOString();
    
    const payload = {
      ...pageData,
      user_id: userData.user.id,
      updated_at: now
    };

    // SIP v6.1: Resolved conflict target to project_id,slug as per DB constraint pages_project_id_slug_key
    const { data, error } = await supabase
      .from('pages')
      .upsert(payload, { onConflict: 'project_id,slug' })
      .select()
      .single();

    if (error) throw error;
    return data;
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
  } catch (error) {
    console.error('Error upserting page sections:', error);
    throw error;
  }
}

/**
 * Registra una solicitud de evolución en el buffer para parches del motor de renderizado.
 */
export async function logEvolutionRequest(feature: string, context: any): Promise<void> {
  try {
    const supabase = getSupabase();
    if (!supabase) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const payload: EngineEvolutionBuffer = {
      project_id: userData.user.id,
      feature_request: feature,
      metadata: context,
      status: 'pending'
    };

    const { error } = await supabase
      .from('engine_evolution_buffer')
      .insert(payload);

    if (error) throw error;
  } catch (error) {
    console.error('Error logging evolution request:', error);
  }
}
