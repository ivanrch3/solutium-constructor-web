import React from 'react';

export const HeroModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any>,
  logoUrl?: string | null,
  logoWhiteUrl?: string | null
}> = ({ moduleId, settingsValues, logoUrl, logoWhiteUrl }) => {
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  const title = getVal(null, 'title', 'Construye tu futuro hoy');
  const subtitle = getVal(null, 'subtitle', 'La plataforma más completa para gestionar tu negocio.');
  const height = getVal(null, 'height', 80);
  const overlayOpacity = getVal(null, 'overlay_opacity', 50);
  const bgImage = getVal(null, 'bg_image', '');
  const showLogo = getVal(null, 'show_logo', true);

  const displayLogo = logoWhiteUrl || logoUrl;

  return (
    <section 
      className="relative flex items-center justify-center overflow-hidden bg-slate-900"
      style={{ minHeight: `${height}vh` }}
    >
      {bgImage && (
        <img 
          src={bgImage} 
          alt="Hero Background" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      )}
      <div 
        className="absolute inset-0 bg-black" 
        style={{ opacity: overlayOpacity / 100 }}
      ></div>
      
      <div className="relative z-10 text-center px-6 max-w-4xl">
        {showLogo && displayLogo && (
          <div className="flex justify-center mb-8">
            <img 
              src={displayLogo} 
              alt="Logo" 
              className="h-16 w-auto object-contain" 
              referrerPolicy="no-referrer" 
            />
          </div>
        )}
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          {subtitle}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-900/20">
            Empezar ahora
          </button>
          <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all backdrop-blur-md border border-white/10">
            Saber más
          </button>
        </div>
      </div>
    </section>
  );
};
