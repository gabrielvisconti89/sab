import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private _initialized = false;

  constructor(private storage: Storage) {}

  async init(): Promise<void> {
    if (this._initialized) return;
    this._storage = await this.storage.create();
    this._initialized = true;
  }

  async get<T>(key: string): Promise<T | null> {
    await this.init();
    return this._storage?.get(key) ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.init();
    await this._storage?.set(key, value);
  }

  async remove(key: string): Promise<void> {
    await this.init();
    await this._storage?.remove(key);
  }

  async clear(): Promise<void> {
    await this.init();
    await this._storage?.clear();
  }

  async keys(): Promise<string[]> {
    await this.init();
    return (await this._storage?.keys()) ?? [];
  }

  async has(key: string): Promise<boolean> {
    await this.init();
    const value = await this._storage?.get(key);
    return value !== null && value !== undefined;
  }
}
