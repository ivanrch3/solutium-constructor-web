/**
 * SOLUTIUM SATELLITE SDK
 * Version: 1.1.0
 * Protocol: S.I.P. v2
 */
import { useEffect, useState, useMemo, useRef } from 'react';
import { initSupabase, supabase } from './supabase';

export interface SolutiumPayload {
  userId: string;
  projectId: string;
  sessionToken?: string;
  role: string;
  timestamp: number;
  scopes: string[];
  environment: string;

  // 1. Perfil de Usuario (Extendido)
  profilesData?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    language: string;
    role: string;
    uiStyle: string;
    activeTheme: string;
    fontFamily: string;
    baseSize: string;
    borderRadius: string;
    themePreference: string;
    coloredSidebarIcons?: boolean;
    subscriptionPlan: string;
    onboardingCompleted: boolean;
    isTrialUser?: boolean;
    needsPassword?: boolean;
    hasCompletedTour?: boolean;
    emailItId?: string;
    updatedAt?: string;
    businessName?: string;
    provider?: string;
    preferredTheme?: string;
    schemaVersion?: string;
  };

  // 2. Datos del Proyecto (Extendido)
  projectsData?: {
    id: string;
    ownerId?: string;
    name: string;
    industry?: string;
    whatsapp?: string;
    website?: string;
    email?: string;
    address?: string;
    brandColors: string[];
    logoUrl?: string;
    uiStyle?: string;
    activeTheme?: string;
    imageMappings?: any[];
    isMaster?: boolean;
    createdAt: number;
    updatedAt?: number;
    schemaVersion?: string;
    webConfig?: any;
    integrations?: any[];
    currency?: string;
    installedAppIds: string[];
    assignedMemberIds: string[];
    assets?: any[];
  };

  // 3. Equipo y Miembros
  teamMembersData?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    status?: string;
    projectId?: string;
    profileId?: string;
    assignedAt?: string | number;
    userId?: string;
    permissions?: string[];
    schemaVersion?: string;
  }>;

  // 4. CRM (Clientes)
  customersData?: Array<{
    id: string;
    projectId?: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    role?: string;
    status?: string;
    source?: string;
    sourceAppId?: string;
    businessId?: string;
    visibility?: string;
    assignedBusinessIds?: any;
    lastActivity?: string;
    notes?: string;
    appData?: any;
    createdAt?: string | number;
    updatedAt?: string | number;
    schemaVersion?: string;
  }>;

  // 5. Catálogo (Productos/Servicios)
  productsData?: Array<{
    id: string;
    projectId?: string;
    name: string;
    description?: string;
    unitCost?: number;
    type?: string;
    sku?: string;
    status?: string;
    businessId?: string;
    appData?: any;
    createdAt?: string | number;
    updatedAt?: string | number;
    schemaVersion?: string;
  }>;

  // 6. Activos Digitales
  assetsData?: Array<{
    id: string;
    projectId?: string;
    name: string;
    type?: string;
    url?: string;
    originApp?: string;
    author?: string;
    status?: string;
    tags?: string[];
    metadata?: any;
    createdAt?: string;
    updatedAt?: string;
    schemaVersion?: string;
  }>;

  // 7. Integraciones de Usuario
  integrationsData?: any[];
  
  // Legacy fields for backwards compatibility
  supabaseData?: {
      url: string;
      anonKey: string;
  };
  currentAsset?: {
      id: string;
      name: string;
      type: string;
      data?: any;
  };
}

// Helper to verify HMAC-SHA256
async function verifySignature(payloadBase64: string, signatureBase64: string, secret: string) {
    try {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secret);
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );
        
        // Convert base64url to Uint8Array
        const sigStr = atob(signatureBase64.replace(/-/g, '+').replace(/_/g, '/'));
        const sigBytes = new Uint8Array(sigStr.length);
        for (let i = 0; i < sigStr.length; i++) {
            sigBytes[i] = sigStr.charCodeAt(i);
        }
        
        const dataBytes = encoder.encode(payloadBase64);
        
        return await crypto.subtle.verify(
            'HMAC',
            cryptoKey,
            sigBytes,
            dataBytes
        );
    } catch (e) {
        console.error('Error verifying signature:', e);
        return false;
    }
}

export interface SolutiumLog {
  id: string;
  timestamp: number;
  origin: string;
  type: string;
  payloadRaw: any;
  isCamelCase: boolean;
  ackStatus: 'pending' | 'success' | 'failed';
  error?: string;
}

export const useSolutium = () => {
    const [config, setConfig] = useState<SolutiumPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<SolutiumLog[]>([]);
    const isInitialized = useRef(false);

    const addLog = (log: Omit<SolutiumLog, 'id' | 'timestamp'>) => {
        const newLog: SolutiumLog = {
            ...log,
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now()
        };
        setLogs(prev => [newLog, ...prev].slice(0, 50));
        console.log(`[Solutium Log] ${log.type} from ${log.origin}`, log);
    };

    const checkCamelCase = (obj: any): boolean => {
        if (!obj || typeof obj !== 'object') return true;
        const snakeCaseKeys = Object.keys(obj).filter(key => key.includes('_'));
        if (snakeCaseKeys.length > 0) {
            console.warn(`[Solutium Warning] Snake Case detected in keys: ${snakeCaseKeys.join(', ')}`);
            return false;
        }
        return true;
    };

    // 1. Intentar obtener token de la URL (flujo iframe/redirect) inmediatamente
    useEffect(() => {
        const initFromUrl = async () => {
            if (typeof window === 'undefined') return;
            try {
                // Estándar V2: El token viene en el hash #token=payloadBase64.firma
                const hash = window.location.hash;
                let token = null;
                
                if (hash.startsWith('#token=')) {
                    token = hash.replace('#token=', '');
                } else {
                    // Fallback a query params
                    const params = new URLSearchParams(window.location.search);
                    token = params.get('token');
                }
                
                if (token) {
                    addLog({
                        origin: 'URL_HASH',
                        type: 'TOKEN_RECEIVED',
                        payloadRaw: { token: token.substring(0, 20) + '...' },
                        isCamelCase: true,
                        ackStatus: 'pending'
                    });

                    const parts = token.split('.');
                    const base64Payload = parts[0];
                    const signature = parts[1];
                    
                    const secret = import.meta.env.VITE_SIP_SECRET_KEY;
                    
                    if (secret && signature) {
                        const isValid = await verifySignature(base64Payload, signature, secret);
                        if (!isValid) {
                            console.error('Invalid SIP token signature');
                            setError('Invalid token signature');
                            setLoading(false);
                            addLog({
                                origin: 'URL_HASH',
                                type: 'TOKEN_ERROR',
                                payloadRaw: { error: 'Invalid signature' },
                                isCamelCase: true,
                                ackStatus: 'failed',
                                error: 'Invalid signature'
                            });
                            return;
                        }
                    }
                    
                    // CRÍTICO: Usar JSON.parse(atob()) para seguridad CSP
                    const decoded = JSON.parse(atob(base64Payload));
                    
                    // Inicializar Supabase con el sessionToken (V2)
                    if (decoded.supabaseData?.url && decoded.supabaseData?.anonKey) {
                        initSupabase(
                            decoded.supabaseData.url, 
                            decoded.supabaseData.anonKey, 
                            decoded.sessionToken
                        );
                    }
                    
                    // Robustness: check legacy keys
                    const profilesData = decoded.profilesData || decoded.profiles || decoded.profile || decoded.userProfile;
                    const projectsData = decoded.projectsData || decoded.projects || decoded.project || decoded.projectData;
                    const customersData = decoded.customersData || decoded.crmData || decoded.crm_data || decoded.customers;
                    const productsData = decoded.productsData || decoded.products_data || decoded.products;
                    const assetsData = decoded.assetsData || decoded.assets_data || decoded.assets;
                    const teamMembersData = decoded.teamMembersData || decoded.team_members || decoded.team;

                    const normalizedDecoded = {
                        ...decoded,
                        profilesData,
                        projectsData,
                        customersData,
                        productsData,
                        assetsData,
                        teamMembersData
                    };

                    const isCamel = checkCamelCase(normalizedDecoded);
                    
                    addLog({
                        origin: 'URL_PARAMS',
                        type: 'TOKEN_DECODED',
                        payloadRaw: normalizedDecoded,
                        isCamelCase: isCamel,
                        ackStatus: 'success'
                    });

                    setConfig(normalizedDecoded);
                    if (normalizedDecoded.projectsData) {
                        applyTheme(normalizedDecoded.projectsData);
                    }
                }
            } catch (e) {
                console.error('Error decodificando token inicial:', e);
                addLog({
                    origin: 'URL_PARAMS',
                    type: 'DECODE_ERROR',
                    payloadRaw: { error: String(e) },
                    isCamelCase: true,
                    ackStatus: 'failed',
                    error: String(e)
                });
            } finally {
                setLoading(false);
            }
        };
        
        initFromUrl();
    }, []);

    useEffect(() => {
        // 2. Avisar a la App Madre que el satélite está listo para recibir la data pesada (solo una vez)
        if (window.opener) {
            window.opener.postMessage({ type: 'SOLUTIUM_SATELLITE_READY' }, '*');
        } else if (window.parent !== window) {
            window.parent.postMessage({ type: 'SOLUTIUM_SATELLITE_READY' }, '*');
        }

        const handleMessage = async (event: MessageEvent) => {
            // Log every message received
            if (event.data?.type) {
                const isCamel = checkCamelCase(event.data.payload || event.data.config);
                
                const logEntry: Omit<SolutiumLog, 'id' | 'timestamp'> = {
                    origin: event.origin,
                    type: event.data.type,
                    payloadRaw: event.data,
                    isCamelCase: isCamel,
                    ackStatus: 'pending'
                };

                if (event.data?.type === 'SOLUTIUM_INIT' || event.data?.type === 'SOLUTIUM_CONFIG') {
                    console.log("📦 [Satélite] Recibiendo payload pesado:", event.data.payload || event.data.config);
                    
                    let payload = event.data.payload || event.data.config;
                    
                    // If payload is a string (token), verify it
                    if (typeof payload === 'string') {
                        const parts = payload.split('.');
                        const base64Payload = parts[0];
                        const signature = parts[1];
                        const secret = import.meta.env.VITE_SIP_SECRET_KEY;
                        
                        if (secret && signature) {
                            const isValid = await verifySignature(base64Payload, signature, secret);
                            if (!isValid) {
                                console.error('Invalid SIP token signature in message');
                                addLog({ ...logEntry, ackStatus: 'failed', error: 'Invalid signature' });
                                return;
                            }
                        }
                        try {
                            payload = JSON.parse(atob(base64Payload));
                        } catch (e) {
                            addLog({ ...logEntry, ackStatus: 'failed', error: 'JSON Parse Error' });
                            return;
                        }
                    }
                    
                    const typedPayload = payload as SolutiumPayload;
                    
                    // Robustness: check legacy keys
                    const profilesData = typedPayload.profilesData || (typedPayload as any).profiles || (typedPayload as any).profile || (typedPayload as any).userProfile;
                    const projectsData = typedPayload.projectsData || (typedPayload as any).projects || (typedPayload as any).project || (typedPayload as any).projectData;
                    const customersData = typedPayload.customersData || (typedPayload as any).crmData || (typedPayload as any).crm_data || (typedPayload as any).customers;
                    const productsData = typedPayload.productsData || (typedPayload as any).products_data || (typedPayload as any).products || (typedPayload as any).inventory;
                    const assetsData = typedPayload.assetsData || (typedPayload as any).assets_data || (typedPayload as any).assets;
                    const teamMembersData = typedPayload.teamMembersData || (typedPayload as any).team_members || (typedPayload as any).team;

                    const normalizedPayload: SolutiumPayload = {
                        ...typedPayload,
                        profilesData,
                        projectsData,
                        customersData,
                        productsData,
                        assetsData,
                        teamMembersData
                    };

                    const isPayloadCamel = checkCamelCase(normalizedPayload);
                    
                    // Apply Theme & Supabase
                    if (normalizedPayload.projectsData) applyTheme(normalizedPayload.projectsData);
                    if (normalizedPayload.supabaseData?.url && normalizedPayload.supabaseData?.anonKey) {
                        initSupabase(
                            normalizedPayload.supabaseData.url, 
                            normalizedPayload.supabaseData.anonKey,
                            normalizedPayload.sessionToken
                        );
                    }

                    // Merge to avoid overwriting heavy data (crmData, productsData) with light data from URL token
                    setConfig(prev => {
                        if (prev) {
                            return {
                                ...prev,
                                ...normalizedPayload,
                                customersData: normalizedPayload.customersData || prev.customersData,
                                productsData: normalizedPayload.productsData || prev.productsData,
                                assetsData: normalizedPayload.assetsData || prev.assetsData,
                                profilesData: normalizedPayload.profilesData || prev.profilesData,
                                teamMembersData: normalizedPayload.teamMembersData || prev.teamMembersData,
                                projectsData: normalizedPayload.projectsData || prev.projectsData
                            };
                        }
                        return normalizedPayload;
                    });
                    setLoading(false);
                    
                    // Enviar acuse de recibo a la App Madre
                    try {
                        const ackMessage = { type: 'SOLUTIUM_ACK' };

                        if (window.opener) {
                            window.opener.postMessage(ackMessage, '*');
                            addLog({ ...logEntry, isCamelCase: isPayloadCamel, ackStatus: 'success' });
                        } else if (event.source) {
                            (event.source as Window).postMessage(ackMessage, '*');
                            addLog({ ...logEntry, isCamelCase: isPayloadCamel, ackStatus: 'success' });
                        } else if (window.parent !== window) {
                            window.parent.postMessage(ackMessage, '*');
                            addLog({ ...logEntry, isCamelCase: isPayloadCamel, ackStatus: 'success' });
                        } else {
                            addLog({ ...logEntry, isCamelCase: isPayloadCamel, ackStatus: 'failed', error: 'No source to ACK' });
                        }
                    } catch (e) {
                        console.error('Error sending ACK:', e);
                        addLog({ ...logEntry, isCamelCase: isPayloadCamel, ackStatus: 'failed', error: 'Security/CSP Block' });
                    }
                } else {
                    // Log other messages but don't process them as config
                    addLog(logEntry);
                }
            }
        };

        window.addEventListener('message', handleMessage);

        // Timeout de seguridad para mostrar mensaje de carga
        const timeout = setTimeout(() => {
            setLoading(prev => {
                if (prev) {
                    console.log('Cargando configuración desde la App Madre...');
                }
                return prev;
            });
        }, 1000);

        return () => {
            window.removeEventListener('message', handleMessage);
            clearTimeout(timeout);
        };
    }, []);

    const saveData = async (assetId: string, data: any, metadata?: { name?: string, status?: string, tags?: string[], author?: string, updatedAt?: number, projectId?: string, type?: string }) => {
        const targetProjectId = metadata?.projectId || config?.projectId;
        
        if (!targetProjectId) {
            console.error('[Solutium SDK] Cannot save: No Project ID configured.');
            return;
        }
        if (!assetId) {
            console.error('[Solutium SDK] Cannot save: No Asset ID provided.');
            return;
        }
        
        // Estándar V2: Conexión Directa a Base de Datos
        try {
            const { error } = await supabase
                .from('assets')
                .upsert({
                    id: assetId,
                    project_id: targetProjectId,
                    origin_app: 'constructor-web',
                    name: metadata?.name || 'Landing Page Principal',
                    type: metadata?.type || 'web_page',
                    data: data,
                    author: metadata?.author || config?.profilesData?.fullName || 'Usuario',
                    status: metadata?.status || 'draft',
                    tags: metadata?.tags || [],
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            console.log('[Solutium SDK] Datos guardados exitosamente en Supabase (V2).');
        } catch (e) {
            console.error('[Solutium SDK] Error al guardar en Supabase:', e);
            
            // Fallback al protocolo postMessage por si acaso
            const message = {
                type: 'SOLUTIUM_SAVE',
                payload: {
                    projectId: targetProjectId,
                    appId: 'constructor-web',
                    assetId: assetId,
                    timestamp: Date.now(),
                    data: data,
                    metadata: {
                        name: metadata?.name || '',
                        status: metadata?.status || 'draft',
                        tags: metadata?.tags || [],
                        author: metadata?.author || config?.profilesData?.fullName || 'Usuario',
                        updatedAt: metadata?.updatedAt || Date.now()
                    }
                }
            };

            if (window.opener) {
                window.opener.postMessage(message, '*');
            } else if (window.parent !== window) {
                window.parent.postMessage(message, '*');
            }
        }
    };

    return { config, isReady: !loading, saveData, error, logs };
};

const applyTheme = (projectData: SolutiumPayload['projectsData']) => {
    if (!projectData) return;
    const root = document.documentElement;
    
    if (projectData.brandColors && Array.isArray(projectData.brandColors)) {
        if (projectData.brandColors[0]) root.style.setProperty('--color-primary-rgb', hexToRgb(projectData.brandColors[0]));
        if (projectData.brandColors[1]) root.style.setProperty('--color-secondary-rgb', hexToRgb(projectData.brandColors[1]));
        if (projectData.brandColors[2]) root.style.setProperty('--color-accent-rgb', hexToRgb(projectData.brandColors[2]));
        if (projectData.brandColors[3]) root.style.setProperty('--color-background-rgb', hexToRgb(projectData.brandColors[3]));
        if (projectData.brandColors[4]) root.style.setProperty('--color-surface-rgb', hexToRgb(projectData.brandColors[4]));
        if (projectData.brandColors[5]) root.style.setProperty('--color-text-rgb', hexToRgb(projectData.brandColors[5]));
    }

    // Fallback to old property names if present in legacy payloads
    const legacyData = projectData as any;
    if (legacyData.colors && Array.isArray(legacyData.colors)) {
        if (legacyData.colors[0]) root.style.setProperty('--color-primary-rgb', hexToRgb(legacyData.colors[0]));
        if (legacyData.colors[1]) root.style.setProperty('--color-secondary-rgb', hexToRgb(legacyData.colors[1]));
        if (legacyData.colors[2]) root.style.setProperty('--color-accent-rgb', hexToRgb(legacyData.colors[2]));
        if (legacyData.colors[3]) root.style.setProperty('--color-background-rgb', hexToRgb(legacyData.colors[3]));
        if (legacyData.colors[4]) root.style.setProperty('--color-surface-rgb', hexToRgb(legacyData.colors[4]));
        if (legacyData.colors[5]) root.style.setProperty('--color-text-rgb', hexToRgb(legacyData.colors[5]));
    }

    if (legacyData.fontFamily) root.style.setProperty('--font-family', legacyData.fontFamily);
    if (legacyData.borderRadius) root.style.setProperty('--border-radius', legacyData.borderRadius);
    if (legacyData.baseSize) root.style.setProperty('--base-size', legacyData.baseSize);
};

const hexToRgb = (hex: string) => {
    // Basic sanitization to prevent CSS injection
    if (!/^#[0-9A-Fa-f]{6}$/i.test(hex)) {
        return '0, 0, 0'; // Fallback to black if invalid
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
};
