/**
 * Safe localStorage wrapper with versioned keys to avoid corruption
 */

const STORAGE_VERSION = "v1";

export function safeLocalStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

export function getStorageKey(key: string): string {
  return `synqchain_${STORAGE_VERSION}_${key}`;
}

export function getItem<T>(key: string, defaultValue: T): T {
  const storage = safeLocalStorage();
  if (!storage) return defaultValue;

  try {
    const item = storage.getItem(getStorageKey(key));
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): void {
  const storage = safeLocalStorage();
  if (!storage) return;

  try {
    storage.setItem(getStorageKey(key), JSON.stringify(value));
  } catch {
    // Ignore storage errors (quota exceeded, etc.)
  }
}

export function removeItem(key: string): void {
  const storage = safeLocalStorage();
  if (!storage) return;

  try {
    storage.removeItem(getStorageKey(key));
  } catch {
    // Ignore storage errors
  }
}

export function clearAll(): void {
  const storage = safeLocalStorage();
  if (!storage) return;

  try {
    const keys = Object.keys(storage);
    const synqchainKeys = keys.filter(key => key.startsWith(`synqchain_${STORAGE_VERSION}_`));
    synqchainKeys.forEach(key => storage.removeItem(key));
  } catch {
    // Ignore storage errors
  }
}






