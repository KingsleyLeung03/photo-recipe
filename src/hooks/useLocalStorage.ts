
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

type SetValue<T> = (value: T | ((val: T) => T)) => void;

export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const isMountedRef = useRef(false);

  // Function to read value from localStorage - memoized
  const readValueFromLocalStorage = useCallback(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Effect to initialize state from localStorage on mount (client-side only)
  useEffect(() => {
    // Only run on the client after mount
    if (typeof window !== "undefined") {
        setStoredValue(readValueFromLocalStorage());
        isMountedRef.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // readValueFromLocalStorage is stable due to its own deps (key, initialValue)

  const setValue: SetValue<T> = useCallback(value => {
    if (typeof window === "undefined") {
      console.warn(
        `Tried setting localStorage key “${key}” even though environment is not a client`
      );
      return;
    }
    try {
      // Allow value to be a function so we have the same API as useState
      const newValue = value instanceof Function ? value(storedValue) : value;
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(newValue));
      // Save state
      setStoredValue(newValue);
      // The 'storage' event will be automatically dispatched by the browser.
      // The listener below will pick it up, including in the current tab.
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]); // storedValue is needed for functional updates

  // Effect to listen for changes from other tabs or direct localStorage modifications
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.storageArea === window.localStorage) {
        // Avoid updates before mount/hydration completes or if not on client
        if (!isMountedRef.current || typeof window === "undefined") return;

        try {
          const itemString = window.localStorage.getItem(key);
          const newValueFromStorage = itemString ? (JSON.parse(itemString) as T) : initialValue;

          // Only update if the new value is meaningfully different from the current state.
          // Compare stringified versions to handle objects/arrays correctly,
          // as JSON.parse creates new references.
          const currentStoredValueString = JSON.stringify(storedValue);
          const newValueFromStorageString = JSON.stringify(newValueFromStorage);

          if (currentStoredValueString !== newValueFromStorageString) {
            setStoredValue(newValueFromStorage);
          }
        } catch (error) {
          console.warn(`Error processing storage event for key "${key}":`, error);
          // Fallback to initial value on error to prevent inconsistent state
          setStoredValue(initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue, storedValue]); // storedValue is a dependency for comparison

  return [storedValue, setValue];
}
