import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type CrmInvoiceModel from 'codecrafters-frontend/models/crm-invoice';

interface Signature {
  Element: HTMLDivElement;
  Args: { model: { invoices: CrmInvoiceModel[] } };
}

export default class CrmInvoicesPageComponent extends Component<Signature> {
  @tracked statusFilter = '';

  get filteredInvoices(): CrmInvoiceModel[] {
    return this.args.model.invoices
      .filter((inv) => !this.statusFilter || inv.status === this.statusFilter)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::InvoicesPage': typeof CrmInvoicesPageComponent;
  }
}
