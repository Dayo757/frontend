import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type CrmSettingsService from 'codecrafters-frontend/services/crm-settings';

interface Signature {
  Element: HTMLDivElement;
  Blocks: { default: [] };
}

export default class CrmLayoutComponent extends Component<Signature> {
  @service declare crmSettings: CrmSettingsService;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::Layout': typeof CrmLayoutComponent;
  }
}
