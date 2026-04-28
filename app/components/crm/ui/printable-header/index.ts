import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type CrmSettingsService from 'codecrafters-frontend/services/crm-settings';

interface Signature {
  Element: HTMLDivElement;
  Args: { documentTitle: string; documentNumber?: string };
}

export default class CrmUiPrintableHeaderComponent extends Component<Signature> {
  @service declare crmSettings: CrmSettingsService;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::Ui::PrintableHeader': typeof CrmUiPrintableHeaderComponent;
  }
}
