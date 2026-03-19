/**
 * SOLUTIUM SATELLITE SDK
 * Version: 1.1.0
 * Protocol: S.I.P. v2
 */
import { useEffect, useState, useMemo, useRef } from 'react';
import { initSupabase } from './supabase';

export interface SolutiumPayload {
    userId: string;
    projectId: string;
    role: string;
    timestamp: number;
    scopes: string[];
    
    // S.I.P. v2 Core Fields
    userProfile: {
        id: string;
        fullName?: string;
        email?: string;
        avatarUrl?: string;
        role?: string;
        language?: string;
        phone?: string;
        uiStyle?: string;
        activeTheme?: string;
        fontFamily?: string;
        baseSize?: string;
        borderRadius?: string;
        themePreference?: string;
        coloredSidebarIcons?: boolean;
        subscriptionPlan?: string;
        onboardingCompleted?: boolean;
        emailItId?: string;
        updatedAt?: string;
        hasCompletedTour?: boolean;
        businessName?: string;
        schemaVersion?: string;
    };
    projectData: {
        name: string;
        colors: string[]; // [Primary, Secondary, Accent, Background, Surface, Text]
        logoUrl?: string;
        fontFamily?: string;
        baseSize?: string;
        borderRadius?: string;
        themePreset?: string;
        socials?: {
            facebook?: string;
            twitter?: string;
            instagram?: string;
            linkedin?: string;
            youtube?: string;
        };
    };
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
        createdAt?: string;
        updatedAt?: string;
        schemaVersion?: string;
        profilePhotoUrl?: string;
        companyLogoUrl?: string;
    }>;
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
        createdAt?: string;
        updatedAt?: string;
        schemaVersion?: string;
        photoUrl?: string;
    }>;
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
    teamMembersData?: Array<{
        id: string;
        name: string;
        email: string;
        role: string;
        avatarUrl?: string;
        status?: string;
        projectId?: string;
        profileId?: string;
        assignedAt?: string;
        userId?: string;
        schemaVersion?: string;
    }>;
    projectsData?: Array<{
        id: string;
        ownerId?: string;
        name: string;
        industry?: string;
        whatsapp?: string;
        email?: string;
        address?: string;
        website?: string;
        socials?: any;
        brandColors?: string[];
        logoUrl?: string;
        uiStyle?: string;
        activeTheme?: string;
        imageMappings?: any;
        isMaster?: boolean;
        createdAt?: string;
        updatedAt?: string;
        schemaVersion?: string;
        assets?: any[];
    }>;
    calendarConfig?: {
        timezone: string;
        workingDays: number[];
        openingTime: string;
        closingTime: string;
    };
    appsData?: Array<{
        id: string;
        name: string;
        url: string;
        description?: string;
        category?: string;
        logoUrl?: string;
        isoUrl?: string;
        icon?: string;
        status?: string;
        lifecycleStatus?: string;
        requiresPro?: boolean;
        isActive?: boolean;
        isComingSoon?: boolean;
        isNew?: boolean;
        isFeatured?: boolean;
        isCustom?: boolean;
        ownerId?: string;
        createdAt?: string;
        schemaVersion?: string;
    }>;
    projectAppsData?: Array<{
        projectId: string;
        appId: string;
        settings?: any;
        installedAt?: string;
        schemaVersion?: string;
    }>;
    integrationsData?: Array<{
        id: string;
        userId: string;
        provider: string;
        accessToken: string;
        refreshToken?: string;
        expiresAt?: string;
        metadata?: any;
        createdAt?: string;
        updatedAt?: string;
        schemaVersion?: string;
    }>;
    assetsData?: Array<{
        id: string;
        projectId?: string;
        name: string;
        type?: string;
        url?: string;
        originApp?: string;
        author?: string;
        status?: string;
        tags?: any;
        metadata?: any;
        createdAt?: string;
        updatedAt?: string;
        schemaVersion?: string;
    }>;
    profilesData?: Array<{
        id: string;
        fullName?: string;
        email?: string;
        avatarUrl?: string;
        role?: string;
        language?: string;
        phone?: string;
        uiStyle?: string;
        activeTheme?: string;
        fontFamily?: string;
        baseSize?: string;
        borderRadius?: string;
        themePreference?: string;
        coloredSidebarIcons?: boolean;
        subscriptionPlan?: string;
        onboardingCompleted?: boolean;
        emailItId?: string;
        updatedAt?: string;
        hasCompletedTour?: boolean;
        businessName?: string;
        schemaVersion?: string;
    }>;
    
    // Legacy/Extra fields
    projects?: any[];
}

export const useSolutium = () => {
    // 1. Intentar obtener token de la URL (flujo iframe/redirect) inmediatamente
    const initialConfig = useMemo(() => {
        if (typeof window === 'undefined') return null;
        try {
            const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
            const token = hashParams.get('token') || new URLSearchParams(window.location.search).get('token');
            if (token) {
                const base64Payload = token.split('.')[0];
                const decoded = JSON.parse(atob(base64Payload));
                return decoded;
            }
        } catch (e) {
            console.error('Error decodificando token inicial:', e);
        }
        return null;
    }, []);

    const [config, setConfig] = useState<SolutiumPayload | null>(initialConfig);
    const [loading, setLoading] = useState(!initialConfig);
    const [error, setError] = useState<string | null>(null);
    const isInitialized = useRef(false);

    // Aplicar tema inicial si existe configuración
    useEffect(() => {
        if (initialConfig?.projectData) {
            applyTheme(initialConfig.projectData);
        }
    }, [initialConfig]);

    useEffect(() => {
        // 2. Avisar a la App Madre que el satélite está listo para recibir la data pesada (solo una vez)
        if (window.opener) {
            window.opener.postMessage({ type: 'SOLUTIUM_SATELLITE_READY' }, '*');
        } else if (window.parent !== window) {
            window.parent.postMessage({ type: 'SOLUTIUM_SATELLITE_READY' }, '*');
        }

        const handleMessage = (event: MessageEvent) => {
            
            if (event.data?.type === 'SOLUTIUM_INIT' || event.data?.type === 'SOLUTIUM_CONFIG') {
                console.log("📦 [Satélite] Recibiendo payload pesado:", event.data.payload);
                
                const payload = event.data.payload as SolutiumPayload;
                console.log("DEBUG: Full Payload Received:", payload);
                
                // Apply Theme & Supabase
                if (payload.projectData) applyTheme(payload.projectData);
                if (payload.supabaseData?.url && payload.supabaseData?.anonKey) {
                    initSupabase(payload.supabaseData.url, payload.supabaseData.anonKey);
                }

             // Merge to avoid overwriting heavy data (crmData, productsData) with light data from URL token
                setConfig(prev => {
                    if (prev) {
                        return {
                            ...prev,
                            ...payload,
                            customersData: payload.customersData || prev.customersData,
                            productsData: payload.productsData || prev.productsData,
                            assetsData: payload.assetsData || prev.assetsData,
                            profilesData: payload.profilesData || prev.profilesData,
                            teamMembersData: payload.teamMembersData || prev.teamMembersData,
                            projectsData: payload.projectsData || prev.projectsData
                        };
                    }
                    return payload;
                });
                setLoading(false);
                
                // Enviar acuse de recibo a la App Madre
                if (event.source) {
                    (event.source as Window).postMessage({ type: 'SOLUTIUM_ACK' }, '*');
                }
            }
        };

        window.addEventListener('message', handleMessage);

        // Timeout de seguridad para mostrar mensaje de carga
        if (!initialConfig) {
            setTimeout(() => {
                setLoading(prev => {
                    if (prev) {
                        console.log('Cargando configuración desde la App Madre...');
                    }
                    return prev;
                });
            }, 1000);
        }

        return () => window.removeEventListener('message', handleMessage);
    }, [initialConfig]);

    const saveData = (assetId: string, data: any, metadata?: { name?: string, status?: string, tags?: string[], author?: string, updatedAt?: number }) => {
        if (!config?.projectId) {
            console.error('[Solutium SDK] Cannot save: No Project ID configured.');
            return;
        }
        if (!assetId) {
            console.error('[Solutium SDK] Cannot save: No Asset ID provided.');
            return;
        }
        
        const message = {
            type: 'SOLUTIUM_SAVE',
            payload: {
                projectId: config.projectId,
                appId: 'web-constructor',
                assetId: assetId,
                timestamp: Date.now(),
                data: data,
                metadata: {
                    name: metadata?.name || '',
                    status: metadata?.status || 'draft',
                    tags: metadata?.tags || [],
                    author: metadata?.author || config.userProfile?.fullName || 'Usuario',
                    updatedAt: metadata?.updatedAt || Date.now()
                }
            }
        };

        if (window.opener) {
            window.opener.postMessage(message, '*');
        } else if (window.parent !== window) {
            window.parent.postMessage(message, '*');
        }
    };

    return { config, isReady: !loading, saveData, error };
};

const applyTheme = (projectData: SolutiumPayload['projectData']) => {
    const root = document.documentElement;
    
    if (projectData.colors && Array.isArray(projectData.colors)) {
        if (projectData.colors[0]) root.style.setProperty('--color-primary-rgb', hexToRgb(projectData.colors[0]));
        if (projectData.colors[1]) root.style.setProperty('--color-secondary-rgb', hexToRgb(projectData.colors[1]));
        if (projectData.colors[2]) root.style.setProperty('--color-accent-rgb', hexToRgb(projectData.colors[2]));
        if (projectData.colors[3]) root.style.setProperty('--color-background-rgb', hexToRgb(projectData.colors[3]));
        if (projectData.colors[4]) root.style.setProperty('--color-surface-rgb', hexToRgb(projectData.colors[4]));
        if (projectData.colors[5]) root.style.setProperty('--color-text-rgb', hexToRgb(projectData.colors[5]));
    }

    if (projectData.fontFamily) root.style.setProperty('--font-family', projectData.fontFamily);
    if (projectData.borderRadius) root.style.setProperty('--border-radius', projectData.borderRadius);
    if (projectData.baseSize) root.style.setProperty('--base-size', projectData.baseSize);
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
