import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sendToMother, startHandshake } from './services/handshakeService';
import { configService } from './services/configService';
import { getSupabase, getSupabaseConfig, initSupabase } from './services/supabaseClient';
import { captureAuthToken } from './services/authTokenProvider';
import { ensureActiveSupabaseSession } from './services/supabaseSessionService';
import { clearLaunchTokenFromUrl, consumeSecureLaunchSession, fetchConstructorContext, getAppMadreBaseUrl, getLaunchTokenFromUrl, getStoredLaunchAccessSession, getStoredSecureLaunchPayload, type SecureLaunchSessionPayload } from './services/secureLaunchSession';
import { getProfile, getProject, getWebBuilderSites, getPublishedSites } from './services/dataService';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { DataTab } from './components/DataTab';
import { Dashboard } from './components/Dashboard';
import { MethodSelection, CreationMethod } from './components/MethodSelection';
import { ProjectForm, ProjectFormData } from './components/ProjectForm';
import { WebConstructor } from './components/constructor/WebConstructor';
import { AIGenerationOverlay } from './components/constructor/AIGenerationOverlay';
import { useEditorStore } from './store/editorStore';
import { Viewer } from './components/Viewer';
import { logDebug } from './utils/debug';
import { Profile, Project, Asset, WebBuilderSite, PublishedSite, Product, Customer, TrustedCompanyLogo } from './types/schema';
import { getAssets } from './services/dataService';
import { BrandColorsInput, normalizeProjectBrandColors } from './utils/projectTheme';

type View = 'dashboard' | 'selection-method' | 'form' | 'generator' | 'constructor' | 'viewer';

const PREVENTIVE_SUPABASE_REFRESH_INTERVAL_MS = 10 * 60 * 1000;
const PREVENTIVE_SUPABASE_REFRESH_THROTTLE_MS = 30 * 1000;
const CONSTRUCTOR_LOGO_URL = 'https://nyc3.digitaloceanspaces.com/solutium-space/988cd339-a2c7-4951-b944-998d32dc349b-solutium-constructor-web-imagotipo.png';
const CONSTRUCTOR_TAB_CHANNEL = 'solutium_constructor_tabs';
const CONSTRUCTOR_ACTIVE_TAB_STORAGE_KEY = 'solutium_constructor_active_tab';
const CONSTRUCTOR_TAB_ID_STORAGE_KEY = 'solutium_constructor_tab_id';
const CONSTRUCTOR_TAB_ACTIVE_MS = 15_000;
const CONSTRUCTOR_TAB_STALE_MS = 30_000;
const CONSTRUCTOR_TAB_HEARTBEAT_MS = 4_000;
const CONSTRUCTOR_TAB_CLEANUP_INTERVAL_MS = 30_000;

const AbstractLoadingIndicator: React.FC<{ label?: string; compact?: boolean }> = ({ label = 'Preparando experiencia', compact = false }) => (
  <div className="flex flex-col items-center gap-4" role="status" aria-live="polite" aria-label={label}>
    <img
      src={CONSTRUCTOR_LOGO_URL}
      alt="Solutium Constructor Web"
      className={`${compact ? 'h-12 max-w-[180px]' : 'h-20 max-w-[260px]'} w-auto object-contain`}
      referrerPolicy="no-referrer"
    />
    <div
      className={`${compact ? 'h-5 w-5' : 'h-6 w-6'} animate-spin rounded-full border-2 border-slate-200 border-t-primary`}
      aria-hidden="true"
    />
    <span className="sr-only">{label}</span>
  </div>
);

const createConstructorTabId = () => (
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
);

const getOrCreateConstructorTabId = () => {
  try {
    const existing = window.sessionStorage.getItem(CONSTRUCTOR_TAB_ID_STORAGE_KEY);
    if (existing) return existing;

    const next = createConstructorTabId();
    window.sessionStorage.setItem(CONSTRUCTOR_TAB_ID_STORAGE_KEY, next);
    return next;
  } catch {
    return createConstructorTabId();
  }
};

const cleanupStaleConstructorActiveTab = (currentTabId?: string) => {
  try {
    const raw = window.localStorage.getItem(CONSTRUCTOR_ACTIVE_TAB_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const lastSeenAt = Number(parsed?.lastSeenAt || parsed?.updatedAt || 0);
    const isCurrentOwner = parsed?.tabId === currentTabId;
    const isStale = !lastSeenAt || Date.now() - lastSeenAt > CONSTRUCTOR_TAB_STALE_MS;

    if (!parsed?.tabId || (!isCurrentOwner && isStale)) {
      window.localStorage.removeItem(CONSTRUCTOR_ACTIVE_TAB_STORAGE_KEY);
      return true;
    }
  } catch {
    window.localStorage.removeItem(CONSTRUCTOR_ACTIVE_TAB_STORAGE_KEY);
    return true;
  }

  return false;
};

const decodeJwtPayload = (token?: string | null): any | null => {
  if (!token || token === 'placeholder-token') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
};

const getJwtExpirationMs = (token?: string | null): number | null => {
  const payload = decodeJwtPayload(token);
  return typeof payload?.exp === 'number' ? payload.exp * 1000 : null;
};

const readSafeHandshakeCache = (): any | null => {
  try {
    const raw = window.localStorage.getItem('solutium_handshake_cache');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const hasThemeColorValue = (value: any) => (
  Array.isArray(value)
    ? value.some((item) => typeof item === 'string' && item.trim() !== '')
    : value && typeof value === 'object' && [
    'primary',
    'primaryColor',
    'primary_color',
    'secondary',
    'secondaryColor',
    'secondary_color',
    'accent',
    'accentColor',
    'accent_color',
    'background',
    'backgroundColor',
    'background_color',
    'text',
    'textColor',
    'text_color',
    'muted',
    'mutedColor',
    'muted_color',
    'border',
    'borderColor',
    'border_color'
  ].some((key) => typeof value[key] === 'string' && value[key].trim() !== '')
);

const extractThemeBrandColors = (themeData: any): BrandColorsInput => {
  if (!themeData || typeof themeData !== 'object') return null;

  const candidates = [
    themeData.brandColors,
    themeData.brand_colors,
    themeData.projectColors,
    themeData.project_colors,
    themeData.palette,
    themeData.colors,
    themeData.theme?.brandColors,
    themeData.theme?.brand_colors,
    themeData.theme?.projectColors,
    themeData.theme?.project_colors,
    themeData.theme?.palette,
    themeData.theme?.colors,
    themeData.theme,
    themeData
  ];

  return candidates.find(hasThemeColorValue) || null;
};

const resolveLaunchThemeData = (payload: any) => {
  if (!payload || typeof payload !== 'object') return null;

  if (payload.uiTheme && typeof payload.uiTheme === 'object') return payload.uiTheme;

  return [
    payload.activeThemeData,
    payload.project?.activeThemeData,
    payload.projectTheme,
    payload.theme,
    payload.brandTheme,
    payload.projectThemeSeed,
    payload.themeSeed,
    payload.project?.projectTheme,
    payload.project?.theme,
    payload.project?.brandTheme,
    payload.project?.brandColors,
    payload.project?.brand_colors
  ].find((candidate) => candidate && typeof candidate === 'object') || null;
};

const normalizeProjectBrandingToProject = (
  projectBranding: any,
  projectId?: string | null
): Project | null => {
  if (!projectBranding || typeof projectBranding !== 'object') return null;

  const brandColors = Array.isArray(projectBranding.brandColors)
    ? projectBranding.brandColors
    : [
      projectBranding.primaryColor,
      projectBranding.secondaryColor,
      projectBranding.accentColor
    ].filter(Boolean);

  return {
    id: projectBranding.projectId || projectId || '',
    name: projectBranding.projectName || projectBranding.businessName || 'Proyecto Solutium',
    industry: projectBranding.industry || null,
    website: projectBranding.website || null,
    email: projectBranding.email || projectBranding.contactInfo?.email || projectBranding.contact?.email || null,
    phone: projectBranding.phone || projectBranding.contactInfo?.phone || projectBranding.contact?.phone || null,
    whatsapp: projectBranding.whatsapp || projectBranding.contactInfo?.whatsapp || projectBranding.contact?.whatsapp || null,
    address: projectBranding.address || projectBranding.contactInfo?.address || projectBranding.contact?.address || null,
    socials: projectBranding.socials || projectBranding.socialLinks || null,
    logoUrl: projectBranding.logoUrl || null,
    logoWhiteUrl: projectBranding.logoWhiteUrl || projectBranding.logo_white_url || null,
    projectIconUrl: projectBranding.projectIconUrl || projectBranding.project_icon_url || null,
    faviconUrl: projectBranding.faviconUrl || projectBranding.favicon_url || null,
    fontFamily: projectBranding.typography?.fontFamily || projectBranding.fontFamily || null,
    brandColors: normalizeProjectBrandColors(brandColors)
  } as Project;
};

const hasContactInfoInPayload = (payload: any) => Boolean(
  payload?.projectContact?.email ||
  payload?.projectContact?.phone ||
  payload?.projectContact?.whatsapp ||
  payload?.projectBranding?.email ||
  payload?.projectBranding?.phone ||
  payload?.projectBranding?.whatsapp ||
  payload?.projectBranding?.contactInfo ||
  payload?.projectBranding?.contact
);

const hasSocialLinksInPayload = (payload: any) => Boolean(
  payload?.projectContact?.socials ||
  payload?.projectContact?.socialLinks ||
  payload?.projectBranding?.socials ||
  payload?.projectBranding?.socialLinks ||
  payload?.projectBranding?.instagram ||
  payload?.projectBranding?.facebook
);

const getProjectBrandColorsFromContract = (projectBranding: any): BrandColorsInput => {
  if (!projectBranding || typeof projectBranding !== 'object') return null;
  if (Array.isArray(projectBranding.brandColors)) return projectBranding.brandColors;
  return {
    primary: projectBranding.primaryColor,
    secondary: projectBranding.secondaryColor,
    accent: projectBranding.accentColor
  };
};

const normalizeIncomingProject = (
  rawProject: any,
  launchThemeData?: any,
  projectBranding?: any
): Project | null => {
  if (!rawProject || typeof rawProject !== 'object') return null;

  const projectBrandColors = normalizeProjectBrandColors(rawProject.brandColors || rawProject.brand_colors);
  const contractBrandColors = getProjectBrandColorsFromContract(projectBranding);
  const launchThemeBrandColors = projectBranding ? contractBrandColors : extractThemeBrandColors(launchThemeData);

  return {
    ...rawProject,
    logoUrl: projectBranding?.logoUrl || rawProject.logoUrl || rawProject.logo_url || null,
    logoWhiteUrl: projectBranding?.logoWhiteUrl || projectBranding?.logo_white_url || rawProject.logoWhiteUrl || rawProject.logo_white_url || null,
    projectIconUrl: projectBranding?.projectIconUrl || projectBranding?.project_icon_url || rawProject.projectIconUrl || rawProject.project_icon_url || null,
    fontFamily: projectBranding?.typography?.fontFamily || rawProject.fontFamily || rawProject.font_family || null,
    brandColors: launchThemeBrandColors
      ? normalizeProjectBrandColors(launchThemeBrandColors, projectBrandColors)
      : projectBrandColors,
    webConfig: rawProject.webConfig || rawProject.web_config || null,
    imageMappings: rawProject.imageMappings || rawProject.image_mappings || null,
    schemaVersion: rawProject.schemaVersion || rawProject.schema_version || null,
    createdAt: rawProject.createdAt || rawProject.created_at || null,
    updatedAt: rawProject.updatedAt || rawProject.updated_at || null
  } as Project;
};

const normalizeSecureProduct = (rawProduct: any): Product | null => {
  if (!rawProduct || typeof rawProduct !== 'object') return null;
  const id = rawProduct.id || rawProduct.productId || rawProduct.product_id || rawProduct.uuid;
  const name = rawProduct.name || rawProduct.title || rawProduct.productName || rawProduct.product_name;
  if (!id || !name) return null;

  const imageUrl = rawProduct.imageUrl || rawProduct.image_url || rawProduct.thumbnailUrl || rawProduct.thumbnail_url || rawProduct.image;
  const priceValue = rawProduct.price ?? rawProduct.priceReference ?? rawProduct.price_reference;
  const parsedPrice = Number(priceValue);

  return {
    ...rawProduct,
    id: String(id),
    name: String(name),
    title: rawProduct.title || String(name),
    description: rawProduct.description || rawProduct.summary || '',
    category: rawProduct.category || rawProduct.type || '',
    price: Number.isFinite(parsedPrice) ? parsedPrice : undefined,
    type: rawProduct.type || rawProduct.category || undefined,
    status: rawProduct.status || (rawProduct.active === false ? 'inactive' : 'active'),
    active: rawProduct.active !== false,
    imageUrl: imageUrl || '',
    image_url: imageUrl || '',
    badgeText: rawProduct.badgeText || rawProduct.badge_text || '',
    ratingAverage: Number(rawProduct.ratingAverage ?? rawProduct.rating_average) || undefined,
    emoji: rawProduct.emoji || '',
    updatedAt: rawProduct.updatedAt || rawProduct.updated_at || null
  } as Product;
};

const normalizeSecureProducts = (...sources: any[][]) => {
  const deduped = new Map<string, Product>();
  sources.flat().forEach((rawProduct) => {
    const product = normalizeSecureProduct(rawProduct);
    if (product) deduped.set(String(product.id), product);
  });
  return Array.from(deduped.values());
};

const normalizeSecureCustomerLogo = (rawLogo: any): Customer | null => {
  if (!rawLogo || typeof rawLogo !== 'object') return null;
  const id = rawLogo.id || rawLogo.customerId || rawLogo.customer_id || rawLogo.company_id || rawLogo.businessId || rawLogo.business_id;
  const companyName = rawLogo.companyName || rawLogo.company_name || rawLogo.company || rawLogo.name;
  const logoUrl = rawLogo.logoUrl || rawLogo.logo_url || rawLogo.companyLogoUrl || rawLogo.company_logo_url;
  if (!id || !companyName || !logoUrl) return null;

  return {
    ...rawLogo,
    id: String(id),
    name: String(rawLogo.name || companyName),
    company: String(companyName),
    companyName: String(companyName),
    companyLogoUrl: String(logoUrl),
    logoUrl: String(logoUrl),
    logo_url: String(logoUrl),
    status: rawLogo.status || (rawLogo.active === false ? 'inactive' : 'active'),
    active: rawLogo.active !== false,
    updatedAt: rawLogo.updatedAt || rawLogo.updated_at || null
  } as Customer;
};

const normalizeSecureTrustedLogo = (rawLogo: any): TrustedCompanyLogo | null => {
  if (!rawLogo || typeof rawLogo !== 'object') return null;
  const companyId = rawLogo.company_id || rawLogo.companyId || rawLogo.id || rawLogo.businessId || rawLogo.business_id;
  const name = rawLogo.name || rawLogo.companyName || rawLogo.company_name || rawLogo.company;
  const logoUrl = rawLogo.logo_url || rawLogo.logoUrl || rawLogo.companyLogoUrl || rawLogo.company_logo_url;
  if (!companyId || !name || !logoUrl) return null;

  return {
    ...rawLogo,
    company_id: String(companyId),
    id: String(rawLogo.id || companyId),
    name: String(name),
    companyName: String(name),
    logo_url: String(logoUrl),
    logoUrl: String(logoUrl),
    status: rawLogo.status || (rawLogo.active === false ? 'inactive' : 'active'),
    active: rawLogo.active !== false,
    updatedAt: rawLogo.updatedAt || rawLogo.updated_at || null,
    website_url: rawLogo.website_url || rawLogo.websiteUrl || rawLogo.website || undefined,
    alt: rawLogo.alt || `${name} logo`
  } as TrustedCompanyLogo;
};

const normalizeSecureLogoSources = (...sources: any[][]) => {
  const customers = new Map<string, Customer>();
  const trustedLogos = new Map<string, TrustedCompanyLogo>();

  sources.flat().forEach((rawLogo) => {
    const customer = normalizeSecureCustomerLogo(rawLogo);
    if (customer) customers.set(String(customer.id), customer);

    const trustedLogo = normalizeSecureTrustedLogo(rawLogo);
    if (trustedLogo) trustedLogos.set(String(trustedLogo.company_id), trustedLogo);
  });

  return {
    customers: Array.from(customers.values()),
    trustedLogos: Array.from(trustedLogos.values())
  };
};

const summarizeLaunchPayload = (payload: any) => ({
  hasProjectId: Boolean(payload?.projectId || payload?.project_id || payload?.satellite_id || payload?.projectContext?.projectId || payload?.launcher?.projectId || payload?.launcher?.satelliteId || payload?.projectBranding?.projectId),
  hasSiteId: Boolean(payload?.site_id || payload?.asset_id || payload?.launcher?.siteId),
  hasUiTheme: Boolean(payload?.uiTheme),
  hasProjectBranding: Boolean(payload?.projectBranding),
  hasLegacySessionToken: Boolean(payload?.session_token),
  hasLegacyStorageKeys: Boolean(payload?.storage_secret_key || payload?.storage_access_key)
});

const getLaunchContractVersion = (payload: SecureLaunchSessionPayload | null | undefined) =>
  payload?.contractVersion || payload?.launcher?.contractVersion || null;

const getSecureLaunchProjectId = (payload: SecureLaunchSessionPayload | null | undefined) => (
  payload?.projectContext?.projectId ||
  payload?.launcher?.projectId ||
  payload?.launcher?.satelliteId ||
  payload?.projectBranding?.projectId ||
  null
);

const getSecureLaunchUserId = (payload: SecureLaunchSessionPayload | null | undefined) => (
  payload?.projectContext?.userId ||
  payload?.projectContext?.profileId ||
  payload?.launcher?.userId ||
  payload?.launcher?.profileId ||
  null
);

const getReadableSessionValue = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const normalized = value.trim();
    if (!normalized) continue;
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)) {
      continue;
    }
    return normalized;
  }
  return null;
};

const getSecureLaunchSessionLabel = (payload: SecureLaunchSessionPayload | null | undefined) => (
  getReadableSessionValue(
    payload?.projectContext?.userEmail,
    payload?.launcher?.userEmail,
    payload?.projectContext?.email,
    payload?.launcher?.email,
    payload?.projectContext?.userName,
    payload?.launcher?.userName,
    payload?.projectContext?.displayName,
    payload?.launcher?.displayName,
    payload?.projectContext?.fullName,
    payload?.launcher?.fullName
  ) || 'Usuario activo'
);

const normalizeSecureLaunchPayloadForHandshake = (payload: SecureLaunchSessionPayload) => {
  const params = new URLSearchParams(window.location.search);
  const projectId = getSecureLaunchProjectId(payload);
  const userId = getSecureLaunchUserId(payload);
  const appId = payload.launcher?.appId || params.get('app_id') || '11111111-1111-1111-1111-111111111111';
  const siteId = payload.launcher?.siteId || params.get('site_id') || params.get('asset_id') || null;
  const mode = payload.launcher?.mode || params.get('mode') || params.get('editor_mode') || null;
  const projectFromBranding = normalizeProjectBrandingToProject(payload.projectBranding, projectId);

  return {
    type: 'SOLUTIUM_SECURE_LAUNCH',
    projectId,
    project_id: projectId,
    satellite_id: projectId,
    userId,
    user_id: userId,
    profileId: userId,
    profile_id: userId,
    appId,
    app_id: appId,
    site_id: siteId,
    asset_id: params.get('asset_id') || siteId,
    siteName: params.get('site_name') || undefined,
    mode,
    editor_mode: params.get('editor_mode') || mode,
    site_status: params.get('site_status') || undefined,
    source: params.get('source') || 'secure_launch',
    launch_contract: getLaunchContractVersion(payload) || params.get('launch_contract') || 'app-launch-v1',
    launcher: payload.launcher || null,
    projectContext: payload.projectContext || null,
    uiTheme: payload.uiTheme || null,
    projectBranding: payload.projectBranding || null,
    project: projectFromBranding,
    publicRenderContext: (payload as any).publicRenderContext || null,
    projectContact: payload.projectContact || (payload as any).projectContact || null
  };
};
const normalizeDraftLifecycleStatus = (
  rawStatus: unknown,
  publishedUpdatedAt?: string | null,
  draftUpdatedAt?: string | null
): 'draft' | 'published' | 'modified' => {
  const normalized = String(rawStatus || '').trim().toLowerCase();

  if (publishedUpdatedAt) {
    const publishedTime = new Date(publishedUpdatedAt).getTime();
    const draftTime = new Date(draftUpdatedAt || 0).getTime();
    if (normalized === 'modified') return 'modified';
    if (Number.isFinite(draftTime) && Number.isFinite(publishedTime)) {
      return draftTime > publishedTime + 1000 ? 'modified' : 'published';
    }
    return 'published';
  }

  if (normalized === 'published' || normalized === 'modified' || normalized === 'unpublished') {
    return 'draft';
  }

  return 'draft';
};

const resolvePublishedLifecycleTimestamp = (site?: PublishedSite | WebBuilderSite | null): string | null => {
  const metadata = (site as any)?.metadata || {};
  return (
    (site as any)?.updatedAt ||
    metadata.last_published_at ||
    metadata.lastPublishedAt ||
    metadata.published_at ||
    metadata.publishedAt ||
    (site as any)?.createdAt ||
    null
  );
};

const mergePagesByCurrentLifecycle = (
  drafts: WebBuilderSite[],
  published: PublishedSite[]
): (WebBuilderSite | PublishedSite)[] => {
  const sitesMap = new Map<string, WebBuilderSite | PublishedSite>();

  published.forEach((site) => {
    if (site.siteId) {
      sitesMap.set(site.siteId, { ...site, status: 'published' as const });
    }
  });

  drafts.forEach((site) => {
    if (!site.siteId) return;

    const existingPublished = sitesMap.get(site.siteId);
    const status = normalizeDraftLifecycleStatus(
      site.status,
      resolvePublishedLifecycleTimestamp(existingPublished),
      site.updatedAt || null
    );
    sitesMap.set(site.siteId, {
      ...existingPublished,
      ...site,
      status
    } as WebBuilderSite | PublishedSite);
  });

  return Array.from(sitesMap.values()).sort((a, b) => {
    const dateA = new Date(a.updatedAt || 0).getTime();
    const dateB = new Date(b.updatedAt || 0).getTime();
    return dateB - dateA;
  });
};

const getLaunchSiteContext = () => {
  const params = new URLSearchParams(window.location.search);
  const launchSiteId = params.get('site_id') || params.get('asset_id') || null;
  const rawLaunchStatus = params.get('site_status');
  const launchSiteStatus =
    rawLaunchStatus && ['draft', 'published', 'modified', 'unpublished'].includes(rawLaunchStatus.toLowerCase())
      ? rawLaunchStatus.toLowerCase()
      : null;

  return {
    launchSiteId,
    launchSiteStatus
  };
};

const getMotherApiBaseUrl = () => {
  const envUrl =
    import.meta.env.VITE_APP_MADRE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'https://solutium.app';

  return String(envUrl).replace(/\/$/, '');
};

const fetchPublishedSiteById = async (siteId: string) => {
  const configuredBaseUrl = getMotherApiBaseUrl();
  const productionBaseUrl = 'https://solutium.app';
  const isProductionConstructor =
    typeof window !== 'undefined' && window.location.hostname === 'constructor.solutium.app';
  const baseUrls = isProductionConstructor
    ? Array.from(new Set([productionBaseUrl, configuredBaseUrl]))
    : Array.from(new Set([configuredBaseUrl, productionBaseUrl]));

  let lastError: unknown = null;

  for (const baseUrl of baseUrls) {
    try {
      const response = await fetch(`${baseUrl}/api/published-site-by-id/${encodeURIComponent(siteId)}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      return payload?.data || payload?.site || payload;
    } catch (error) {
      lastError = error;
      logDebug('[PUBLISHED_RENDER_FETCH_FALLBACK]', {
        baseUrl,
        siteId,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Published site fetch failed');
};

const AppContent: React.FC = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const isPublicRenderMode =
    queryParams.get('mode') === 'render' ||
    queryParams.get('external_render') === 'true' ||
    queryParams.get('published') === 'true';
  const [isHandshakeComplete, setIsHandshakeComplete] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [pages, setPages] = useState<(WebBuilderSite | PublishedSite)[]>([]);
  const [secureCatalogProducts, setSecureCatalogProducts] = useState<Product[]>([]);
  const [secureCatalogCustomers, setSecureCatalogCustomers] = useState<Customer[]>([]);
  const [secureTrustedLogos, setSecureTrustedLogos] = useState<TrustedCompanyLogo[]>([]);
  const [hasSecureConstructorCatalogContext, setHasSecureConstructorCatalogContext] = useState(false);
  const [pagesLoadError, setPagesLoadError] = useState<string | null>(null);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedMethod, setSelectedMethod] = useState<CreationMethod | null>(null);
  const [formData, setFormData] = useState<ProjectFormData | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedPage, setSelectedPage] = useState<WebBuilderSite | PublishedSite | null>(null);
  const [urlLogo, setUrlLogo] = useState<string | null>(null);
  const [urlLogoWhite, setUrlLogoWhite] = useState<string | null>(null);
  const loadingMessages = React.useMemo(() => ([
    'Estableciendo handshake seguro...',
    'Inicializando sesión de Supabase...',
    'Sincronizando contexto del proyecto...',
    'Aplicando identidad visual...',
    'Preparando módulos del constructor...'
  ]), []);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const { applyTheme } = useTheme();
  const [secureLaunchError, setSecureLaunchError] = useState<string | null>(null);
  const sessionRefreshInFlightRef = useRef(false);
  const lastSessionRefreshAtRef = useRef(0);
  const handshakeStartedRef = useRef(false);
  const launchStartedAtRef = useRef(new Date());
  const secureLaunchPayloadRef = useRef<SecureLaunchSessionPayload | null>(null);
  const constructorTabIdRef = useRef(getOrCreateConstructorTabId());
  const [constructorTabConflict, setConstructorTabConflict] = useState<{ tabId: string; updatedAt: number } | null>(null);
  const [constructorTabReplaced, setConstructorTabReplaced] = useState(false);
  const [constructorTabCancelled, setConstructorTabCancelled] = useState(false);
  const constructorTabConflictRef = useRef<{ tabId: string; updatedAt: number } | null>(null);
  const constructorTabReplacedRef = useRef(false);
  const constructorTabCancelledRef = useRef(false);

  const welcomeSessionInfo = React.useMemo(() => {
    const safeCache = readSafeHandshakeCache();
    const currentParams = new URLSearchParams(window.location.search);
    const sessionToken =
      currentParams.get('session_token') ||
      window.sessionStorage.getItem('solutium_supabase_access_token') ||
      safeCache?.session_token ||
      safeCache?.sessionToken ||
      safeCache?.supabaseAccessToken ||
      safeCache?.accessToken ||
      null;
    const expiresAt = getJwtExpirationMs(sessionToken);
    const hasLegacySession = Boolean(sessionToken) && sessionToken !== 'placeholder-token' && (!expiresAt || expiresAt > Date.now());
    const secureLaunchPayload = secureLaunchPayloadRef.current;
    const hasSecureLaunchSession = Boolean(getSecureLaunchProjectId(secureLaunchPayload));
    const hasRealSession = hasLegacySession || hasSecureLaunchSession;
    const userLabel =
      profile?.email ||
      (profile as any)?.name ||
      (profile as any)?.fullName ||
      (profile as any)?.displayName ||
      safeCache?.profile?.email ||
      safeCache?.profile?.name ||
      safeCache?.profile?.fullName ||
      safeCache?.profile?.displayName ||
      safeCache?.user?.email ||
      safeCache?.user?.name ||
      safeCache?.user?.fullName ||
      safeCache?.user?.displayName ||
      (secureLaunchPayload ? getSecureLaunchSessionLabel(secureLaunchPayload) : 'Usuario activo');
    const projectLabel =
      project?.name ||
      (project as any)?.businessName ||
      safeCache?.project?.name ||
      safeCache?.project?.businessName ||
      safeCache?.siteName ||
      projectId ||
      'proyecto activo';

    return {
      hasRealSession,
      userLabel,
      projectLabel,
      startedAt: launchStartedAtRef.current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      canRequestMotherContext: Boolean(window.opener || (window.parent && window.parent !== window))
    };
  }, [profile, project, projectId]);

  // --- PERSISTENCE PROTOCOL v1.0 ---
  const saveSession = () => {
    try {
      const session = {
        projectId,
        appId,
        currentView,
        selectedPage,
        activeTab
      };
      localStorage.setItem('solutium_session_v2', JSON.stringify(session));
    } catch (e) {
      console.warn('[SESSION] Error saving session:', e);
    }
  };

  // [DEBUG_FLAGS_RESOLUTION_DEBUG] (FASE 2)
  const debugParam = queryParams.get('debug');
  const debugRenderParam = queryParams.get('debug_render');
  const debugProductsParam = queryParams.get('debug_products');
  
  const debugEnabled = debugParam === 'true' || debugRenderParam === 'true' || debugParam === 'products';
  const productsDebugEnabled = debugEnabled || debugParam === 'products' || debugProductsParam === 'true';

  useEffect(() => {
    if (debugEnabled) {
      logDebug('[DEBUG_FLAGS_RESOLUTION_DEBUG]', {
        debugParam,
        debugRenderParam,
        debugProductsParam,
        debugEnabled,
        productsDebugEnabled,
        search: window.location.search
      });
    }
  }, [debugEnabled, productsDebugEnabled]);

  useEffect(() => {
    if (isHandshakeComplete) return;

    const interval = window.setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1400);

    return () => window.clearInterval(interval);
  }, [isHandshakeComplete, loadingMessages]);

  useEffect(() => {
    constructorTabConflictRef.current = constructorTabConflict;
  }, [constructorTabConflict]);

  useEffect(() => {
    constructorTabReplacedRef.current = constructorTabReplaced;
  }, [constructorTabReplaced]);

  useEffect(() => {
    constructorTabCancelledRef.current = constructorTabCancelled;
  }, [constructorTabCancelled]);

  useEffect(() => {
    if (!isHandshakeComplete || isPublicRenderMode || !projectId) return;

    const tabId = constructorTabIdRef.current;
    const channel = typeof BroadcastChannel !== 'undefined'
      ? new BroadcastChannel(CONSTRUCTOR_TAB_CHANNEL)
      : null;
    let conflictConfirmedByBroadcast = false;
    let probeTimer: number | null = null;

    cleanupStaleConstructorActiveTab(tabId);

    const readActiveTab = () => {
      try {
        const raw = window.localStorage.getItem(CONSTRUCTOR_ACTIVE_TAB_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { tabId?: string; lastSeenAt?: number; updatedAt?: number };
        const updatedAt = Number(parsed.lastSeenAt || parsed.updatedAt || 0);
        if (!parsed.tabId || parsed.tabId === tabId) return null;
        if (!updatedAt || Date.now() - updatedAt > CONSTRUCTOR_TAB_ACTIVE_MS) {
          window.localStorage.removeItem(CONSTRUCTOR_ACTIVE_TAB_STORAGE_KEY);
          return null;
        }
        return { tabId: parsed.tabId, updatedAt };
      } catch {
        return null;
      }
    };

    const writeHeartbeat = () => {
      if (constructorTabConflictRef.current || constructorTabReplacedRef.current || constructorTabCancelledRef.current) return;

      try {
        const raw = window.localStorage.getItem(CONSTRUCTOR_ACTIVE_TAB_STORAGE_KEY);
        const previous = raw ? JSON.parse(raw) : null;
        const now = Date.now();
        const page = selectedPage as any;

        window.localStorage.setItem(CONSTRUCTOR_ACTIVE_TAB_STORAGE_KEY, JSON.stringify({
          tabId,
          projectId: projectId || null,
          siteId: page?.siteId || page?.site_id || null,
          pageId: page?.id || page?.pageId || page?.page_id || null,
          createdAt: Number(previous?.createdAt || now),
          lastSeenAt: now,
          updatedAt: now,
          title: page?.siteName || page?.site_name || page?.name || 'Constructor Solutium'
        }));
      } catch (error) {
        console.warn('[CONSTRUCTOR_TAB] Unable to write root heartbeat:', error);
      }
    };

    const handleMessage = (event: MessageEvent) => {
      const message = event.data || {};
      if (message.tabId === tabId) return;

      if (message.type === 'tab-probe') {
        if (message.targetTabId && message.targetTabId !== tabId) return;
        channel?.postMessage({
          type: 'tab-alive',
          tabId,
          targetTabId: message.tabId,
          updatedAt: Date.now()
        });
        return;
      }

      if (message.type === 'tab-alive') {
        if (message.targetTabId !== tabId) return;
        conflictConfirmedByBroadcast = true;
        setConstructorTabConflict({
          tabId: message.tabId,
          updatedAt: Number(message.updatedAt || Date.now())
        });
        return;
      }

      if (message.type === 'tab-replaced') {
        if (message.replacedTabId && message.replacedTabId !== tabId) return;
        setConstructorTabConflict(null);
        setConstructorTabReplaced(true);
        return;
      }

    };

    channel?.addEventListener('message', handleMessage);

    const activeTab = readActiveTab();
    if (activeTab) {
      if (channel) {
        channel.postMessage({
          type: 'tab-probe',
          tabId,
          targetTabId: activeTab.tabId,
          updatedAt: Date.now()
        });
        probeTimer = window.setTimeout(() => {
          if (conflictConfirmedByBroadcast || constructorTabConflictRef.current || constructorTabReplacedRef.current) return;
          try {
            const raw = window.localStorage.getItem(CONSTRUCTOR_ACTIVE_TAB_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : null;
            if (parsed?.tabId === activeTab.tabId) {
              window.localStorage.removeItem(CONSTRUCTOR_ACTIVE_TAB_STORAGE_KEY);
            }
          } catch {
            // Best-effort stale cleanup.
          }
          writeHeartbeat();
        }, 900);
      } else {
        setConstructorTabConflict(activeTab);
      }
    } else {
      writeHeartbeat();
    }

    const heartbeatId = window.setInterval(writeHeartbeat, CONSTRUCTOR_TAB_HEARTBEAT_MS);
    const cleanupId = window.setInterval(() => cleanupStaleConstructorActiveTab(tabId), CONSTRUCTOR_TAB_CLEANUP_INTERVAL_MS);

    const removeCurrentTabIfOwner = () => {
      try {
        const raw = window.localStorage.getItem(CONSTRUCTOR_ACTIVE_TAB_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed?.tabId === tabId) {
          window.localStorage.removeItem(CONSTRUCTOR_ACTIVE_TAB_STORAGE_KEY);
        }
      } catch {
        // Best-effort cleanup.
      }
    };

    const handlePageExit = () => {
      channel?.postMessage({ type: 'tab-closing', tabId });
      removeCurrentTabIfOwner();
    };

    const handleVisibilityChange = () => {
      cleanupStaleConstructorActiveTab(tabId);
    };

    window.addEventListener('pagehide', handlePageExit);
    window.addEventListener('beforeunload', handlePageExit);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(heartbeatId);
      window.clearInterval(cleanupId);
      if (probeTimer) window.clearTimeout(probeTimer);
      window.removeEventListener('pagehide', handlePageExit);
      window.removeEventListener('beforeunload', handlePageExit);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      channel?.removeEventListener('message', handleMessage);
      channel?.close();
      removeCurrentTabIfOwner();
    };
  }, [currentView, isHandshakeComplete, isPublicRenderMode, projectId, selectedPage]);

  useEffect(() => {
    if (!isHandshakeComplete || isPublicRenderMode) return;

    let isMounted = true;

    const refreshSupabaseSessionSilently = async (
      reason: 'startup' | 'focus' | 'visibility' | 'interval'
    ) => {
      if (!isMounted || sessionRefreshInFlightRef.current) return;

      const now = Date.now();
      if (
        reason !== 'startup' &&
        now - lastSessionRefreshAtRef.current < PREVENTIVE_SUPABASE_REFRESH_THROTTLE_MS
      ) {
        return;
      }

      sessionRefreshInFlightRef.current = true;

      try {
        const result = await ensureActiveSupabaseSession();
        lastSessionRefreshAtRef.current = Date.now();

        if (result.state === 'refreshed') {
          logDebug('[SUPABASE_PREVENTIVE_REFRESH]', {
            reason,
            state: result.state,
            source: result.source
          });
        } else if (result.state !== 'active') {
          logDebug('[SUPABASE_PREVENTIVE_REFRESH_WARNING]', {
            reason,
            state: result.state,
            source: result.source,
            message: result.message
          });
        }
      } catch (error: any) {
        logDebug('[SUPABASE_PREVENTIVE_REFRESH_ERROR]', {
          reason,
          message: error?.message || 'Unknown preventive refresh error'
        });
      } finally {
        sessionRefreshInFlightRef.current = false;
      }
    };

    void refreshSupabaseSessionSilently('startup');

    const handleWindowFocus = () => {
      void refreshSupabaseSessionSilently('focus');
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshSupabaseSessionSilently('visibility');
      }
    };

    const intervalId = window.setInterval(() => {
      void refreshSupabaseSessionSilently('interval');
    }, PREVENTIVE_SUPABASE_REFRESH_INTERVAL_MS);

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isHandshakeComplete, isPublicRenderMode]);

  // Sync state to local storage
  useEffect(() => {
    // [APP_CONTENT_RENDER_DECISION_DEBUG] (FASE 6)
    if (debugEnabled) {
      logDebug('[APP_CONTENT_RENDER_DECISION_DEBUG]', {
        currentView,
        projectId,
        siteId: (selectedPage as any)?.siteId || (selectedPage as any)?.id,
        hasSelectedPage: !!selectedPage,
        hasSections: !!(selectedPage as any)?.content?.sections,
        sectionsCount: (selectedPage as any)?.content?.sections?.length || (selectedPage as any)?.content?.pages?.[0]?.sections?.length || 0,
        isHandshakeComplete,
        willRenderViewer: currentView === 'viewer',
        willRenderEmptyScreen: currentView === 'viewer' && !selectedPage,
        reasonIfEmpty: !selectedPage ? "selectedPage is null" : "None"
      });
    }

    if (projectId || currentView !== 'dashboard') {
      saveSession();
    }
  }, [projectId, appId, currentView, selectedPage, activeTab, isHandshakeComplete]);

  // [VIEWER_HANDSHAKE_BYPASS_DEBUG] (FASE 9)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const siteIdParam = params.get('site_id') || params.get('satellite_id');
    const isPublishedMode = params.get('mode') === 'render' || params.get('external_render') === 'true' || window.location.search.includes('debug=products');

    if ((siteIdParam && isPublishedMode) || (window.location.search.includes('debug=products'))) {
      if (!isHandshakeComplete) {
        logDebug('[VIEWER_HANDSHAKE_BYPASS_DEBUG]', {
          currentView,
          isPublishedViewer: true,
          shouldWaitForHandshake: false,
          reason: "published viewer detected from URL params (FORCED-V101)"
        });
        
        // Auto-complete handshake after a short delay if it hasn't finished
        const timer = setTimeout(() => {
          if (!isHandshakeComplete) {
            logDebug('[VIEWER_HANDSHAKE_BYPASS] Forzando isHandshakeComplete=true por timeout (V101).');
            setIsHandshakeComplete(true);
            // Only force view if not already in viewer
            if (currentView !== 'viewer') {
              setCurrentView('viewer');
            }
          }
        }, 500); // Shorter timeout
        return () => clearTimeout(timer);
      }
    }
  }, [isHandshakeComplete, currentView]);

  const refreshData = async (fProjectId?: string) => {
    const idToUse = fProjectId || projectId;
    if (!idToUse) {
      setPagesLoading(false);
      return [];
    }

    setPagesLoading(true);
    setPagesLoadError(null);

    try {
    const secureLaunchPayload = secureLaunchPayloadRef.current;
    const usingSecureLaunch = Boolean(secureLaunchPayload);
    const safeCache = readSafeHandshakeCache();
    const supabase = getSupabase();
    const supabaseConfig = getSupabaseConfig();
    const launchAccessToken = secureLaunchPayload?.access?.launch_access_token || null;
    const usingLegacySession = Boolean(
      supabaseConfig?.token ||
      safeCache?.session_token ||
      safeCache?.sessionToken ||
      safeCache?.supabaseAccessToken ||
      safeCache?.accessToken ||
      window.sessionStorage.getItem('solutium_supabase_access_token')
    );
    let hasSupabaseSession = Boolean(supabaseConfig?.token);
    let pagesErrorMessage: string | null = null;

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.getSession();
        hasSupabaseSession = hasSupabaseSession || Boolean(data?.session?.access_token);
        if (error) pagesErrorMessage = error.message;
      } catch (error: any) {
        pagesErrorMessage = error?.message || 'No se pudo inspeccionar la sesion de Supabase.';
      }
    } else {
      pagesErrorMessage = 'Supabase client not initialized.';
    }

    const pageDiagnosticsBase = {
      pagesQueryProjectId: idToUse,
      assetsQueryProjectId: idToUse,
      pagesSource: usingSecureLaunch && launchAccessToken ? 'api' : (supabase ? 'supabase' : 'unknown'),
      pagesHttpStatus: null,
      hasSupabaseSession,
      usingSecureLaunch,
      usingLegacySession,
      currentProjectId: idToUse,
      currentUserId: profile?.id || getSecureLaunchUserId(secureLaunchPayload)
    };

    logDebug('[PAGES_LOAD_DIAGNOSTIC]', {
      ...pageDiagnosticsBase,
      pagesResultCount: null,
      pagesErrorMessage
    });

    if (!usingSecureLaunch && hasSecureConstructorCatalogContext) {
      setSecureCatalogProducts([]);
      setSecureCatalogCustomers([]);
      setSecureTrustedLogos([]);
      setHasSecureConstructorCatalogContext(false);
    }

    if (usingSecureLaunch) {
      if (!launchAccessToken) {
        const message = 'El Constructor recibio el proyecto, pero no tiene una API autorizada para leer las paginas existentes.';
        setPagesLoadError(message);
        setPages([]);
        setAssets([]);
        logDebug('[PAGES_LOAD_DIAGNOSTIC]', {
          ...pageDiagnosticsBase,
          pagesSource: 'unknown',
          pagesResultCount: 0,
          pagesErrorMessage: message
        });
        return [];
      }

      const contextResult = await fetchConstructorContext({
        appBaseUrl: getAppMadreBaseUrl(),
        launchAccessToken
      });

      logDebug('[CONSTRUCTOR_CONTEXT_LOAD_DIAGNOSTIC]', {
        httpStatus: contextResult.httpStatus || null,
        hasWebBuilderSites: Array.isArray(contextResult.webBuilderSites),
        webBuilderSitesCount: contextResult.webBuilderSites?.length || 0,
        publishedSitesCount: contextResult.publishedSites?.length || 0,
        assetsCount: contextResult.assets?.length || 0,
        productsCount: contextResult.products?.length || 0,
        catalogProductsCount: contextResult.catalogProducts?.length || 0,
        trustedLogosCount: contextResult.trustedLogos?.length || 0,
        customersCount: contextResult.customers?.length || 0,
        clientsCount: contextResult.clients?.length || 0,
        hasProjectContact: Boolean(contextResult.projectContact),
        hasProjectBranding: Boolean(contextResult.projectBranding)
      });

      if (!contextResult.success) {
        const message = contextResult.message || 'No se pudieron cargar las paginas existentes.';
        setPagesLoadError(message);
        setPages([]);
        setAssets([]);
        logDebug('[PAGES_LOAD_DIAGNOSTIC]', {
          ...pageDiagnosticsBase,
          pagesSource: 'api',
          pagesResultCount: 0,
          pagesErrorMessage: message,
          pagesHttpStatus: contextResult.httpStatus || null
        });
        return [];
      }

      const contextAssets = contextResult.assets || [];
      const contextDrafts = contextResult.webBuilderSites || [];
      const contextPublished = contextResult.publishedSites || [];
      const contextProducts = normalizeSecureProducts(
        contextResult.products || [],
        contextResult.catalogProducts || []
      );
      const contextLogos = normalizeSecureLogoSources(
        contextResult.trustedLogos || [],
        contextResult.customers || [],
        contextResult.clients || []
      );
      const allPages = mergePagesByCurrentLifecycle(contextDrafts as WebBuilderSite[], contextPublished as PublishedSite[]);
      if (secureLaunchPayloadRef.current) {
        secureLaunchPayloadRef.current = {
          ...secureLaunchPayloadRef.current,
          projectContact: contextResult.projectContact || secureLaunchPayloadRef.current.projectContact || null,
          projectBranding: contextResult.projectBranding || secureLaunchPayloadRef.current.projectBranding || null
        };
      }

      const contextProjectBranding = contextResult.projectBranding || secureLaunchPayload?.projectBranding || null;
      const contextProjectContact = contextResult.projectContact || null;
      const projectFromContext = normalizeProjectBrandingToProject(
        contextProjectBranding
          ? {
            ...contextProjectBranding,
            email: contextProjectContact?.email ?? (contextProjectBranding as any)?.email,
            phone: contextProjectContact?.phone ?? (contextProjectBranding as any)?.phone,
            whatsapp: contextProjectContact?.whatsapp ?? (contextProjectBranding as any)?.whatsapp,
            address: contextProjectContact?.address ?? (contextProjectBranding as any)?.address,
            socials: contextProjectContact?.socialLinks || contextProjectContact?.socials || (contextProjectBranding as any)?.socials || (contextProjectBranding as any)?.socialLinks || null
          }
          : null,
        contextResult.projectId || idToUse
      );

      if (projectFromContext) {
        setProject(projectFromContext);
        if (projectFromContext.logoUrl) setUrlLogo(projectFromContext.logoUrl);
        if (projectFromContext.logoWhiteUrl) setUrlLogoWhite(projectFromContext.logoWhiteUrl);
      }

      setAssets(contextAssets as Asset[]);
      setSecureCatalogProducts(contextProducts);
      setSecureCatalogCustomers(contextLogos.customers);
      setSecureTrustedLogos(contextLogos.trustedLogos);
      setHasSecureConstructorCatalogContext(true);
      setPagesLoadError(null);
      setPages(allPages);
      logDebug('[PAGES_LOAD_DIAGNOSTIC]', {
        ...pageDiagnosticsBase,
        pagesSource: 'api',
        pagesResultCount: allPages.length,
        productsResultCount: contextProducts.length,
        trustedLogosResultCount: contextLogos.trustedLogos.length,
        pagesErrorMessage: null,
        pagesHttpStatus: contextResult.httpStatus || null
      });
      return allPages;
    }

    if (!supabase || (usingSecureLaunch && !hasSupabaseSession)) {
      const message = usingSecureLaunch
        ? 'El Constructor recibio el proyecto, pero no tiene una sesion o API autorizada para leer las paginas existentes.'
        : 'No se pudo conectar con Supabase para cargar las paginas existentes.';
      setPagesLoadError(message);
      setPages([]);
      setAssets([]);
      logDebug('[PAGES_LOAD_DIAGNOSTIC]', {
        ...pageDiagnosticsBase,
        pagesResultCount: 0,
        pagesErrorMessage: pagesErrorMessage || message
      });
      return [];
    }

    try {
      logDebug('[SECURE_LAUNCH_SCOPE_DEBUG]', {
        pagesQueryProjectId: idToUse,
        assetsQueryProjectId: idToUse,
        currentProjectIdState: projectId,
        hasSecureLaunchSession: usingSecureLaunch
      });

      const projectAssets = await getAssets(idToUse, 'web_page');
      setAssets(projectAssets);

      const [drafts, published] = await Promise.all([
        getWebBuilderSites(idToUse),
        getPublishedSites(idToUse)
      ]);
      
      const allPages = mergePagesByCurrentLifecycle(drafts, published);
      const { launchSiteId, launchSiteStatus } = getLaunchSiteContext();

      if (launchSiteId && (launchSiteStatus === 'draft' || launchSiteStatus === 'unpublished')) {
        allPages.forEach((page) => {
          if (page.siteId === launchSiteId || (page as any).id === launchSiteId) {
            (page as any).status = 'draft';
          }
        });
      }
      
      setPagesLoadError(null);
      setPages(allPages);
      logDebug('[PAGES_LOAD_DIAGNOSTIC]', {
        ...pageDiagnosticsBase,
        pagesResultCount: allPages.length,
        pagesErrorMessage: null
      });
      return allPages;
    } catch (error: any) {
      const message = error?.message || 'No se pudieron cargar las paginas existentes.';
      console.error('[DATA] Error refreshing data:', error);
      setPagesLoadError(message);
      logDebug('[PAGES_LOAD_DIAGNOSTIC]', {
        ...pageDiagnosticsBase,
        pagesResultCount: 0,
        pagesErrorMessage: message,
        pagesHttpStatus: error?.status || error?.statusCode || null
      });
      return [];
    }
    } finally {
      setPagesLoading(false);
    }
  };

  const hydrateProfileAndThemeFromSession = async (
    payload: any,
    handshakeFont: string,
    fallbackTheme: any,
    options?: { preserveSecureUiTheme?: boolean }
  ) => {
    if (!payload.supabase_url || !payload.supabase_anon_key || !payload.session_token) {
      return;
    }

    try {
      (window as any).SOLUTIUM_SUPABASE_SESSION = { access_token: payload.session_token };

      const supabase = initSupabase(
        payload.supabase_url,
        payload.supabase_anon_key,
        payload.session_token
      );

      if (!supabase) return;

      const userResult = await Promise.race([
        supabase.auth.getUser(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 1500))
      ]).catch((error) => ({ data: { user: null }, error }));

      const { data: { user }, error: userError } = userResult as any;
      if (!user || userError) {
        return;
      }

      const mappedProfile = await getProfile(user.id);
      const themeToApply = mappedProfile?.activeTheme || fallbackTheme || 'blue-light';

      if (mappedProfile) {
        setProfile(mappedProfile);
      } else {
        setProfile({
          id: user.id,
          email: user.email,
          role: 'user',
          activeTheme: (typeof themeToApply === 'string' ? themeToApply : 'blue-light') as any
        });
      }

      if (options?.preserveSecureUiTheme) {
        return;
      }

      if (typeof themeToApply === 'object') {
        applyTheme({
          ...themeToApply,
          fontFamily: handshakeFont || themeToApply.fontFamily || themeToApply.font_family
        });
      } else {
        applyTheme(themeToApply);
        if (handshakeFont) applyTheme({ fontFamily: handshakeFont });
      }
    } catch (error) {
      console.warn('[HANDSHAKE] Delayed profile/theme hydration failed:', error);
    }
  };

  const processHandshake = async (payload: any) => {
    try {
      const secureLaunchPayload = secureLaunchPayloadRef.current;
      const secureUiTheme = secureLaunchPayload?.uiTheme || null;
      const secureProjectBranding = secureLaunchPayload?.projectBranding || payload.projectBranding || null;

      logDebug('[HANDSHAKE] Procesando payload:', summarizeLaunchPayload(payload));
      
      // [APP_MADRE_PRODUCTS_PAYLOAD_FINAL_DEBUG] (FASE 1)
      const sections = payload.sections || payload.content?.sections || payload.site_content?.sections || [];
      const productsSection = sections.find((s: any) => s.type === 'products' || s.tipo === 'products');
      
      if (productsDebugEnabled) {
        logDebug('[APP_MADRE_PRODUCTS_PAYLOAD_FINAL_DEBUG]', {
          siteId: payload.site_id,
          projectId: payload.projectId || payload.satellite_id,
          sectionsCount: sections.length,
          productsSectionFound: !!productsSection,
          sectionId: productsSection?.id,
          moduleId: productsSection?.id,
          sectionType: productsSection?.type || productsSection?.tipo,
          contentProductsCount: productsSection?.content?.products?.length || 0,
          contentProductosCount: productsSection?.content?.productos?.length || 0,
          contentItemsCount: productsSection?.content?.items?.length || 0,
          settingsSnapshotCount: productsSection?.settings?.[`${productsSection?.id}_el_products_items_products`]?.length || 0,
          deepKeySnapshotCount: (payload.settingsValues || {})[`${productsSection?.id}_el_products_items_products`]?.length || 0,
          selectedIdsCount: productsSection?.settings?.[`${productsSection?.id}_el_products_config_select_products`]?.length || 0,
          firstProductName: productsSection?.content?.products?.[0]?.name || productsSection?.content?.productos?.[0]?.name,
          payloadTarget: "satellite/viewer",
          timestamp: new Date().toISOString()
        });
      }

      // LOG DE DIAGNÓSTICO SOLICITADO
      logDebug('[CONSTRUCTOR_MESSAGE_RECEIVED_DEBUG]', {
        eventType: payload.type, // Note: payload here is the config object from handshakeService
        topLevelFirstSectionContent: payload.sections?.[0]?.content,
        contentFirstSectionContent: payload.content?.sections?.[0]?.content,
        configFirstSectionContent: payload.config?.sections?.[0]?.content,
        fullFirstSection: payload.sections?.[0]
      });

      if (!secureLaunchPayload) {
        localStorage.setItem('solutium_handshake_cache', JSON.stringify(payload));
      }

      // Actualizar configuración dinámica (API Keys) desde la Madre
      if (!secureLaunchPayload) {
        configService.updateConfig({
          geminiApiKey: payload.gemini_api_key || payload.VITE_GEMINI_API_KEY || null
        });
      }

      // Extraer fontFamily con máxima cobertura de claves posibles
      const handshakeFont = 
        payload.fontFamily || 
        (payload as any).font_family || 
        (payload as any).font ||
        payload.project?.fontFamily || 
        payload.project?.font_family ||
        payload.project?.font ||
        payload.activeThemeData?.fontFamily ||
        payload.activeThemeData?.font_family ||
        payload.activeThemeData?.font ||
        '';

      const handshakeThemeData = secureUiTheme || resolveLaunchThemeData(payload);
      const handshakeThemeName = payload.profile?.activeTheme || payload.project?.activeTheme;
      const hasThemeData = handshakeThemeData && Object.keys(handshakeThemeData).length > 0;
      const initialThemeToApply = (hasThemeData ? handshakeThemeData : null) || handshakeThemeName || 'blue-light';

      if (typeof initialThemeToApply === 'object') {
        applyTheme({
          ...initialThemeToApply,
          fontFamily: handshakeFont || initialThemeToApply.fontFamily || initialThemeToApply.font_family
        });
      } else {
        applyTheme(initialThemeToApply);
        if (handshakeFont) applyTheme({ fontFamily: handshakeFont });
      }

      void hydrateProfileAndThemeFromSession(payload, handshakeFont, initialThemeToApply, {
        preserveSecureUiTheme: Boolean(secureUiTheme)
      });
      
      // Update favicon if provided
      const handshakeFavicon = 
        payload.favicon_url || 
        payload.faviconUrl || 
        payload.project?.favicon_url || 
        payload.project?.faviconUrl ||
        payload.activeThemeData?.favicon_url ||
        payload.activeThemeData?.faviconUrl;

      if (handshakeFavicon) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = handshakeFavicon;
      }

      if (payload.projectId || projectId) {
        const finalProjectId = payload.projectId || projectId;
        if (secureLaunchPayload) {
          logDebug('[SECURE_LAUNCH_SCOPE_DEBUG]', {
            secureProjectId: getSecureLaunchProjectId(secureLaunchPayload),
            secureUserId: getSecureLaunchUserId(secureLaunchPayload),
            normalizedProjectId: finalProjectId,
            normalizedUserId: payload.userId || payload.user_id || payload.profileId || payload.profile_id || null,
            satelliteId: payload.satellite_id || null,
            siteId: payload.site_id || payload.asset_id || secureLaunchPayload.launcher?.siteId || null,
            pagesQueryProjectId: finalProjectId,
            assetsQueryProjectId: finalProjectId
          });
        }
        setProjectId(finalProjectId);
        
        const handshakeAppId = payload.appId || (payload as any).app_id || '11111111-1111-1111-1111-111111111111';
        setAppId(handshakeAppId);

        const projectPromise = secureProjectBranding
          ? Promise.resolve(
            normalizeIncomingProject(
              payload.project || normalizeProjectBrandingToProject(secureProjectBranding, finalProjectId),
              handshakeThemeData,
              secureProjectBranding
            )
          )
          : payload.project
          ? Promise.resolve(normalizeIncomingProject(payload.project, handshakeThemeData))
          : finalProjectId
            ? getProject(finalProjectId).then((data) => normalizeIncomingProject(data, handshakeThemeData))
            : Promise.resolve(null);

        const pagesPromise = finalProjectId ? refreshData(finalProjectId) : Promise.resolve([]);
        const [resolvedProject, allPages] = await Promise.all([projectPromise, pagesPromise]);

        if (resolvedProject) {
          setProject(resolvedProject);
          if (!secureUiTheme && (resolvedProject.fontFamily || handshakeFont)) {
            applyTheme({
              fontFamily: handshakeFont || resolvedProject.fontFamily || undefined
            });
          }
          if (resolvedProject.logoWhiteUrl) {
            setUrlLogoWhite(resolvedProject.logoWhiteUrl);
          }
        }

        if (finalProjectId) {
          const resolvedSiteId = payload.site_id || payload.asset_id || secureLaunchPayload?.launcher?.siteId || null;

          if (resolvedSiteId) {
            // SIP v7.2: Robust search by either logical siteId or primary key id
            const existingPage = allPages.find(p => p.siteId === resolvedSiteId || (p as any).id === resolvedSiteId);
            let finalPage = existingPage;
            
            // SIP v5.5 (Protocolo 10.2): Robust hydration from payload
            const providedContent = payload.site_content || payload.site_data || payload.content || payload.full_site;
            
            const launchStatus =
              payload.site_status ||
              payload.editor_mode ||
              payload.status ||
              payload.siteStatus ||
              payload.mode;
            const shouldForceDraftLifecycle =
              typeof launchStatus === 'string' &&
              ['draft', 'unpublished'].includes(launchStatus.toLowerCase());

            if (providedContent) {
              logDebug('[GATEWAY] Hidratando sitio desde payload (Protocolo 10.2)');
              finalPage = { 
                ...(existingPage || {}),
                siteId: resolvedSiteId, 
                name: payload.siteName || (existingPage as any)?.name || 'Sitio Remoto',
                content: providedContent,
                isActive: payload.isActive ?? (existingPage as any)?.isActive ?? true,
                status: shouldForceDraftLifecycle ? 'draft' : ((existingPage as any)?.status || 'draft')
              } as any;
            } else if (existingPage) {
              finalPage = shouldForceDraftLifecycle
                ? ({ ...existingPage, status: 'draft' } as any)
                : existingPage;
            } else {
              finalPage = {
                siteId: resolvedSiteId,
                name: payload.siteName || 'Nuevo Sitio',
                status: 'draft'
              } as any;
            }

            setSelectedPage(finalPage);
            
            // Handle rendering modes directly using local variable since state updates are async
            if (payload.force_render || payload.render_mode === 'published') {
              logDebug('[GATEWAY] Forzando renderizado directo:', payload.render_mode);
              if (payload.render_mode === 'published') {
                setCurrentView('viewer');
              } else {
                setCurrentView('constructor');
              }
            } else {
              setCurrentView('constructor');
            }
          }
        }
      }
      
      setIsHandshakeComplete(true);
    } catch (err) {
      console.error('Error processing handshake:', err);
      setIsHandshakeComplete(true);
    }
  };

  const processSecureLaunch = async (payload: SecureLaunchSessionPayload) => {
    secureLaunchPayloadRef.current = payload;
    setSecureLaunchError(null);

    const normalizedPayload = normalizeSecureLaunchPayloadForHandshake(payload);
    const secureProjectId = normalizedPayload.projectId;
    const secureUserId = getSecureLaunchUserId(payload);

    logDebug('[SECURE_LAUNCH] Payload seguro normalizado.', {
      launchMode: 'secure',
      contractVersion: normalizedPayload.launch_contract,
      hasLauncher: Boolean(payload.launcher),
      hasProjectContext: Boolean(payload.projectContext),
      secureProjectId: getSecureLaunchProjectId(payload),
      secureUserId,
      normalizedProjectId: normalizedPayload.projectId,
      normalizedUserId: normalizedPayload.userId || normalizedPayload.profileId || null,
      satelliteId: normalizedPayload.satellite_id,
      siteId: normalizedPayload.site_id || normalizedPayload.asset_id || null,
      pagesQueryProjectId: normalizedPayload.projectId,
      assetsQueryProjectId: normalizedPayload.projectId,
      hasUiTheme: Boolean(payload.uiTheme),
      hasProjectBranding: Boolean(payload.projectBranding),
      hasLaunchAccess: Boolean(payload.access?.launch_access_token),
      launchAccessExpiresAt: payload.access?.expires_at || null
    });

    if (!secureProjectId) {
      setSecureLaunchError('No se pudo sincronizar el contexto del proyecto. Vuelva a abrir el Constructor desde Solutium.');
      return;
    }

    await processHandshake(normalizedPayload);
  };

  useEffect(() => {
    // 1. Recover basic session if URL params are missing
    const params = new URLSearchParams(window.location.search);
    const hasInitParams = params.get('satellite_id') || params.get('site_id');
    const hasSecureLaunchToken = Boolean(getLaunchTokenFromUrl());
    const hasStoredSecureLaunchSession = Boolean(
      getStoredLaunchAccessSession().active && getStoredSecureLaunchPayload()
    );
    
    if (!hasInitParams && !hasSecureLaunchToken && !hasStoredSecureLaunchSession) {
      try {
        const saved = localStorage.getItem('solutium_session_v2');
        if (saved) {
          const session = JSON.parse(saved);
          logDebug('[SESSION] Recuperando sesión persistente:', session);
          if (session.projectId) setProjectId(session.projectId);
          if (session.appId) setAppId(session.appId);
          if (session.currentView) setCurrentView(session.currentView);
          if (session.selectedPage) setSelectedPage(session.selectedPage);
          if (session.activeTab) setActiveTab(session.activeTab);
          
          const savedHandshake = localStorage.getItem('solutium_handshake_cache');
          if (savedHandshake) {
            processHandshake(JSON.parse(savedHandshake));
          }
        }
      } catch (e) {
        console.warn('[SESSION] Error recovering session:', e);
      }
    }

    const logo = params.get('logoUrl') || params.get('logo_url') || params.get('isoUrl') || params.get('iso_url');
    if (logo) setUrlLogo(logo);

    const logoWhite = params.get('logoWhiteUrl') || params.get('logo_white_url');
    if (logoWhite) setUrlLogoWhite(logoWhite);
    
    const fontParam = params.get('fontFamily') || params.get('font_family');
    if (fontParam) {
      applyTheme({ fontFamily: fontParam });
    }

    // --- PROTOCOLO SOLUTIUM v5.2: Gateway Override ---
    const isExternal = params.get('external_render') === 'true';
    const assetId = params.get('asset_id');
    const satelliteId = params.get('satellite_id');

    if (isExternal && satelliteId) {
      logDebug(`[GATEWAY v5.2] Detectado renderizado externo para Satélite: ${satelliteId}, Asset: ${assetId}`);
      setProjectId(satelliteId);
      if (assetId) {
        // Preparamos el estado para que el constructor cargue este asset
        setSelectedPage({ siteId: assetId, name: 'Cargando sitio...' } as any);
        setCurrentView('viewer');

        void fetchPublishedSiteById(assetId)
          .then((publishedSite) => {
            const content =
              publishedSite?.content ||
              publishedSite?.content_published ||
              publishedSite?.site_content ||
              publishedSite?.siteContent;

            if (!content) {
              throw new Error('Published site payload has no content');
            }

            const resolvedProjectId =
              publishedSite.projectId ||
              publishedSite.project_id ||
              satelliteId;

            setProjectId(resolvedProjectId);
            setAppId(
              publishedSite.appId ||
              publishedSite.app_id ||
              '11111111-1111-1111-1111-111111111111'
            );
            setSelectedPage({
              id: publishedSite.id,
              projectId: resolvedProjectId,
              appId: publishedSite.appId || publishedSite.app_id,
              siteId: publishedSite.siteId || publishedSite.site_id || assetId,
              siteName: publishedSite.siteName || publishedSite.site_name || 'Sitio publicado',
              name: publishedSite.siteName || publishedSite.site_name || 'Sitio publicado',
              content,
              metadata: publishedSite.metadata,
              isActive: publishedSite.isActive ?? publishedSite.is_active ?? true,
              status: 'published'
            } as any);
            setCurrentView('viewer');
            setIsHandshakeComplete(true);
          })
          .catch((error) => {
            console.error('[PUBLISHED_RENDER_FETCH_ERROR]', error);
            setIsHandshakeComplete(true);
            setCurrentView('viewer');
          });
      }
    }
    
    const favicon = params.get('faviconUrl') || params.get('favicon_url');
    if (favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = favicon;
    }
    
    logDebug("--- DIAGNÓSTICO SIP v5.2 ---");
    const hasSecureLaunchTokenForDiagnostics = Boolean(getLaunchTokenFromUrl());
    logDebug(
      "1. window.name contenido:",
      hasSecureLaunchTokenForDiagnostics
        ? "OMITIDO_POR_LAUNCH_TOKEN"
        : (window.name ? (window.name.substring(0, 50) + "...") : "VACIO")
    );
    logDebug("2. ¿Tiene abridor (window.opener)?:", !!window.opener);
    logDebug("3. ¿Está en iframe?:", window.parent !== window);
    logDebug("4. URL actual:", window.location.href);
    logDebug("---------------------------------");

    // Expose test function to console for validation
    (window as any).SOLUTIUM_TEST_UPLOAD_ASSET = async () => {
      logDebug("[SOLUTIUM] Iniciando validación de upload centralizado...");
      const { uploadAsset } = await import('./services/assetsClient');
      
      try {
        // Crear un pequeño blob de prueba
        const canvas = document.createElement('canvas');
        canvas.width = 100; canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(0, 0, 100, 100);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Arial';
          ctx.fillText('CONSOLE TEST', 10, 50);
        }
        const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b || new Blob()), 'image/png'));

        const result = await uploadAsset(blob, {
          projectId: '5210c610-776e-4736-b3f6-5c176e9a771b',
          siteId: '59a75271-2d5a-4c2f-9c8a-c6584b33b755',
          webBuilderSiteId: '77042df2-0c01-46cd-8acc-e874ebade1e4',
          assetType: 'image',
          sourceApp: 'constructor_web',
          fileName: `console-test-${Date.now()}.png`
        });

        logDebug("[SOLUTIUM] ¡Subida exitosa!");
        console.table(result);
        return result;
      } catch (err: any) {
        console.error("[SOLUTIUM] Error en validación:", err.message);
        return { error: err.message };
      }
    };
  }, []);

  useEffect(() => {
    if (handshakeStartedRef.current) return;
    handshakeStartedRef.current = true;
    const launchToken = getLaunchTokenFromUrl();
    const storedSecureLaunchPayload = getStoredSecureLaunchPayload();

    if (storedSecureLaunchPayload) {
      logDebug('[SECURE_LAUNCH] Restaurando sesion segura vigente desde sessionStorage.', {
        launchMode: 'secure',
        restoreSource: 'sessionStorage',
        hasLaunchTokenInUrl: Boolean(launchToken),
        secureProjectId: getSecureLaunchProjectId(storedSecureLaunchPayload),
        secureUserId: getSecureLaunchUserId(storedSecureLaunchPayload),
        launchAccessExpiresAt: storedSecureLaunchPayload.access?.expires_at || null
      });
      clearLaunchTokenFromUrl();
      void processSecureLaunch(storedSecureLaunchPayload);
      return;
    }

    if (!launchToken) {
      logDebug('[SECURE_LAUNCH] Launcher mode:', {
        launchMode: 'legacy',
        contractVersion: null,
        hasUiTheme: false,
        hasProjectBranding: false
      });
      startHandshake(processHandshake);
      return;
    }

    const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);

    void consumeSecureLaunchSession(launchToken).then(async (result) => {
      if (result.success && result.payload) {
        const safeLaunchDebug = {
          launchMode: 'secure',
          contractVersion: getLaunchContractVersion(result.payload),
          hasUiTheme: Boolean(result.payload.uiTheme),
          hasProjectBranding: Boolean(result.payload.projectBranding),
          hasLaunchAccess: Boolean(result.payload.access?.launch_access_token),
          launchAccessExpiresAt: result.payload.access?.expires_at || null,
          hasContactInfo: hasContactInfoInPayload(result.payload),
          hasSocialLinks: hasSocialLinksInPayload(result.payload),
          consumeAttemptId: result.consumeAttemptId,
          consumeStatus: result.fromCache ? 'cached_success' : 'success',
          httpStatus: result.httpStatus || null
        };
        logDebug('[SECURE_LAUNCH] launch_token consumido correctamente.', {
          ...safeLaunchDebug,
          secureProjectId: getSecureLaunchProjectId(result.payload),
          secureUserId: getSecureLaunchUserId(result.payload)
        });
        if (isLocalDev) {
          (window as any).SOLUTIUM_LAUNCH_DEBUG = safeLaunchDebug;
        }
        clearLaunchTokenFromUrl();
        await processSecureLaunch(result.payload);
        return;
      }

      const message = 'La sesión segura del Constructor ya no es válida. Por favor vuelve a lanzar el Constructor Web desde Solutium.';
      setSecureLaunchError(message);
      console.error('[SECURE_LAUNCH] Error consuming launch_token:', {
        consumeAttemptId: result.consumeAttemptId,
        consumeStatus: result.fromCache ? 'cached_error' : 'error',
        httpStatus: result.httpStatus || null,
        errorCode: result.error,
        errorMessage: result.message
      });
    });
  }, []);

  const handleNewPage = () => {
    setSelectedPage(null);
    setSelectedAsset(null);
    setSelectedMethod(null);
    setFormData(null);
    setCurrentView('selection-method');
  };

  const handleSelectMethod = (method: CreationMethod) => {
    setSelectedPage(null);
    setSelectedAsset(null);
    setSelectedMethod(method);
    setCurrentView('constructor');
  };

  const handleSelectAsset = (asset: Asset) => {
    setSelectedPage(null);
    setSelectedAsset(asset);
    setCurrentView('constructor');
  };

  const refreshPages = async () => {
    if (!projectId) return;
    const [drafts, published] = await Promise.all([
      getWebBuilderSites(projectId),
      getPublishedSites(projectId)
    ]);
    setPages(mergePagesByCurrentLifecycle(drafts, published));
  };

  const handleFormSubmit = (data: ProjectFormData) => {
    setFormData(data);
    if (selectedMethod === 'ai') {
      setCurrentView('generator');
    } else {
      setCurrentView('constructor');
    }
  };

  const activateThisConstructorTab = () => {
    const tabId = constructorTabIdRef.current;
    const replacedTabId = constructorTabConflict?.tabId || null;
    const now = Date.now();
    const page = selectedPage as any;

    try {
      window.localStorage.setItem(CONSTRUCTOR_ACTIVE_TAB_STORAGE_KEY, JSON.stringify({
        tabId,
        projectId: projectId || null,
        siteId: page?.siteId || page?.site_id || null,
        pageId: page?.id || page?.pageId || page?.page_id || null,
        createdAt: now,
        lastSeenAt: now,
        updatedAt: now,
        title: page?.siteName || page?.site_name || page?.name || 'Constructor Solutium',
        replacedBy: tabId
      }));
    } catch (error) {
      console.warn('[CONSTRUCTOR_TAB] Unable to activate root tab:', error);
    }

    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(CONSTRUCTOR_TAB_CHANNEL);
      channel.postMessage({
        type: 'tab-replaced',
        tabId,
        replacedTabId
      });
      channel.close();
    }

    setConstructorTabCancelled(false);
    setConstructorTabReplaced(false);
    setConstructorTabConflict(null);
  };

  const cancelThisConstructorTab = () => {
    const tabId = constructorTabIdRef.current;
    try {
      const raw = window.localStorage.getItem(CONSTRUCTOR_ACTIVE_TAB_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.tabId === tabId) {
        window.localStorage.removeItem(CONSTRUCTOR_ACTIVE_TAB_STORAGE_KEY);
      }
    } catch {
      // Best-effort cleanup only.
    }
    setConstructorTabConflict(null);
    setConstructorTabCancelled(true);
  };

  if (!isHandshakeComplete) {
    if (secureLaunchError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <span className="text-2xl font-black">!</span>
            </div>
            <h1 className="text-xl font-black text-slate-900">No se pudo iniciar el Constructor</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">{secureLaunchError}</p>
          </div>
        </div>
      );
    }

    if (isPublicRenderMode) {
      return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white">
          <AbstractLoadingIndicator label="Cargando sitio" compact />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          {/* Solutium Isotipo central */}
          <div className="flex items-center justify-center">
            <motion.div
              animate={{
                opacity: [0.92, 1, 0.92]
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex items-center justify-center"
            >
              <AbstractLoadingIndicator label={loadingMessages[loadingMessageIndex]} />
            </motion.div>
            
            {/* Círculo de Carga animado */}
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-slate-500">
              {loadingMessages[loadingMessageIndex]}
            </p>
          </div>
        </motion.div>


        {/* Botón de Emergencia DISCRETO para Desarrollo */}
        {(window.location.hostname.includes('run.app') || window.location.hostname.includes('localhost')) && (
          <div className="absolute bottom-6 opacity-20 hover:opacity-100 transition-opacity">
            <button 
              onClick={() => {
                initSupabase(
                  'https://placeholder-project.supabase.co',
                  'placeholder-key',
                  'placeholder-token'
                );
                setProjectId('dev-project-id');
                setProfile({
                  id: 'dev-user-id',
                  email: 'admin@solutium.com',
                  role: 'superadmin',
                  activeTheme: 'blue-light'
                });
                setIsHandshakeComplete(true);
              }}
              className="px-4 py-1 text-[10px] uppercase tracking-widest font-bold text-text/40 hover:text-primary transition-colors"
            >
              Skip
            </button>
          </div>
        )}
      </div>
    );
  }

  if (constructorTabCancelled) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <h1 className="text-xl font-black text-slate-900">Constructor abierto en otra pestaña</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Esta pestaña no tomó control. La sesión activa se mantiene sin cambios.
          </p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            assets={assets} 
            pages={pages}
            pagesLoadError={pagesLoadError}
            pagesLoading={pagesLoading}
            onNewPage={() => {
              setSelectedPage(null);
              handleNewPage();
            }} 
            onSelectAsset={handleSelectAsset}
            onSelectPage={(page) => {
              setSelectedPage(page);
              if (!('contentDraft' in page)) {
                setCurrentView('viewer');
              } else {
                setCurrentView('constructor');
              }
            }}
            sessionInfo={welcomeSessionInfo}
            onRequestMotherContext={() => {
              sendToMother('SOLUTIUM_GET_CONFIG', { source: 'constructor_dashboard' });
              try {
                window.opener?.focus?.();
              } catch {
                // El navegador puede bloquear focus; la solicitud por postMessage queda enviada.
              }
            }}
            logoUrl={urlLogo}
            logoWhiteUrl={urlLogoWhite}
          />
        );
      case 'selection-method':
        return (
          <MethodSelection 
            onSelect={handleSelectMethod}
            onBack={() => setCurrentView('dashboard')}
            logoUrl={urlLogo}
          />
        );
      case 'form':
        return (
          <>
            <MethodSelection 
              onSelect={handleSelectMethod}
              onBack={() => setCurrentView('dashboard')}
              logoUrl={urlLogo}
            />
            <ProjectForm 
              onSubmit={handleFormSubmit}
              onCancel={() => setCurrentView('selection-method')}
              onSkip={() => {
                if (selectedMethod === 'ai') {
                  setCurrentView('generator');
                } else {
                  setCurrentView('constructor');
                }
              }}
            />
          </>
        );
      case 'generator':
        return (
          <div className="p-8 flex flex-col items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-6"></div>
            <h2 className="text-3xl font-bold">Generando tu página con IA...</h2>
            <p className="text-text/60 mt-2">Estamos creando la estructura perfecta para {formData?.name}</p>
            <button onClick={() => setCurrentView('constructor')} className="mt-8 text-primary font-bold">Saltar a Constructor (Simulación)</button>
          </div>
        );
      case 'constructor':
        return (
          <WebConstructor 
            key={selectedPage?.id || (selectedPage as any)?.siteId || 'new-constructor'}
            onBackToDashboard={() => {
              refreshData();
              setSelectedPage(null);
              setSelectedAsset(null);
              setSelectedMethod(null);
              setFormData(null);
              setCurrentView('dashboard');
            }} 
            onCancelOnboarding={() => {
              setCurrentView('selection-method');
              setSelectedPage(null);
              setSelectedMethod(null);
              setSelectedAsset(null);
              setFormData(null);
            }}
            projectId={projectId} 
            appId={appId}
            currentUserId={profile?.id || null}
            logoUrl={urlLogo}
            logoWhiteUrl={urlLogoWhite}
            project={project}
            initialPage={selectedPage}
            creationMethod={selectedMethod}
            secureProducts={secureCatalogProducts}
            secureCustomers={secureCatalogCustomers}
            secureTrustedCompanyLogos={secureTrustedLogos}
            useSecureCatalogContext={hasSecureConstructorCatalogContext}
          />
        );
      case 'viewer':
        if (!selectedPage) return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        );

        // LOG DE DIAGNÓSTICO SOLICITADO
        logDebug('[CONSTRUCTOR_BEFORE_VIEWER_DEBUG]', {
          firstSection: (selectedPage as any).content?.sections?.[0],
          firstSectionContent: (selectedPage as any).content?.sections?.[0]?.content,
          firstSectionSettingsKeys: Object.keys((selectedPage as any).content?.sections?.[0]?.settings || {})
        });

        return (
          <Viewer 
            site={selectedPage as PublishedSite}
            onBack={() => {
              setSelectedPage(null);
              setCurrentView('dashboard');
            }}
            catalogProducts={secureCatalogProducts}
            catalogCustomers={secureCatalogCustomers}
            trustedCompanyLogos={secureTrustedLogos}
            useSecureCatalogContext={hasSecureConstructorCatalogContext}
          />
        );
      default:
        return <div>Vista no encontrada</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text">
      {renderView()}
      {constructorTabConflict && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/45 p-6 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-2xl"
          >
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10">
              <span className="text-xl font-black text-amber-600">!</span>
            </div>
            <h2 className="mb-3 text-xl font-bold text-slate-900">Constructor abierto en otra pestaña</h2>
            <p className="mb-7 text-sm leading-relaxed text-slate-600">
              Si continúas aquí, la otra sesión se cerrará. Los cambios no guardados en esa pestaña podrían perderse.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={activateThisConstructorTab}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90"
              >
                Usar esta pestaña
              </button>
              <button
                type="button"
                onClick={cancelThisConstructorTab}
                className="w-full py-2 text-sm font-bold text-slate-400 transition-all hover:text-slate-700"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {constructorTabReplaced && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/45 p-6 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-2xl"
          >
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10">
              <span className="text-xl font-black text-blue-600">i</span>
            </div>
            <h2 className="mb-3 text-xl font-bold text-slate-900">Sesión reemplazada</h2>
            <p className="mb-7 text-sm leading-relaxed text-slate-600">
              Esta sesión fue reemplazada por otra pestaña.
            </p>
          </motion.div>
        </div>
      )}
      <AIGenerationOverlay />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
