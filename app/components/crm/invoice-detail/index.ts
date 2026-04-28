import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type CrmInvoiceModel from 'codecrafters-frontend/models/crm-invoice';

interface Signature {
  Element: HTMLDivElement;
  Args: { invoice: CrmInvoiceModel };
}

export default class CrmInvoiceDetailComponent extends Component<Signature> {
  @service declare router: RouterService;

  @action
  async markPaid(): Promise<void> {
    this.args.invoice.status = 'paid';
    this.args.invoice.paidAt = new Date();
    await this.args.invoice.save();
  }

  @action
  async markSent(): Promise<void> {
    this.args.invoice.status = 'sent';
    await this.args.invoice.save();
  }

  @action
  async handleDelete(): Promise<void> {
    if (!confirm('Delete this invoice and all its line items?')) return;
    for (const li of this.args.invoice.lineItems.slice()) {
      await li.destroyRecord();
    }
    await this.args.invoice.destroyRecord();
    this.router.transitionTo('crm.invoices');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::InvoiceDetail': typeof CrmInvoiceDetailComponent;
  }
}
