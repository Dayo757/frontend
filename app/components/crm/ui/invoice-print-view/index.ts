import Component from '@glimmer/component';
import { action } from '@ember/object';
import type CrmInvoiceModel from 'codecrafters-frontend/models/crm-invoice';

interface Signature {
  Element: HTMLDivElement;
  Args: { invoice: CrmInvoiceModel };
}

export default class CrmUiInvoicePrintViewComponent extends Component<Signature> {
  @action
  handlePrint(): void {
    const prevTitle = document.title;
    document.title = this.args.invoice.invoiceNumber ?? 'Invoice';
    window.print();
    document.title = prevTitle;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::Ui::InvoicePrintView': typeof CrmUiInvoicePrintViewComponent;
  }
}
