import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useCapKit } from '@/shared/hooks/use-capkit';
import type { Cap } from '@/shared/types';
import { useCapStore } from './stores';
import type { CapStoreSection, RemoteCap } from './types';

interface CapStoreContextValue {
  activeSection: CapStoreSection;
  setActiveSection: (section: CapStoreSection) => void;
  selectedCap: Cap & RemoteCap | null;
  setSelectedCap: (cap: Cap & RemoteCap | null) => void;
}

const initialActiveSection = {
  id: 'home',
  label: 'Home',
  type: 'section' as const,
};

const defaultContextValue: CapStoreContextValue = {
  activeSection: initialActiveSection,
  setActiveSection: () => { },
  selectedCap: null,
  setSelectedCap: () => { },
};

const CapStoreContext =
  createContext<CapStoreContextValue>(defaultContextValue);

interface CapStoreProviderProps {
  children: ReactNode;
}

export function CapStoreProvider({ children }: CapStoreProviderProps) {
  const [selectedCap, setSelectedCap] = useState<Cap & RemoteCap | null>(null);
  const [activeSection, _setActiveSection] =
    useState<CapStoreSection>(initialActiveSection);
  const { fetchCaps, fetchFavoriteCaps, fetchHome } = useCapStore();
  const capKit = useCapKit();
  const [init, setInit] = useState(false);

  const setActiveSection = (section: CapStoreSection) => {
    _setActiveSection(section);
    setSelectedCap(null);
  };

  useEffect(() => {
    if (capKit.capKit && !init) {
      fetchCaps();
      fetchFavoriteCaps();
      fetchHome();
      setInit(true);
    }
  }, [capKit]);

  const value: CapStoreContextValue = {
    activeSection,
    setActiveSection,
    selectedCap,
    setSelectedCap,
  };

  return (
    <CapStoreContext.Provider value={value}>
      {children}
    </CapStoreContext.Provider>
  );
}

export function useCapStoreContext() {
  const context = useContext(CapStoreContext);

  if (!context) {
    throw new Error('useCapStore must be used within a CapStoreProvider');
  }

  return context;
}

export { CapStoreContext };
