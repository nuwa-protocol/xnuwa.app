import { useState, useCallback } from 'react';

interface CapDevState {
  activeSection: 'mcp' | 'caps';
  debugMode: boolean;
}

export function useCapDev() {
  const [state, setState] = useState<CapDevState>({
    activeSection: 'mcp',
    debugMode: true,
  });

  const setActiveSection = useCallback((section: 'mcp' | 'caps') => {
    setState(prev => ({ ...prev, activeSection: section }));
  }, []);

  const toggleDebugMode = useCallback(() => {
    setState(prev => ({ ...prev, debugMode: !prev.debugMode }));
  }, []);

  return {
    ...state,
    setActiveSection,
    toggleDebugMode,
  };
}