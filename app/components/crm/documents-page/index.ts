import Component from '@glimmer/component';
import type CrmContractModel from 'codecrafters-frontend/models/crm-contract';
import type CrmInvoiceModel from 'codecrafters-frontend/models/crm-invoice';

interface Signature {
  Element: HTMLDivElement;
  Args: { model: { contracts: CrmContractModel[]; invoices: CrmInvoiceModel[] } };
}

export default class CrmDocumentsPageComponent extends Component<Signature> {
  get sortedContracts(): CrmContractModel[] {
    return this.args.model.contracts.slice().sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
  }

  get sortedInvoices(): CrmInvoiceModel[] {
    return this.args.model.invoices.slice().sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::DocumentsPage': typeof CrmDocumentsPageComponent;
  }
}
