import { useEffect, useRef, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';

export function usePersistentInput(storageKey: string = 'input') {
  const [input, setInput] = useState('');
  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    storageKey,
    '',
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Hydration handling - run once after mount
  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const clearInput = () => {
    setInput('');
    setLocalStorageInput('');
  };

  return {
    input,
    setInput,
    textareaRef,
    clearInput,
  };
}
