import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';

export const ContactModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const layout = getVal(null, 'layout', 'split');
  const maxWidth = getVal(null, 'max_width', 1200);
  const paddingY = getVal(null, 'padding_y', 100);
  const bgColor = getVal(null, 'bg_color', '#F8FAFC');
  const entranceAnim = getVal(null, 'entrance_anim', true);

  // Element: Header
  const headerTitle = getVal(`${moduleId}_el_contact_header`, 'title', 'Ponte en contacto');
  const headerSubtitle = getVal(`${moduleId}_el_contact_header`, 'subtitle', 'Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.');
  const headerAlign = getVal(`${moduleId}_el_contact_header`, 'align', 'left');
  const headerTitleSize = getVal(`${moduleId}_el_contact_header`, 'title_size', 32);
  const headerTitleColor = getVal(`${moduleId}_el_contact_header`, 'title_color', '#0F172A');
  const headerMarginB = getVal(`${moduleId}_el_contact_header`, 'margin_b', 60);

  // Element: Info
  const email = getVal(`${moduleId}_el_contact_info`, 'email', 'hola@tuempresa.com');
  const phone = getVal(`${moduleId}_el_contact_info`, 'phone', '+34 900 000 000');
  const address = getVal(`${moduleId}_el_contact_info`, 'address', 'Calle Innovación 123, Madrid, España');
  const infoSize = getVal(`${moduleId}_el_contact_info`, 'info_size', 16);
  const infoColor = getVal(`${moduleId}_el_contact_info`, 'info_color', '#475569');
  const iconColor = getVal(`${moduleId}_el_contact_info`, 'icon_color', 'var(--primary-color)');
  const infoCardBg = getVal(`${moduleId}_el_contact_info`, 'card_bg', 'transparent');

  // Element: Form
  const buttonText = getVal(`${moduleId}_el_contact_form`, 'button_text', 'Enviar Mensaje');
  const whatsappNumber = getVal(`${moduleId}_el_contact_form`, 'whatsapp_number', '');
  const inputBg = getVal(`${moduleId}_el_contact_form`, 'input_bg', '#FFFFFF');
  const inputRadius = getVal(`${moduleId}_el_contact_form`, 'input_radius', 12);
  const btnBg = getVal(`${moduleId}_el_contact_form`, 'btn_bg', 'var(--primary-color)');
  const btnColor = getVal(`${moduleId}_el_contact_form`, 'btn_color', '#FFFFFF');
  const hoverEffect = getVal(`${moduleId}_el_contact_form`, 'hover_effect', 'lift');

  // Element: Map
  const showMap = getVal(`${moduleId}_el_contact_map`, 'show_map', true);
  const mapUrl = getVal(`${moduleId}_el_contact_map`, 'map_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.615174415891!2d-3.7037902!3d40.4167754!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42287e00000001%3A0x0!2zUHVlcnRhIGRlbCBTb2w!5e0!3m2!1ses!2ses!4v1625123456789!5m2!1ses!2ses');
  const mapHeight = getVal(`${moduleId}_el_contact_map`, 'map_height', 400);
  const mapGrayscale = getVal(`${moduleId}_el_contact_map`, 'grayscale', false);
  const mapRadius = getVal(`${moduleId}_el_contact_map`, 'map_radius', 24);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const animProps = entranceAnim ? {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  } : {};

  const renderInfo = () => (
    <div className="space-y-8">
      <div 
        className="p-8 rounded-3xl space-y-6"
        style={{ backgroundColor: infoCardBg }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
          >
            <Mail size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">Email</h4>
            <p style={{ fontSize: `${infoSize}px`, color: infoColor }}>{email}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
          >
            <Phone size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">Teléfono</h4>
            <p style={{ fontSize: `${infoSize}px`, color: infoColor }}>{phone}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
          >
            <MapPin size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">Dirección</h4>
            <p style={{ fontSize: `${infoSize}px`, color: infoColor }}>{address}</p>
          </div>
        </div>
      </div>

      {whatsappNumber && (
        <a 
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#25D366] text-white font-black text-sm shadow-xl shadow-green-500/20 hover:scale-105 transition-all active:scale-95"
        >
          <MessageCircle size={20} />
          Chatear por WhatsApp
        </a>
      )}
    </div>
  );

  const renderForm = () => (
    <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100">
      {isSubmitted ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send size={32} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">¡Mensaje Enviado!</h3>
          <p className="text-slate-500">Gracias por contactarnos. Te responderemos muy pronto.</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Nombre Completo</label>
            <input 
              required
              type="text"
              placeholder="Ej: Juan Pérez"
              className="w-full px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-slate-200"
              style={{ backgroundColor: inputBg, borderRadius: `${inputRadius}px` }}
              value={formState.name}
              onChange={(e) => setFormState({...formState, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Correo Electrónico</label>
            <input 
              required
              type="email"
              placeholder="juan@ejemplo.com"
              className="w-full px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-slate-200"
              style={{ backgroundColor: inputBg, borderRadius: `${inputRadius}px` }}
              value={formState.email}
              onChange={(e) => setFormState({...formState, email: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Mensaje</label>
            <textarea 
              required
              rows={4}
              placeholder="¿En qué podemos ayudarte?"
              className="w-full px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-slate-200 resize-none"
              style={{ backgroundColor: inputBg, borderRadius: `${inputRadius}px` }}
              value={formState.message}
              onChange={(e) => setFormState({...formState, message: e.target.value})}
            />
          </div>
          <motion.button
            whileHover={hoverEffect === 'lift' ? { y: -5 } : hoverEffect === 'glow' ? { boxShadow: `0 0 25px ${btnBg}60` } : {}}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: btnBg, color: btnColor, borderRadius: `${inputRadius}px` }}
          >
            {buttonText}
            <Send size={18} />
          </motion.button>
        </form>
      )}
    </div>
  );

  const renderMap = () => {
    if (!showMap) return null;
    return (
      <div 
        className="w-full overflow-hidden shadow-xl border border-slate-200"
        style={{ 
          height: `${mapHeight}px`, 
          borderRadius: `${mapRadius}px`,
          filter: mapGrayscale ? 'grayscale(1)' : 'none'
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
        />
      </div>
    );
  };

  return (
    <section 
      className="w-full relative overflow-hidden"
      style={{ backgroundColor: bgColor, paddingTop: `${paddingY}px`, paddingBottom: `${paddingY}px` }}
    >
      <div className="mx-auto px-8" style={{ maxWidth: `${maxWidth}px` }}>
        <motion.div {...animProps}>
          {/* Header */}
          <div 
            className={`flex flex-col mb-16 ${headerAlign === 'center' ? 'items-center text-center' : 'items-start text-left'}`}
            style={{ marginBottom: `${headerMarginB}px` }}
          >
            <h2 
              className="font-black leading-tight mb-4"
              style={{ fontSize: `${headerTitleSize}px`, color: headerTitleColor }}
            >
              {headerTitle}
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
              {headerSubtitle}
            </p>
          </div>

          {/* Layouts */}
          {layout === 'split' && (
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              {renderInfo()}
              {renderForm()}
            </div>
          )}

          {layout === 'centered' && (
            <div className="max-w-3xl mx-auto">
              {renderForm()}
              <div className="mt-16">
                {renderInfo()}
              </div>
            </div>
          )}

          {layout === 'map_side' && (
            <div className="grid lg:grid-cols-2 gap-12 items-stretch">
              {renderForm()}
              {renderMap()}
            </div>
          )}

          {layout === 'map_top' && (
            <div className="space-y-12">
              {renderMap()}
              <div className="grid lg:grid-cols-2 gap-16 items-start">
                {renderInfo()}
                {renderForm()}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
