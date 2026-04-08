import React from 'react';
import { motion } from 'motion/react';
import { Linkedin, Twitter, Globe } from 'lucide-react';

const MOCK_TEAM = [
  {
    id: 1,
    name: 'Alex Rivera',
    role: 'CEO & Fundador',
    image: 'https://picsum.photos/seed/alex/400/500',
    socials: { linkedin: '#', twitter: '#', web: '#' }
  },
  {
    id: 2,
    name: 'Elena Santos',
    role: 'Directora Creativa',
    image: 'https://picsum.photos/seed/elena/400/500',
    socials: { linkedin: '#', twitter: '#', web: '#' }
  },
  {
    id: 3,
    name: 'Marcus Chen',
    role: 'Head of Engineering',
    image: 'https://picsum.photos/seed/marcus/400/500',
    socials: { linkedin: '#', twitter: '#', web: '#' }
  },
  {
    id: 4,
    name: 'Sofia Valente',
    role: 'Product Designer',
    image: 'https://picsum.photos/seed/sofia/400/500',
    socials: { linkedin: '#', twitter: '#', web: '#' }
  }
];

export const TeamModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const layout = getVal(null, 'layout', 'grid');
  const columns = getVal(null, 'columns', 3);
  const gap = getVal(null, 'gap', 32);
  const paddingY = getVal(null, 'padding_y', 100);
  const bgColor = getVal(null, 'bg_color', '#FFFFFF');
  const entranceAnim = getVal(null, 'entrance_anim', true);
  const staggerAnim = getVal(null, 'stagger_anim', true);

  // Element: Header
  const headerTitle = getVal(`${moduleId}_el_team_header`, 'title', 'Conoce a nuestro equipo');
  const headerSubtitle = getVal(`${moduleId}_el_team_header`, 'subtitle', 'Expertos apasionados dedicados a llevar tu visión a la realidad.');
  const headerAlign = getVal(`${moduleId}_el_team_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_team_header`, 'title_size', 32);
  const headerMarginB = getVal(`${moduleId}_el_team_header`, 'margin_b', 60);

  // Element: Card
  const cardBg = getVal(`${moduleId}_el_team_card`, 'card_bg', '#FFFFFF');
  const cardRadius = getVal(`${moduleId}_el_team_card`, 'card_radius', 24);
  const showBorder = getVal(`${moduleId}_el_team_card`, 'show_border', false);
  const cardShadow = getVal(`${moduleId}_el_team_card`, 'card_shadow', 'sm');
  const cardPadding = getVal(`${moduleId}_el_team_card`, 'card_padding', 24);
  const hoverEffect = getVal(`${moduleId}_el_team_card`, 'hover_effect', 'lift');

  // Element: Image
  const imgRadius = getVal(`${moduleId}_el_team_image`, 'img_radius', 20);
  const imgAspect = getVal(`${moduleId}_el_team_image`, 'img_aspect', 'portrait');
  const imgMarginB = getVal(`${moduleId}_el_team_image`, 'img_margin_b', 20);

  // Element: Info
  const nameSize = getVal(`${moduleId}_el_team_info`, 'name_size', 18);
  const nameColor = getVal(`${moduleId}_el_team_info`, 'name_color', '#0F172A');
  const roleSize = getVal(`${moduleId}_el_team_info`, 'role_size', 14);
  const roleColor = getVal(`${moduleId}_el_team_info`, 'role_color', 'var(--primary-color)');

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <section 
      className="w-full relative overflow-hidden py-12 @md:py-20 @lg:py-24"
      style={{ 
        backgroundColor: bgColor
      }}
    >
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div 
          className={`mb-12 flex flex-col ${headerAlign === 'center' ? 'items-center text-center' : 'items-start text-left'}`}
          style={{ marginBottom: `${headerMarginB}px` }}
        >
          <h2 
            className="font-black text-slate-900 mb-4 leading-tight text-3xl @md:text-4xl @lg:text-5xl"
          >
            {headerTitle}
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
            {headerSubtitle}
          </p>
        </div>

        {/* Team Grid */}
        <motion.div 
          variants={staggerAnim ? containerVariants : {}}
          initial={entranceAnim ? "hidden" : false}
          whileInView="visible"
          viewport={{ once: true }}
          className={`grid gap-8 ${
            layout === 'list' ? 'grid-cols-1' : 
            layout === 'bento' ? 'grid-cols-1 @md:grid-cols-4' :
            columns === 4 ? 'grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4' :
            columns === 3 ? 'grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3' :
            columns === 2 ? 'grid-cols-1 @sm:grid-cols-2' : 'grid-cols-1'
          }`}
          style={{ gap: `${gap}px` }}
        >
          {MOCK_TEAM.map((member, index) => {
            const isBentoFirst = layout === 'bento' && index === 0;
            
            return (
              <motion.div
                key={member.id}
                variants={itemVariants}
                whileHover={hoverEffect === 'lift' ? { y: -10 } : {}}
                className={`group relative overflow-hidden transition-all duration-300 ${
                  layout === 'list' ? 'flex flex-col @md:flex-row items-center gap-8' : ''
                } ${isBentoFirst ? '@md:col-span-2 @md:row-span-2' : ''}`}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: `${cardRadius}px`,
                  padding: `${cardPadding}px`,
                  boxShadow: getShadow(cardShadow),
                  border: showBorder ? '1px solid rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {/* Image Container */}
                <div 
                  className={`relative overflow-hidden ${getAspect(imgAspect)} ${
                    layout === 'list' ? 'w-full @md:w-64 flex-shrink-0' : 'w-full'
                  }`}
                  style={{ 
                    borderRadius: imgAspect === 'circle' ? '50%' : `${imgRadius}px`,
                    marginBottom: layout === 'list' ? '0' : `${imgMarginB}px`
                  }}
                >
                  <motion.img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                    whileHover={hoverEffect === 'zoom' ? { scale: 1.1 } : {}}
                    transition={{ duration: 0.6 }}
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Social Overlay on Hover */}
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-lg">
                      <Linkedin size={18} />
                    </button>
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-lg">
                      <Twitter size={18} />
                    </button>
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-lg">
                      <Globe size={18} />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className={`flex-1 ${layout === 'list' ? 'text-left' : 'text-center'}`}>
                  <h3 
                    className="font-black mb-1"
                    style={{ fontSize: `${nameSize}px`, color: nameColor }}
                  >
                    {member.name}
                  </h3>
                  <p 
                    className="font-bold uppercase tracking-widest"
                    style={{ fontSize: `${roleSize}px`, color: roleColor }}
                  >
                    {member.role}
                  </p>
                  
                  {layout === 'list' && (
                    <p className="mt-4 text-slate-500 leading-relaxed">
                      Líder visionario con más de 10 años de experiencia en el sector, enfocado en crear soluciones que impacten positivamente en la vida de las personas.
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
