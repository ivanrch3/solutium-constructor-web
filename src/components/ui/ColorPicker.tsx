import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

export const ColorPicker = ({ color, onChange, label }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Ensure color is a valid hex for the picker, default to black if empty
  const safeColor = color && color.startsWith('#') ? color : '#000000';

  return (
    <div className="relative" ref={popoverRef}>
      {label && <label className="text-[9px] font-bold text-text/40 uppercase block mb-1">{label}</label>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded-md border border-text/20 shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50"
          style={{ backgroundColor: safeColor }}
          aria-label="Elegir color"
        />
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-1.5 bg-background border border-text/10 rounded text-[10px] font-mono focus:ring-2 focus:ring-primary/50 outline-none uppercase"
          placeholder="#000000"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 p-3 bg-surface border border-text/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <HexColorPicker color={safeColor} onChange={onChange} />
          
          {/* Quick Swatches */}
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-text/5">
            {['#000000', '#FFFFFF', '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map((swatch) => (
              <button
                key={swatch}
                type="button"
                className="w-5 h-5 rounded-full border border-text/10 shadow-sm hover:scale-110 transition-transform"
                style={{ backgroundColor: swatch }}
                onClick={() => {
                  onChange(swatch);
                  setIsOpen(false);
                }}
                aria-label={`Seleccionar color ${swatch}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
