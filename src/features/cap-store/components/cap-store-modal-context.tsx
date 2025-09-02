import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRemoteCap } from '../hooks/use-remote-cap';
import type { CapStoreSidebarSection, InstalledCap } from '../types';
import { useCapKit } from '@/shared/hooks/use-capkit';

interface CapStoreModalContextValue {
  // isOpen: boolean;
  // openModal: () => void;
  // closeModal: () => void;
  // toggleModal: () => void;
  activeSection: CapStoreSidebarSection;
  setActiveSection: (section: CapStoreSidebarSection) => void;
  selectedCap: InstalledCap | null;
  setSelectedCap: (cap: InstalledCap | null) => void;
}

const initialActiveSection = {
  id: 'all',
  label: 'All Caps',
  type: 'section' as const,
};

const defaultContextValue: CapStoreModalContextValue = {
  // isOpen: false,
  // openModal: () => {},
  // closeModal: () => {},
  // toggleModal: () => {},
  activeSection: initialActiveSection,
  setActiveSection: () => {},
  selectedCap: null,
  setSelectedCap: () => {},
};

const CapStoreModalContext =
  createContext<CapStoreModalContextValue>(defaultContextValue);

interface CapStoreModalProviderProps {
  children: ReactNode;
}

export function CapStoreModalProvider({
  children,
}: CapStoreModalProviderProps) {
  // const [isOpen, setIsOpen] = useState(false);
  const [selectedCap, setSelectedCap] = useState<InstalledCap | null>(null);
  const [activeSection, _setActiveSection] =
    useState<CapStoreSidebarSection>(initialActiveSection);
  const { fetchCaps } = useRemoteCap();
  const capKit = useCapKit();
  const [init, setInit] = useState(false)

  // const openModal = () => setIsOpen(true);
  // const closeModal = () => {
  //   setIsOpen(false);
  //   setActiveSection(initialActiveSection);
  // };
  // const toggleModal = () => setIsOpen((prev) => !prev);

  const setActiveSection = (section: CapStoreSidebarSection) => {
    _setActiveSection(section);
    setSelectedCap(null);
  };

  useEffect(() => {
    if (capKit.capKit && !init) {
      fetchCaps();
      setInit(true);
    }
  }, [capKit]);

  const value: CapStoreModalContextValue = {
    // isOpen,
    // openModal,
    // closeModal,
    // toggleModal,
    activeSection,
    setActiveSection,
    selectedCap,
    setSelectedCap,
  };

  return (
    <CapStoreModalContext.Provider value={value}>
      {children}
    </CapStoreModalContext.Provider>
  );
}

export function useCapStoreModal() {
  const context = useContext(CapStoreModalContext);

  if (!context) {
    throw new Error(
      'useCapStoreModal must be used within a CapStoreModalProvider',
    );
  }

  return context;
}

export { CapStoreModalContext };
