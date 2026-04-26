import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type LocalStorageService from 'codecrafters-frontend/services/local-storage';

const SETTINGS_KEY = 'crm:settings';

interface SettingsData {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  logoDataUrl: string;
}

export default class CrmSettingsService extends Service {
  @service declare localStorage: LocalStorageService;

  @tracked companyName = 'Mob Madness';
  @tracked companyAddress = '';
  @tracked companyPhone = '';
  @tracked companyEmail = '';
  @tracked logoDataUrl = '';

  constructor(owner: object) {
    super(owner);
    this.load();
  }

  private load(): void {
    const raw = this.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as SettingsData;
      this.companyName = data.companyName ?? 'Mob Madness';
      this.companyAddress = data.companyAddress ?? '';
      this.companyPhone = data.companyPhone ?? '';
      this.companyEmail = data.companyEmail ?? '';
      this.logoDataUrl = data.logoDataUrl ?? '';
    } catch {
      // ignore corrupt data
    }
  }

  save(): void {
    const data: SettingsData = {
      companyName: this.companyName,
      companyAddress: this.companyAddress,
      companyPhone: this.companyPhone,
      companyEmail: this.companyEmail,
      logoDataUrl: this.logoDataUrl,
    };
    this.localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
  }
}

declare module '@ember/service' {
  interface Registry {
    'crm-settings': CrmSettingsService;
  }
}
