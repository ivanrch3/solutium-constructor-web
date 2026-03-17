import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Github, Send } from 'lucide-react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';
import { usePageLayout } from '../../context/PageLayoutContext';

interface FooterModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const FooterModule = ({ data, onUpdate }: FooterModuleProps) => {
  const { previewDevice } = usePageLayout();
  const is_mobile_simulated = previewDevice === 'mobile';
  const layout_type = data?.layout_type || 'columns';
  const show_social_links = data?.show_social_links !== false;
  const show_newsletter = data?.show_newsletter !== false;
  const social_links = data?.social_links || [];
  const columns = data?.columns || [];
  const bottom_links = data?.bottom_links || [];

  const handleTextUpdate = (path: string, value: string) => {
    if (onUpdate) {
      const newData = { ...data };
      const parts = path.split('.');
      let current = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        if (Array.isArray(current[key])) {
          current[key] = [...current[key]];
        } else {
          current[key] = { ...current[key] };
        }
        current = current[key];
      }
      current[parts[parts.length - 1]] = value;
      onUpdate(newData);
    }
  };

  const renderSocialIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      case 'github': return <Github className="w-5 h-5" />;
      default: return null;
    }
  };

  const renderSocialLinks = () => {
    if (!show_social_links || social_links.length === 0) return null;
    return (
      <div className={`flex gap-4 ${layout_type === 'centered' ? 'justify-center' : ''}`}>
        {social_links.map((link: any, idx: number) => (
          <a 
            key={idx}
            href={link.url}
            className="w-10 h-10 bg-current/10 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:-translate-y-1"
          >
            {renderSocialIcon(link.platform)}
          </a>
        ))}
      </div>
    );
  };

  const renderLogo = () => (
    <div className="mb-6">
      {data?.logo_image ? (
        <img src={data.logo_image} alt="Logo" className="h-10 w-auto object-contain" referrerPolicy="no-referrer" />
      ) : (
        <Typography
          variant="span"
          className="text-2xl font-black tracking-tighter block"
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('logo_text', text)}
        >
          {data?.logo_text || 'SOLUTIUM'}
        </Typography>
      )}
    </div>
  );

  const renderNewsletter = () => {
    if (!show_newsletter) return null;
    return (
      <div className="bg-current/5 p-6 rounded-2xl border border-current/10">
        <Typography
          variant="h4"
          className="font-bold mb-2"
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('newsletter_title', text)}
        >
          {data?.newsletter_title || 'Suscríbete'}
        </Typography>
        <Typography
          variant="p"
          className="text-sm opacity-60 mb-4"
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('newsletter_text', text)}
        >
          {data?.newsletter_text || 'Recibe las últimas noticias.'}
        </Typography>
        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="Email" 
            className="flex-1 px-4 py-2 bg-background border border-current/10 rounded-lg text-sm outline-none focus:border-primary transition-colors"
          />
          <button className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  };

  const renderBottomBar = () => (
    <div className={`mt-16 pt-8 border-t border-current/10 flex flex-col ${is_mobile_simulated ? '' : 'md:flex-row'} items-center justify-between gap-4 text-sm opacity-60 ${layout_type === 'centered' || is_mobile_simulated ? 'flex-col text-center' : ''}`}>
      <Typography
        variant="span"
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate('copyright', text)}
      >
        {data?.copyright || '© 2024 Solutium. Todos los derechos reservados.'}
      </Typography>
      {social_links.length > 0 && (
        <div className={`flex flex-wrap justify-center gap-4 md:gap-6`}>
          {bottom_links.map((link: any, idx: number) => (
            <a key={idx} href={link.url} className="hover:text-primary transition-colors">
              {link.text}
            </a>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (layout_type) {
      case 'centered':
        return (
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              {renderLogo()}
            </div>
            <Typography
              variant="p"
              className="text-lg opacity-60 mb-8 max-w-2xl mx-auto"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('description', text)}
            >
              {data?.description}
            </Typography>
            <div className="mb-12 flex justify-center">
              {renderSocialLinks()}
            </div>
            
            {columns.length > 0 && (
              <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-12">
                {columns.map((col: any, idx: number) => (
                  <div key={idx}>
                    <Typography
                      variant="h4"
                      className="font-bold mb-4"
                      editable={!!onUpdate}
                      onUpdate={(text) => handleTextUpdate(`columns.${idx}.title`, text)}
                    >
                      {col.title}
                    </Typography>
                    <ul className="space-y-2">
                      {col.links?.map((link: any, lIdx: number) => (
                        <li key={lIdx}>
                          <a 
                            href={link.url} 
                            onClick={(e) => { if (onUpdate) e.preventDefault(); }}
                            className="opacity-60 hover:opacity-100 hover:text-primary transition-colors cursor-pointer block"
                          >
                            <Typography
                              variant="span"
                              editable={!!onUpdate}
                              onUpdate={(text) => handleTextUpdate(`columns.${idx}.links.${lIdx}.text`, text)}
                            >
                              {link.text}
                            </Typography>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            
            {renderBottomBar()}
          </div>
        );

      case 'minimal':
        return (
          <div className={`flex flex-col ${is_mobile_simulated ? '' : 'md:flex-row'} items-center justify-between gap-8`}>
            <div className={`flex items-center ${is_mobile_simulated ? 'flex-col' : 'gap-8'}`}>
              {renderLogo()}
              {!is_mobile_simulated && <div className="hidden md:block h-6 w-px bg-current/10"></div>}
              <Typography
                variant="p"
                className={`text-sm opacity-60 max-w-xs ${is_mobile_simulated ? 'text-center mb-4' : 'hidden md:block'}`}
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('description', text)}
              >
                {data?.description}
              </Typography>
            </div>
            <div className={`flex flex-col ${is_mobile_simulated ? 'items-center' : 'md:flex-row md:items-center'} gap-6 md:gap-8`}>
              {renderSocialLinks()}
              <Typography
                variant="span"
                className="text-sm opacity-60"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('copyright', text)}
              >
                {data?.copyright}
              </Typography>
            </div>
          </div>
        );

      case 'simple':
        return (
          <div className={`grid ${is_mobile_simulated ? 'grid-cols-1' : 'md:grid-cols-2'} gap-12 items-start`}>
            <div className={is_mobile_simulated ? 'text-center flex flex-col items-center' : ''}>
              {renderLogo()}
              <Typography
                variant="p"
                className="text-lg opacity-60 mb-8 max-w-md"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('description', text)}
              >
                {data?.description}
              </Typography>
              {renderSocialLinks()}
            </div>
            <div className={`grid grid-cols-2 ${is_mobile_simulated ? 'gap-6' : 'sm:grid-cols-3 gap-8'}`}>
              {columns.map((col: any, idx: number) => (
                <div key={idx}>
                  <Typography
                    variant="h4"
                    className="font-bold mb-4"
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate(`columns.${idx}.title`, text)}
                  >
                    {col.title}
                  </Typography>
                  <ul className="space-y-2">
                    {col.links?.map((link: any, lIdx: number) => (
                      <li key={lIdx}>
                        <a 
                          href={link.url} 
                          onClick={(e) => { if (onUpdate) e.preventDefault(); }}
                          className="opacity-60 hover:opacity-100 hover:text-primary transition-colors cursor-pointer block"
                        >
                          <Typography
                            variant="span"
                            editable={!!onUpdate}
                            onUpdate={(text) => handleTextUpdate(`columns.${idx}.links.${lIdx}.text`, text)}
                          >
                            {link.text}
                          </Typography>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="col-span-full">
              {renderBottomBar()}
            </div>
          </div>
        );

      case 'columns':
      default:
        return (
          <>
            <div className={`grid ${is_mobile_simulated ? 'grid-cols-1' : 'lg:grid-cols-12'} gap-12`}>
              <div className={is_mobile_simulated ? 'text-center flex flex-col items-center' : 'lg:col-span-4'}>
                {renderLogo()}
                <Typography
                  variant="p"
                  className="text-lg opacity-60 mb-8 max-w-sm"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('description', text)}
                >
                  {data?.description}
                </Typography>
                {renderSocialLinks()}
              </div>
              
              <div className={`${is_mobile_simulated ? 'grid-cols-2' : 'lg:col-span-5 grid grid-cols-2 sm:grid-cols-3'} gap-8`}>
                {columns.map((col: any, idx: number) => (
                  <div key={idx}>
                    <Typography
                      variant="h4"
                      className="font-bold mb-6"
                      editable={!!onUpdate}
                      onUpdate={(text) => handleTextUpdate(`columns.${idx}.title`, text)}
                    >
                      {col.title}
                    </Typography>
                    <ul className="space-y-3">
                      {col.links?.map((link: any, lIdx: number) => (
                        <li key={lIdx}>
                          <a 
                            href={link.url} 
                            onClick={(e) => { if (onUpdate) e.preventDefault(); }}
                            className="opacity-60 hover:opacity-100 hover:text-primary transition-colors block cursor-pointer"
                          >
                            <Typography
                              variant="span"
                              editable={!!onUpdate}
                              onUpdate={(text) => handleTextUpdate(`columns.${idx}.links.${lIdx}.text`, text)}
                            >
                              {link.text}
                            </Typography>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className={is_mobile_simulated ? 'w-full' : 'lg:col-span-3'}>
                {renderNewsletter()}
              </div>
            </div>
            {renderBottomBar()}
          </>
        );
    }
  };

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
      className={layout_type === 'minimal' ? 'py-12' : ''}
    >
      {renderContent()}
    </ModuleWrapper>
  );
};
