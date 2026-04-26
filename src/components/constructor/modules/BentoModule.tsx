import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useScroll } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { TextRenderer } from '../TextRenderer';
import { ParallaxBackground } from '../ParallaxBackground';
import { parseNumSafe } from '../utils';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import { GLOBAL_ANIMATIONS, getGlobalAnimation } from '../../../constants/animations';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

// --- SUB-ELEMENT RENDERERS ---


import { InlineEditableText } from '../InlineEditableText';

const BentoCellContent = ({ item, darkMode, moduleId, isPreviewMode, onSave }: any) => {
  const {
    type,
    title,
    description,
    icon,
    eyebrow,
    button_text,
    btn_url,
    btn_target,
    title_size = 't3',
    title_weight = 'extrabold',
    title_color,
    desc_size = 'p',
    desc_color,
  } = item;

  const IconComponent = (LucideIcons as any)[icon] || Sparkles;
  
  const finalTitleColor = title_color || (darkMode ? '#FFFFFF' : '#0F172A');
  const finalDescColor = desc_color || (darkMode ? '#94A3B8' : '#64748B');

  switch (type) {
    case 'stat':
      return (
        <div className="flex flex-col gap-2 z-10 w-full h-full">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <IconComponent size={24} />
             </div>
             {eyebrow && (
               <InlineEditableText
                 moduleId={moduleId}
                 settingId="eyebrow"
                 value={eyebrow}
                 tagName="span"
                 isPreviewMode={isPreviewMode}
                 onSave={(val) => onSave('eyebrow', val)}
                 className="text-[10px] font-bold tracking-widest uppercase opacity-60"
               />
             )}
          </div>
          <h4 
            className="leading-none mt-2"
            style={{ 
              fontSize: window.innerWidth < 640 ? '32px' : '48px',
              fontWeight: 900,
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
          </h4>
          {description && (
            <p 
              className="line-clamp-2"
              style={{ 
                fontSize: `${TYPOGRAPHY_SCALE[desc_size as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 16}px`,
                color: finalDescColor
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

    case 'icon_text':
      return (
        <div className="flex flex-col gap-4 z-10 w-full h-full">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <IconComponent size={32} />
          </div>
          <div>
            {eyebrow && (
              <InlineEditableText
                moduleId={moduleId}
                settingId="eyebrow"
                value={eyebrow}
                tagName="span"
                isPreviewMode={isPreviewMode}
                onSave={(val) => onSave('eyebrow', val)}
                className="text-[10px] font-bold tracking-widest uppercase opacity-60 mb-1 block"
              />
            )}
            <h3 
              className="mb-2 leading-tight"
              style={{ 
                fontSize: `${TYPOGRAPHY_SCALE[title_size as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 24}px`,
                fontWeight: FONT_WEIGHTS[title_weight as keyof typeof FONT_WEIGHTS]?.value || 800,
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
              <p 
                style={{ 
                  fontSize: `${TYPOGRAPHY_SCALE[desc_size as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 16}px`,
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
          </div>
        </div>
      );

    case 'cta':
      return (
        <div className="flex flex-col gap-6 z-10 w-full h-full justify-center">
          <div>
            <h3 
              className="mb-3 leading-tight"
              style={{ 
                fontSize: `${TYPOGRAPHY_SCALE[title_size as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 32}px`,
                fontWeight: FONT_WEIGHTS[title_weight as keyof typeof FONT_WEIGHTS]?.value || 900,
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
              <p style={{ color: finalDescColor }}>
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
          <a 
            href={btn_url || '#'}
            target={btn_target === '_blank' ? '_blank' : undefined}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 group"
          >
            <InlineEditableText
              moduleId={moduleId}
              settingId="button_text"
              value={button_text}
              tagName="span"
              isPreviewMode={isPreviewMode}
              onSave={(val) => onSave('button_text', val)}
            />
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      );

    case 'video':
      return null;

    default: // 'text' or 'image'
      return (
        <div className="flex flex-col gap-3 z-10 w-full h-full">
          {eyebrow && (
            <InlineEditableText
              moduleId={moduleId}
              settingId="eyebrow"
              value={eyebrow}
              tagName="span"
              isPreviewMode={isPreviewMode}
              onSave={(val) => onSave('eyebrow', val)}
              className="text-xs font-bold tracking-[0.2em] uppercase opacity-70 mb-1 block"
              style={{ color: darkMode ? '#3B82F6' : 'var(--color-primary)' }}
            />
          )}
          {title && (
            <h3 
              className="mb-2 leading-tight"
              style={{ 
                fontSize: `${TYPOGRAPHY_SCALE[title_size as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 24}px`,
                fontWeight: FONT_WEIGHTS[title_weight as keyof typeof FONT_WEIGHTS]?.value || 800,
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
                fontSize: `${TYPOGRAPHY_SCALE[desc_size as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 16}px`,
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

export const BentoModule: React.FC<{ 
  moduleId: string; 
  settingsValues: Record<string, any>;
  onSettingChange?: (id: string, settingId: string, value: any) => void;
  isPreviewMode?: boolean;
}> = ({ moduleId, settingsValues, onSettingChange, isPreviewMode }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const columns = Math.max(1, parseInt(getVal(null, 'columns', 12)) || 12);
  const gap = parseNumSafe(getVal(null, 'gap', 20), 20);
  const paddingY = parseNumSafe(getVal(null, 'padding_y', 100), 100);
  const maxWidth = parseNumSafe(getVal(null, 'max_width', 1400), 1400);
  const darkMode = getVal(null, 'dark_mode', false);
  const bgColor = getVal(null, 'bg_color', darkMode ? '#0F172A' : '#FFFFFF');
  const sectionGradient = getVal(null, 'section_gradient', false);
  const bgGradient = getVal(null, 'bg_gradient', 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)');
  const entranceAnim = getVal(null, 'entrance_anim', 'fade_up');

  // Animation Overrides
  const globalAnimOverride = getGlobalAnimation(entranceAnim, 'bento');

  // Multimedia (Parallax Background)
  const bgParallaxEnabled = getVal(null, 'bg_parallax_enabled', false);
  const bgParallaxImg = getVal(null, 'bg_parallax_img', '');
  const bgParallaxOpacity = parseNumSafe(getVal(null, 'bg_parallax_opacity', 20), 20);
  const bgParallaxOverlay = getVal(null, 'bg_parallax_overlay', '#000000');
  const bgParallaxSpeed = parseNumSafe(getVal(null, 'bg_parallax_speed', 100), 100);

  // Items Data
  const rawItems = getVal(`${moduleId}_el_bento_items`, 'items', []);
  
  // Convert items to RGL format
  const layout = useMemo(() => {
    return rawItems.map((item: any, index: number) => ({
      i: index.toString(),
      x: parseInt(item.x) || 0,
      y: parseInt(item.y) || 0,
      w: parseInt(item.col_span) || 4,
      h: parseInt(item.row_span) || 2,
    }));
  }, [rawItems, columns]);

  const itemVariants = globalAnimOverride || {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const handleLayoutChange = (newLayout: any) => {
    if (!onSettingChange || isPreviewMode) return;

    const newItems = [...rawItems];
    let changed = false;

    newLayout.forEach((l: any) => {
      const idx = parseInt(l.i);
      if (newItems[idx]) {
        const x = isNaN(parseInt(l.x)) ? 0 : parseInt(l.x);
        const y = isNaN(parseInt(l.y)) ? 0 : parseInt(l.y);
        const w = isNaN(parseInt(l.w)) ? 1 : parseInt(l.w);
        const h = isNaN(parseInt(l.h)) ? 1 : parseInt(l.h);

        if (
          newItems[idx].col_span !== w || 
          newItems[idx].row_span !== h ||
          newItems[idx].x !== x ||
          newItems[idx].y !== y
        ) {
          newItems[idx] = { 
            ...newItems[idx], 
            col_span: w, 
            row_span: h,
            x: x,
            y: y
          };
          changed = true;
        }
      }
    });

    if (changed) {
      onSettingChange(`${moduleId}_el_bento_items`, 'items', newItems);
    }
  };

  const handleDrop = (layout: any, item: any, e: Event) => {
    if (!onSettingChange) return;
    
    const type = (window as any)._draggingBentoType || 'text';
    
    const newItem = {
      type,
      title: type === 'stat' ? '99+' : (type === 'cta' ? '¡Únete ahora!' : 'Nuevo Bloque'),
      description: 'Personaliza este bloque desde el panel de ajustes.',
      col_span: item.w,
      row_span: item.h,
      x: item.x,
      y: item.y,
      card_style: 'solid',
      card_radius: 28,
      padding: 32,
      content_align: 'center',
      icon: type === 'stat' ? 'Zap' : 'Sparkles',
      button_text: 'Explorar'
    };

    onSettingChange(`${moduleId}_el_bento_items`, 'items', [...rawItems, newItem]);
    (window as any)._draggingBentoType = null;
    setSelectedIndex(rawItems.length);
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
    const newItem = { 
      ...itemToDuplicate,
      x: (itemToDuplicate.x + 1) % columns, // Simple shift to avoid complete overlap
      y: itemToDuplicate.y + 1
    };
    onSettingChange(`${moduleId}_el_bento_items`, 'items', [...rawItems, newItem]);
    setSelectedIndex(rawItems.length);
  };

  const renameItem = (index: number, newName: string) => {
    if (!onSettingChange) return;
    const newItems = [...rawItems];
    newItems[index] = { ...newItems[index], admin_label: newName };
    onSettingChange(`${moduleId}_el_bento_items`, 'items', newItems);
  };

  return (
    <section 
      id={moduleId}
      ref={containerRef}
      className={`w-full relative overflow-hidden transition-colors duration-500 ${isDragging ? 'bento-dragging' : ''}`}
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
        
        {/* Grid Guide - Only visible in constructor */}
        {!isPreviewMode && (
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
          className="w-full" 
          style={{ 
            minHeight: rawItems.length > 0 ? '400px' : '300px',
            opacity: 1,
            visibility: 'visible'
          }}
        >
          <ResponsiveGridLayout
            className="layout w-full relative z-10"
            layouts={{ 
              lg: layout, 
              md: layout, 
              sm: layout, 
              xs: layout, 
              xxs: layout.map((l: any, idx: number) => ({ 
                ...l, 
                w: 1, 
                x: 0, 
                y: idx * 2 
              }))
            }}
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
              card_style = 'solid',
              card_bg = '#FFFFFF',
              card_gradient = 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
              card_border = 'rgba(0,0,0,0.05)',
              card_radius = 28,
              card_shadow = 'sm',
              padding = 32,
              content_align = 'center',
              image,
              image_fit = 'cover',
              overlay_opacity = 0,
              hover_effect = 'lift',
              z_index = 1
            } = item;

            const isSafeGradient = (val: any) => typeof val === 'string' && !val.includes('NaN');
            const finalBg = card_style === 'solid' ? (darkMode ? '#1E293B' : card_bg) : 
                            (card_style === 'gradient' && isSafeGradient(card_gradient)) ? card_gradient : 
                            card_style === 'glass' ? (darkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)') : 
                            'transparent';
            
            const shadowClass = {
              none: 'shadow-none',
              sm: 'shadow-sm',
              lg: 'shadow-2xl',
              xl: 'shadow-[0_20px_50px_rgba(0,0,0,0.1)]'
            }[card_shadow as string] || 'shadow-sm';

            const alignClass = {
              'top-left': 'justify-start items-start text-left',
              'center': 'justify-center items-center text-center',
              'bottom-right': 'justify-end items-end text-right'
            }[content_align as string] || 'justify-center items-center';

            const hoverClass = isPreviewMode ? {
              lift: 'hover:-translate-y-2 hover:shadow-2xl',
              zoom: 'hover:scale-[1.02]',
              pulse: 'hover:ring-4 hover:ring-primary/20',
              none: ''
            }[hover_effect as string] || '' : '';

            const isSelected = selectedIndex === i;

            return (
              <div key={i.toString()}>
                <motion.div 
                  variants={entranceAnim !== 'none' ? itemVariants : {}}
                  initial={entranceAnim !== 'none' ? "hidden" : "visible"}
                  whileInView={entranceAnim !== 'none' ? "visible" : "visible"}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedIndex(i)}
                  className={`w-full h-full overflow-hidden transition-all duration-300 group flex flex-col cursor-pointer ${shadowClass} ${hoverClass} ${alignClass} ${card_style === 'glass' ? 'backdrop-blur-xl' : ''} ${
                    isSelected ? 'ring-2 ring-primary ring-offset-4' : ''
                  }`}
                  style={{
                    backgroundColor: card_style !== 'gradient' ? finalBg : undefined,
                    backgroundImage: card_style === 'gradient' ? finalBg : undefined,
                    borderRadius: `${card_radius}px`,
                    border: card_style === 'transparent' ? 'none' : `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : card_border}`,
                    padding: item.type === 'image' && image_fit === 'cover' && !item.title ? 0 : `${padding}px`,
                    zIndex: z_index
                  }}
                >
                  {/* Delete Button (Only in Constructor) */}
                  {!isPreviewMode && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeItem(i); }}
                      className="absolute top-3 right-3 p-2 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:scale-110 active:scale-95 shadow-lg"
                      title="Eliminar celda"
                    >
                      <LucideIcons.Trash2 size={14} />
                    </button>
                  )}

                  {/* Background Image / Video */}
                  {(image || item.type === 'video') && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                        <img 
                          src={image} 
                          className={`w-full h-full transition-transform duration-700 ${hover_effect === 'zoom' ? 'group-hover:scale-110' : ''} ${image_fit === 'cover' ? 'object-cover' : 'object-contain'}`}
                          referrerPolicy="no-referrer"
                          alt=""
                        />
                        {overlay_opacity > 0 && (
                          <div 
                            className="absolute inset-0 bg-black" 
                            style={{ opacity: overlay_opacity / 100 }}
                          />
                        )}
                      </div>
                  )}

                  {/* Glow Effect */}
                  {card_style === 'glow' && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-[inherit] opacity-20 blur-xl group-hover:opacity-40 transition-opacity z-[-1]" />
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
            <div className="bg-surface/80 backdrop-blur-md p-8 rounded-3xl border border-border shadow-xl text-center max-w-sm animate-in fade-in zoom-in duration-500">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
              <p className="text-sm text-text font-bold">Lienzo Bento Listo</p>
              <p className="text-[11px] text-text/60 mt-2 leading-relaxed">Arrastra elementos desde la <b>Caja de Herramientas</b> en el panel izquierdo para empezar a construir tu composición.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
