import Component from '@glimmer/component';
import { action } from '@ember/object';
import type CrmContractModel from 'codecrafters-frontend/models/crm-contract';

interface Signature {
  Element: HTMLDivElement;
  Args: { contract: CrmContractModel };
}

export default class CrmUiContractPrintViewComponent extends Component<Signature> {
  @action
  handlePrint(): void {
    const prevTitle = document.title;
    document.title = this.args.contract.title ?? 'Contract';
    window.print();
    document.title = prevTitle;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::Ui::ContractPrintView': typeof CrmUiContractPrintViewComponent;
  }
}
