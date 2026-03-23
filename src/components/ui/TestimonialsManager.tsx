import React from 'react';
import { MessageSquare, Plus, Trash2, Settings2, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { PremiumBadge } from './PremiumBadge';

interface TestimonialsManagerProps {
  data: any;
  onUpdate: (data: any) => void;
  onOpenImagePicker: (callback: (url: string) => void) => void;
  isPremiumUser?: boolean;
}

export const TestimonialsManager = ({ data, onUpdate, onOpenImagePicker, isPremiumUser = false }: TestimonialsManagerProps) => {
  const [expandedTestimonial, setExpandedTestimonial] = React.useState<number | null>(null);
  const testimonials = data.testimonials || [];

  const updateData = (newData: any) => {
    onUpdate({ ...data, ...newData });
  };

  const updateTestimonial = (index: number, key: string, value: any) => {
    const newTestimonials = [...testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [key]: value };
    updateData({ testimonials: newTestimonials });
  };

  const addTestimonial = () => {
    if (!isPremiumUser && testimonials.length >= 3) {
      return;
    }

    const newTestimonial = {
      name: 'Nuevo Cliente',
      role: 'Cargo',
      company: 'Empresa',
      content: 'Escribe aquí el testimonio del cliente...',
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      rating: 5,
      verified: true,
      source: 'none'
    };
    updateData({ testimonials: [...testimonials, newTestimonial] });
    setExpandedTestimonial(testimonials.length);
  };

  const removeTestimonial = (index: number) => {
    const newTestimonials = testimonials.filter((_: any, i: number) => i !== index);
    updateData({ testimonials: newTestimonials });
    if (expandedTestimonial === index) setExpandedTestimonial(null);
  };

  const toggleTestimonial = (index: number) => {
    setExpandedTestimonial(expandedTestimonial === index ? null : index);
  };

  const isLimitReached = !isPremiumUser && testimonials.length >= 3;

  return (
    <div className="space-y-6">
      {!isPremiumUser && (
        <div className="p-3 bg-background border border-text/10 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2">
            <PremiumBadge inline />
          </div>
          <p className="text-xs font-medium text-text/80 pr-12">
            En la versión gratuita puedes añadir hasta <span className="font-black text-primary">3 testimonios</span>.
          </p>
        </div>
      )}

      {/* Global Settings */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
          <Settings2 className="w-3 h-3" /> Configuración Global
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 p-2 bg-background border border-text/10 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
            <input
              type="checkbox"
              checked={data.showRating !== false}
              onChange={(e) => updateData({ showRating: e.target.checked })}
              className="w-3.5 h-3.5 text-primary rounded border-text/20 focus:ring-primary"
            />
            <span className="text-[11px] font-medium text-text/80">Mostrar Estrellas</span>
          </label>
          <label className="flex items-center gap-2 p-2 bg-background border border-text/10 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
            <input
              type="checkbox"
              checked={data.showAvatar !== false}
              onChange={(e) => updateData({ showAvatar: e.target.checked })}
              className="w-3.5 h-3.5 text-primary rounded border-text/20 focus:ring-primary"
            />
            <span className="text-[11px] font-medium text-text/80">Mostrar Fotos</span>
          </label>
          <label className="flex items-center gap-2 p-2 bg-background border border-text/10 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
            <input
              type="checkbox"
              checked={data.showRole !== false}
              onChange={(e) => updateData({ showRole: e.target.checked })}
              className="w-3.5 h-3.5 text-primary rounded border-text/20 focus:ring-primary"
            />
            <span className="text-[11px] font-medium text-text/80">Mostrar Cargo</span>
          </label>
          <label className="flex items-center gap-2 p-2 bg-background border border-text/10 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
            <input
              type="checkbox"
              checked={data.showCompany !== false}
              onChange={(e) => updateData({ showCompany: e.target.checked })}
              className="w-3.5 h-3.5 text-primary rounded border-text/20 focus:ring-primary"
            />
            <span className="text-[11px] font-medium text-text/80">Mostrar Empresa</span>
          </label>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
            <MessageSquare className="w-3 h-3" /> Testimonios
          </label>
          <button
            onClick={addTestimonial}
            disabled={isLimitReached}
            className={`p-1.5 rounded-lg transition-colors ${
              isLimitReached 
                ? 'bg-background text-text/20 cursor-not-allowed' 
                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
            }`}
            title={isLimitReached ? "Límite alcanzado" : "Añadir testimonio"}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {testimonials.map((testimonial: any, index: number) => (
            <div key={index} className="border border-text/10 rounded-xl overflow-hidden bg-background">
              <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-text/5 transition-colors"
                onClick={() => toggleTestimonial(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
                    {testimonial.avatar ? (
                      <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary text-[10px] font-bold">
                        {testimonial.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text truncate max-w-[120px]">
                      {testimonial.name || 'Sin nombre'}
                    </span>
                    <span className="text-[10px] text-text/40 truncate max-w-[120px]">
                      {testimonial.role} {testimonial.company ? `@ ${testimonial.company}` : ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTestimonial(index);
                    }}
                    className="p-1.5 text-text/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <ChevronDown className={`w-4 h-4 text-text/40 transition-transform ${expandedTestimonial === index ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {expandedTestimonial === index && (
                <div className="p-4 border-t border-text/10 space-y-4 bg-surface/50">
                  {/* Avatar */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Foto (Avatar)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={testimonial.avatar || ''}
                        onChange={(e) => updateTestimonial(index, 'avatar', e.target.value)}
                        className="flex-1 p-2.5 bg-background border border-text/10 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none"
                        placeholder="URL de la imagen"
                      />
                      <button
                        onClick={() => onOpenImagePicker((url) => updateTestimonial(index, 'avatar', url))}
                        className="p-2.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Nombre</label>
                      <input
                        type="text"
                        value={testimonial.name || ''}
                        onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                        className="w-full p-2.5 bg-background border border-text/10 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Cargo</label>
                      <input
                        type="text"
                        value={testimonial.role || ''}
                        onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                        className="w-full p-2.5 bg-background border border-text/10 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Empresa</label>
                    <input
                      type="text"
                      value={testimonial.company || ''}
                      onChange={(e) => updateTestimonial(index, 'company', e.target.value)}
                      className="w-full p-2.5 bg-background border border-text/10 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Testimonio</label>
                    <textarea
                      value={testimonial.content || ''}
                      onChange={(e) => updateTestimonial(index, 'content', e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-background border border-text/10 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none resize-none"
                    />
                  </div>

                  {/* Rating & Source */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Valoración (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={testimonial.rating || 5}
                        onChange={(e) => updateTestimonial(index, 'rating', parseInt(e.target.value))}
                        className="w-full p-2.5 bg-background border border-text/10 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Fuente</label>
                      <div className="relative">
                        <select
                          value={testimonial.source || 'none'}
                          onChange={(e) => updateTestimonial(index, 'source', e.target.value)}
                          className="w-full p-2.5 bg-background border border-text/10 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none appearance-none"
                        >
                          <option value="none">Ninguna</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="twitter">Twitter / X</option>
                          <option value="trustpilot">Trustpilot</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text/40 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Verified */}
                  <label className="flex items-center gap-2 p-2 bg-background border border-text/10 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={testimonial.verified || false}
                      onChange={(e) => updateTestimonial(index, 'verified', e.target.checked)}
                      className="w-3.5 h-3.5 text-primary rounded border-text/20 focus:ring-primary"
                    />
                    <span className="text-[11px] font-medium text-text/80">Compra Verificada</span>
                  </label>

                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
