import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Play } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { TextRenderer } from '../TextRenderer';
import { ParallaxBackground, useParallaxScrollProgress } from '../ParallaxBackground';
import { RotatingText } from '../RotatingText';
import { InlineEditableText } from '../InlineEditableText';
import { SectionAnimation } from '../animations/SectionAnimation';
import { parseNumSafe } from '../utils';
import { useEditorStore } from '../../../store/editorStore';
import { normalizeSectionAnimation } from '../../../constants/moduleAnimations';
import { getProjectThemeFromSettings, resolveBrandColor } from '../../../utils/projectTheme';

import { logDebug } from '../../../utils/debug';

export const HeroModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any>,
  logoUrl?: string | null,
  logoWhiteUrl?: string | null,
  isPreviewMode?: boolean
}> = ({ moduleId, settingsValues, logoUrl, logoWhiteUrl, isPreviewMode = false }) => {
  const { updateSectionSettings, selectSection, selectElement } = useEditorStore();
  
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    
    if (settingsValues[key] !== undefined) {
      const val = settingsValues[key];
      return (val && typeof val === 'object' && 'value' in val && !Array.isArray(val)) ? val.value : val;
    }

    // PROTOCOLO SOLUTIUM v7.8: Búsqueda resiliente (con/sin prefijo de moduleId)
    // Útil para contratos publicados donde las keys en style_json no llevan el ID de instancia
    if (elementId && elementId.startsWith(`${moduleId}_`)) {
      const fallbackElementId = elementId.replace(`${moduleId}_`, '');
      const fallbackKey = `${fallbackElementId}_${settingId}`;
      if (settingsValues[fallbackKey] !== undefined) {
        const val = settingsValues[fallbackKey];
        return (val && typeof val === 'object' && 'value' in val && !Array.isArray(val)) ? val.value : val;
      }
    }
    
    // También intentar buscar el settingId directamente si es global
    if (!elementId) {
      if (settingsValues[settingId] !== undefined) return settingsValues[settingId];
    }

    return defaultValue;
  };

  const toBoolean = (value: unknown) => {
    return value === true || value === 'true' || value === 1 || value === '1';
  };

  const resolveThemeColor = (
    value: string | undefined,
    lightDefault: string,
    darkDefault: string,
    darkMode: boolean
  ) => {
    const safeValue = String(value || '').trim();
    const safeLight = String(lightDefault || '').trim().toLowerCase();

    if (!darkMode) {
      return safeValue || lightDefault;
    }

    if (!safeValue || safeValue.toLowerCase() === safeLight) {
      return darkDefault;
    }

    return safeValue;
  };

  const isDarkColor = (value: string | undefined) => {
    if (!value) return false;
    const safe = value.trim();
    const hex = safe.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);

    if (hex) {
      let normalized = hex[1];
      if (normalized.length === 3) {
        normalized = normalized.split('').map(char => char + char).join('');
      }

      const r = parseInt(normalized.slice(0, 2), 16);
      const g = parseInt(normalized.slice(2, 4), 16);
      const b = parseInt(normalized.slice(4, 6), 16);
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      return luminance < 0.45;
    }

    const rgb = safe.match(/^rgba?\(([^)]+)\)$/i);
    if (rgb) {
      const parts = rgb[1]
        .split(',')
        .map(part => Number(part.trim()))
        .filter(part => !Number.isNaN(part));

      if (parts.length >= 3) {
        const [r, g, b] = parts;
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        return luminance < 0.45;
      }
    }

    return false;
  };

  const sanitizeDarkBackgroundColor = (value: string | undefined, fallback: string) => {
    return isDarkColor(value) ? String(value).trim() : fallback;
  };

  const sanitizeDarkGradient = (value: string | undefined, fallback: string) => {
    if (!value || typeof value !== 'string') return fallback;
    const matches = value.match(/#(?:[0-9a-f]{3}|[0-9a-f]{6})/gi) || [];
    if (matches.length === 0) return fallback;
    return matches.every(color => isDarkColor(color)) ? value : fallback;
  };

  /**
   * PROTOCOLO SOLUTIUM v8.1: Normalización robusta de items rotativos.
   * Acepta arrays de objetos, arrays de strings o strings delimitados.
   */
  const normalizeRotatingItems = (raw: any): string[] => {
    if (!raw) return [];
    
    // Si es un string (ej. multilinea de un textarea)
    if (typeof raw === 'string') {
      return raw.split(/\n|,|;/).map(s => s.trim()).filter(Boolean);
    }
    
    // Si es un array (estándar de repeater)
    if (Array.isArray(raw)) {
      return raw.map(item => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        if (typeof item === 'object') {
          // Intentar varias propiedades comunes según evolución del registry
          return item.text || item.phrase || item.label || item.value || '';
        }
        return String(item);
      }).filter(Boolean);
    }
    
    return [];
  };

  const containerRef = React.useRef(null);
  const { scrollYProgress } = useParallaxScrollProgress(containerRef);

  // Global Settings
  const layout = getVal(null, 'layout', 'split');
  
  logDebug('[SOLUTIUM_RENDER_DEBUG]', {
    moduleId,
    finalLayout: layout,
    finalBgType: getVal(null, 'bg_type', 'color'),
    finalPrimaryText: getVal(`${moduleId}_el_hero_ctas`, 'primary_text', ''),
    finalPrimaryUrl: getVal(`${moduleId}_el_hero_ctas`, 'primary_url', ''),
    finalEyebrow: getVal(`${moduleId}_el_hero_typography`, 'eyebrow', ''),
    finalEyebrowColor: getVal(`${moduleId}_el_hero_typography`, 'eyebrow_color', ''),
    finalEyebrowBg: getVal(`${moduleId}_el_hero_typography`, 'eyebrow_bg', ''),
    finalAlign: getVal(`${moduleId}_el_hero_typography`, 'align', 'inherit')
  });

  const height = getVal(null, 'height', 'screen');
  const verticalAlign = getVal(null, 'vertical_align', 'start');
  const maxWidth = parseNumSafe(getVal(null, 'max_width', 1200), 1200);
  const paddingY = parseNumSafe(getVal(null, 'padding_y', 40), 40);
  const darkMode = toBoolean(getVal(null, 'dark_mode', false));
  const bgType = getVal(null, 'bg_type', 'color');
  const rawBgColor = getVal(null, 'bg_color', '#FFFFFF');
  const darkModeBgFallback = '#0F172A';
  const darkModeGradientFallback = 'linear-gradient(135deg, #020617 0%, #0F172A 55%, #1E293B 100%)';
  const bgColor = darkMode
    ? sanitizeDarkBackgroundColor(rawBgColor, darkModeBgFallback)
    : resolveThemeColor(rawBgColor, '#FFFFFF', darkModeBgFallback, false);
  const rawBgGradient = getVal(null, 'bg_gradient', 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)');
  const bgGradient = darkMode
    ? sanitizeDarkGradient(rawBgGradient, darkModeGradientFallback)
    : rawBgGradient;
  const overlayColor = getVal(null, 'overlay_color', '#000000');
  const overlayOpacity = parseNumSafe(getVal(null, 'overlay_opacity', 0), 0);
  const globalThemeSectionAnimationSpeed = parseNumSafe(settingsValues['global_theme_section_animation_speed'], 1);
  const globalThemeSectionAnimation = settingsValues['global_theme_section_animation'];
  const moduleSectionAnimation = getVal(null, 'section_animation', undefined);
  const entranceAnim = getVal(null, 'entrance_anim', 'fade_up');
  const sectionAnimation = normalizeSectionAnimation(
    globalThemeSectionAnimation ?? moduleSectionAnimation ?? entranceAnim,
    'fade-up'
  );
  const projectTheme = getProjectThemeFromSettings(settingsValues);

  // Multimedia (Parallax Background)
  const bgParallaxEnabled = getVal(null, 'bg_parallax_enabled', false);
  const bgParallaxImg = getVal(null, 'bg_parallax_img', '');
  const bgParallaxOpacity = parseNumSafe(getVal(null, 'bg_parallax_opacity', 20), 20);
  const bgParallaxOverlay = getVal(null, 'bg_parallax_overlay', '#000000');
  const bgParallaxSpeed = parseNumSafe(getVal(null, 'bg_parallax_speed', 100), 100);

  // Element: Typography
  const eyebrow = getVal(`${moduleId}_el_hero_typography`, 'eyebrow', 'NUEVA SOLUCIÓN');
  const title = getVal(`${moduleId}_el_hero_typography`, 'title', 'Transforma tu presencia digital hoy');
  const subtitle = getVal(`${moduleId}_el_hero_typography`, 'subtitle', 'Construimos el futuro de tu marca con herramientas de última generación.');
  const titleMode = getVal(
    `${moduleId}_el_hero_typography`,
    'title_mode',
    getVal(`${moduleId}_el_hero_typography`, 'rotating_enabled', false) ? 'dynamic' : 'static'
  );
  const titleSize = getVal(`${moduleId}_el_hero_typography`, 'title_size', 't1');
  const titleWeight = getVal(`${moduleId}_el_hero_typography`, 'title_weight', 'bold');
  const subtitleSize = getVal(`${moduleId}_el_hero_typography`, 'subtitle_size', 'p');
  const subtitleWeight = getVal(`${moduleId}_el_hero_typography`, 'subtitle_weight', 'normal');
  const rawTitleColor = getVal(`${moduleId}_el_hero_typography`, 'title_color', '#0F172A');
  const titleColor = darkMode
    ? '#F8FAFC'
    : resolveBrandColor({
        value: rawTitleColor,
        defaultValue: '#0F172A',
        token: 'text',
        projectTheme
      });
  const rawSubtitleColor = getVal(`${moduleId}_el_hero_typography`, 'subtitle_color', '#475569');
  const subtitleColor = darkMode
    ? '#CBD5E1'
    : resolveBrandColor({
        value: rawSubtitleColor,
        defaultValue: '#475569',
        token: 'muted',
        projectTheme
      });
  
  // Highlight Settings
  const titleHighlightType = getVal(`${moduleId}_el_hero_typography`, 'title_highlight_type', 'gradient');
  const rawTitleHighlightColor = getVal(`${moduleId}_el_hero_typography`, 'title_highlight_color', '#3B82F6');
  const titleHighlightColor = darkMode ? '#93C5FD' : resolveBrandColor({
    value: rawTitleHighlightColor,
    defaultValue: '#3B82F6',
    token: 'primary',
    projectTheme
  });
  const rawTitleHighlightGradient = getVal(`${moduleId}_el_hero_typography`, 'title_highlight_gradient', 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)');
  const titleHighlightGradient = darkMode ? 'linear-gradient(90deg, #93C5FD 0%, #C4B5FD 100%)' : resolveBrandColor({
    value: rawTitleHighlightGradient,
    defaultValue: [
      'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)',
      'linear-gradient(90deg,#3B82F6 0%,#8B5CF6 100%)'
    ],
    token: 'primary',
    projectTheme: {
      ...projectTheme,
      primary: `linear-gradient(90deg, ${projectTheme.primary} 0%, ${projectTheme.secondary} 100%)`
    }
  });
  const titleHighlightBold = getVal(`${moduleId}_el_hero_typography`, 'title_highlight_bold', true);

  // Rotating Text Settings
  const rotatingEnabled = titleMode === 'dynamic';
  const rotatingFixed = getVal(`${moduleId}_el_hero_typography`, 'rotating_fixed', 'Solutium es la mejor alternativa para ');
  
  // Búsqueda de items con fallback de IDs
  let rawRotatingOptions = getVal(`${moduleId}_el_hero_typography`, 'rotating_options', null);
  if (!rawRotatingOptions) rawRotatingOptions = getVal(`${moduleId}_el_hero_typography`, 'rotating_items', null);
  if (!rawRotatingOptions) rawRotatingOptions = getVal(`${moduleId}_el_hero_typography`, 'rotating_words', null);
  if (!rawRotatingOptions) rawRotatingOptions = [];

  const rotatingOptions = normalizeRotatingItems(rawRotatingOptions);

  logDebug('[HERO_DYNAMIC_TEXT_DEBUG]', {
    moduleId,
    rotatingEnabled,
    rotatingFixed,
    rawRotatingOptions,
    normalizedCount: rotatingOptions.length,
    rotatingOptions,
    titleFallback: title
  });

  const rotatingAnim = getVal(`${moduleId}_el_hero_typography`, 'rotating_anim', 'fade');
  const rotatingSpeed = getVal(`${moduleId}_el_hero_typography`, 'rotating_speed', 3000);
  const rawRotatingColor = getVal(`${moduleId}_el_hero_typography`, 'rotating_color', '#3B82F6');
  const rotatingColor = darkMode ? '#E2E8F0' : resolveBrandColor({
    value: rawRotatingColor,
    defaultValue: '#3B82F6',
    token: 'primary',
    projectTheme
  });
  const rawRotatingGradient = getVal(`${moduleId}_el_hero_typography`, 'rotating_gradient', '');
  const rotatingGradient = typeof rawRotatingGradient === 'string' && rawRotatingGradient.trim() !== ''
    ? (darkMode ? 'linear-gradient(90deg, #93C5FD 0%, #C4B5FD 100%)' : resolveBrandColor({
        value: rawRotatingGradient,
        defaultValue: [
          'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)',
          'linear-gradient(90deg,#3B82F6 0%,#8B5CF6 100%)'
        ],
        token: 'primary',
        projectTheme: {
          ...projectTheme,
          primary: `linear-gradient(90deg, ${projectTheme.primary} 0%, ${projectTheme.secondary} 100%)`
        }
      }))
    : '';

  const subtitleHighlightType = getVal(`${moduleId}_el_hero_typography`, 'subtitle_highlight_type', 'gradient');
  const rawSubtitleHighlightColor = getVal(`${moduleId}_el_hero_typography`, 'subtitle_highlight_color', '#3B82F6');
  const subtitleHighlightColor = darkMode ? '#93C5FD' : resolveBrandColor({
    value: rawSubtitleHighlightColor,
    defaultValue: '#3B82F6',
    token: 'primary',
    projectTheme
  });
  const rawSubtitleHighlightGradient = getVal(`${moduleId}_el_hero_typography`, 'subtitle_highlight_gradient', 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)');
  const subtitleHighlightGradient = darkMode ? 'linear-gradient(90deg, #93C5FD 0%, #C4B5FD 100%)' : resolveBrandColor({
    value: rawSubtitleHighlightGradient,
    defaultValue: [
      'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)',
      'linear-gradient(90deg,#3B82F6 0%,#8B5CF6 100%)'
    ],
    token: 'primary',
    projectTheme: {
      ...projectTheme,
      primary: `linear-gradient(90deg, ${projectTheme.primary} 0%, ${projectTheme.secondary} 100%)`
    }
  });
  const subtitleHighlightBold = getVal(`${moduleId}_el_hero_typography`, 'subtitle_highlight_bold', true);

  const eyebrowBg = getVal(`${moduleId}_el_hero_typography`, 'eyebrow_bg', 'rgba(59, 130, 246, 0.1)');
  const rawEyebrowColor = getVal(`${moduleId}_el_hero_typography`, 'eyebrow_color', '#3B82F6');
  const eyebrowColor = darkMode ? '#BFDBFE' : resolveBrandColor({
    value: rawEyebrowColor,
    defaultValue: '#3B82F6',
    token: 'primary',
    projectTheme
  });
  const safeEyebrowBg = darkMode ? 'rgba(148, 163, 184, 0.16)' : eyebrowBg;
  const typographyAlign = getVal(`${moduleId}_el_hero_typography`, 'align', 'inherit');
  const typographyMarginB = parseNumSafe(getVal(`${moduleId}_el_hero_typography`, 'margin_b', 0), 0);
  const rawProofColor = getVal(`${moduleId}_el_hero_social_proof`, 'proof_color', '#475569');
  const proofColor = darkMode
    ? '#CBD5E1'
    : resolveBrandColor({
        value: rawProofColor,
        defaultValue: '#475569',
        token: 'muted',
        projectTheme
      });

  // Element: Media
  const mediaType = getVal(`${moduleId}_el_hero_media`, 'media_type', 'image');
  const defaultVisualImage = 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1440&auto=format&fit=crop';
  const visualImage = getVal(`${moduleId}_el_hero_media`, 'image', defaultVisualImage) || defaultVisualImage;
  const visualVideo = getVal(`${moduleId}_el_hero_media`, 'video_url', '');
  const visualRadius = parseNumSafe(getVal(`${moduleId}_el_hero_media`, 'border_radius', 24), 24);
  const visualShadow = getVal(`${moduleId}_el_hero_media`, 'shadow', 'lg');
  const visualFit = getVal(`${moduleId}_el_hero_media`, 'object_fit', 'cover');
  const transparentMedia = toBoolean(getVal(`${moduleId}_el_hero_media`, 'transparent_media', false));
  const perspective = parseNumSafe(getVal(`${moduleId}_el_hero_media`, 'perspective', 1000), 1000);
  const rotationY = parseNumSafe(getVal(`${moduleId}_el_hero_media`, 'rotation_y', 15), 15);
  const floatingAnim = getVal(`${moduleId}_el_hero_media`, 'floating_anim', true);
  const isLikelyTransparentVisual = mediaType === 'image' && typeof visualImage === 'string' && (
    /\.png($|[?#])/i.test(visualImage) ||
    /\.svg($|[?#])/i.test(visualImage) ||
    /format=png/i.test(visualImage) ||
    /transparent/i.test(visualImage)
  );
  const shouldRenderTransparentMedia = mediaType === 'image' && (transparentMedia || isLikelyTransparentVisual);

  // Element: CTAs
  const primaryText = getVal(`${moduleId}_el_hero_ctas`, 'primary_text', 'Comenzar Ahora');
  const primaryIcon = getVal(`${moduleId}_el_hero_ctas`, 'primary_icon', 'ArrowRight');
  const primaryType = getVal(`${moduleId}_el_hero_ctas`, 'primary_link_type', 'external');
  const primaryUrl = getVal(`${moduleId}_el_hero_ctas`, 'primary_url', '#');
  const primaryTarget = getVal(`${moduleId}_el_hero_ctas`, 'primary_target', '_self');
  
  const secondaryText = getVal(`${moduleId}_el_hero_ctas`, 'secondary_text', 'Saber Más');
  const secondaryIcon = getVal(`${moduleId}_el_hero_ctas`, 'secondary_icon', '');
  const secondaryType = getVal(`${moduleId}_el_hero_ctas`, 'secondary_link_type', 'external');
  const secondaryUrl = getVal(`${moduleId}_el_hero_ctas`, 'secondary_url', '#');
  const secondaryTarget = getVal(`${moduleId}_el_hero_ctas`, 'secondary_target', '_self');

  const showPrimary = toBoolean(getVal(`${moduleId}_el_hero_ctas`, 'show_primary', true));
  const showSecondary = toBoolean(getVal(`${moduleId}_el_hero_ctas`, 'show_secondary', true));

  const isValidCta = (text?: string, url?: string) => {
    const safeText = String(text || '').trim();
    const safeUrl = String(url || '').trim();
    return safeText !== '' && (safeUrl === '' || safeUrl === '#' || safeUrl.startsWith('#') || safeUrl.startsWith('/') || /^https?:/i.test(safeUrl));
  };

  const hasPrimary = showPrimary && isValidCta(primaryText, primaryUrl);
  const hasSecondary = showSecondary && isValidCta(secondaryText, secondaryUrl);

  const rawPrimaryBg = getVal(`${moduleId}_el_hero_ctas`, 'primary_bg', 'var(--primary-color)');
  const primaryBg = resolveBrandColor({
    value: rawPrimaryBg,
    defaultValue: ['var(--primary-color)', '#3B82F6', '#2563EB'],
    token: 'primary',
    projectTheme
  });
  const primaryColor = getVal(`${moduleId}_el_hero_ctas`, 'primary_color', '#FFFFFF');
  const secondaryStyle = getVal(`${moduleId}_el_hero_ctas`, 'secondary_style', 'outline');
  const shimmerEffect = getVal(`${moduleId}_el_hero_ctas`, 'shimmer_effect', false);
  const hoverEffect = getVal(`${moduleId}_el_hero_ctas`, 'hover_effect', 'lift');
  const btnRadius = parseNumSafe(getVal(`${moduleId}_el_hero_ctas`, 'btn_radius', 16), 16);
  const btnWidthMobile = getVal(`${moduleId}_el_hero_ctas`, 'btn_width', 'auto');

  // Element: Social Proof
  const showProof = getVal(`${moduleId}_el_hero_social_proof`, 'show_proof', true);
  const proofText = getVal(`${moduleId}_el_hero_social_proof`, 'proof_text', 'Confiado por +500 empresas');
  const rawAvatars = getVal(`${moduleId}_el_hero_social_proof`, 'avatars', []);
  const avatars = Array.isArray(rawAvatars) ? rawAvatars : [];
  const proofFontSize = getVal(`${moduleId}_el_hero_social_proof`, 'font_size', 's');
  const proofWeight = getVal(`${moduleId}_el_hero_social_proof`, 'font_weight', 'bold');
  const proofMarginB = parseNumSafe(getVal(`${moduleId}_el_hero_social_proof`, 'margin_b', 0), 0);

  const IconRenderer = ({ name, size = 16, className = "" }: { name: string, size?: number, className?: string }) => {
    const IconComponent = (LucideIcons as any)[name];
    if (!IconComponent) return null;
    return <IconComponent size={size} className={className} />;
  };

  const getTypographyStyle = (sizeToken: string, weightToken: string) => {
    const size = TYPOGRAPHY_SCALE[sizeToken as keyof typeof TYPOGRAPHY_SCALE] || TYPOGRAPHY_SCALE.p;
    const weight = FONT_WEIGHTS[weightToken as keyof typeof FONT_WEIGHTS] || FONT_WEIGHTS.normal;
    return {
      fontSize: `${size.fontSize}px`,
      lineHeight: size.lineHeight,
      fontWeight: weight.value,
    } as React.CSSProperties;
  };

  const sectionHeight = !showProof
    ? height === 'screen' ? 'min-h-[82vh]' :
      height === 'large' ? 'min-h-[70vh]' :
      height === 'medium' ? 'min-h-[52vh]' : 'min-h-auto'
    : height === 'screen' ? 'min-h-screen' :
      height === 'large' ? 'min-h-[80vh]' :
      height === 'medium' ? 'min-h-[60vh]' : 'min-h-auto';
  const contentBottomPadding = height === 'screen'
    ? Math.max(16, Math.round(paddingY * 0.35))
    : Math.max(16, Math.round(paddingY * 0.6));

  const renderContent = (forcedAlign?: 'left' | 'center' | 'right') => {
    const inheritedAlign = forcedAlign || 'left';
    const finalAlign = typographyAlign === 'inherit' ? inheritedAlign : typographyAlign;
    const titleWidthClass = layout === 'center' || layout === 'full_bg'
      ? 'max-w-[13ch] sm:max-w-[14ch]'
      : 'max-w-[12ch] sm:max-w-[13ch] lg:max-w-[14ch]';
    const subtitleWidthClass = layout === 'center' || layout === 'full_bg'
      ? 'max-w-[34ch]'
      : 'max-w-[40ch]';
    const proofTextWidthClass = 'max-w-[28ch]';
    const ctaTextClass = 'text-center whitespace-normal break-words [overflow-wrap:anywhere] leading-tight';
    
    return (
      <motion.div 
        className={`flex flex-col w-full relative z-30 ${
          finalAlign === 'center' ? 'items-center text-center mx-auto' : 
          finalAlign === 'right' ? 'items-end text-right ml-auto' : 
          'items-start text-left mr-auto'
        } gap-6 max-w-3xl overflow-hidden`}
        style={{ marginBottom: `${typographyMarginB}px` }}
      >
      {eyebrow && (
        <InlineEditableText
          moduleId={moduleId}
          elementId={`${moduleId}_el_hero_typography`}
          settingId="eyebrow"
          value={eyebrow}
          tagName="span"
          isPreviewMode={isPreviewMode}
          className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
          style={{ backgroundColor: safeEyebrowBg, color: eyebrowColor, display: 'inline-block' }}
        />
      )}
      
      <motion.h1 
        className={`leading-[1.1] tracking-tight w-full break-words [overflow-wrap:anywhere] ${titleWidthClass}`}
        style={{ 
          ...getTypographyStyle(titleSize, titleWeight),
          color: titleColor,
          textWrap: 'balance'
        }}
      >
        {rotatingEnabled && rotatingOptions.length > 0 ? (
          <RotatingText 
            fixedText={rotatingFixed}
            options={rotatingOptions}
            color={rotatingColor}
            gradient={rotatingGradient}
            speed={rotatingSpeed}
            animationType={rotatingAnim as any}
            moduleId={moduleId}
            isPreviewMode={isPreviewMode}
            align={finalAlign}
            onSaveFixed={(val) => {
              updateSectionSettings(moduleId, { [`${moduleId}_el_hero_typography_rotating_fixed`]: val });
            }}
            onSaveOption={(idx, val) => {
              // Reconstruir array de objetos para persistencia (usando 'text' como ID del registry)
              const rawItemsArray = Array.isArray(rawRotatingOptions) ? rawRotatingOptions : [];
              const newOptions = [...rawItemsArray];
              newOptions[idx] = typeof newOptions[idx] === 'object' 
                ? { ...newOptions[idx], text: val }
                : { text: val };
              
              updateSectionSettings(moduleId, { [`${moduleId}_el_hero_typography_rotating_options`]: newOptions });
            }}
          />
        ) : (
          <InlineEditableText
            moduleId={moduleId}
            elementId={`${moduleId}_el_hero_typography`}
            settingId="title"
            value={title}
            tagName="span"
            isPreviewMode={isPreviewMode}
            className="inline-block max-w-full break-words [overflow-wrap:anywhere]"
            style={{ display: 'inline-block' }}
          >
            <TextRenderer 
              text={title} 
              highlightType={titleHighlightType}
              highlightColor={titleHighlightColor}
              highlightGradient={titleHighlightGradient}
              highlightBold={titleHighlightBold}
            />
          </InlineEditableText>
        )}
      </motion.h1>

      {subtitle && (
          <motion.p
          className={`text-lg leading-relaxed w-full break-words [overflow-wrap:anywhere] ${subtitleWidthClass}`}
          style={{ 
            ...getTypographyStyle(subtitleSize, subtitleWeight),
            color: subtitleColor,
            textWrap: 'pretty'
          }}
        >
          <InlineEditableText
            moduleId={moduleId}
            elementId={`${moduleId}_el_hero_typography`}
            settingId="subtitle"
            value={subtitle}
            tagName="span"
            isPreviewMode={isPreviewMode}
            className="inline-block max-w-full break-words [overflow-wrap:anywhere]"
            style={{ display: 'inline-block', width: '100%' }}
          >
            <TextRenderer 
              text={subtitle} 
              highlightType={subtitleHighlightType}
              highlightColor={subtitleHighlightColor}
              highlightGradient={subtitleHighlightGradient}
              highlightBold={subtitleHighlightBold}
            />
          </InlineEditableText>
        </motion.p>
      )}

        <motion.div 
          className={`flex flex-wrap gap-4 w-full ${
            finalAlign === 'center' ? 'justify-center' : finalAlign === 'right' ? 'justify-end' : 'justify-start'
          }`}
        >
        {hasPrimary && (
            <motion.a 
              href={primaryUrl || '#'}
              target={primaryTarget === '_blank' ? '_blank' : undefined}
              rel={primaryTarget === '_blank' ? 'noopener noreferrer' : undefined}
              whileHover={hoverEffect === 'lift' ? { y: -5 } : {}}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                if (isPreviewMode) return;
                e.stopPropagation();
                selectSection(moduleId);
                selectElement(`${moduleId}_el_hero_ctas`);
              }}
              className={`group relative overflow-hidden flex items-center justify-center gap-2 px-8 py-4 font-black uppercase tracking-widest text-[11px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${btnWidthMobile === 'full' ? 'w-full sm:w-auto' : 'w-auto'}`}
              style={{ 
                backgroundColor: primaryBg,
                color: primaryColor,
                minHeight: '56px',
                borderRadius: `${btnRadius}px`,
                boxShadow: 'none'
              }}
            >
              {shimmerEffect && (
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              )}
              <InlineEditableText
                moduleId={moduleId}
                elementId={`${moduleId}_el_hero_ctas`}
                settingId="primary_text"
                value={primaryText}
                tagName="span"
                isPreviewMode={isPreviewMode}
                className={ctaTextClass}
              />
              {primaryIcon && <IconRenderer name={primaryIcon} className="group-hover:translate-x-1 transition-transform" />}
            </motion.a>
        )}

        {hasSecondary && (
          <motion.a 
            href={secondaryUrl || '#'}
            target={secondaryTarget === '_blank' ? '_blank' : undefined}
            rel={secondaryTarget === '_blank' ? 'noopener noreferrer' : undefined}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              if (isPreviewMode) return;
              e.stopPropagation();
              selectSection(moduleId);
              selectElement(`${moduleId}_el_hero_ctas`);
            }}
            className={`flex items-center justify-center gap-2 px-8 py-4 font-black uppercase tracking-widest text-[11px] transition-all ${btnWidthMobile === 'full' ? 'w-full sm:w-auto' : 'w-auto'}`}
            style={{ 
              backgroundColor: secondaryStyle === 'solid' ? (darkMode ? '#334155' : '#F1F5F9') : 'transparent',
              color: darkMode ? '#FFFFFF' : '#0F172A',
              border: secondaryStyle === 'outline' ? `2px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` : 'none',
              minHeight: '56px',
              borderRadius: `${btnRadius}px`
            }}
          >
            <InlineEditableText
              moduleId={moduleId}
              elementId={`${moduleId}_el_hero_ctas`}
              settingId="secondary_text"
              value={secondaryText}
              tagName="span"
              isPreviewMode={isPreviewMode}
              className={ctaTextClass}
            />
            {secondaryIcon && <IconRenderer name={secondaryIcon} />}
          </motion.a>
        )}
      </motion.div>

      {showProof && (
          <motion.div 
            className="flex w-full max-w-full flex-wrap items-center gap-4 mt-4"
            style={{ marginBottom: `${proofMarginB}px` }}
          >
            <div className="flex -space-x-3">
            {[1,2,3,4].map((_, i: number) => {
              const baseSize = TYPOGRAPHY_SCALE[proofFontSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 12;
              const avatarSize = Math.max(32, baseSize * 2.5);
              
              // Protocol v8.2: Enhanced fallback for avatars
              let avatarUrl = '';
              if (avatars && avatars[i]) {
                avatarUrl = typeof avatars[i] === 'string' ? avatars[i] : (avatars[i].img || avatars[i].url || '');
              }
              
              if (!avatarUrl) {
                avatarUrl = `https://i.pravatar.cc/150?u=${i + (moduleId || 'hero')}`;
              }
              
              return (
                <div 
                  key={i} 
                  className="rounded-full border-2 border-white overflow-hidden bg-slate-100"
                  style={{ 
                    width: `${avatarSize}px`, 
                    height: `${avatarSize}px`,
                    borderColor: darkMode ? '#0F172A' : '#FFFFFF' 
                  }}
                >
                  <img 
                    src={avatarUrl} 
                    alt={`User ${i}`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              );
            })}
          </div>
          <InlineEditableText
            moduleId={moduleId}
            elementId={`${moduleId}_el_hero_social_proof`}
            settingId="proof_text"
            value={proofText}
            tagName="span"
            isPreviewMode={isPreviewMode}
            className={`opacity-60 uppercase tracking-wider break-words [overflow-wrap:anywhere] ${proofTextWidthClass}`}
            style={{ 
              color: proofColor,
              fontSize: `${TYPOGRAPHY_SCALE[proofFontSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 12}px`,
              fontWeight: FONT_WEIGHTS[proofWeight as keyof typeof FONT_WEIGHTS]?.value || 800,
              textWrap: 'pretty'
            }}
          />
        </motion.div>
      )}
    </motion.div>
    );
  };

  const renderVisual = () => (
      <motion.div 
        animate={floatingAnim ? {
          y: [0, -15, 0],
          rotate: [0, 1, 0]
      } : {}}
      transition={floatingAnim ? {
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        opacity: { duration: 1 },
        scale: { duration: 1 }
      } : { duration: 1 }}
      viewport={{ once: true }}
      onClick={(e) => {
        if (isPreviewMode) return;
        e.stopPropagation();
        selectSection(moduleId);
        selectElement(`${moduleId}_el_hero_media`);
      }}
      className="relative z-30"
      style={{ perspective: `${perspective}px` }}
    >
      <div 
        className={`relative transition-all duration-500 ${
          shouldRenderTransparentMedia
            ? 'overflow-visible bg-transparent'
            : `overflow-hidden ${
                visualShadow === 'lg' ? 'shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]' : 
                visualShadow === 'sm' ? 'shadow-xl' : ''
              }`
        }`}
        style={{ 
          borderRadius: shouldRenderTransparentMedia ? 0 : `${visualRadius}px`,
          backgroundColor: shouldRenderTransparentMedia ? 'transparent' : (darkMode ? '#1E293B' : '#F8FAFC')
        }}
      >
        {mediaType === 'image' && visualImage ? (
          <img 
            src={visualImage} 
            alt="Hero Visual" 
            className={`w-full h-auto block ${shouldRenderTransparentMedia ? 'object-contain' : ''}`}
            style={{ objectFit: (shouldRenderTransparentMedia ? 'contain' : visualFit) as any }}
            referrerPolicy="no-referrer"
          />
        ) : mediaType === 'image' ? (
          <div className="aspect-video bg-slate-100 flex items-center justify-center text-slate-300">
            <LucideIcons.Image size={48} />
          </div>
        ) : (
          <div className="relative aspect-video bg-black flex items-center justify-center group">
            <video 
              src={visualVideo} 
              className="w-full h-full object-cover"
              autoPlay muted loop playsInline
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-all">
                <Play fill="currentColor" size={24} />
              </div>
            </div>
          </div>
        )}
      </div>
      
    </motion.div>
  );

  const renderBackground = () => {
    if (bgType === 'video' && visualVideo) {
      return (
        <div className="absolute inset-0 z-0">
          <video 
            src={visualVideo} 
            autoPlay muted loop playsInline 
            className="w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0" 
            style={{ backgroundColor: overlayColor, opacity: overlayOpacity / 100 }}
          />
        </div>
      );
    }
    if (bgType === 'image' && visualImage) {
      return (
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${visualImage})` }}
          />
          <div 
            className="absolute inset-0" 
            style={{ backgroundColor: overlayColor, opacity: overlayOpacity / 100 }}
          />
        </div>
      );
    }
    if (bgType === 'gradient') {
      return (
        <div 
          className="absolute inset-0 z-0" 
          style={{ background: (typeof bgGradient === 'string' && !bgGradient.includes('NaN')) ? bgGradient : 'none' }}
        />
      );
    }
    return (
      <div 
        className="absolute inset-0 z-0" 
        style={{ backgroundColor: bgColor }}
      />
    );
  };

  const verticalAlignClass = verticalAlign === 'start'
    ? 'items-start'
    : verticalAlign === 'end'
      ? 'items-end'
      : 'items-center';

  const containerClassName = `relative w-full overflow-hidden flex ${verticalAlignClass} ${sectionHeight} @container`;
  
  logDebug('[HERO_LAYOUT_DEBUG]', {
    moduleId,
    layout,
    isPreviewMode,
    windowWidth: window.innerWidth,
    containerClassName,
    maxWidth
  });

  return (
    <SectionAnimation animation={sectionAnimation} speed={globalThemeSectionAnimationSpeed}>
    <section 
      id={moduleId}
      ref={containerRef}
      className={containerClassName}
      onClick={(e) => {
        if (isPreviewMode) return;
        e.stopPropagation();
        selectSection(moduleId);
        selectElement(`${moduleId}_global`);
      }}
    >
      {renderBackground()}

      <ParallaxBackground 
        scrollYProgress={scrollYProgress}
        enabled={bgParallaxEnabled}
        imageUrl={bgParallaxImg}
        opacity={bgParallaxOpacity}
        overlayColor={bgParallaxOverlay}
        speed={bgParallaxSpeed}
      />

      <div 
        className="relative z-30 w-full px-8 mx-auto"
        style={{ 
          maxWidth: `${maxWidth}px`,
          paddingTop: `${paddingY}px`,
          paddingBottom: `${contentBottomPadding}px`
        }}
      >
        {layout === 'split' && (
          <div className="grid grid-cols-1 @lg:grid-cols-2 gap-16 @lg:gap-24 items-center">
            {renderContent('left')}
            {renderVisual()}
          </div>
        )}

        {layout === 'reverse' && (
          <div className="grid grid-cols-1 @lg:grid-cols-2 gap-16 @lg:gap-24 items-center">
            <div className="order-2 @lg:order-1">
              {renderVisual()}
            </div>
            <div className="order-1 @lg:order-2">
              {renderContent('left')}
            </div>
          </div>
        )}

        {(layout === 'center' || layout === 'full_bg') && (
          <div className="flex flex-col items-center gap-16">
            {renderContent('center')}
            {layout === 'center' && renderVisual()}
          </div>
        )}

        {layout === 'text_left' && (
          <div className="flex">
            {renderContent('left')}
          </div>
        )}

        {layout === 'text_right' && (
          <div className="flex justify-end">
            {renderContent('right')}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
    </SectionAnimation>
  );
};
