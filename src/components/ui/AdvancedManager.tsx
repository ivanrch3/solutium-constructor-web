import React from 'react';
import { Clock, List, X, Plus, Trash2 } from 'lucide-react';
import { PremiumBadge } from './PremiumBadge';

interface AdvancedManagerProps {
  data: any;
  onUpdate: (data: any) => void;
  isPremiumUser?: boolean;
}

export const AdvancedManager = ({ data, onUpdate, isPremiumUser = false }: AdvancedManagerProps) => {
  const mode = data.advancedMode || 'none'; // 'none', 'timer', 'carousel'
  const timerData = data.timer || { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const carouselData = data.carousel || ['Mensaje 1'];

  const setMode = (newMode: string) => {
    onUpdate({ advancedMode: newMode });
  };

  const updateTimer = (field: string, value: number) => {
    onUpdate({
      timer: {
        ...timerData,
        [field]: value
      }
    });
  };

  const updateCarousel = (index: number, value: string) => {
    const newCarousel = [...carouselData];
    newCarousel[index] = value;
    onUpdate({ carousel: newCarousel });
  };

  const addCarouselItem = () => {
    if (carouselData.length < 3) {
      onUpdate({ carousel: [...carouselData, `Mensaje ${carouselData.length + 1}`] });
    }
  };

  const removeCarouselItem = (index: number) => {
    const newCarousel = carouselData.filter((_: any, i: number) => i !== index);
    onUpdate({ carousel: newCarousel });
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex bg-background p-1 rounded-xl border border-text/10 relative">
        <button
          onClick={() => setMode('none')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
            mode === 'none' 
              ? 'bg-surface text-primary shadow-sm' 
              : 'text-text/40 hover:text-text/60'
          }`}
        >
          <X className="w-3 h-3" />
          Ninguno
        </button>
        <button
          onClick={() => {
            if (!isPremiumUser) return;
            setMode('timer');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all relative ${
            mode === 'timer' 
              ? 'bg-surface text-primary shadow-sm' 
              : !isPremiumUser
              ? 'text-text/30 cursor-not-allowed'
              : 'text-text/40 hover:text-text/60'
          }`}
        >
          {!isPremiumUser && <PremiumBadge />}
          <Clock className="w-3 h-3" />
          Temporizador
        </button>
        <button
          onClick={() => {
            if (!isPremiumUser) return;
            setMode('carousel');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all relative ${
            mode === 'carousel' 
              ? 'bg-surface text-primary shadow-sm' 
              : !isPremiumUser
              ? 'text-text/30 cursor-not-allowed'
              : 'text-text/40 hover:text-text/60'
          }`}
        >
          {!isPremiumUser && <PremiumBadge />}
          <List className="w-3 h-3" />
          Carrusel
        </button>
      </div>

      {/* Timer Config */}
      {mode === 'timer' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-[10px] text-text/50 leading-relaxed">
            Configura el tiempo restante. El temporizador se mostrará a la par del mensaje principal.
          </p>
          <div className="grid grid-cols-4 gap-2">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-text/40 uppercase tracking-widest text-center block">Días</label>
              <input
                type="number"
                min="0"
                value={timerData.days}
                onChange={(e) => updateTimer('days', parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-background border border-text/10 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-text/40 uppercase tracking-widest text-center block">Horas</label>
              <input
                type="number"
                min="0"
                max="23"
                value={timerData.hours}
                onChange={(e) => updateTimer('hours', parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-background border border-text/10 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-text/40 uppercase tracking-widest text-center block">Minutos</label>
              <input
                type="number"
                min="0"
                max="59"
                value={timerData.minutes}
                onChange={(e) => updateTimer('minutes', parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-background border border-text/10 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-text/40 uppercase tracking-widest text-center block">Segundos</label>
              <input
                type="number"
                min="0"
                max="59"
                value={timerData.seconds}
                onChange={(e) => updateTimer('seconds', parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-background border border-text/10 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Carousel Config */}
      {mode === 'carousel' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-[10px] text-text/50 leading-relaxed">
            El carrusel reemplazará el mensaje principal y rotará entre los siguientes mensajes. (Máximo 3)
          </p>
          <div className="space-y-2">
            {carouselData.map((msg: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={msg}
                  onChange={(e) => updateCarousel(index, e.target.value)}
                  className="flex-1 p-2 bg-background border border-text/10 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder={`Mensaje ${index + 1}`}
                />
                {carouselData.length > 1 && (
                  <button
                    onClick={() => removeCarouselItem(index)}
                    className="p-2 text-text/40 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {carouselData.length < 3 && (
            <button
              onClick={addCarouselItem}
              className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
            >
              <Plus className="w-3 h-3" /> Agregar Mensaje
            </button>
          )}
        </div>
      )}
    </div>
  );
};
