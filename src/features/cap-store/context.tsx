import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useCapKit } from '@/shared/hooks/use-capkit';
import { useRemoteCap } from './hooks/use-remote-cap';
import type { CapStoreSection, InstalledCap } from './types';

interface CapStoreContextValue {
  activeSection: CapStoreSection;
  setActiveSection: (section: CapStoreSection) => void;
  selectedCap: InstalledCap | null;
  setSelectedCap: (cap: InstalledCap | null) => void;
}

const initialActiveSection = {
  id: 'all',
  label: 'All Caps',
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
  // const [isOpen, setIsOpen] = useState(false);
  const [selectedCap, setSelectedCap] = useState<InstalledCap | null>(null);
  const [activeSection, _setActiveSection] =
    useState<CapStoreSection>(initialActiveSection);
  const { fetchCaps } = useRemoteCap();
  const capKit = useCapKit();
  const [init, setInit] = useState(false);

  // const openModal = () => setIsOpen(true);
  // const closeModal = () => {
  //   setIsOpen(false);
  //   setActiveSection(initialActiveSection);
  // };
  // const toggleModal = () => setIsOpen((prev) => !prev);

  const setActiveSection = (section: CapStoreSection) => {
    _setActiveSection(section);
    setSelectedCap(null);
  };

  useEffect(() => {
    if (capKit.capKit && !init) {
      fetchCaps();
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
