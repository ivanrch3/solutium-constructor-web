import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Linkedin, Twitter, Globe, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { TextRenderer } from '../TextRenderer';
import { parseNumSafe } from '../utils';
import { GLOBAL_ANIMATIONS, getGlobalAnimation } from '../../../constants/animations';

import { InlineEditableText } from '../InlineEditableText';
import { useEditorStore } from '../../../store/editorStore';

export const TeamModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any>,
  isPreviewMode?: boolean
}> = ({ moduleId, settingsValues, isPreviewMode = false }) => {
  const { selectSection, selectElement } = useEditorStore();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const layout = getVal(null, 'layout', 'grid');
  const showFilters = getVal(null, 'show_filters', true);
  const columns = Math.max(1, parseNumSafe(getVal(null, 'columns', 3), 3));
  const gap = parseNumSafe(getVal(null, 'gap', 32), 32);
  const paddingY = parseNumSafe(getVal(null, 'padding_y', 100), 100);
  const darkMode = getVal(null, 'dark_mode', false);
  const bgColor = getVal(null, 'bg_color', darkMode ? '#0F172A' : '#FFFFFF');
  const sectionGradient = getVal(null, 'section_gradient', false);
  const bgGradient = getVal(null, 'bg_gradient', 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)');
  const entranceAnim = getVal(null, 'entrance_anim', 'none');
  const staggerAnim = getVal(null, 'stagger_anim', true);

  // Animation Overrides
  const globalAnimOverride = getGlobalAnimation(entranceAnim, 'team');
  const enableModal = getVal(null, 'enable_modal', true);

  // Element: Header
  const eyebrow = getVal(`${moduleId}_el_team_header`, 'eyebrow', 'EQUIPO');
  const headerTitle = getVal(`${moduleId}_el_team_header`, 'title', 'Conoce a nuestro equipo');
  const headerSubtitle = getVal(`${moduleId}_el_team_header`, 'subtitle', 'Expertos apasionados dedicados a llevar tu visión a la realidad.');
  const headerSubtitleSize = getVal(`${moduleId}_el_team_header`, 'subtitle_size', 'p');
  const headerSubtitleWeight = getVal(`${moduleId}_el_team_header`, 'subtitle_weight', 'normal');
  const headerAlign = getVal(`${moduleId}_el_team_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_team_header`, 'title_size', 't2');
  const headerTitleWeight = getVal(`${moduleId}_el_team_header`, 'title_weight', 'black');
  const headerTitleColor = darkMode ? '#FFFFFF' : getVal(`${moduleId}_el_team_header`, 'title_color', '#0F172A');
  const eyebrowColor = getVal(`${moduleId}_el_team_header`, 'eyebrow_color', 'var(--primary-color)');
  const headerMarginB = parseNumSafe(getVal(`${moduleId}_el_team_header`, 'margin_b', 60), 60);

  // Highlight Settings
  const titleHighlightType = getVal(`${moduleId}_el_team_header`, 'title_highlight_type', 'gradient');
  const titleHighlightColor = getVal(`${moduleId}_el_team_header`, 'title_highlight_color', '#3B82F6');
  const titleHighlightGradient = getVal(`${moduleId}_el_team_header`, 'title_highlight_gradient', 'linear-gradient(to right, #3B82F6, #2563EB)');
  const titleHighlightBold = getVal(`${moduleId}_el_team_header`, 'title_highlight_bold', true);

  const subtitleHighlightType = getVal(`${moduleId}_el_team_header`, 'subtitle_highlight_type', 'none');
  const subtitleHighlightColor = getVal(`${moduleId}_el_team_header`, 'subtitle_highlight_color', '#3B82F6');
  const subtitleHighlightGradient = getVal(`${moduleId}_el_team_header`, 'subtitle_highlight_gradient', 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)');
  const subtitleHighlightBold = getVal(`${moduleId}_el_team_header`, 'subtitle_highlight_bold', true);

  // Element: Items
  const userMembers = getVal(`${moduleId}_el_team_items`, 'members', []);
  const members = userMembers.length > 0 ? userMembers : [
    { name: 'Alex Rivera', role: 'Director Creativo', bio: '10 años de experiencia en diseño.', image: 'https://picsum.photos/seed/team1/400/500', category: 'Diseño', linkedin: '#', twitter: '#', web: '#' },
    { name: 'Elena Soler', role: 'Lead Developer', bio: 'Experta en arquitecturas escalables.', image: 'https://picsum.photos/seed/team2/400/500', category: 'Ingeniería', linkedin: '#', twitter: '#', web: '#' },
    { name: 'Marc Costa', role: 'Estratega Digital', bio: 'Especialista en crecimiento de marca.', image: 'https://picsum.photos/seed/team3/400/500', category: 'Marketing', linkedin: '#', twitter: '#', web: '#' }
  ];

  // Element: Card
  const cardStyle = getVal(`${moduleId}_el_team_card`, 'card_style', 'solid');
  const cardBg = darkMode ? '#1E293B' : getVal(`${moduleId}_el_team_card`, 'card_bg', '#FFFFFF');
  const cardRadius = parseNumSafe(getVal(`${moduleId}_el_team_card`, 'card_radius', 24), 24);
  const showBorder = getVal(`${moduleId}_el_team_card`, 'show_border', false);
  const cardShadow = getVal(`${moduleId}_el_team_card`, 'card_shadow', 'sm');
  const cardPadding = parseNumSafe(getVal(`${moduleId}_el_team_card`, 'card_padding', 24), 24);
  const hoverEffect = getVal(`${moduleId}_el_team_card`, 'hover_effect', 'lift');

  // Element: Image
  const imgRadius = parseNumSafe(getVal(`${moduleId}_el_team_image`, 'img_radius', 20), 20);
  const imgAspect = getVal(`${moduleId}_el_team_image`, 'img_aspect', 'portrait');
  const hoverImageSwap = getVal(`${moduleId}_el_team_image`, 'hover_image_swap', true);
  const imgMask = getVal(`${moduleId}_el_team_image`, 'img_mask', 'none');

  // Element: Info
  const nameSize = getVal(`${moduleId}_el_team_info`, 'name_size', 't3');
  const nameWeight = getVal(`${moduleId}_el_team_info`, 'name_weight', 'black');
  const nameColor = darkMode ? '#FFFFFF' : getVal(`${moduleId}_el_team_info`, 'name_color', '#0F172A');
  const roleSize = getVal(`${moduleId}_el_team_info`, 'role_size', 's');
  const roleWeight = getVal(`${moduleId}_el_team_info`, 'role_weight', 'bold');
  const roleColor = getVal(`${moduleId}_el_team_info`, 'role_color', '#3B82F6');
  const bioSize = getVal(`${moduleId}_el_team_info`, 'bio_size', 'p');
  const bioWeight = getVal(`${moduleId}_el_team_info`, 'bio_weight', 'normal');
  const bioColor = darkMode ? '#94A3B8' : getVal(`${moduleId}_el_team_info`, 'bio_color', '#64748B');

  const getTypographyStyle = (sizeToken: string, weightToken: string, alignToken?: string) => {
    const size = TYPOGRAPHY_SCALE[sizeToken as keyof typeof TYPOGRAPHY_SCALE] || TYPOGRAPHY_SCALE.p;
    const weight = FONT_WEIGHTS[weightToken as keyof typeof FONT_WEIGHTS] || FONT_WEIGHTS.normal;
    
    return {
      fontSize: `${size.fontSize}px`,
      lineHeight: size.lineHeight,
      fontWeight: weight.value,
      textAlign: (alignToken && alignToken !== 'inherit') ? alignToken : undefined
    } as React.CSSProperties;
  };

  const categories = useMemo(() => {
    const cats = new Set(members.map((m: any) => m.category).filter(Boolean));
    return ['Todos', ...Array.from(cats)];
  }, [members]);

  const filteredMembers = useMemo(() => {
    if (activeCategory === 'Todos') return members;
    return members.filter((m: any) => m.category === activeCategory);
  }, [members, activeCategory]);

  const getShadow = (s: string) => {
    if (s === 'sm') return '0 4px 20px rgba(0,0,0,0.05)';
    if (s === 'lg') return '0 10px 40px rgba(0,0,0,0.1)';
    return 'none';
  };

  const getAspect = (a: string) => {
    if (a === 'square') return 'aspect-square';
    if (a === 'circle') return 'aspect-square rounded-full';
    return 'aspect-[3/4]';
  };

  const getMaskClass = (mask: string) => {
    if (mask === 'squircle') return 'mask-squircle'; // Assuming CSS handles this or use clip-path
    if (mask === 'blob') return 'mask-blob';
    return '';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = globalAnimOverride ? {
    hidden: globalAnimOverride.hidden as any,
    visible: globalAnimOverride.visible as any
  } : {
    hidden: { y: 20, opacity: 0 } as any,
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" as any } } as any
  };

  const prevSlide = () => {
    const pages = Math.ceil(filteredMembers.length / columns);
    if (pages <= 0) return;
    setCarouselIndex((prev) => (prev - 1 + pages) % pages);
  };

  const nextSlide = () => {
    const pages = Math.ceil(filteredMembers.length / columns);
    if (pages <= 0) return;
    setCarouselIndex((prev) => (prev + 1) % pages);
  };

  const handleUpdateMember = (index: number, field: string, newValue: string) => {
    const updatedMembers = [...members];
    updatedMembers[index] = { ...updatedMembers[index], [field]: newValue };
    const { updateSectionSettings } = useEditorStore.getState();
    updateSectionSettings(moduleId, { [`${moduleId}_el_team_items_members`]: updatedMembers });
  };

  return (
    <section 
      id={moduleId}
      onClick={(e) => {
        if (isPreviewMode) return;
        e.stopPropagation();
        selectSection(moduleId);
        selectElement(`${moduleId}_global`);
      }}
      className="w-full relative overflow-hidden"
      style={{ 
        backgroundColor: bgColor,
        backgroundImage: (sectionGradient && typeof bgGradient === 'string' && !bgGradient.includes('NaN')) ? bgGradient : 'none',
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`
      }}
    >
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div 
          className={`mb-12 flex flex-col w-full ${headerAlign === 'center' ? 'items-center text-center' : headerAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
          style={{ marginBottom: `${headerMarginB}px` }}
        >
          {eyebrow && (
            <span 
              className="text-sm font-bold tracking-widest mb-3 uppercase"
              style={{ color: eyebrowColor }}
            >
              <InlineEditableText
                moduleId={moduleId}
                elementId={`${moduleId}_el_team_header`}
                settingId="eyebrow"
                value={eyebrow}
                isPreviewMode={isPreviewMode}
              />
            </span>
          )}
          <h2 
            className="mb-4 leading-tight"
            style={{ 
              ...getTypographyStyle(headerTitleSize as any, headerTitleWeight, headerAlign),
              color: headerTitleColor
            }}
          >
            <InlineEditableText
              moduleId={moduleId}
              elementId={`${moduleId}_el_team_header`}
              settingId="title"
              value={headerTitle}
              isPreviewMode={isPreviewMode}
            >
              <TextRenderer 
                text={headerTitle}
                highlightType={titleHighlightType}
                highlightColor={titleHighlightColor}
                highlightGradient={titleHighlightGradient}
                highlightBold={titleHighlightBold}
              />
            </InlineEditableText>
          </h2>
          {headerSubtitle && (
            <p 
              className="text-lg max-w-2xl leading-relaxed"
              style={{ 
                ...getTypographyStyle(headerSubtitleSize as any, headerSubtitleWeight, headerAlign),
                color: darkMode ? '#94A3B8' : '#64748B' 
              }}
            >
              <InlineEditableText
                moduleId={moduleId}
                elementId={`${moduleId}_el_team_header`}
                settingId="subtitle"
                value={headerSubtitle}
                isPreviewMode={isPreviewMode}
              >
                <TextRenderer 
                  text={headerSubtitle} 
                  highlightType={subtitleHighlightType}
                  highlightColor={subtitleHighlightColor}
                  highlightGradient={subtitleHighlightGradient}
                  highlightBold={subtitleHighlightBold}
                />
              </InlineEditableText>
            </p>
          )}
        </div>

        {/* Filters */}
        {showFilters && categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat: any) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setCarouselIndex(0);
                }}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  activeCategory === cat 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : (darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Team Grid / Carousel */}
        <div className="relative">
          <motion.div 
            variants={staggerAnim ? containerVariants : {}}
            initial={entranceAnim ? "hidden" : false}
            whileInView="visible"
            viewport={{ once: true }}
            className={`grid gap-8 ${
              layout === 'list' ? 'grid-cols-1' : 
              layout === 'carousel' ? 'flex transition-transform duration-500' :
              layout === 'bento' ? 'grid-cols-1 @md:grid-cols-4' :
              columns === 4 ? 'grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4' :
              columns === 3 ? 'grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3' :
              columns === 2 ? 'grid-cols-1 @sm:grid-cols-2' : 'grid-cols-1'
            }`}
            style={{ 
              gap: layout === 'carousel' ? '0' : `${parseFloat(gap as any) || 0}px`,
              transform: layout === 'carousel' ? `translateX(-${(parseFloat(carouselIndex as any) || 0) * 100}%)` : 'none'
            }}
          >
            <AnimatePresence mode="popLayout">
              {filteredMembers.map((member: any, index: number) => {
                const isBentoFirst = layout === 'bento' && index === 0;
                
                return (
                  <motion.div
                    key={member.name + index}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    variants={itemVariants}
                    whileHover={hoverEffect === 'lift' ? { y: -10 } : {}}
                    onClick={(e) => {
                      if (isPreviewMode) return;
                      e.stopPropagation();
                      selectSection(moduleId);
                      selectElement(`${moduleId}_el_team_items`);
                      if (enableModal) setSelectedMember(member);
                    }}
                    className={`group relative overflow-hidden transition-all duration-300 ${
                      layout === 'list' ? 'flex flex-col @md:flex-row items-center gap-8' : 
                      layout === 'carousel' ? `w-full shrink-0 px-[${gap/2}px]` : ''
                    } ${isBentoFirst ? '@md:col-span-2 @md:row-span-2' : ''} ${enableModal ? 'cursor-pointer' : ''} ${darkMode && cardStyle !== 'minimal' ? 'shadow-none' : ''}`}
                    style={{
                      backgroundColor: cardStyle === 'glass' ? (darkMode ? 'rgba(30,41,59,0.7)' : 'rgba(255,255,255,0.7)') : cardStyle === 'minimal' ? 'transparent' : cardBg,
                      backdropFilter: cardStyle === 'glass' ? 'blur(12px)' : 'none',
                      borderRadius: `${cardRadius}px`,
                      padding: cardStyle === 'minimal' ? '0' : `${cardPadding}px`,
                      boxShadow: cardStyle === 'minimal' ? 'none' : (darkMode ? 'none' : getShadow(cardShadow)),
                      borderWidth: showBorder ? '1px' : '0px',
                      borderStyle: showBorder ? 'solid' : 'none',
                      borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      width: layout === 'carousel' ? `${100 / columns}%` : 'auto'
                    }}
                  >
                    {/* Image Container */}
                    <div 
                      className={`relative overflow-hidden ${getAspect(imgAspect)} ${
                        layout === 'list' ? 'w-full @md:w-64 flex-shrink-0' : 'w-full'
                      } ${getMaskClass(imgMask)}`}
                      style={{ 
                        borderRadius: imgAspect === 'circle' ? '50%' : `${imgRadius}px`,
                        marginBottom: layout === 'list' ? '0' : `20px`
                      }}
                    >
                      {member.image && (
                        <motion.img 
                          src={member.image} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      
                      {hoverImageSwap && member.image_hover && (
                        <motion.img 
                          src={member.image_hover} 
                          alt={`${member.name} hover`}
                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      
                      {/* Social Overlay on Hover */}
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        {member.linkedin && (
                          <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-lg">
                            <Linkedin size={18} />
                          </a>
                        )}
                        {member.twitter && (
                          <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-lg">
                            <Twitter size={18} />
                          </a>
                        )}
                        {member.web && (
                          <a href={member.web} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-lg">
                            <Globe size={18} />
                          </a>
                        )}
                      </div>
                    </div>

                      <div className={`flex-1 ${layout === 'list' ? 'text-left' : 'text-center'}`}>
                        <h3 
                          className="mb-1"
                          style={{ 
                            fontSize: `${TYPOGRAPHY_SCALE[nameSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 18}px`, 
                            color: nameColor,
                            fontWeight: FONT_WEIGHTS[nameWeight as keyof typeof FONT_WEIGHTS]?.value || 900
                          }}
                        >
                          <InlineEditableText
                            moduleId={moduleId}
                            elementId={`${moduleId}_el_team_items`}
                            settingId={`member_${index}_name`}
                            value={member.name}
                            isPreviewMode={isPreviewMode}
                            onSave={(val) => handleUpdateMember(index, 'name', val)}
                          />
                        </h3>
                        <p 
                          className="uppercase tracking-widest mb-3"
                          style={{ 
                            fontSize: `${TYPOGRAPHY_SCALE[roleSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 14}px`, 
                            color: roleColor,
                            fontWeight: FONT_WEIGHTS[roleWeight as keyof typeof FONT_WEIGHTS]?.value || 800
                          }}
                        >
                          <InlineEditableText
                            moduleId={moduleId}
                            elementId={`${moduleId}_el_team_items`}
                            settingId={`member_${index}_role`}
                            value={member.role}
                            isPreviewMode={isPreviewMode}
                            onSave={(val) => handleUpdateMember(index, 'role', val)}
                          />
                        </p>
                        
                        {(layout === 'list' || (member.bio && !enableModal)) && (
                          <div 
                            className="leading-relaxed line-clamp-3"
                            style={{ 
                              ...getTypographyStyle(bioSize, bioWeight),
                              color: bioColor 
                            }}
                          >
                            <InlineEditableText
                              moduleId={moduleId}
                              elementId={`${moduleId}_el_team_items`}
                              settingId={`member_${index}_bio`}
                              value={member.bio}
                              isPreviewMode={isPreviewMode}
                              onSave={(val) => handleUpdateMember(index, 'bio', val)}
                            />
                          </div>
                        )}
                      </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {layout === 'carousel' && filteredMembers.length > columns && (
            <>
              <button 
                onClick={prevSlide}
                className={`absolute left-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all z-10 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextSlide}
                className={`absolute right-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all z-10 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bio Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <button 
                onClick={() => setSelectedMember(null)}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 ${darkMode ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                <X size={20} />
              </button>
              
              <div className="w-full md:w-2/5 aspect-[4/5] md:aspect-auto">
                {selectedMember.image && (
                  <img 
                    src={selectedMember.image} 
                    alt={selectedMember.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              
              <div className="flex-1 p-8 md:p-12">
                <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">{selectedMember.role}</p>
                <h3 
                  className="text-3xl font-black mb-6"
                  style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}
                >
                  {selectedMember.name}
                </h3>
                <div className="prose prose-slate mb-8">
                  <p 
                    className="leading-relaxed text-lg"
                    style={{ color: darkMode ? '#94A3B8' : '#475569' }}
                  >
                    {selectedMember.bio || "Este miembro del equipo es una pieza fundamental de nuestra organización, aportando su experiencia y pasión para lograr resultados excepcionales."}
                  </p>
                </div>
                
                <div className="flex gap-4">
                  {selectedMember.linkedin && (
                    <a href={selectedMember.linkedin} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${darkMode ? 'bg-slate-700 text-slate-400 hover:bg-primary hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-primary hover:text-white'}`}>
                      <Linkedin size={20} />
                    </a>
                  )}
                  {selectedMember.twitter && (
                    <a href={selectedMember.twitter} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${darkMode ? 'bg-slate-700 text-slate-400 hover:bg-primary hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-primary hover:text-white'}`}>
                      <Twitter size={20} />
                    </a>
                  )}
                  {selectedMember.web && (
                    <a href={selectedMember.web} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${darkMode ? 'bg-slate-700 text-slate-400 hover:bg-primary hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-primary hover:text-white'}`}>
                      <Globe size={20} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .mask-squircle {
          clip-path: url(#squircle-mask);
        }
        .mask-blob {
          clip-path: url(#blob-mask);
        }
      `}} />
      
      {/* SVG Masks for Clip-path */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="squircle-mask" clipPathUnits="objectBoundingBox">
            <path d="M .5,0 C .1,0 0,.1 0,.5 0,.9 .1,1 .5,1 .9,1 1,.9 1,.5 1,.1 .9,0 .5,0 Z" />
          </clipPath>
          <clipPath id="blob-mask" clipPathUnits="objectBoundingBox">
            <path d="M.5 0C.2 0 0 .2 0 .5s.2.5.5.5.5-.2.5-.5S.8 0 .5 0z" />
          </clipPath>
        </defs>
      </svg>
    </section>
  );
};
