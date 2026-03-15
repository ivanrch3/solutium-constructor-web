import React, { createContext, useContext } from 'react';

interface ModuleContextType {
  index: number;
}

const ModuleContext = createContext<ModuleContextType>({ index: 0 });

export const ModuleProvider: React.FC<{ index: number; children: React.ReactNode }> = ({ index, children }) => {
  return (
    <ModuleContext.Provider value={{ index }}>
      {children}
    </ModuleContext.Provider>
  );
};

export const useModuleContext = () => useContext(ModuleContext);
