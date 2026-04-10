import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Linkedin, Twitter, Globe, X, ChevronLeft, ChevronRight } from 'lucide-react';

export const TeamModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const members = getVal(null, 'members', []);
  const layout = getVal(null, 'layout', 'grid');
  const showFilters = getVal(null, 'show_filters', true);
  const columns = getVal(null, 'columns', 3);
  const gap = getVal(null, 'gap', 32);
  const paddingY = getVal(null, 'padding_y', 100);
  const bgColor = getVal(null, 'bg_color', '#FFFFFF');
  const sectionGradient = getVal(null, 'section_gradient', false);
  const entranceAnim = getVal(null, 'entrance_anim', true);
  const staggerAnim = getVal(null, 'stagger_anim', true);
  const enableModal = getVal(null, 'enable_modal', false);

  // Element: Header
  const headerTitle = getVal(`${moduleId}_el_team_header`, 'title', 'Conoce a nuestro equipo');
  const headerSubtitle = getVal(`${moduleId}_el_team_header`, 'subtitle', 'Expertos apasionados dedicados a llevar tu visión a la realidad.');
  const headerAlign = getVal(`${moduleId}_el_team_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_team_header`, 'title_size', 32);
  const headerTitleColor = getVal(`${moduleId}_el_team_header`, 'title_color', '#0F172A');
  const headerMarginB = getVal(`${moduleId}_el_team_header`, 'margin_b', 60);

  // Element: Card
  const cardStyle = getVal(`${moduleId}_el_team_card`, 'card_style', 'solid');
  const cardBg = getVal(`${moduleId}_el_team_card`, 'card_bg', '#FFFFFF');
  const cardRadius = getVal(`${moduleId}_el_team_card`, 'card_radius', 24);
  const showBorder = getVal(`${moduleId}_el_team_card`, 'show_border', false);
  const cardShadow = getVal(`${moduleId}_el_team_card`, 'card_shadow', 'sm');
  const cardPadding = getVal(`${moduleId}_el_team_card`, 'card_padding', 24);
  const hoverEffect = getVal(`${moduleId}_el_team_card`, 'hover_effect', 'lift');

  // Element: Image
  const imgRadius = getVal(`${moduleId}_el_team_image`, 'img_radius', 20);
  const imgAspect = getVal(`${moduleId}_el_team_image`, 'img_aspect', 'portrait');
  const hoverImageSwap = getVal(`${moduleId}_el_team_image`, 'hover_image_swap', true);
  const imgMask = getVal(`${moduleId}_el_team_image`, 'img_mask', 'none');

  // Element: Info
  const nameSize = getVal(`${moduleId}_el_team_info`, 'name_size', 18);
  const nameWeight = getVal(`${moduleId}_el_team_info`, 'name_weight', 'black');
  const nameColor = getVal(`${moduleId}_el_team_info`, 'name_color', '#0F172A');
  const roleSize = getVal(`${moduleId}_el_team_info`, 'role_size', 14);
  const roleWeight = getVal(`${moduleId}_el_team_info`, 'role_weight', 'bold');
  const roleColor = getVal(`${moduleId}_el_team_info`, 'role_color', 'var(--primary-color)');
  const bioColor = getVal(`${moduleId}_el_team_info`, 'bio_color', '#64748B');

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

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" as any } }
  };

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % Math.ceil(filteredMembers.length / columns));
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + Math.ceil(filteredMembers.length / columns)) % Math.ceil(filteredMembers.length / columns));
  };

  return (
    <section 
      className="w-full relative overflow-hidden"
      style={{ 
        backgroundColor: bgColor,
        backgroundImage: sectionGradient ? `linear-gradient(180deg, ${bgColor} 0%, rgba(0,0,0,0.02) 100%)` : 'none',
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`
      }}
    >
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div 
          className={`mb-12 flex flex-col ${headerAlign === 'center' ? 'items-center text-center' : 'items-start text-left'}`}
          style={{ marginBottom: `${headerMarginB}px` }}
        >
          <h2 
            className="mb-4 leading-tight"
            style={{ 
              fontSize: `${headerTitleSize}px`, 
              color: headerTitleColor,
              fontWeight: 900
            }}
          >
            {headerTitle}
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
            {headerSubtitle}
          </p>
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
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
              gap: layout === 'carousel' ? '0' : `${gap}px`,
              transform: layout === 'carousel' ? `translateX(-${carouselIndex * 100}%)` : 'none'
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
                    onClick={() => enableModal && setSelectedMember(member)}
                    className={`group relative overflow-hidden transition-all duration-300 ${
                      layout === 'list' ? 'flex flex-col @md:flex-row items-center gap-8' : 
                      layout === 'carousel' ? `w-full shrink-0 px-[${gap/2}px]` : ''
                    } ${isBentoFirst ? '@md:col-span-2 @md:row-span-2' : ''} ${enableModal ? 'cursor-pointer' : ''}`}
                    style={{
                      backgroundColor: cardStyle === 'glass' ? 'rgba(255,255,255,0.7)' : cardStyle === 'minimal' ? 'transparent' : cardBg,
                      backdropFilter: cardStyle === 'glass' ? 'blur(12px)' : 'none',
                      borderRadius: `${cardRadius}px`,
                      padding: cardStyle === 'minimal' ? '0' : `${cardPadding}px`,
                      boxShadow: cardStyle === 'minimal' ? 'none' : getShadow(cardShadow),
                      border: showBorder ? '1px solid rgba(0,0,0,0.05)' : 'none',
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
                      <motion.img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      
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

                    {/* Info */}
                    <div className={`flex-1 ${layout === 'list' ? 'text-left' : 'text-center'}`}>
                      <h3 
                        className="mb-1"
                        style={{ 
                          fontSize: `${nameSize}px`, 
                          color: nameColor,
                          fontWeight: nameWeight === 'black' ? 900 : 700
                        }}
                      >
                        {member.name}
                      </h3>
                      <p 
                        className="uppercase tracking-widest mb-3"
                        style={{ 
                          fontSize: `${roleSize}px`, 
                          color: roleColor,
                          fontWeight: roleWeight === 'bold' ? 700 : 500
                        }}
                      >
                        {member.role}
                      </p>
                      
                      {(layout === 'list' || (member.bio && !enableModal)) && (
                        <p 
                          className="text-sm leading-relaxed line-clamp-3"
                          style={{ color: bioColor }}
                        >
                          {member.bio}
                        </p>
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
                className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all z-10"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all z-10"
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
              className="relative w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all z-10"
              >
                <X size={20} />
              </button>
              
              <div className="w-full md:w-2/5 aspect-[4/5] md:aspect-auto">
                <img 
                  src={selectedMember.image} 
                  alt={selectedMember.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="flex-1 p-8 md:p-12">
                <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">{selectedMember.role}</p>
                <h3 className="text-3xl font-black text-slate-900 mb-6">{selectedMember.name}</h3>
                <div className="prose prose-slate mb-8">
                  <p className="text-slate-600 leading-relaxed text-lg">
                    {selectedMember.bio || "Este miembro del equipo es una pieza fundamental de nuestra organización, aportando su experiencia y pasión para lograr resultados excepcionales."}
                  </p>
                </div>
                
                <div className="flex gap-4">
                  {selectedMember.linkedin && (
                    <a href={selectedMember.linkedin} className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all">
                      <Linkedin size={20} />
                    </a>
                  )}
                  {selectedMember.twitter && (
                    <a href={selectedMember.twitter} className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all">
                      <Twitter size={20} />
                    </a>
                  )}
                  {selectedMember.web && (
                    <a href={selectedMember.web} className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all">
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
