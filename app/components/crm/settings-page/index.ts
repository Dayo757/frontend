import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import type CrmSettingsService from 'codecrafters-frontend/services/crm-settings';

interface Signature {
  Element: HTMLDivElement;
  Args: Record<string, never>;
}

export default class CrmSettingsPageComponent extends Component<Signature> {
  @service declare crmSettings: CrmSettingsService;

  @action handleSave(e: Event): void {
    e.preventDefault();
    this.crmSettings.save();
    alert('Settings saved!');
  }

  @action handleLogoUpload(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      this.crmSettings.logoDataUrl = (ev.target?.result as string) ?? '';
    };
    reader.readAsDataURL(file);
  }

  @action removeLogo(): void {
    this.crmSettings.logoDataUrl = '';
    this.crmSettings.save();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::SettingsPage': typeof CrmSettingsPageComponent;
  }
}
