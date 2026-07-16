interface StorageLike {
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  getItem: (key: string) => string | null;
  readonly isAvailable: boolean;
}

const STORAGE_PREFIX = "trcustoms.";

const getPrefixedKey = (key: string): string => {
  return `${STORAGE_PREFIX}${key}`;
};

const isStorageAvailable = (
  type: "localStorage" | "sessionStorage",
): boolean => {
  let storage: Storage;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    const y = storage.getItem(x);
    storage.removeItem(x);
    return x === y;
  } catch (e) {
    return false;
  }
};

class MyStorage implements StorageLike {
  data: { [key: string]: string };

  constructor() {
    this.data = {};
  }

  setItem(key: string, value: string): void {
    this.data[key] = value;
  }

  removeItem(key: string): void {
    delete this.data[key];
  }

  getItem(key: string): string | null {
    return this.data[key] ?? null;
  }

  get isAvailable() {
    return true;
  }
}

class LocalStorage implements StorageLike {
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  get isAvailable() {
    return isStorageAvailable("localStorage");
  }
}

class SessionStorage implements StorageLike {
  setItem(key: string, value: string): void {
    sessionStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  getItem(key: string): string | null {
    return sessionStorage.getItem(key);
  }

  get isAvailable() {
    return isStorageAvailable("sessionStorage");
  }
}

const storages: StorageLike[] = [
  new LocalStorage(),
  new SessionStorage(),
  new MyStorage(),
];

const getItem = (key: string): string | null => {
  const prefixedKey = getPrefixedKey(key);
  for (const storage of storages) {
    if (storage.isAvailable) {
      const prefixedValue = storage.getItem(prefixedKey);
      if (prefixedValue !== null) {
        return prefixedValue;
      }
      return storage.getItem(key);
    }
  }
  return null;
};

const setItem = (key: string, value: string): void => {
  const prefixedKey = getPrefixedKey(key);
  for (const storage of storages) {
    if (storage.isAvailable) {
      storage.setItem(prefixedKey, value);
    }
  }
};

const removeItem = (key: string): void => {
  const prefixedKey = getPrefixedKey(key);
  for (const storage of storages) {
    if (storage.isAvailable) {
      storage.removeItem(prefixedKey);
      storage.removeItem(key);
    }
  }
};

const StorageService = {
  getItem,
  setItem,
  removeItem,
};

export { STORAGE_PREFIX, StorageService, getPrefixedKey };
