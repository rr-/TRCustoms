const isStorageAvailable = (type: any): boolean => {
  let storage: any;
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

class MyStorage {
  data: { [key: string]: any };

  constructor() {
    this.data = {};
  }

  setItem(key: string, value: any): void {
    this.data[key] = value;
  }

  removeItem(key: string): void {
    delete this.data[key];
  }

  getItem(key: string): any {
    return this.data[key];
  }

  get isAvailable() {
    return true;
  }
}

class LocalStorage {
  setItem(key: string, value: any): void {
    localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  getItem(key: string): any {
    return localStorage.getItem(key);
  }

  get isAvailable() {
    return isStorageAvailable("localStorage");
  }
}

class SessionStorage {
  setItem(key: string, value: any): void {
    sessionStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  getItem(key: string): any {
    return sessionStorage.getItem(key);
  }

  get isAvailable() {
    return isStorageAvailable("sessionStorage");
  }
}

const storages = [new LocalStorage(), new SessionStorage(), new MyStorage()];

const getItem = (key: string): string | null => {
  for (let storage of storages) {
    if (storage.isAvailable) {
      return storage.getItem(key);
    }
  }
  return null;
};

const setItem = (key: string, value: any): void => {
  for (let storage of storages) {
    if (storage.isAvailable) {
      storage.setItem(key, value);
    }
  }
};

const removeItem = (key: string): void => {
  for (let storage of storages) {
    if (storage.isAvailable) {
      storage.removeItem(key);
    }
  }
};

const StorageService = {
  getItem,
  setItem,
  removeItem,
};

export { StorageService };
