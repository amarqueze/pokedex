import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService) { }

  saveItem(key: string, value: any) {
    this.storage.set(key, value);
  }

  removeItem(key: string) {
    this.storage.remove(key);
  }

  restoreItem(key: string): any {
    return this.storage.get(key);
  }
}
