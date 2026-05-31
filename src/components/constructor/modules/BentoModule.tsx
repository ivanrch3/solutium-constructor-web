import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { TextRenderer } from '../TextRenderer';
import { ParallaxBackground, useParallaxScrollProgress } from '../ParallaxBackground';
import { parseNumSafe } from '../utils';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import { SectionAnimation } from '../animations/SectionAnimation';
import { normalizeSectionAnimation } from '../../../constants/moduleAnimations';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);
const BENTO_AI_ACTIONS_ENABLED = false;
const BENTO_BREAKPOINT_TO_LAYOUT: Record<string, 'desktop' | 'tablet' | 'mobile'> = {
  lg: 'desktop',
  md: 'desktop',
  sm: 'tablet',
  xs: 'mobile',
  xxs: 'mobile'
};

const BENTO_BREAKPOINT_ORDER = ['lg', 'md', 'sm', 'xs', 'xxs'];

const BENTO_ELEMENT_OPTIONS = [
  { kind: 'text', label: 'Texto', icon: 'Type', description: 'Bloque de texto libre' },
  { kind: 'visual', label: 'Imagen', icon: 'Image', description: 'Imagen principal' },
  { kind: 'button', label: 'Botón', icon: 'MousePointerClick', description: 'Llamado a la acción' },
  { kind: 'icon', label: 'Ícono', icon: 'Sparkles', description: 'Símbolo destacado' },
  { kind: 'badge', label: 'Badge', icon: 'Badge', description: 'Etiqueta compacta' },
  { kind: 'metric', label: 'Métrica', icon: 'BarChart3', description: 'Dato o indicador' },
  { kind: 'list', label: 'Lista', icon: 'ListChecks', description: 'Puntos clave' },
  { kind: 'accordion', label: 'Acordeón', icon: 'ChevronDownSquare', description: 'Texto desplegable' },
  { kind: 'marquee', label: 'Cinta animada', icon: 'MoveRight', description: 'Texto en movimiento' },
  { kind: 'card', label: 'Tarjeta simple', icon: 'PanelTop', description: 'Contenedor flexible' }
];

const isBentoDebugEnabled = () => {
  if (typeof window === 'undefined') return false;

  const hasDebugParam = (search: string) => {
    return new URLSearchParams(search).get('debug_bento') === 'true';
  };

  if (hasDebugParam(window.location.search)) return true;

  try {
    if (window.parent && window.parent !== window && hasDebugParam(window.parent.location.search)) {
      return true;
    }
  } catch {
    // Cross-origin parent frames are expected in embedded contexts.
  }

  try {
    return window.localStorage.getItem('debug_bento') === 'true';
  } catch {
    return false;
  }
};

const createBentoCellId = () => {
  const randomId = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  return `bento_cell_${randomId}`;
};

// --- SUB-ELEMENT RENDERERS ---


import { InlineEditableText } from '../InlineEditableText';

const getAdaptiveTypography = (priority: string, colSpan: number, rowSpan: number) => {
  if (priority === 'hero' || (colSpan >= 8)) return { title: 't1', desc: 'p' };
  if (priority === 'feature' || (colSpan >= 4 && rowSpan >= 4)) return { title: 't2', desc: 'p' };
  if (colSpan >= 4) return { title: 't3', desc: 'p' };
  return { title: 'p', desc: 'small' }; // Compact
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

const getTypographyStyle = (token: string | undefined, fallback: keyof typeof TYPOGRAPHY_SCALE) => {
  return TYPOGRAPHY_SCALE[(token as keyof typeof TYPOGRAPHY_SCALE) || fallback] || TYPOGRAPHY_SCALE[fallback];
};

const getFontWeightValue = (token: string | undefined, fallback: keyof typeof FONT_WEIGHTS) => {
  return FONT_WEIGHTS[(token as keyof typeof FONT_WEIGHTS) || fallback]?.value || FONT_WEIGHTS[fallback].value;
};

const BentoCellContent = ({ item, darkMode, moduleId, isPreviewMode, onSave }: any) => {
  const {
    type,
    title,
    description,
    icon,
    eyebrow,
    priority = 'standard',
    col_span = 4,
    row_span = 2,
    button_text,
    btn_url,
    btn_target,
    image,
    card_image,
    image_fit = 'cover',
    title_size,
    title_weight = 'extrabold',
    title_color,
    desc_size,
    desc_color,
    metric_suffix,
    accent_color,
    show_description = true,
    content_position = 'center',
    text_contrast = 'auto'
  } = item;

  const adaptive = getAdaptiveTypography(priority, col_span, row_span);
  const finalTitleSize = (title_size && title_size !== 'auto') ? title_size : adaptive.title;
  const finalDescSize = (desc_size && desc_size !== 'auto') ? desc_size : adaptive.desc;
  const finalTitleWeight = getFontWeightValue(title_weight, 'extrabold');

  const IconComponent = (LucideIcons as any)[icon] || Sparkles;
  
  // Contraste de texto forzado
  const forcedColor = text_contrast === 'white' ? '#FFFFFF' : text_contrast === 'black' ? '#0F172A' : null;
  const finalTitleColor = forcedColor || resolveThemeColor(title_color, '#0F172A', '#FFFFFF', darkMode);
  const finalDescColor = forcedColor || resolveThemeColor(desc_color, '#64748B', '#94A3B8', darkMode);

  const isHero = type === 'hero' || priority === 'hero';

  const alignClass = {
    'left': 'items-start text-left',
    'center': 'items-center text-center',
    'right': 'items-end text-right'
  }[content_position as string] || 'items-center text-center';

  switch (type) {
    case 'hero':
      return (
        <div className={`flex flex-col z-10 w-full h-full justify-center gap-6 ${alignClass}`}>
          {eyebrow && (
            <span className="text-[12px] font-bold tracking-[0.3em] uppercase opacity-70 mb-1 block">
              {eyebrow}
            </span>
          )}
          <h2 
            className="leading-[1.1] mb-2"
            style={{ 
              fontSize: `${TYPOGRAPHY_SCALE[finalTitleSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 48}px`,
              fontWeight: finalTitleWeight,
              color: finalTitleColor,
              letterSpacing: '-0.03em'
            }}
          >
            <InlineEditableText
              moduleId={moduleId}
              settingId="title"
              value={title}
              tagName="span"
              isPreviewMode={isPreviewMode}
              onSave={(val) => onSave('title', val)}
            />
          </h2>
          {description && (
            <p 
              className="max-w-xl"
              style={{ 
                fontSize: `${TYPOGRAPHY_SCALE[finalDescSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 18}px`,
                color: finalDescColor,
                lineHeight: 1.5
              }}
            >
              <InlineEditableText
                moduleId={moduleId}
                settingId="description"
                value={description}
                tagName="span"
                isPreviewMode={isPreviewMode}
                onSave={(val) => onSave('description', val)}
              />
            </p>
          )}
          {button_text && (
            <div className="mt-4">
               <a 
                 href={btn_url || '#'}
                 className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
               >
                  {button_text}
                  <ArrowRight size={18} />
               </a>
            </div>
          )}
        </div>
      );

    case 'metric':
    case 'stat':
      return (
        <div className="flex flex-col gap-1 z-10 w-full h-full justify-center items-center text-center p-2">
          {item.icon && (
            <div className="p-2 bg-primary/10 rounded-xl text-primary mb-1">
               <IconComponent size={24} />
            </div>
          )}
          <div className="flex items-center justify-center gap-0.5">
            {item.metric_prefix && (
              <span className="text-2xl font-bold opacity-40 -mt-2">
                {item.metric_prefix}
              </span>
            )}
            <h4 
              className="leading-none tracking-tighter"
              style={{ 
                fontSize: col_span > 1 ? '72px' : '48px',
                fontWeight: 900,
                color: item.accent_color || finalTitleColor
              }}
            >
              <InlineEditableText
                moduleId={moduleId}
                settingId="metric_value"
                value={item.metric_value || title}
                tagName="span"
                isPreviewMode={isPreviewMode}
                onSave={(val) => onSave('metric_value', val)}
              />
            </h4>
            {item.metric_suffix && (
              <span className="text-2xl font-black opacity-60 ml-0.5" style={{ color: item.accent_color || finalTitleColor }}>
                {item.metric_suffix}
              </span>
            )}
          </div>
          {item.metric_label && (
            <p 
              className="font-black uppercase tracking-widest text-[10px]"
              style={{ color: item.accent_color || finalTitleColor }}
            >
              {item.metric_label}
            </p>
          )}
          {description && (
            <p 
              className="mt-2 text-[11px] leading-snug max-w-[180px] opacity-70 font-medium"
              style={{ color: finalDescColor }}
            >
              <InlineEditableText
                moduleId={moduleId}
                settingId="description"
                value={description}
                tagName="span"
                isPreviewMode={isPreviewMode}
                onSave={(val) => onSave('description', val)}
              />
            </p>
          )}
        </div>
      );

    case 'button':
      return (
        <div className="flex z-10 w-full h-full items-center justify-center">
          <a
            href={btn_url || '#'}
            target={btn_target === '_blank' ? '_blank' : undefined}
            rel={btn_target === '_blank' ? 'noopener noreferrer' : undefined}
            onClick={(event) => !isPreviewMode && event.preventDefault()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-black uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-[1.03]"
          >
            <InlineEditableText
              moduleId={moduleId}
              settingId="button_text"
              value={button_text || title || 'Haz clic aquí'}
              tagName="span"
              isPreviewMode={isPreviewMode}
              onSave={(val) => onSave('button_text', val)}
            />
            <LucideIcons.ArrowRight size={16} />
          </a>
        </div>
      );

    case 'badge':
      return (
        <div className="flex z-10 w-full h-full items-center justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
            <LucideIcons.Tag size={14} />
            <InlineEditableText
              moduleId={moduleId}
              settingId="title"
              value={title || 'Nuevo'}
              tagName="span"
              isPreviewMode={isPreviewMode}
              onSave={(val) => onSave('title', val)}
            />
          </span>
        </div>
      );

    case 'icon':
      return (
        <div className="flex flex-col z-10 w-full h-full items-center justify-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <IconComponent size={32} />
          </div>
          {title && (
            <h3 className="text-base leading-tight" style={{ color: finalTitleColor, fontWeight: finalTitleWeight }}>
              <InlineEditableText
                moduleId={moduleId}
                settingId="title"
                value={title}
                tagName="span"
                isPreviewMode={isPreviewMode}
                onSave={(val) => onSave('title', val)}
              />
            </h3>
          )}
        </div>
      );

    case 'list':
      const listItems = Array.isArray(item.list_items)
        ? item.list_items
        : String(item.list_items || 'Primer punto\nSegundo punto\nTercer punto').split('\n').filter(Boolean);

      return (
        <div className="flex flex-col z-10 w-full h-full gap-4">
          <h3 className="text-lg leading-tight" style={{ color: finalTitleColor, fontWeight: finalTitleWeight }}>
            <InlineEditableText
              moduleId={moduleId}
              settingId="title"
              value={title || 'Lista clave'}
              tagName="span"
              isPreviewMode={isPreviewMode}
              onSave={(val) => onSave('title', val)}
            />
          </h3>
          <div className="space-y-2">
            {listItems.map((listItem: string, index: number) => (
              <div key={index} className="flex items-start gap-2 text-sm" style={{ color: finalDescColor }}>
                <LucideIcons.CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                <span>{listItem}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'accordion':
      return (
        <details className="group z-10 w-full" open={!isPreviewMode}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-black" style={{ color: finalTitleColor }}>
            <InlineEditableText
              moduleId={moduleId}
              settingId="title"
              value={title || 'Ver más detalles'}
              tagName="span"
              isPreviewMode={isPreviewMode}
              onSave={(val) => onSave('title', val)}
            />
            <LucideIcons.ChevronDown size={18} className="transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: finalDescColor }}>
            <InlineEditableText
              moduleId={moduleId}
              settingId="description"
              value={description || 'Contenido desplegable...'}
              tagName="span"
              isPreviewMode={isPreviewMode}
              onSave={(val) => onSave('description', val)}
            />
          </p>
        </details>
      );

    case 'marquee':
      return (
        <div className="relative z-10 flex h-full w-full items-center overflow-hidden">
          <motion.div
            className="flex min-w-full whitespace-nowrap text-lg font-black uppercase tracking-[0.25em]"
            style={{ color: finalTitleColor }}
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 12, ease: 'linear', repeat: Infinity }}
          >
            <span className="px-4">{title || 'PROMO • NUEVO • 24/7'}</span>
            <span className="px-4">{title || 'PROMO • NUEVO • 24/7'}</span>
          </motion.div>
        </div>
      );

    case 'step':
      return (
        <div className="flex flex-col gap-4 z-10 w-full h-full justify-center text-left">
          <div className="flex items-center justify-between">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg"
              style={{ backgroundColor: item.accent_color || 'var(--color-primary)' }}
            >
              {item.step_number || 1}
            </div>
            {item.icon && <IconComponent size={24} className="opacity-20" />}
          </div>
          <div>
            <h3 className="text-lg leading-tight mb-2" style={{ color: finalTitleColor, fontWeight: finalTitleWeight }}>
              <InlineEditableText
                moduleId={moduleId}
                settingId="title"
                value={title}
                tagName="span"
                isPreviewMode={isPreviewMode}
                onSave={(val) => onSave('title', val)}
              />
            </h3>
            <p className="text-xs opacity-70 leading-relaxed" style={{ color: finalDescColor }}>
              <InlineEditableText
                moduleId={moduleId}
                settingId="description"
                value={description}
                tagName="span"
                isPreviewMode={isPreviewMode}
                onSave={(val) => onSave('description', val)}
              />
            </p>
          </div>
        </div>
      );

    case 'trust_signal':
    case 'testimonial':
      return (
        <div className="flex flex-col gap-3 z-10 w-full h-full justify-center">
          <div className="flex gap-0.5">
            {[...Array(item.rating || 5)].map((_, i) => (
              <LucideIcons.Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-sm italic font-medium leading-relaxed opacity-90" style={{ color: finalTitleColor }}>
            "{description || title}"
          </p>
          {type === 'testimonial' && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                {title.charAt(0)}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{title}</span>
            </div>
          )}
          {type === 'trust_signal' && (
             <div className="flex items-center gap-2 mt-1">
                <LucideIcons.ShieldCheck size={14} className="text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{title}</span>
             </div>
          )}
        </div>
      );

    case 'feature':
      return (
        <div className="flex flex-col gap-4 z-10 w-full h-full justify-center">
          <div className="flex items-center gap-4">
             {item.icon && (
               <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                 <IconComponent size={28} />
               </div>
             )}
             <div>
               {eyebrow && <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mb-1 block">{eyebrow}</span>}
               <h3 className="text-xl leading-none" style={{ color: finalTitleColor, fontWeight: finalTitleWeight }}>
                <InlineEditableText
                  moduleId={moduleId}
                  settingId="title"
                  value={title}
                  tagName="span"
                  isPreviewMode={isPreviewMode}
                  onSave={(val) => onSave('title', val)}
                />
               </h3>
             </div>
          </div>
          <p className="text-sm opacity-70 leading-relaxed" style={{ color: finalDescColor }}>
            <InlineEditableText
              moduleId={moduleId}
              settingId="description"
              value={description}
              tagName="span"
              isPreviewMode={isPreviewMode}
              onSave={(val) => onSave('description', val)}
            />
          </p>
          {button_text && (
            <button className="flex items-center gap-2 text-xs font-bold text-primary hover:gap-3 transition-all mt-1">
              {button_text}
              <LucideIcons.ArrowRight size={14} />
            </button>
          )}
        </div>
      );

    case 'app_card':
      return (
        <div className="flex flex-col gap-4 z-10 w-full h-full justify-between">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center p-2">
               <IconComponent size={24} className="text-gray-900" />
            </div>
            <span className="px-2 py-0.5 bg-gray-100 rounded text-[8px] font-bold text-gray-400 uppercase tracking-widest">
              {item.app_category || 'App'}
            </span>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-1" style={{ color: finalTitleColor }}>{title}</h4>
            <p className="text-[10px] opacity-60 line-clamp-2 leading-snug" style={{ color: finalDescColor }}>{description}</p>
          </div>
          <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
             <span className="text-[9px] font-bold text-green-600 flex items-center gap-1">
               <LucideIcons.Zap size={10} />
               Conectado
             </span>
             <LucideIcons.Plus size={14} className="text-gray-300" />
          </div>
        </div>
      );

    case 'compact':
      return (
        <div className="flex flex-col gap-4 z-10 w-full h-full justify-center">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
               <IconComponent size={20} />
             </div>
             <div>
                <h3 
                  className="leading-tight"
                  style={{ 
                    fontSize: '16px',
                    fontWeight: finalTitleWeight,
                    color: finalTitleColor
                  }}
                >
                  <InlineEditableText
                    moduleId={moduleId}
                    settingId="title"
                    value={title}
                    tagName="span"
                    isPreviewMode={isPreviewMode}
                    onSave={(val) => onSave('title', val)}
                  />
                </h3>
                {eyebrow && <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">{eyebrow}</span>}
             </div>
          </div>
          {show_description && description && (
            <p 
              className="line-clamp-2 text-xs"
              style={{ color: finalDescColor, lineHeight: 1.4 }}
            >
              {description}
            </p>
          )}
        </div>
      );

    case 'icon_text':
    case 'standard':
      return (
        <div className={`flex flex-col z-10 w-full h-full ${isHero ? 'gap-6 justify-center' : 'gap-4'}`}>
          <div className={`${isHero ? 'w-16 h-16' : 'w-12 h-12'} bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0`}>
            <IconComponent size={isHero ? 40 : 32} />
          </div>
          <div>
            {eyebrow && (
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-60 mb-1 block">
                {eyebrow}
              </span>
            )}
            <h3 
              className="mb-2 leading-tight"
              style={{ 
                fontSize: `${TYPOGRAPHY_SCALE[finalTitleSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 24}px`,
                fontWeight: isHero ? Math.max(finalTitleWeight, 900) : finalTitleWeight,
                color: finalTitleColor,
                letterSpacing: isHero ? '-0.02em' : 'normal'
              }}
            >
              <InlineEditableText
                moduleId={moduleId}
                settingId="title"
                value={title}
                tagName="span"
                isPreviewMode={isPreviewMode}
                onSave={(val) => onSave('title', val)}
              />
            </h3>
            {description && (
              <p 
                className={row_span <= 2 && !isHero ? 'line-clamp-2' : ''}
                style={{ 
                  fontSize: `${TYPOGRAPHY_SCALE[finalDescSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 16}px`,
                  color: finalDescColor,
                  lineHeight: 1.5
                }}
              >
                <InlineEditableText
                  moduleId={moduleId}
                  settingId="description"
                  value={description}
                  tagName="span"
                  isPreviewMode={isPreviewMode}
                  onSave={(val) => onSave('description', val)}
                />
              </p>
            )}
            
            {button_text && (
              <div className="mt-4">
                 <button className="text-[12px] font-bold text-primary flex items-center gap-1 group/btn">
                    {button_text}
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                 </button>
              </div>
            )}
          </div>
        </div>
      );

    case 'cta':
      return (
        <div className="flex flex-col gap-6 z-10 w-full h-full justify-center p-4">
          <div className="space-y-2">
            {item.headline ? (
              <>
                <h3 
                  className="leading-tight tracking-tight"
                  style={{ 
                    fontSize: `${TYPOGRAPHY_SCALE.t2.fontSize}px`,
                    fontWeight: finalTitleWeight,
                    color: finalTitleColor
                  }}
                >
                  <InlineEditableText
                    moduleId={moduleId}
                    settingId="headline"
                    value={item.headline}
                    tagName="span"
                    isPreviewMode={isPreviewMode}
                    onSave={(val) => onSave('headline', val)}
                  />
                </h3>
                {item.subheadline && (
                  <p className="text-sm font-medium opacity-60 leading-relaxed" style={{ color: finalDescColor }}>
                    <InlineEditableText
                      moduleId={moduleId}
                      settingId="subheadline"
                      value={item.subheadline}
                      tagName="span"
                      isPreviewMode={isPreviewMode}
                      onSave={(val) => onSave('subheadline', val)}
                    />
                  </p>
                )}
              </>
            ) : (
              <>
                <h3 
                  className="mb-1 leading-tight"
                  style={{ 
                    fontSize: `${TYPOGRAPHY_SCALE.t3.fontSize}px`,
                    fontWeight: finalTitleWeight,
                    color: finalTitleColor
                  }}
                >
                  <InlineEditableText
                    moduleId={moduleId}
                    settingId="title"
                    value={title}
                    tagName="span"
                    isPreviewMode={isPreviewMode}
                    onSave={(val) => onSave('title', val)}
                  />
                </h3>
                {description && (
                  <p style={{ color: finalDescColor, fontSize: '14px' }}>{description}</p>
                )}
              </>
            )}
          </div>
          
          <div className="flex flex-col gap-3">
            <a 
              href={item.primary_btn_url || btn_url || '#'}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black border border-black/5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xl group"
              style={{ backgroundColor: item.accent_color || '#FFFFFF', color: item.accent_color ? '#FFFFFF' : '#000000' }}
            >
              <InlineEditableText
                moduleId={moduleId}
                settingId={item.primary_btn_label ? "primary_btn_label" : "button_text"}
                value={item.primary_btn_label || button_text}
                tagName="span"
                isPreviewMode={isPreviewMode}
                onSave={(val) => onSave(item.primary_btn_label ? 'primary_btn_label' : 'button_text', val)}
              />
              <LucideIcons.ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            
            {item.secondary_btn_label && (
              <button className="text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
                 {item.secondary_btn_label}
              </button>
            )}

            {item.trust_note && (
              <p className="text-[10px] text-center font-bold opacity-40 uppercase tracking-widest">
                {item.trust_note}
              </p>
            )}
          </div>
        </div>
      );

    case 'visual':
      const visualImage = image || card_image;

      return (
        <div className="relative z-10 w-full h-full overflow-hidden">
          {visualImage ? (
            <img
              src={visualImage}
              className="absolute inset-0 w-full h-full"
              style={{ objectFit: image_fit }}
              referrerPolicy="no-referrer"
              alt={title || 'Imagen principal'}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-300">
              <LucideIcons.Image size={56} strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-6">
            <h3
              className="leading-tight mb-2 text-white"
              style={{
                fontSize: `${TYPOGRAPHY_SCALE[finalTitleSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 20}px`,
                fontWeight: finalTitleWeight
              }}
            >
              <InlineEditableText
                moduleId={moduleId}
                settingId="title"
                value={title}
                tagName="span"
                isPreviewMode={isPreviewMode}
                onSave={(val) => onSave('title', val)}
              />
            </h3>
            {description && (
              <p className="text-white/80 text-xs mb-2 line-clamp-2">
                <InlineEditableText
                  moduleId={moduleId}
                  settingId="description"
                  value={description}
                  tagName="span"
                  isPreviewMode={isPreviewMode}
                  onSave={(val) => onSave('description', val)}
                />
              </p>
            )}
          </div>
        </div>
      );

    case 'video':
      return (
        <div className="flex flex-col gap-3 z-10 w-full h-full justify-center items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <LucideIcons.PlayCircle size={28} />
          </div>
          <div>
            {title && (
              <h3
                className="mb-2 leading-tight"
                style={{
                  fontSize: `${TYPOGRAPHY_SCALE[finalTitleSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 20}px`,
                  fontWeight: finalTitleWeight,
                  color: finalTitleColor
                }}
              >
                {title}
              </h3>
            )}
            <p className="text-xs font-semibold opacity-60" style={{ color: finalDescColor }}>
              Tipo video heredado. La edición visual se habilitará en una fase posterior.
            </p>
          </div>
        </div>
      );

    default: // 'text'
      return (
        <div className="flex flex-col gap-3 z-10 w-full h-full">
          {eyebrow && (
            <span 
              className="text-xs font-bold tracking-[0.2em] uppercase opacity-70 mb-1 block"
              style={{ color: darkMode ? '#3B82F6' : 'var(--color-primary)' }}
            >
              {eyebrow}
            </span>
          )}
          {title && (
            <h3 
              className="mb-2 leading-tight"
              style={{ 
                fontSize: `${TYPOGRAPHY_SCALE[finalTitleSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 24}px`,
                fontWeight: finalTitleWeight,
                color: finalTitleColor
              }}
            >
              <InlineEditableText
                moduleId={moduleId}
                settingId="title"
                value={title}
                tagName="span"
                isPreviewMode={isPreviewMode}
                onSave={(val) => onSave('title', val)}
              >
                <TextRenderer text={title} />
              </InlineEditableText>
            </h3>
          )}
          {description && (
            <p 
              className="flex-1"
              style={{ 
                fontSize: `${TYPOGRAPHY_SCALE[finalDescSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 16}px`,
                color: finalDescColor,
                lineHeight: 1.6
              }}
            >
              <InlineEditableText
                moduleId={moduleId}
                settingId="description"
                value={description}
                tagName="span"
                isPreviewMode={isPreviewMode}
                onSave={(val) => onSave('description', val)}
              />
            </p>
          )}
        </div>
      );
  }
};

// --- MAIN BENTO MODULE ---

import { useEditorStore } from '../../../store/editorStore';

export const BentoModule: React.FC<{ 
  moduleId: string; 
  settingsValues: Record<string, any>;
  content?: any;
  onSettingChange?: (id: string, settingId: string, value: any) => void;
  isPreviewMode?: boolean;
  onOpenBentoGenerator?: () => void;
}> = ({ moduleId, settingsValues, content, onSettingChange, isPreviewMode, onOpenBentoGenerator }) => {
  useEffect(() => {
    if (!isBentoDebugEnabled()) return;
    console.log('[BENTO_MODULE_MOUNT_DEBUG]', {
      moduleId,
      runtime: "constructor_canvas",
      isPreviewMode,
      hasContent: !!content,
      hasOnSettingChange: !!onSettingChange
    });
  }, []);

  const { selectedBentoCellIndex, setSelectedBentoCellIndex, selectSection } = useEditorStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isElementPickerOpen, setIsElementPickerOpen] = useState(false);
  // Remove local selectedIndex, use store instead
  // const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedIndex = selectedBentoCellIndex;
  const setSelectedIndex = setSelectedBentoCellIndex;

  const containerRef = useRef(null);
  const { scrollYProgress } = useParallaxScrollProgress(containerRef);

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    // Priority: settingsValues (live edits)
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    if (settingsValues[key] !== undefined) return settingsValues[key];

    // Fallback: content object (standardized data)
    if (content) {
      // Mapping common keys
      if (elementId?.includes('el_bento_header')) {
        if (settingId === 'title' && content.title) return content.title;
        if (settingId === 'subtitle' && content.subtitle) return content.subtitle;
        if (settingId === 'eyebrow' && content.eyebrow) return content.eyebrow;
      }
    }

    return defaultValue;
  };

  // Global Settings
  const columns = Math.max(1, parseInt(getVal(null, 'columns', 12)) || 12);
  const gap = parseNumSafe(getVal(null, 'gap', 20), 20);
  const paddingY = parseNumSafe(getVal(null, 'padding_y', 40), 40);
  const maxWidth = parseNumSafe(getVal(null, 'max_width', 1200), 1200);
  const darkMode = toBoolean(getVal(null, 'dark_mode', false));
  const rawBgColor = getVal(null, 'bg_color', '#FFFFFF');
  const bgColor = resolveThemeColor(rawBgColor, '#FFFFFF', '#0F172A', darkMode);
  const sectionGradient = getVal(null, 'section_gradient', false);
  const bgGradient = getVal(null, 'bg_gradient', 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)');
  const legacyEntranceAnim = getVal(null, 'entrance_anim', 'fade_up');
  const globalThemeSectionAnimation = settingsValues['global_theme_section_animation'];
  const globalThemeSectionAnimationSpeed = parseNumSafe(settingsValues['global_theme_section_animation_speed'], 1);
  const moduleSectionAnimation = getVal(null, 'section_animation', undefined);
  const sectionAnimation = normalizeSectionAnimation(
    globalThemeSectionAnimation ?? moduleSectionAnimation ?? legacyEntranceAnim,
    'fade-up'
  );
  const entranceAnim = 'none';
  const globalAnimOverride = null;

  // Multimedia (Parallax Background)
  const bgParallaxEnabled = getVal(null, 'bg_parallax_enabled', false);
  const bgParallaxImg = getVal(null, 'bg_parallax_img', '');
  const bgParallaxOpacity = parseNumSafe(getVal(null, 'bg_parallax_opacity', 20), 20);
  const bgParallaxOverlay = getVal(null, 'bg_parallax_overlay', '#000000');
  const bgParallaxSpeed = parseNumSafe(getVal(null, 'bg_parallax_speed', 100), 100);

  // --- LAYOUT HELPERS ---

  const normalizeLayoutEntry = (layout: any) => ({
    x: Number(layout?.x) || 0,
    y: Number(layout?.y) || 0,
    w: Number(layout?.w) || 1,
    h: Number(layout?.h) || 1
  });

  const areLayoutsEqual = (a: any[] = [], b: any[] = []) => {
    if (a.length !== b.length) return false;

    return a.every((entry, index) => {
      const candidate = b[index];
      return candidate
        && String(entry.i) === String(candidate.i)
        && entry.x === candidate.x
        && entry.y === candidate.y
        && entry.w === candidate.w
        && entry.h === candidate.h;
    });
  };

  const getBentoLayoutForBreakpoint = (items: any[], breakpoint: string, cols: number) => {
    return items.map((item: any, index: number) => {
      // 1. Try saved layouts object
      if (item.layouts && item.layouts[breakpoint]) {
        return { i: index.toString(), ...item.layouts[breakpoint] };
      }

      // 2. Try legacy / specific span fields
      const w = breakpoint === 'mobile' ? (item.mobile_span || item.col_span || 4) : 
                breakpoint === 'tablet' ? (item.tablet_span || 2) : 
                (item.desktop_span || item.col_span || 4);
      
      const h = breakpoint === 'mobile' ? (item.mobile_rows || item.row_span || 2) : 
                (item.desktop_rows || item.row_span || 2);

      // Simple positional fallback if x/y not set for bp
      return {
        i: index.toString(),
        x: item.x || 0,
        y: item.y || 0,
        w: Math.min(w, cols),
        h: h
      };
    });
  };

  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
  const currentBreakpointRef = useRef('lg');
  
  // Items Data - Robust Normalization
  const getItemsFromMultipleSources = () => {
    const settingsItems = getVal(`${moduleId}_el_bento_items`, 'items', null);
    const contentItems = content?.items || content?.blocks || content?.cells || (content?.data?.items) || (content?.data?.blocks) || [];
    const finalItems = Array.isArray(settingsItems) ? settingsItems : 
                       (Array.isArray(contentItems) && contentItems.length > 0) ? contentItems : [];

    return finalItems;
  };

  const rawItems = useMemo(() => getItemsFromMultipleSources(), [settingsValues, moduleId]);

  const layouts = useMemo(() => ({
    lg: getBentoLayoutForBreakpoint(rawItems, 'desktop', columns),
    md: getBentoLayoutForBreakpoint(rawItems, 'desktop', columns),
    sm: getBentoLayoutForBreakpoint(rawItems, 'tablet', 6),
    xs: getBentoLayoutForBreakpoint(rawItems, 'mobile', 4),
    xxs: getBentoLayoutForBreakpoint(rawItems, 'mobile', 1)
  }), [rawItems, columns]);

  const handleLayoutChange = (currentLayout: any, allLayouts: any) => {
    if (!onSettingChange || isPreviewMode) return;

    const activeBreakpoint = areLayoutsEqual(currentLayout, allLayouts?.[currentBreakpointRef.current])
      ? currentBreakpointRef.current
      : BENTO_BREAKPOINT_ORDER.find((breakpoint) => areLayoutsEqual(currentLayout, allLayouts?.[breakpoint])) || currentBreakpointRef.current;
    const currentBP = BENTO_BREAKPOINT_TO_LAYOUT[activeBreakpoint] || 'desktop';

    const newItems = [...rawItems];
    let changed = false;

    currentLayout.forEach((l: any) => {
      const idx = parseInt(l.i);
      if (newItems[idx]) {
        const entry = normalizeLayoutEntry(l);
        const existingLayouts = newItems[idx].layouts || {};
        
        if (JSON.stringify(existingLayouts[currentBP]) !== JSON.stringify(entry)) {
          newItems[idx] = {
            ...newItems[idx],
            layouts: { ...existingLayouts, [currentBP]: entry },
            // Keep legacy synced for desktop compatibility
            ...(currentBP === 'desktop' ? { x: l.x, y: l.y, col_span: l.w, row_span: l.h } : {})
          };
          changed = true;
        }
      }
    });

    if (changed) {
      onSettingChange(`${moduleId}_el_bento_items`, 'items', newItems);
    }
  };

  const handleBreakpointChange = (newBreakpoint: string) => {
    currentBreakpointRef.current = newBreakpoint;
    setCurrentBreakpoint(newBreakpoint);
    if (isBentoDebugEnabled()) console.log('[BENTO_BP_CHANGE]', newBreakpoint);
  };

  const itemVariants = globalAnimOverride || {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const handleDrop = (layout: any, item: any, e: Event) => {
    if (!onSettingChange) return;
    
    const type = (window as any)._draggingBentoType || 'text';
    const currentLayoutKey = BENTO_BREAKPOINT_TO_LAYOUT[currentBreakpointRef.current] || 'desktop';
    const droppedLayout = normalizeLayoutEntry(item);
    
    const newItem = {
      id: createBentoCellId(),
      type,
      title: type === 'stat' ? '99+' : (type === 'cta' ? '¡Únete ahora!' : 'Nuevo Bloque'),
      description: 'Personaliza este bloque desde el panel de ajustes.',
      col_span: item.w,
      row_span: item.h,
      x: item.x,
      y: item.y,
      layouts: {
        [currentLayoutKey]: droppedLayout
      },
      card_style: 'solid',
      card_radius: 28,
      padding: 32,
      content_align: 'center',
      icon: type === 'stat' ? 'Zap' : 'Sparkles',
      button_text: 'Explorar'
    };

    onSettingChange(`${moduleId}_el_bento_items`, 'items', [...rawItems, newItem]);
    (window as any)._draggingBentoType = null;
    selectSection(moduleId);
    setSelectedIndex(rawItems.length);
  };

  const getLayoutEntryForBreakpoint = (item: any, breakpoint: 'desktop' | 'tablet' | 'mobile', colsForBreakpoint: number) => {
    if (item.layouts?.[breakpoint]) {
      return normalizeLayoutEntry({
        ...item.layouts[breakpoint],
        w: Math.min(item.layouts[breakpoint].w || 1, colsForBreakpoint)
      });
    }

    const w = breakpoint === 'mobile' ? (item.mobile_span || item.col_span || 4) :
              breakpoint === 'tablet' ? (item.tablet_span || 2) :
              (item.desktop_span || item.col_span || 4);
    const h = breakpoint === 'mobile' ? (item.mobile_rows || item.row_span || 2) :
              (item.desktop_rows || item.row_span || 2);

    return {
      x: Math.min(item.x || 0, Math.max(colsForBreakpoint - Math.min(w, colsForBreakpoint), 0)),
      y: item.y || 0,
      w: Math.min(w, colsForBreakpoint),
      h
    };
  };

  const doLayoutsOverlap = (a: any, b: any) => (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );

  const getNextFreeLayout = (
    breakpoint: 'desktop' | 'tablet' | 'mobile',
    colsForBreakpoint: number,
    width: number,
    height: number
  ) => {
    const safeWidth = Math.min(width, colsForBreakpoint);
    const existingLayouts = rawItems.map((item: any) => getLayoutEntryForBreakpoint(item, breakpoint, colsForBreakpoint));
    const maxY = existingLayouts.length > 0
      ? Math.max(...existingLayouts.map((layout: any) => layout.y + layout.h))
      : 0;

    for (let y = 0; y <= maxY + height; y += 1) {
      for (let x = 0; x <= colsForBreakpoint - safeWidth; x += 1) {
        const candidate = { x, y, w: safeWidth, h: height };
        if (!existingLayouts.some((layout: any) => doLayoutsOverlap(candidate, layout))) {
          return candidate;
        }
      }
    }

    return { x: 0, y: maxY, w: safeWidth, h: height };
  };

  const getNextStackedLayout = (
    breakpoint: 'tablet' | 'mobile',
    colsForBreakpoint: number,
    width: number,
    height: number
  ) => {
    const safeWidth = Math.min(width, colsForBreakpoint);
    const y = rawItems.length > 0
      ? Math.max(...rawItems.map((item: any) => {
          const layout = getLayoutEntryForBreakpoint(item, breakpoint, colsForBreakpoint);
          return layout.y + layout.h;
        }))
      : 0;

    return { x: 0, y, w: safeWidth, h: height };
  };

  const createResponsiveLayouts = (desktopW: number, desktopH: number, tabletW = Math.min(desktopW, 6), mobileW = 4) => ({
    desktop: getNextFreeLayout('desktop', columns, desktopW, desktopH),
    tablet: getNextFreeLayout('tablet', 6, tabletW, desktopH),
    mobile: getNextStackedLayout('mobile', 4, mobileW, desktopH)
  });

  const createBentoElementPreset = (kind: string) => {
    const base = {
      id: createBentoCellId(),
      card_style: "solid",
      card_radius: 28,
      card_shadow: 'sm',
      padding: 32,
      content_align: 'center',
      x: 0,
      y: 0
    };

    const withLayout = (item: any, desktopW: number, desktopH: number, tabletW?: number, mobileW?: number) => {
      const itemLayouts = createResponsiveLayouts(desktopW, desktopH, tabletW, mobileW);

      return {
        ...base,
        ...item,
        col_span: desktopW,
        row_span: desktopH,
        desktop_span: desktopW,
        desktop_rows: desktopH,
        tablet_span: tabletW ?? Math.min(desktopW, 6),
        mobile_span: mobileW ?? 4,
        x: itemLayouts.desktop.x,
        y: itemLayouts.desktop.y,
        layouts: itemLayouts
      };
    };

    switch (kind) {
      case 'visual':
        return withLayout({
          type: 'visual',
          title: 'Imagen destacada',
          description: '',
          image: '',
          card_style: 'transparent',
          padding: 0
        }, 3, 2, 3, 4);
      case 'button':
        return withLayout({
          type: 'button',
          title: 'Haz clic aquí',
          button_text: 'Haz clic aquí',
          btn_url: '#',
          card_style: 'transparent',
          padding: 16
        }, 3, 1, 3, 4);
      case 'icon':
        return withLayout({
          type: 'icon',
          title: 'Ícono destacado',
          icon: 'Sparkles',
          description: ''
        }, 2, 2, 2, 4);
      case 'badge':
        return withLayout({
          type: 'badge',
          title: 'Nuevo',
          icon: 'Tag',
          card_style: 'transparent',
          padding: 12
        }, 2, 1, 2, 4);
      case 'metric':
        return withLayout({
          type: 'metric',
          title: '99+',
          description: 'Impacto medible',
          metric_value: '99+',
          metric_label: 'Impacto',
          icon: 'BarChart3',
          accent_color: '#3B82F6'
        }, 3, 2, 3, 4);
      case 'list':
        return withLayout({
          type: 'list',
          title: 'Puntos clave',
          description: '',
          list_items: ['Primer punto', 'Segundo punto', 'Tercer punto'],
          icon: 'ListChecks'
        }, 4, 3, 4, 4);
      case 'accordion':
        return withLayout({
          type: 'accordion',
          title: 'Ver más detalles',
          description: 'Contenido desplegable para ampliar esta idea.',
          icon: 'ChevronDown'
        }, 4, 2, 4, 4);
      case 'marquee':
        return withLayout({
          type: 'marquee',
          title: 'PROMO • NUEVO • 24/7',
          card_style: 'transparent',
          padding: 12
        }, 8, 1, 6, 4);
      case 'card':
        return withLayout({
          type: 'card',
          title: 'Tarjeta simple',
          description: 'Combina texto, estilo e imagen de fondo.',
          icon: 'PanelTop'
        }, 4, 2, 3, 4);
      case 'text':
      default:
        return withLayout({
          type: 'text',
          title: 'Título del texto',
          description: 'Escribe aquí tu contenido...',
          icon: 'Type'
        }, 4, 2, 3, 4);
    }
  };

  const handleAddElement = (kind: string) => {
    if (!onSettingChange) return;

    const newItem = createBentoElementPreset(kind);

    const newItems = [...rawItems, newItem];
    onSettingChange(`${moduleId}_el_bento_items`, 'items', newItems);
    selectSection(moduleId);
    setSelectedIndex(newItems.length - 1);
    setIsElementPickerOpen(false);

    if (isBentoDebugEnabled()) {
      console.log('[BENTO_CELL_UPDATE_DEBUG]', {
        moduleId,
        action: "add_element",
        kind,
        itemsCount: newItems.length,
        updatedItem: newItem
      });
    }
  };

  const removeItem = (index: number) => {
    if (!onSettingChange) return;
    const newItems = rawItems.filter((_: any, i: number) => i !== index);
    onSettingChange(`${moduleId}_el_bento_items`, 'items', newItems);
    if (selectedIndex === index) setSelectedIndex(null);
    else if (selectedIndex !== null && selectedIndex > index) setSelectedIndex(selectedIndex - 1);
  };

  const duplicateItem = (index: number) => {
    if (!onSettingChange) return;
    const itemToDuplicate = rawItems[index];
    const offsetLayout = (layout: any, colsForLayout: number) => {
      const entry = normalizeLayoutEntry(layout);
      const nextX = Math.min(entry.x + 1, Math.max(0, colsForLayout - entry.w));
      return { ...entry, x: nextX, y: entry.y + 1 };
    };
    const duplicatedLayouts = itemToDuplicate.layouts
      ? {
          ...itemToDuplicate.layouts,
          ...(itemToDuplicate.layouts.desktop ? { desktop: offsetLayout(itemToDuplicate.layouts.desktop, columns) } : {}),
          ...(itemToDuplicate.layouts.tablet ? { tablet: offsetLayout(itemToDuplicate.layouts.tablet, 6) } : {}),
          ...(itemToDuplicate.layouts.mobile ? { mobile: offsetLayout(itemToDuplicate.layouts.mobile, 4) } : {})
        }
      : undefined;
    const duplicatedDesktopLayout = duplicatedLayouts?.desktop;
    const newItem = { 
      ...itemToDuplicate,
      id: createBentoCellId(),
      ...(duplicatedLayouts ? { layouts: duplicatedLayouts } : {}),
      x: duplicatedDesktopLayout?.x ?? ((itemToDuplicate.x + 1) % columns),
      y: duplicatedDesktopLayout?.y ?? (itemToDuplicate.y + 1),
      col_span: duplicatedDesktopLayout?.w ?? itemToDuplicate.col_span,
      row_span: duplicatedDesktopLayout?.h ?? itemToDuplicate.row_span
    };
    onSettingChange(`${moduleId}_el_bento_items`, 'items', [...rawItems, newItem]);
    selectSection(moduleId);
    setSelectedIndex(rawItems.length);
  };

  const renameItem = (index: number, newName: string) => {
    if (!onSettingChange) return;
    const newItems = [...rawItems];
    newItems[index] = { ...newItems[index], admin_label: newName };
    onSettingChange(`${moduleId}_el_bento_items`, 'items', newItems);
  };

  const renderElementPicker = (variant: 'empty' | 'floating') => (
    <AnimatePresence>
      {isElementPickerOpen && (
        <motion.div
          initial={{ opacity: 0, y: variant === 'empty' ? 8 : 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          className={variant === 'empty'
            ? 'pointer-events-auto fixed left-1/2 top-1/2 z-50 w-[680px] max-w-[calc(100vw-32px)] max-h-[70vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2rem] border border-gray-100 bg-white text-left shadow-2xl'
            : 'absolute bottom-full left-1/2 z-50 mb-3 w-[680px] max-w-[calc(100vw-48px)] max-h-[70vh] -translate-x-1/2 overflow-hidden rounded-[2rem] border border-gray-100 bg-white text-left shadow-2xl'
          }
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-4">
            <div>
              <h4 className="text-sm font-black text-slate-900">Elegir elemento</h4>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Agrega piezas flexibles al Bento sin salir del lienzo.
              </p>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsElementPickerOpen(false);
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Cerrar selector de elementos Bento"
            >
              <LucideIcons.X size={18} />
            </button>
          </div>
          <div className="grid max-h-[calc(70vh-88px)] grid-cols-1 gap-2 overflow-y-auto p-3 sm:grid-cols-2">
            {BENTO_ELEMENT_OPTIONS.map((option) => {
              const PickerIcon = (LucideIcons as any)[option.icon] || Sparkles;
              return (
                <button
                  key={option.kind}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAddElement(option.kind);
                  }}
                  className="flex min-h-[76px] items-start gap-3 rounded-2xl border border-gray-100 bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <PickerIcon size={18} />
                  </span>
                  <span>
                    <span className="block text-xs font-black text-gray-900">{option.label}</span>
                    <span className="block text-[10px] font-medium leading-snug text-gray-400">{option.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Header Values
  const headerEyebrow = getVal(`${moduleId}_el_bento_header`, 'eyebrow', '');
  const headerTitle = getVal(`${moduleId}_el_bento_header`, 'title', '');
  const headerSubtitle = getVal(`${moduleId}_el_bento_header`, 'subtitle', '');
  const headerTitleSize = getTypographyStyle(getVal(`${moduleId}_el_bento_header`, 'title_size', 't2'), 't2');
  const headerTitleWeight = getFontWeightValue(getVal(`${moduleId}_el_bento_header`, 'title_weight', 'extrabold'), 'extrabold');
  const headerTitleColor = resolveThemeColor(getVal(`${moduleId}_el_bento_header`, 'title_color', undefined), '#0F172A', '#FFFFFF', darkMode);
  const headerTitleHighlightType = getVal(`${moduleId}_el_bento_header`, 'title_highlight_type', 'gradient');
  const headerTitleHighlightColor = getVal(`${moduleId}_el_bento_header`, 'title_highlight_color', '#3B82F6');
  const headerTitleHighlightGradient = getVal(`${moduleId}_el_bento_header`, 'title_highlight_gradient', 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)');
  const headerTitleHighlightBold = toBoolean(getVal(`${moduleId}_el_bento_header`, 'title_highlight_bold', true));
  const headerSubtitleSize = getTypographyStyle(getVal(`${moduleId}_el_bento_header`, 'subtitle_size', 'p'), 'p');
  const headerSubtitleWeight = getFontWeightValue(getVal(`${moduleId}_el_bento_header`, 'subtitle_weight', 'normal'), 'normal');
  const headerSubtitleColor = resolveThemeColor(getVal(`${moduleId}_el_bento_header`, 'subtitle_color', undefined), '#64748B', '#94A3B8', darkMode);
  const headerSubtitleHighlightType = getVal(`${moduleId}_el_bento_header`, 'subtitle_highlight_type', 'gradient');
  const headerSubtitleHighlightColor = getVal(`${moduleId}_el_bento_header`, 'subtitle_highlight_color', '#3B82F6');
  const headerSubtitleHighlightGradient = getVal(`${moduleId}_el_bento_header`, 'subtitle_highlight_gradient', 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)');
  const headerSubtitleHighlightBold = toBoolean(getVal(`${moduleId}_el_bento_header`, 'subtitle_highlight_bold', true));
  const headerEyebrowColor = resolveThemeColor(getVal(`${moduleId}_el_bento_header`, 'eyebrow_color', undefined), '#3B82F6', '#60A5FA', darkMode);
  const headerAlign = getVal(`${moduleId}_el_bento_header`, 'align', 'center');
  const headerMarginB = parseNumSafe(getVal(`${moduleId}_el_bento_header`, 'margin_b', 60), 60);

  const showHeader = headerEyebrow || headerTitle || headerSubtitle;

  const shouldShowEmptyState = !isPreviewMode && rawItems.length === 0;
  const isSelected = !isPreviewMode && settingsValues.isSelected; // Some canvases pass this

  useEffect(() => {
    if (!isPreviewMode && isBentoDebugEnabled()) {
      console.log('[BENTO_RENDER_DEBUG]', {
        moduleId,
        itemsCount: rawItems.length,
        columns,
        gap,
        hasHeader: showHeader,
        shouldShowEmptyState,
        isPreviewMode,
        allKeys: Object.keys(settingsValues).filter(k => k.startsWith(moduleId))
      });
    }
  }, [moduleId, rawItems.length, columns, gap, isPreviewMode, shouldShowEmptyState]);

  const bentoType = getVal(null, 'bento_type', 'mixed_content');

  return (
    <SectionAnimation animation={sectionAnimation} speed={globalThemeSectionAnimationSpeed}>
      <section 
        id={moduleId}
        ref={containerRef}
        onClick={(e) => {
          if (isPreviewMode) return;
          e.stopPropagation();
          selectSection(moduleId);
          setSelectedIndex(null);
        }}
        className={`w-full relative ${isElementPickerOpen ? 'overflow-visible' : 'overflow-hidden'} transition-colors duration-500 bento-specialization-${bentoType} ${isDragging ? 'bento-dragging' : ''}`}
        data-bento-type={bentoType}
        style={{ 
          backgroundColor: bgColor,
          backgroundImage: (sectionGradient && typeof bgGradient === 'string' && !bgGradient.includes('NaN')) ? bgGradient : 'none',
          paddingTop: `${paddingY}px`,
          paddingBottom: `${paddingY}px`
        }}
      >
      <ParallaxBackground 
        scrollYProgress={scrollYProgress}
        enabled={bgParallaxEnabled}
        imageUrl={bgParallaxImg}
        opacity={bgParallaxOpacity}
        overlayColor={bgParallaxOverlay}
        speed={bgParallaxSpeed}
      />
      <div className="mx-auto px-4 sm:px-8" style={{ maxWidth: `${maxWidth}px` }}>
        
        {/* Header Section */}
        {showHeader && (
          <div 
            className={`flex flex-col mb-12 relative z-20 ${
              headerAlign === 'center' ? 'items-center text-center' : 
              headerAlign === 'right' ? 'items-end text-right' : 
              'items-start text-left'
            }`}
            style={{ marginBottom: `${headerMarginB}px` }}
          >
            {headerEyebrow && (
              <motion.span
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
                style={{ color: headerEyebrowColor }}
              >
                <InlineEditableText
                  moduleId={moduleId}
                  settingId="el_bento_header_eyebrow"
                  value={headerEyebrow}
                  tagName="span"
                  isPreviewMode={isPreviewMode}
                  onSave={(val) => onSettingChange?.(`${moduleId}_el_bento_header`, 'eyebrow', val)}
                />
              </motion.span>
            )}
            {headerTitle && (
              <motion.h2
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="max-w-3xl leading-[1.1] mb-6"
                style={{ 
                  fontSize: `${headerTitleSize.fontSize}px`,
                  lineHeight: headerTitleSize.lineHeight,
                  fontWeight: headerTitleWeight,
                  color: headerTitleColor
                }}
              >
                <InlineEditableText
                  moduleId={moduleId}
                  settingId="el_bento_header_title"
                  value={headerTitle}
                  tagName="span"
                  isPreviewMode={isPreviewMode}
                  onSave={(val) => onSettingChange?.(`${moduleId}_el_bento_header`, 'title', val)}
                >
                  <TextRenderer
                    text={headerTitle}
                    highlightType={headerTitleHighlightType}
                    highlightColor={headerTitleHighlightColor}
                    highlightGradient={headerTitleHighlightGradient}
                    highlightBold={headerTitleHighlightBold}
                  />
                </InlineEditableText>
              </motion.h2>
            )}
            {headerSubtitle && (
              <motion.p
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="max-w-2xl"
                style={{ 
                  fontSize: `${headerSubtitleSize.fontSize}px`,
                  fontWeight: headerSubtitleWeight,
                  color: headerSubtitleColor,
                  lineHeight: headerSubtitleSize.lineHeight
                }}
              >
                <InlineEditableText
                  moduleId={moduleId}
                  settingId="el_bento_header_subtitle"
                  value={headerSubtitle}
                  tagName="span"
                  isPreviewMode={isPreviewMode}
                  onSave={(val) => onSettingChange?.(`${moduleId}_el_bento_header`, 'subtitle', val)}
                >
                  <TextRenderer
                    text={headerSubtitle}
                    highlightType={headerSubtitleHighlightType}
                    highlightColor={headerSubtitleHighlightColor}
                    highlightGradient={headerSubtitleHighlightGradient}
                    highlightBold={headerSubtitleHighlightBold}
                  />
                </InlineEditableText>
              </motion.p>
            )}
          </div>
        )}

        {/* Grid Guide - Only visible in constructor */}
        {!isPreviewMode && !shouldShowEmptyState && (
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-0" style={{ margin: `0 ${gap}px` }}>
            <div 
              className="w-full h-full grid" 
              style={{ 
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${gap}px`,
              }}
            >
              {Array.from({ length: columns * 8 }).map((_, i) => (
                <div 
                  key={i} 
                  className="border border-primary/30 rounded-[28px]" 
                  style={{ height: '80px' }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Bento Grid */}
        <div 
          className={`w-full transition-all duration-500 relative ${!isPreviewMode ? 'min-h-[400px] border-2 border-dashed border-gray-200 rounded-[40px] hover:border-primary/40' : ''} ${!isPreviewMode && rawItems.length === 0 ? 'bg-blue-50/10 border-blue-200/50' : ''}`} 
          style={{ 
            opacity: 1,
            visibility: 'visible',
            minHeight: !isPreviewMode ? '400px' : 'auto'
          }}
        >
          {/* Editor Label */}
          {!isPreviewMode && (
            <div className="absolute -top-3 left-8 z-30 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
              {selectedIndex !== null ? 'Estás editando una celda' : 'Bento Grid'}
            </div>
          )}

          <ResponsiveGridLayout
            className="layout w-full relative z-10"
            onBreakpointChange={handleBreakpointChange}
            onWidthChange={(w) => {
              if (isBentoDebugEnabled()) console.log('[BENTO_WIDTH_CHANGE]', w);
            }}
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: columns, md: columns, sm: 6, xs: 4, xxs: 1 }}
            rowHeight={80}
            margin={[gap, gap]}
            containerPadding={[0, 0]}
            isDraggable={!isPreviewMode}
            isResizable={!isPreviewMode}
            isDroppable={!isPreviewMode}
            onLayoutChange={handleLayoutChange}
            onDragStart={() => setIsDragging(true)}
            onDragStop={() => setIsDragging(false)}
            onResizeStart={() => setIsDragging(true)}
            onResizeStop={() => setIsDragging(false)}
            onDrop={handleDrop}
            useCSSTransforms={true}
            measureBeforeMount={true}
            droppingItem={{ i: "__dropping_elem__", w: 4, h: 2, x: 0, y: 0 }}
          >
            {rawItems.map((item: any, i: number) => {
              const {
                type,
                icon,
                priority = 'standard',
                card_style = 'solid',
                card_bg = '#FFFFFF',
                card_gradient = 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
                card_image = '',
                image_fit = 'cover',
                card_overlay = 0,
                card_border = 'rgba(0,0,0,0.05)',
                card_radius = 28,
                card_shadow = 'sm',
                padding = 32,
                align_items = 'start',
                hover_effect = 'lift',
                z_index = 1,
                text_contrast = 'auto'
              } = item;

              const IconComponent = (LucideIcons as any)[icon] || Sparkles;
              const resolvedCardBg = resolveThemeColor(card_bg, '#FFFFFF', '#1E293B', darkMode);
              const resolvedCardBorder = resolveThemeColor(card_border, 'rgba(0,0,0,0.05)', 'rgba(255,255,255,0.1)', darkMode);

              const isSafeGradient = (val: any) => typeof val === 'string' && !val.includes('NaN');
              const finalBg = (card_style === 'solid' || card_style === 'glow') ? resolvedCardBg : 
                              (card_style === 'gradient' && isSafeGradient(card_gradient)) ? card_gradient : 
                              card_style === 'glass' ? (darkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)') : 
                              'transparent';
              const glowShadow = card_style === 'glow'
                ? `0 20px 60px -24px ${resolvedCardBg}, 0 0 0 1px ${resolvedCardBorder}`
                : undefined;
              
              // Hero styling is handled within BentoCellContent or specifically here for its container
              const isHeroType = type === 'hero' || priority === 'hero';
              const specialBg = isHeroType ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' : undefined;

              const shadowClass = {
                none: 'shadow-none',
                sm: 'shadow-sm',
                lg: 'shadow-2xl',
                xl: 'shadow-[0_20px_50px_rgba(0,0,0,0.1)]'
              }[card_shadow as string] || 'shadow-sm';

              const alignClass = {
                'start': 'justify-start items-start text-left',
                'center': 'justify-center items-center text-center',
                'end': 'justify-end items-end text-right'
              }[align_items as string] || 'justify-start items-start';

              const hoverClass = isPreviewMode ? {
                lift: 'hover:-translate-y-2 hover:shadow-2xl',
                zoom: 'hover:scale-[1.02]',
                pulse: 'hover:ring-4 hover:ring-primary/20',
                none: ''
              }[hover_effect as string] || '' : '';

              const isSelected = selectedIndex === i;
              const rglKey = i.toString();
              const cellKey = item.id || rglKey;

              return (
                <div 
                  key={rglKey} 
                  className={`relative ${!isPreviewMode ? 'group/rgl' : ''}`}
                >
                  <motion.div 
                    key={cellKey}
                    variants={entranceAnim !== 'none' ? itemVariants : {}}
                    initial={entranceAnim !== 'none' ? "hidden" : "visible"}
                    whileInView={entranceAnim !== 'none' ? "visible" : "visible"}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    onClick={(e) => {
                      if (!isPreviewMode) {
                        e.stopPropagation();
                        selectSection(moduleId);
                        setSelectedIndex(i);
                      }
                    }}
                    className={`w-full h-full overflow-hidden transition-all duration-300 group flex flex-col cursor-pointer relative ${shadowClass} ${hoverClass} ${alignClass} ${card_style === 'glass' ? 'backdrop-blur-xl' : ''} ${
                      isSelected ? 'ring-4 ring-primary ring-offset-4 scale-[1.01] z-50 shadow-2xl' : 'z-10'
                    }`}
                    style={{
                      backgroundColor: specialBg ? undefined : (card_style !== 'gradient' ? finalBg : undefined),
                      backgroundImage: specialBg || (card_style === 'gradient' ? finalBg : undefined),
                      borderRadius: `${card_radius}px`,
                      border: (card_style === 'transparent' || isHeroType) ? 'none' : `1px solid ${resolvedCardBorder}`,
                      padding: type === 'visual' ? 0 : `${padding}px`,
                      boxShadow: glowShadow,
                      zIndex: isSelected ? 50 : z_index
                    }}
                  >
                    {/* Selected Indicator Labels (Only in Constructor) */}
                    {isSelected && (
                      <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
                        <div className="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-lg">
                          Editando Bloque: {item.title || 'Nuevo'}
                        </div>
                      </div>
                    )}

                    {/* Delete/Action Buttons (Only in Constructor) */}
                    {!isPreviewMode && (
                      <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                        <button 
                          onClick={(e) => { e.stopPropagation(); duplicateItem(i); }}
                          className="p-1.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 shadow-md border border-gray-100"
                          title="Duplicar"
                        >
                          <LucideIcons.Copy size={12} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeItem(i); }}
                          className="p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 shadow-md transition-colors"
                          title="Eliminar"
                        >
                          <LucideIcons.Trash2 size={12} />
                        </button>
                      </div>
                    )}

                    {/* Background Image Logic */}
                    {card_image && type !== 'visual' && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                        <img 
                          src={card_image} 
                          className={`w-full h-full transition-transform duration-700 ${hover_effect === 'zoom' ? 'group-hover:scale-110' : ''} object-cover`}
                          referrerPolicy="no-referrer"
                          alt=""
                          style={{ objectFit: image_fit }}
                        />
                        {card_overlay > 0 && (
                          <div 
                            className="absolute inset-0 bg-black" 
                            style={{ opacity: card_overlay / 100 }}
                          />
                        )}
                      </div>
                    )}

                    {/* Decorative element for Hero (Legacy Icon) */}
                    {isHeroType && !card_image && (
                      <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12 transition-transform group-hover:scale-110 duration-700">
                        <IconComponent size={180} />
                      </div>
                    )}

                    {/* Content */}
                    <BentoCellContent 
                        item={item} 
                        darkMode={darkMode} 
                        moduleId={moduleId}
                        isPreviewMode={isPreviewMode}
                        onSave={(field: string, val: string) => {
                          const newItems = [...rawItems];
                          newItems[i] = { ...newItems[i], [field]: val };
                          if (onSettingChange) {
                            onSettingChange(`${moduleId}_el_bento_items`, 'items', newItems);
                          }
                        }}
                    />
                  </motion.div>
                </div>
              );
            })}
          </ResponsiveGridLayout>
        </div>

        {/* Hint when empty - subtle overlay over the grid guide */}
        {!isPreviewMode && rawItems.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 pointer-events-none z-20">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl text-center max-w-sm pointer-events-auto"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Bento Grid Vacío</h3>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                Esta sección permite crear composiciones modulares flexibles. Arrastra bloques desde el panel o usa las acciones de abajo.
              </p>
              <div className="flex flex-col gap-3">
                 <button 
                   onClick={(e) => { e.stopPropagation(); setIsElementPickerOpen((open) => !open); }}
                   className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                 >
                   <LucideIcons.Plus size={18} />
                   Agregar elemento
                 </button>
                 {BENTO_AI_ACTIONS_ENABLED && (
                   <button 
                     onClick={(e) => { e.stopPropagation(); onOpenBentoGenerator?.(); }}
                     className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-4 rounded-2xl font-bold hover:bg-blue-100 active:scale-95 transition-all border border-blue-100"
                   >
                     <Sparkles size={18} />
                     Generar con IA
                   </button>
                 )}
              </div>
            </motion.div>
            {renderElementPicker('empty')}
          </div>
        )}

        {/* Floating Add Button (when items exist) */}
        {!isPreviewMode && rawItems.length > 0 && (
          <div className="relative z-40 mx-auto mt-6 flex w-fit items-center gap-3 rounded-2xl border border-gray-100 bg-white/80 p-2 shadow-2xl backdrop-blur-md">
            {renderElementPicker('floating')}
            <button 
               onClick={(e) => { e.stopPropagation(); setIsElementPickerOpen((open) => !open); }}
               className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap"
            >
              <LucideIcons.Plus size={16} />
              <span className="text-xs">Agregar elemento</span>
            </button>
            {BENTO_AI_ACTIONS_ENABLED && (
              <>
                <div className="w-px h-6 bg-gray-200" />
                <button 
                   onClick={(e) => { e.stopPropagation(); onOpenBentoGenerator?.(); }}
                   className="flex items-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-all active:scale-95"
                >
                  <Sparkles size={16} />
                  <span className="text-xs">IA</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
      </section>
    </SectionAnimation>
  );
};
