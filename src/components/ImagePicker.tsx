import React, { useState, useEffect } from 'react';
import { Search, Image as ImageIcon, Loader2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
}

interface ImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
}

export const ImagePicker = ({ isOpen, onClose, onSelect }: ImagePickerProps) => {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<PexelsPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchImages = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const apiKey = import.meta.env.VITE_PEXELS_API_KEY;
      if (!apiKey) {
        throw new Error('Falta configurar VITE_PEXELS_API_KEY en las variables de entorno.');
      }

      const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&perPage=20`, {
        headers: {
          'Authorization': apiKey
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al buscar imágenes');
      }
      const data = await response.json();
      setImages(data.photos || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && images.length === 0) {
      searchImages('business'); // Default search
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchImages(query);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-text/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-background rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-text/10 flex items-center justify-between bg-surface sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-text flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  Buscador de Imágenes
                </h3>
                <p className="text-sm text-text/60">Fotos profesionales gratuitas vía Pexels</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-background rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-text/40" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-6 sm:p-8 bg-background border-b border-text/10">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text/40" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Busca paisajes, tecnología, personas..."
                  className="w-full pl-12 pr-4 py-4 bg-surface border border-text/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-text/70"
                />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
                </button>
              </form>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium mb-6">
                  {error}
                </div>
              )}

              {isLoading && images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-text/40">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="font-medium">Buscando las mejores imágenes...</p>
                </div>
              ) : images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-text/40">
                  <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-medium">No se encontraron imágenes. Prueba con otra búsqueda.</p>
                </div>
              ) : (
                <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
                  {images.map((image) => (
                    <motion.div
                      key={image.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelect(image.src.large2x)}
                      className="relative group cursor-pointer rounded-xl overflow-hidden border border-text/10 shadow-sm hover:shadow-xl transition-all"
                    >
                      <img
                        src={image.src.medium}
                        alt={image.photographer}
                        className="w-full h-auto object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
                        <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center shadow-lg scale-0 group-hover:scale-100 transition-transform duration-300">
                          <Check className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white font-medium truncate">Por {image.photographer}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
