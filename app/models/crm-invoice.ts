import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import type { SyncBelongsTo, SyncHasMany } from '@ember-data/model';
import type CrmClientModel from './crm-client';
import type CrmEventModel from './crm-event';
import type CrmInvoiceLineItemModel from './crm-invoice-line-item';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export default class CrmInvoiceModel extends Model {
  @attr('string') declare invoiceNumber: string;
  @attr('string') declare status: InvoiceStatus;
  @attr('string') declare notes: string;
  @attr('date') declare issueDate: Date;
  @attr('date') declare dueDate: Date;
  @attr('date') declare paidAt: Date;
  @attr('number') declare taxRate: number; // percentage e.g. 8.5
  @attr('number') declare discountAmount: number; // cents
  @attr('date') declare createdAt: Date;
  @attr('date') declare updatedAt: Date;

  @belongsTo('crm-client', { async: false, inverse: 'invoices' }) declare client: SyncBelongsTo<CrmClientModel>;
  @belongsTo('crm-event', { async: false, inverse: 'invoices' }) declare event: SyncBelongsTo<CrmEventModel>;
  @hasMany('crm-invoice-line-item', { async: false, inverse: 'invoice' }) declare lineItems: SyncHasMany<CrmInvoiceLineItemModel>;

  get subtotal(): number {
    return this.lineItems.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0);
  }

  get taxAmount(): number {
    return Math.round(this.subtotal * ((this.taxRate ?? 0) / 100));
  }

  get total(): number {
    return this.subtotal + this.taxAmount - (this.discountAmount ?? 0);
  }

  get totalInDollars(): number {
    return this.total / 100;
  }

  get isOverdue(): boolean {
    return this.status !== 'paid' && this.status !== 'cancelled' && !!this.dueDate && this.dueDate < new Date();
  }

  get statusColor(): string {
    const colors: Record<InvoiceStatus, string> = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-500',
    };
    return colors[this.status] ?? 'bg-gray-100 text-gray-700';
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'crm-invoice': CrmInvoiceModel;
  }
}
