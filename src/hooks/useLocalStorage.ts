
"use client";

import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = (value: T | ((val: T) => T)) => void;

export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);
  
  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue: SetValue<T> = useCallback(value => {
    if (typeof window === "undefined") {
      console.warn(
        `Tried setting localStorage key “${key}” even though environment is not a client`
      );
    }
    try {
      // Use a functional update to ensure setStoredValue has the latest state
      // and to make `setValue` itself stable (not dependent on `storedValue`)
      setStoredValue(prevStoredValue => {
        const newValue = value instanceof Function ? value(prevStoredValue) : value;
        window.localStorage.setItem(key, JSON.stringify(newValue));
        return newValue;
      });
      window.dispatchEvent(new Event("local-storage")); // dispatch event to sync tabs
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]); // Removed storedValue, setStoredValue is stable

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.storageArea === window.localStorage) {
         setStoredValue(readValue());
      }
    };
    
    const handleLocalStorageEvent = () => {
        setStoredValue(readValue())
    }

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage", handleLocalStorageEvent) // For same-tab updates

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage", handleLocalStorageEvent)
    };
  }, [key, readValue]);

  return [storedValue, setValue];
}
