import React, { createContext, useContext } from 'react';
import { PageLayout } from '../types';

interface PageLayoutContextType {
  pageLayout: PageLayout;
  previewDevice: 'mobile' | 'tablet' | 'desktop';
}

const PageLayoutContext = createContext<PageLayoutContextType>({ 
  pageLayout: 'seamless',
  previewDevice: 'desktop'
});

export const PageLayoutProvider: React.FC<{ 
  pageLayout: PageLayout; 
  previewDevice: 'mobile' | 'tablet' | 'desktop';
  children: React.ReactNode 
}> = ({ pageLayout, previewDevice, children }) => {
  return (
    <PageLayoutContext.Provider value={{ pageLayout, previewDevice }}>
      {children}
    </PageLayoutContext.Provider>
  );
};

export const usePageLayout = () => useContext(PageLayoutContext);
