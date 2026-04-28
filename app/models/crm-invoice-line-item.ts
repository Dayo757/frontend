import Model, { attr, belongsTo } from '@ember-data/model';
import type { SyncBelongsTo } from '@ember-data/model';
import type CrmInvoiceModel from './crm-invoice';

export default class CrmInvoiceLineItemModel extends Model {
  @attr('string') declare description: string;
  @attr('number') declare quantity: number;
  @attr('number') declare unitPrice: number; // cents
  @attr('date') declare createdAt: Date;

  @belongsTo('crm-invoice', { async: false, inverse: 'lineItems' }) declare invoice: SyncBelongsTo<CrmInvoiceModel>;

  get lineTotal(): number {
    return (this.quantity ?? 0) * (this.unitPrice ?? 0);
  }

  get lineTotalInDollars(): number {
    return this.lineTotal / 100;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'crm-invoice-line-item': CrmInvoiceLineItemModel;
  }
}
