import React from 'react';
import { ScrollAnimation, AnimationType } from './ScrollAnimation';
import { PageLayout } from '../../types';
import { usePageLayout } from '../../context/PageLayoutContext';
import { useModuleContext } from '../../context/ModuleContext';

interface ModuleWrapperProps {
  layout?: 'layout-1' | 'layout-2' | 'layout-3' | 'layout-4' | 'layout-5' | 'layout-6' | 'layout-7';
  theme?: 'light' | 'dark';
  background?: {
    image?: string;
    size?: 'cover' | 'contain' | 'repeat' | 'auto';
    overlayOpacity?: number;
  };
  animation?: AnimationType;
  pageLayout?: PageLayout;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  noPadding?: boolean;
  index?: number;
  id?: string;
}

export const ModuleWrapper = ({
  layout = 'layout-1',
  theme = 'light',
  background,
  animation = 'fade-up',
  pageLayout: manualPageLayout,
  children,
  className = '',
  style = {},
  noPadding = false,
  index: manualIndex,
  id
}: ModuleWrapperProps) => {
  const { pageLayout: contextPageLayout } = usePageLayout();
  const { index: contextIndex } = useModuleContext();
  
  const pageLayout = manualPageLayout || contextPageLayout || 'seamless';
  const index = manualIndex !== undefined ? manualIndex : contextIndex;

  const themeClasses = theme === 'dark' 
    ? 'bg-text text-background border-text/20' 
    : 'bg-surface text-text border-text/10';

  const isLayered = pageLayout === 'layered';
  const isBento = pageLayout === 'bento';
  const isSnap = pageLayout === 'snap';
  const isSplit = pageLayout === 'split';
  const isEven = index % 2 === 0;

  const layoutClasses = pageLayout === 'seamless' 
    ? 'rounded-none border-0' 
    : pageLayout === 'symmetric'
    ? 'rounded-none border-x border-text/5'
    : isLayered
    ? `rounded-[3rem] border shadow-xl ${isEven ? 'md:ml-[-5%] md:mr-[5%]' : 'md:mr-[-5%] md:ml-[5%]'}`
    : isBento
    ? 'rounded-3xl border shadow-sm h-full'
    : isSnap
    ? 'rounded-none border-0 snap-start min-h-[calc(100vh-120px)] flex items-center justify-center'
    : isSplit
    ? 'rounded-none border-0 min-h-[60vh] flex items-center justify-center'
    : 'rounded-[2.5rem] border';

  const backgroundStyles: React.CSSProperties = {};
  if (background?.image) {
    backgroundStyles.backgroundImage = `url(${background.image})`;
    backgroundStyles.backgroundSize = background.size || 'cover';
    backgroundStyles.backgroundPosition = 'center';
    backgroundStyles.backgroundRepeat = background.size === 'repeat' ? 'repeat' : 'no-repeat';
  }

  const overlayOpacity = background?.overlayOpacity ?? (theme === 'dark' ? 0.7 : 0.1);
  const overlayStyle: React.CSSProperties = {
    backgroundColor: theme === 'dark' ? 'rgb(var(--color-text-rgb))' : 'rgb(var(--color-background-rgb))',
    opacity: overlayOpacity
  };

  const paddingClass = noPadding ? '' : isBento ? 'py-12 md:py-16 px-6 md:px-8' : isSnap || isSplit ? 'py-16 md:py-20 px-6 md:px-10' : 'py-12 md:py-24 px-6 md:px-10';

  return (
    <ScrollAnimation 
      animation={animation} 
      tag="section"
      id={id}
      className={`relative ${paddingClass} overflow-hidden transition-all duration-500 ${themeClasses} ${layoutClasses} ${className}`}
      style={{ ...backgroundStyles, ...style }}
    >
      {background?.image && (
        <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-500" style={overlayStyle} />
      )}
      <div className="relative z-10 max-w-7xl mx-auto">
        {children}
      </div>
    </ScrollAnimation>
  );
};

