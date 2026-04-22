import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle, Copy, Check, Calendar, Linkedin, Twitter, Instagram, Facebook, Github } from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { TextRenderer } from '../TextRenderer';

export const ContactModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const layout = getVal(null, 'layout', 'split');
  const maxWidth = getVal(null, 'max_width', 1200);
  const paddingY = getVal(null, 'padding_y', 100);
  const darkMode = getVal(null, 'dark_mode', false);
  const bgColor = darkMode ? '#0F172A' : getVal(null, 'bg_color', '#F8FAFC');
  const bgImage = getVal(null, 'bg_image', '');
  const bgOverlay = getVal(null, 'bg_overlay', 0);
  const entranceAnim = getVal(null, 'entrance_anim', true);

  // Element: Header
  const headerTitle = getVal(`${moduleId}_el_contact_header`, 'title', 'Ponte en contacto');
  const headerSubtitle = getVal(`${moduleId}_el_contact_header`, 'subtitle', 'Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.');
  const headerSubtitleSize = getVal(`${moduleId}_el_contact_header`, 'subtitle_size', 'p');
  const headerSubtitleWeight = getVal(`${moduleId}_el_contact_header`, 'subtitle_weight', 'normal');
  const headerAlign = getVal(`${moduleId}_el_contact_header`, 'align', 'left');
  const headerTitleSize = getVal(`${moduleId}_el_contact_header`, 'title_size', 't2');
  const headerTitleWeight = getVal(`${moduleId}_el_contact_header`, 'title_weight', 'bold');
  const headerTitleColor = darkMode ? '#FFFFFF' : getVal(`${moduleId}_el_contact_header`, 'title_color', '#0F172A');
  const headerMarginB = getVal(`${moduleId}_el_contact_header`, 'margin_b', 60);

  const titleHighlightType = getVal(`${moduleId}_el_contact_header`, 'title_highlight_type', 'gradient');
  const titleHighlightColor = getVal(`${moduleId}_el_contact_header`, 'title_highlight_color', '#3B82F6');
  const titleHighlightGradient = getVal(`${moduleId}_el_contact_header`, 'title_highlight_gradient', 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)');
  const titleHighlightBold = getVal(`${moduleId}_el_contact_header`, 'title_highlight_bold', true);

  const subtitleHighlightType = getVal(`${moduleId}_el_contact_header`, 'subtitle_highlight_type', 'none');
  const subtitleHighlightColor = getVal(`${moduleId}_el_contact_header`, 'subtitle_highlight_color', '#3B82F6');
  const subtitleHighlightGradient = getVal(`${moduleId}_el_contact_header`, 'subtitle_highlight_gradient', 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)');
  const subtitleHighlightBold = getVal(`${moduleId}_el_contact_header`, 'subtitle_highlight_bold', true);

  // Element: Info
  const email = getVal(`${moduleId}_el_contact_info`, 'email', 'hola@tuempresa.com');
  const phone = getVal(`${moduleId}_el_contact_info`, 'phone', '+34 900 000 000');
  const address = getVal(`${moduleId}_el_contact_info`, 'address', 'Calle Innovación 123, Madrid, España');
  const showAvailability = getVal(`${moduleId}_el_contact_info`, 'show_availability', true);
  const availabilityText = getVal(`${moduleId}_el_contact_info`, 'availability_text', 'Disponible ahora (9:00 - 18:00)');
  const socialLinks = getVal(`${moduleId}_el_contact_info`, 'social_links', []);
  const infoSize = getVal(`${moduleId}_el_contact_info`, 'info_size', 'p');
  const infoWeight = getVal(`${moduleId}_el_contact_info`, 'info_weight', 'normal');
  const infoColor = darkMode ? '#94A3B8' : getVal(`${moduleId}_el_contact_info`, 'info_color', '#475569');
  const iconColor = getVal(`${moduleId}_el_contact_info`, 'icon_color', 'var(--primary-color)');
  const infoCardBg = darkMode ? '#1E293B' : getVal(`${moduleId}_el_contact_info`, 'card_bg', 'transparent');
  const showCopyButtons = getVal(`${moduleId}_el_contact_info`, 'show_copy_buttons', true);

  // Element: Form
  const buttonText = getVal(`${moduleId}_el_contact_form`, 'button_text', 'Enviar Mensaje');
  const btnUrl = getVal(`${moduleId}_el_contact_form`, 'btn_url', '#');
  const btnTarget = getVal(`${moduleId}_el_contact_form`, 'btn_target', '_self');
  const whatsappNumber = getVal(`${moduleId}_el_contact_form`, 'whatsapp_number', '');
  const customFields = getVal(`${moduleId}_el_contact_form`, 'custom_fields', [
    { label: 'Nombre Completo', type: 'text', placeholder: 'Ej: Juan Pérez', required: true },
    { label: 'Correo Electrónico', type: 'email', placeholder: 'juan@ejemplo.com', required: true },
    { label: 'Mensaje', type: 'textarea', placeholder: '¿En qué podemos ayudarte?', required: true }
  ]);
  const inputBg = darkMode ? '#334155' : getVal(`${moduleId}_el_contact_form`, 'input_bg', '#FFFFFF');
  const inputRadius = getVal(`${moduleId}_el_contact_form`, 'input_radius', 12);
  const btnBg = getVal(`${moduleId}_el_contact_form`, 'btn_bg', 'var(--primary-color)');
  const btnColor = getVal(`${moduleId}_el_contact_form`, 'btn_color', '#FFFFFF');
  const labelSizeToken = getVal(`${moduleId}_el_contact_form`, 'label_size', 's');
  const labelWeightToken = getVal(`${moduleId}_el_contact_form`, 'label_weight', 'bold');
  const shimmer = getVal(`${moduleId}_el_contact_form`, 'shimmer', false);
  const hoverEffect = getVal(`${moduleId}_el_contact_form`, 'hover_effect', 'lift');

  // Element: Integrations
  const showCalendly = getVal(`${moduleId}_el_contact_integrations`, 'show_calendly', false);
  const calendlyUrl = getVal(`${moduleId}_el_contact_integrations`, 'calendly_url', '');
  const calendlyText = getVal(`${moduleId}_el_contact_integrations`, 'calendly_text', '¿Prefieres una videollamada? Reserva aquí');
  const calendlyBg = darkMode ? '#1E293B' : getVal(`${moduleId}_el_contact_integrations`, 'calendly_bg', '#F1F5F9');

  // Element: Map
  const showMap = getVal(`${moduleId}_el_contact_map`, 'show_map', true);
  const mapUrl = getVal(`${moduleId}_el_contact_map`, 'map_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.615174415891!2d-3.7037902!3d40.4167754!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42287e00000001%3A0x0!2zUHVlcnRhIGRlbCBTb2w!5e0!3m2!1ses!2ses!4v1625123456789!5m2!1ses!2ses');
  const mapHeight = getVal(`${moduleId}_el_contact_map`, 'map_height', 400);
  const mapGrayscale = getVal(`${moduleId}_el_contact_map`, 'grayscale', false);
  const mapRadius = getVal(`${moduleId}_el_contact_map`, 'map_radius', 24);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin': return <Linkedin size={18} />;
      case 'twitter': case 'x': return <Twitter size={18} />;
      case 'instagram': return <Instagram size={18} />;
      case 'facebook': return <Facebook size={18} />;
      case 'github': return <Github size={18} />;
      default: return <Mail size={18} />;
    }
  };

  const animProps = entranceAnim ? {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any }
  } : {};

  const renderInfo = (isBento: boolean = false) => (
    <div className={`space-y-6 ${isBento ? 'h-full flex flex-col' : ''}`}>
      <div 
        className={`p-8 rounded-[32px] space-y-6 ${isBento ? 'flex-1' : ''}`}
        style={{ backgroundColor: infoCardBg }}
      >
        {showAvailability && (
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-green-600">
              {availabilityText}
            </span>
          </div>
        )}

        {[
          { icon: Mail, label: 'Email', value: email, id: 'email' },
          { icon: Phone, label: 'Teléfono', value: phone, id: 'phone' },
          { icon: MapPin, label: 'Dirección', value: address, id: 'address' }
        ].map((item) => (
          <div key={item.id} className="flex items-start gap-4 group">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
            >
              <item.icon size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 
                className="font-bold mb-0.5 text-sm"
                style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}
              >
                {item.label}
              </h4>
              <p className="truncate" style={{ 
                ...getTypographyStyle(infoSize, infoWeight),
                color: infoColor 
              }}>{item.value}</p>
            </div>
            {showCopyButtons && item.id !== 'address' && (
              <button 
                onClick={() => handleCopy(item.value, item.id)}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              >
                {copiedField === item.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            )}
          </div>
        ))}

        {socialLinks.length > 0 && (
          <div className="pt-4 flex flex-wrap gap-3">
            {socialLinks.map((link: any, idx: number) => (
              <a 
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: `${iconColor}10`, color: iconColor }}
              >
                {getSocialIcon(link.platform)}
              </a>
            ))}
          </div>
        )}
      </div>

      {whatsappNumber && (
        <a 
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#25D366] text-white font-black text-sm shadow-xl shadow-green-500/20 hover:scale-105 transition-all active:scale-95 w-full justify-center"
        >
          <MessageCircle size={20} />
          Chatear por WhatsApp
        </a>
      )}
    </div>
  );

  const renderForm = (isBento: boolean = false) => (
    <div 
      className={`p-6 @md:p-10 rounded-[32px] shadow-2xl border ${isBento ? 'h-full' : ''} ${darkMode ? 'bg-slate-800 border-white/10 shadow-none' : 'bg-white border-slate-100 shadow-slate-200/50'}`}
      style={{
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(241, 245, 249, 1)'
      }}
    >
      {isSubmitted ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'}`}>
            <Send size={32} />
          </div>
          <h3 
            className="text-2xl font-black mb-2"
            style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}
          >
            ¡Mensaje Enviado!
          </h3>
          <p style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>Gracias por contactarnos. Te responderemos muy pronto.</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {customFields.map((field: any, idx: number) => (
            <div key={idx} className="space-y-2">
              <label 
                className="uppercase tracking-widest ml-1"
                style={{
                  ...getTypographyStyle(labelSizeToken, labelWeightToken),
                  color: darkMode ? '#94A3B8' : '#94A3B8' // Keeping slate-400 equivalent for labels as requested/standard
                }}
              >
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea 
                  required={field.required}
                  rows={4}
                  placeholder={field.placeholder}
                  className={`w-full px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border resize-none ${darkMode ? 'border-white/10 text-white placeholder:text-slate-500' : 'border-slate-200 text-slate-900'}`}
                  style={{ backgroundColor: inputBg, borderRadius: `${inputRadius}px` }}
                  value={formState[field.label] || ''}
                  onChange={(e) => setFormState({...formState, [field.label]: e.target.value})}
                />
              ) : (
                <input 
                  required={field.required}
                  type={field.type}
                  placeholder={field.placeholder}
                  className={`w-full px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border ${darkMode ? 'border-white/10 text-white placeholder:text-slate-500' : 'border-slate-200 text-slate-900'}`}
                  style={{ backgroundColor: inputBg, borderRadius: `${inputRadius}px` }}
                  value={formState[field.label] || ''}
                  onChange={(e) => setFormState({...formState, [field.label]: e.target.value})}
                />
              )}
            </div>
          ))}
          <motion.button
            whileHover={hoverEffect === 'lift' ? { y: -5 } : hoverEffect === 'glow' ? { boxShadow: `0 0 25px ${btnBg}60` } : hoverEffect === 'magnetic' ? { scale: 1.02 } : {}}
            whileTap={{ scale: 0.98 }}
            type="submit"
            onClick={() => {
              if (btnUrl && btnUrl !== '#') window.open(btnUrl, btnTarget === '_blank' ? '_blank' : '_self');
            }}
            className={`w-full py-5 font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 relative overflow-hidden group`}
            style={{ backgroundColor: btnBg, color: btnColor, borderRadius: `${inputRadius}px` }}
          >
            {shimmer && (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            )}
            <span className="relative z-10">{buttonText}</span>
            <Send size={18} className="relative z-10" />
          </motion.button>
        </form>
      )}
    </div>
  );

  const renderMap = (isBento: boolean = false) => {
    if (!showMap) return null;
    return (
      <div 
        className={`w-full overflow-hidden shadow-xl border group ${isBento ? 'h-full' : ''} ${darkMode ? 'border-white/10' : 'border-slate-200'}`}
        style={{ 
          height: isBento ? '100%' : `${mapHeight}px`, 
          borderRadius: `${mapRadius}px`,
          filter: mapGrayscale ? 'grayscale(1)' : 'none',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 1)'
        }}
      >
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="transition-all duration-700 group-hover:scale-110"
        />
      </div>
    );
  };

  const renderCalendly = (isBento: boolean = false) => {
    if (!showCalendly) return null;
    return (
      <div 
        className={`p-8 rounded-[32px] flex flex-col items-center text-center justify-center gap-4 ${isBento ? 'h-full' : ''}`}
        style={{ backgroundColor: calendlyBg }}
      >
        <div className={`w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center text-primary ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <Calendar size={32} />
        </div>
        <h4 
          className="font-black"
          style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}
        >
          {calendlyText}
        </h4>
        <a 
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-6 py-3 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all hover:-translate-y-1 ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}
        >
          Reservar Cita
        </a>
      </div>
    );
  };

  return (
    <section 
      className="w-full relative overflow-hidden py-12 @md:py-20 @lg:py-24"
      style={{ backgroundColor: bgColor }}
    >
      {bgImage && (
        <div className="absolute inset-0 z-0">
          <img src={bgImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${bgOverlay/100})` }} />
        </div>
      )}

      <div className="mx-auto px-8 relative z-10" style={{ maxWidth: `${maxWidth}px` }}>
        <motion.div {...animProps}>
          {/* Header */}
          <div 
            className={`flex flex-col w-full mb-12 @md:mb-16 ${headerAlign === 'center' ? 'items-center text-center' : headerAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
            style={{ marginBottom: `${headerMarginB}px` }}
          >
            <h2 
              className="mb-4 tracking-tighter"
              style={{ 
                ...getTypographyStyle(headerTitleSize as any, headerTitleWeight, headerAlign),
                color: headerTitleColor 
              }}
            >
              <TextRenderer 
                text={headerTitle}
                highlightType={titleHighlightType}
                highlightColor={titleHighlightColor}
                highlightGradient={titleHighlightGradient}
                highlightBold={titleHighlightBold}
              />
            </h2>
            {headerSubtitle && (
              <p 
                className="text-lg max-w-2xl leading-relaxed"
                style={{ 
                  ...getTypographyStyle(headerSubtitleSize as any, headerSubtitleWeight, headerAlign),
                  color: darkMode ? '#94A3B8' : '#64748B' 
                }}
              >
                <TextRenderer 
                  text={headerSubtitle} 
                  highlightType={subtitleHighlightType}
                  highlightColor={subtitleHighlightColor}
                  highlightGradient={subtitleHighlightGradient}
                  highlightBold={subtitleHighlightBold}
                />
              </p>
            )}
          </div>

          {/* Layouts */}
          {layout === 'split' && (
            <div className="grid @lg:grid-cols-2 gap-16 items-start">
              <div className="space-y-8">
                {renderInfo()}
                {renderCalendly()}
              </div>
              {renderForm()}
            </div>
          )}

          {layout === 'centered' && (
            <div className="max-w-3xl mx-auto">
              {renderForm()}
              <div className="mt-16 grid @md:grid-cols-2 gap-8">
                {renderInfo()}
                {renderCalendly()}
              </div>
            </div>
          )}

          {layout === 'map_side' && (
            <div className="grid @lg:grid-cols-2 gap-12 items-stretch">
              <div className="space-y-8">
                {renderForm()}
                {renderCalendly()}
              </div>
              {renderMap()}
            </div>
          )}

          {layout === 'map_top' && (
            <div className="space-y-12">
              {renderMap()}
              <div className="grid @lg:grid-cols-2 gap-16 items-start">
                <div className="space-y-8">
                  {renderInfo()}
                  {renderCalendly()}
                </div>
                {renderForm()}
              </div>
            </div>
          )}

          {layout === 'bento' && (
            <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
              <div className="@md:col-span-2 @lg:col-span-1 @lg:row-span-2">
                {renderForm(true)}
              </div>
              <div className="@lg:col-span-1">
                {renderInfo(true)}
              </div>
              <div className="@lg:col-span-1">
                {renderCalendly(true)}
              </div>
              <div className="@md:col-span-2">
                {renderMap(true)}
              </div>
            </div>
          )}
        </motion.div>
      </div>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
};
