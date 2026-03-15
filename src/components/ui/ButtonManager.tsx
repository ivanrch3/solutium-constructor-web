import React, { useState } from 'react';
import { MousePointer2, Link as LinkIcon, ExternalLink, ChevronDown, Type, Palette } from 'lucide-react';
import { ColorPicker } from './ColorPicker';

interface ButtonManagerProps {
  data: any;
  onUpdate: (data: any) => void;
  buttonElements: { key: string; label: string }[];
}

export const ButtonManager = ({ data, onUpdate, buttonElements }: ButtonManagerProps) => {
  const [selectedButton, setSelectedButton] = useState(buttonElements[0]?.key || '');

  if (buttonElements.length === 0) return null;

  const currentButtonData = data[selectedButton] || {};

  const updateButton = (key: string, value: any) => {
    onUpdate({
      [selectedButton]: {
        ...currentButtonData,
        [key]: value
      }
    });
  };

  const getThemeColorHex = (variableName: string, fallbackHex: string) => {
    if (typeof window === 'undefined') return fallbackHex;
    const rgbStr = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    if (!rgbStr) return fallbackHex;
    const parts = rgbStr.split(' ').map(p => parseInt(p, 10));
    if (parts.length === 3 && !parts.some(isNaN)) {
      return '#' + parts.map(x => x.toString(16).padStart(2, '0')).join('');
    }
    return fallbackHex;
  };

  const defaultColor = currentButtonData.color || getThemeColorHex('--color-primary-rgb', '#3B82F6');

  return (
    <div className="space-y-6">
      {/* Button Selector (Only show if there are multiple buttons) */}
      {buttonElements.length > 1 ? (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
            <MousePointer2 className="w-3 h-3" /> Botón a Editar
          </label>
          <div className="relative">
            <select
              value={selectedButton}
              onChange={(e) => setSelectedButton(e.target.value)}
              className="w-full p-3 bg-background border border-text/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
            >
              {buttonElements.map((el) => (
                <option key={el.key} value={el.key}>
                  {el.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40 pointer-events-none" />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
            <MousePointer2 className="w-3 h-3" /> {buttonElements[0].label} (Opcional)
          </label>
        </div>
      )}

      {/* Button Settings */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
            <LinkIcon className="w-3 h-3" /> URL / Enlace
          </label>
          <input
            type="text"
            value={currentButtonData.url || ''}
            onChange={(e) => updateButton('url', e.target.value)}
            className="w-full p-3 bg-background border border-text/10 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
            <ExternalLink className="w-3 h-3" /> Abrir en
          </label>
          <div className="flex bg-background p-1 rounded-xl border border-text/10">
            {[
              { label: 'Misma pestaña', value: '_self' },
              { label: 'Nueva pestaña', value: '_blank' }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateButton('target', opt.value)}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                  (currentButtonData.target || '_self') === opt.value 
                    ? 'bg-surface text-primary shadow-sm' 
                    : 'text-text/40 hover:text-text/60'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
            <Palette className="w-3 h-3" /> Color del Botón
          </label>
          <ColorPicker
            color={defaultColor}
            onChange={(color) => updateButton('color', color)}
          />
        </div>
      </div>

      <p className="text-[9px] text-text/30 italic leading-relaxed">
        * El texto y estilo tipográfico del botón se gestionan en la sección de "Textos".
      </p>
    </div>
  );
};
