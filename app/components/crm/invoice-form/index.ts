import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';
import type CrmInvoiceModel from 'codecrafters-frontend/models/crm-invoice';
import type CrmClientModel from 'codecrafters-frontend/models/crm-client';
import type CrmEventModel from 'codecrafters-frontend/models/crm-event';

interface LineItemDraft {
  description: string;
  quantity: number;
  unitPrice: number; // dollars (display)
}

interface Signature {
  Element: HTMLDivElement;
  Args: { invoice: CrmInvoiceModel; isNew: boolean };
}

export default class CrmInvoiceFormComponent extends Component<Signature> {
  @service declare router: RouterService;
  @service declare store: Store;

  @tracked lineItems: LineItemDraft[] = this.args.isNew
    ? [{ description: '', quantity: 1, unitPrice: 0 }]
    : this.args.invoice.lineItems.map((li) => ({
        description: li.description,
        quantity: li.quantity,
        unitPrice: (li.unitPrice ?? 0) / 100,
      }));

  get allClients(): CrmClientModel[] {
    return this.store.peekAll('crm-client').slice();
  }

  get allEvents(): CrmEventModel[] {
    return this.store.peekAll('crm-event').slice();
  }

  get issueDateString(): string {
    const d = this.args.invoice.issueDate;
    return d ? d.toISOString().slice(0, 10) : '';
  }

  get dueDateString(): string {
    const d = this.args.invoice.dueDate;
    return d ? d.toISOString().slice(0, 10) : '';
  }

  get subtotalCents(): number {
    return this.lineItems.reduce((sum, li) => sum + Math.round(li.quantity * li.unitPrice * 100), 0);
  }

  get taxAmountCents(): number {
    return Math.round(this.subtotalCents * ((this.args.invoice.taxRate ?? 0) / 100));
  }

  get totalCents(): number {
    return this.subtotalCents + this.taxAmountCents - (this.args.invoice.discountAmount ?? 0);
  }

  get discountInDollars(): number {
    return (this.args.invoice.discountAmount ?? 0) / 100;
  }

  @action addLineItem(): void {
    this.lineItems = [...this.lineItems, { description: '', quantity: 1, unitPrice: 0 }];
  }

  @action removeLineItem(index: number): void {
    this.lineItems = this.lineItems.filter((_, i) => i !== index);
  }

  @action updateLineItem(index: number, field: keyof LineItemDraft, e: Event): void {
    const value = (e.target as HTMLInputElement).value;
    const updated = [...this.lineItems];
    if (field === 'quantity' || field === 'unitPrice') {
      (updated[index] as Record<string, unknown>)[field] = parseFloat(value) || 0;
    } else {
      (updated[index] as Record<string, unknown>)[field] = value;
    }
    this.lineItems = updated;
  }

  @action handleIssueDateChange(e: Event): void {
    this.args.invoice.issueDate = new Date((e.target as HTMLInputElement).value);
  }

  @action handleDueDateChange(e: Event): void {
    this.args.invoice.dueDate = new Date((e.target as HTMLInputElement).value);
  }

  @action handleClientChange(e: Event): void {
    const id = (e.target as HTMLSelectElement).value;
    this.args.invoice.client = id
      ? (this.store.peekRecord('crm-client', id) as unknown as typeof this.args.invoice.client)
      : null as unknown as typeof this.args.invoice.client;
  }

  @action handleEventChange(e: Event): void {
    const id = (e.target as HTMLSelectElement).value;
    this.args.invoice.event = id
      ? (this.store.peekRecord('crm-event', id) as unknown as typeof this.args.invoice.event)
      : null as unknown as typeof this.args.invoice.event;
  }

  @action handleDiscountChange(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.args.invoice.discountAmount = isNaN(val) ? 0 : Math.round(val * 100);
  }

  @action async handleSave(e: Event): Promise<void> {
    e.preventDefault();
    const inv = this.args.invoice;
    inv.updatedAt = new Date();
    if (this.args.isNew) inv.createdAt = new Date();

    // Delete old line items if editing
    if (!this.args.isNew) {
      for (const li of inv.lineItems.slice()) {
        await li.destroyRecord();
      }
    }

    await inv.save();

    // Create new line items
    for (const draft of this.lineItems) {
      if (!draft.description) continue;
      const li = this.store.createRecord('crm-invoice-line-item', {
        description: draft.description,
        quantity: draft.quantity,
        unitPrice: Math.round(draft.unitPrice * 100),
        invoice: inv,
        createdAt: new Date(),
      });
      await li.save();
    }

    this.router.transitionTo('crm.invoices.show', inv.id);
  }

  @action handleCancel(): void {
    this.args.invoice.rollbackAttributes();
    if (this.args.isNew) {
      this.router.transitionTo('crm.invoices');
    } else {
      this.router.transitionTo('crm.invoices.show', this.args.invoice.id);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::InvoiceForm': typeof CrmInvoiceFormComponent;
  }
}
