import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';
export default class CrmInvoicesNewRoute extends Route {
  @service declare store: Store;
  model() {
    const now = new Date();
    const due = new Date(now);
    due.setDate(due.getDate() + 30);
    const year = now.getFullYear();
    const seq = String(this.store.peekAll('crm-invoice').length + 1).padStart(3, '0');
    return this.store.createRecord('crm-invoice', {
      status: 'draft', issueDate: now, dueDate: due,
      taxRate: 0, discountAmount: 0,
      invoiceNumber: `INV-${year}-${seq}`,
      createdAt: now, updatedAt: now,
    });
  }
}
