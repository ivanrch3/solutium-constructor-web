import React, { createContext, useContext } from 'react';
import { PageLayout } from '../types';

interface PageLayoutContextType {
  pageLayout: PageLayout;
}

const PageLayoutContext = createContext<PageLayoutContextType>({ pageLayout: 'seamless' });

export const PageLayoutProvider: React.FC<{ pageLayout: PageLayout; children: React.ReactNode }> = ({ pageLayout, children }) => {
  return (
    <PageLayoutContext.Provider value={{ pageLayout }}>
      {children}
    </PageLayoutContext.Provider>
  );
};

export const usePageLayout = () => useContext(PageLayoutContext);
