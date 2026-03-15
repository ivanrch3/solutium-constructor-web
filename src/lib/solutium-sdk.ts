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
        name: string;
        email: string;
        avatar?: string;
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
    crmData: {
        apiUrl: string;
        authToken: string;
        customers?: any[];
        leads?: any[];
    };
    productsData: {
        apiUrl: string;
        authToken: string;
        products?: any[];
        categories?: any[];
    };
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
    teamMembers?: {
        name: string;
        role: string;
        email: string;
        avatar?: string;
    }[];
    activeProjects?: {
        id: string;
        name: string;
        description?: string;
        status: string;
        updatedAt: number;
    }[];
    calendarConfig?: {
        timezone: string;
        workingDays: number[];
        openingTime: string;
        closingTime: string;
    };
    
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
                            crmData: payload.crmData || prev.crmData,
                            productsData: payload.productsData || prev.productsData
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

    const saveData = (data: any, metadata?: { status?: string, tags?: string[], author?: string, updatedAt?: number }) => {
        if (!config?.projectId) {
            console.error('[Solutium SDK] Cannot save: No Project ID configured.');
            return;
        }
        
        const message = {
            type: 'SOLUTIUM_SAVE',
            payload: {
                projectId: config.projectId,
                appId: 'web-constructor',
                timestamp: Date.now(),
                data: data,
                metadata: {
                    status: metadata?.status || 'draft',
                    tags: metadata?.tags || [],
                    author: metadata?.author || config.userProfile.name,
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
