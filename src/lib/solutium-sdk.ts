/**
 * SOLUTIUM SATELLITE SDK
 * Version: 1.1.0
 * Protocol: S.I.P. v2
 */
import { useEffect, useState, useMemo, useRef } from 'react';
import { initSupabase } from './supabase';

export interface SolutiumPayload {
    user_id: string;
    project_id: string;
    role: string;
    timestamp: number;
    scopes: string[];
    
    // S.I.P. v2 Core Fields
    user_profile: {
        id: string;
        full_name?: string;
        email?: string;
        avatar_url?: string;
        role?: string;
        language?: string;
        phone?: string;
        ui_style?: string;
        active_theme?: string;
        font_family?: string;
        base_size?: string;
        border_radius?: string;
        theme_preference?: string;
        colored_sidebar_icons?: boolean;
        subscription_plan?: string;
        onboarding_completed?: boolean;
        email_it_id?: string;
        updated_at?: string;
        has_completed_tour?: boolean;
        business_name?: string;
        schema_version?: string;
    };
    project_data: {
        name: string;
        colors: string[]; // [Primary, Secondary, Accent, Background, Surface, Text]
        logo_url?: string;
        font_family?: string;
        base_size?: string;
        border_radius?: string;
        theme_preset?: string;
        socials?: {
            facebook?: string;
            twitter?: string;
            instagram?: string;
            linkedin?: string;
            youtube?: string;
        };
    };
    customers_data?: Array<{
        id: string;
        project_id?: string;
        name: string;
        email?: string;
        phone?: string;
        company?: string;
        role?: string;
        status?: string;
        source?: string;
        source_app_id?: string;
        business_id?: string;
        visibility?: string;
        assigned_business_ids?: any;
        last_activity?: string;
        notes?: string;
        app_data?: any;
        created_at?: string;
        updated_at?: string;
        schema_version?: string;
        profile_photo_url?: string;
        company_logo_url?: string;
    }>;
    products_data?: Array<{
        id: string;
        project_id?: string;
        name: string;
        description?: string;
        unit_cost?: number;
        type?: string;
        sku?: string;
        status?: string;
        business_id?: string;
        app_data?: any;
        created_at?: string;
        updated_at?: string;
        schema_version?: string;
        photo_url?: string;
    }>;
    supabase_data?: {
        url: string;
        anon_key: string;
    };
    current_asset?: {
        id: string;
        name: string;
        type: string;
        data?: any;
    };
    team_members_data?: Array<{
        id: string;
        name: string;
        email: string;
        role: string;
        avatar_url?: string;
        status?: string;
        project_id?: string;
        profile_id?: string;
        assigned_at?: string;
        user_id?: string;
        schema_version?: string;
    }>;
    projects_data?: Array<{
        id: string;
        owner_id?: string;
        name: string;
        industry?: string;
        whatsapp?: string;
        email?: string;
        address?: string;
        website?: string;
        socials?: any;
        brand_colors?: string[];
        logo_url?: string;
        ui_style?: string;
        active_theme?: string;
        image_mappings?: any;
        is_master?: boolean;
        created_at?: string;
        updated_at?: string;
        schema_version?: string;
        assets?: any[];
    }>;
    calendar_config?: {
        timezone: string;
        working_days: number[];
        opening_time: string;
        closing_time: string;
    };
    apps_data?: Array<{
        id: string;
        name: string;
        url: string;
        description?: string;
        category?: string;
        logo_url?: string;
        iso_url?: string;
        icon?: string;
        status?: string;
        lifecycle_status?: string;
        requires_pro?: boolean;
        is_active?: boolean;
        is_coming_soon?: boolean;
        is_new?: boolean;
        is_featured?: boolean;
        is_custom?: boolean;
        owner_id?: string;
        created_at?: string;
        schema_version?: string;
    }>;
    project_apps_data?: Array<{
        project_id: string;
        app_id: string;
        settings?: any;
        installed_at?: string;
        schema_version?: string;
    }>;
    integrations_data?: Array<{
        id: string;
        user_id: string;
        provider: string;
        access_token: string;
        refresh_token?: string;
        expires_at?: string;
        metadata?: any;
        created_at?: string;
        updated_at?: string;
        schema_version?: string;
    }>;
    assets_data?: Array<{
        id: string;
        project_id?: string;
        name: string;
        type?: string;
        url?: string;
        origin_app?: string;
        author?: string;
        status?: string;
        tags?: any;
        metadata?: any;
        created_at?: string;
        updated_at?: string;
        schema_version?: string;
    }>;
    profiles_data?: Array<{
        id: string;
        full_name?: string;
        email?: string;
        avatar_url?: string;
        role?: string;
        language?: string;
        phone?: string;
        ui_style?: string;
        active_theme?: string;
        font_family?: string;
        base_size?: string;
        border_radius?: string;
        theme_preference?: string;
        colored_sidebar_icons?: boolean;
        subscription_plan?: string;
        onboarding_completed?: boolean;
        email_it_id?: string;
        updated_at?: string;
        has_completed_tour?: boolean;
        business_name?: string;
        schema_version?: string;
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
        if (initialConfig?.project_data) {
            applyTheme(initialConfig.project_data);
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
                if (payload.project_data) applyTheme(payload.project_data);
                if (payload.supabase_data?.url && payload.supabase_data?.anon_key) {
                    initSupabase(payload.supabase_data.url, payload.supabase_data.anon_key);
                }

             // Merge to avoid overwriting heavy data (crm_data, products_data) with light data from URL token
                setConfig(prev => {
                    if (prev) {
                        return {
                            ...prev,
                            ...payload,
                            customers_data: payload.customers_data || prev.customers_data,
                            products_data: payload.products_data || prev.products_data,
                            assets_data: payload.assets_data || prev.assets_data,
                            profiles_data: payload.profiles_data || prev.profiles_data,
                            team_members_data: payload.team_members_data || prev.team_members_data,
                            projects_data: payload.projects_data || prev.projects_data
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

    const saveData = (data: any, metadata?: { status?: string, tags?: string[], author?: string, updated_at?: number }) => {
        if (!config?.project_id) {
            console.error('[Solutium SDK] Cannot save: No Project ID configured.');
            return;
        }
        
        const message = {
            type: 'SOLUTIUM_SAVE',
            payload: {
                project_id: config.project_id,
                app_id: 'web-constructor',
                timestamp: Date.now(),
                data: data,
                metadata: {
                    status: metadata?.status || 'draft',
                    tags: metadata?.tags || [],
                    author: metadata?.author || config.user_profile?.full_name || 'Usuario',
                    updated_at: metadata?.updated_at || Date.now()
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

const applyTheme = (project_data: SolutiumPayload['project_data']) => {
    const root = document.documentElement;
    
    if (project_data.colors && Array.isArray(project_data.colors)) {
        if (project_data.colors[0]) root.style.setProperty('--color-primary-rgb', hexToRgb(project_data.colors[0]));
        if (project_data.colors[1]) root.style.setProperty('--color-secondary-rgb', hexToRgb(project_data.colors[1]));
        if (project_data.colors[2]) root.style.setProperty('--color-accent-rgb', hexToRgb(project_data.colors[2]));
        if (project_data.colors[3]) root.style.setProperty('--color-background-rgb', hexToRgb(project_data.colors[3]));
        if (project_data.colors[4]) root.style.setProperty('--color-surface-rgb', hexToRgb(project_data.colors[4]));
        if (project_data.colors[5]) root.style.setProperty('--color-text-rgb', hexToRgb(project_data.colors[5]));
    }

    if (project_data.font_family) root.style.setProperty('--font-family', project_data.font_family);
    if (project_data.border_radius) root.style.setProperty('--border-radius', project_data.border_radius);
    if (project_data.base_size) root.style.setProperty('--base-size', project_data.base_size);
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
