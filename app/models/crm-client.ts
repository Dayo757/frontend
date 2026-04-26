import Model, { attr, hasMany } from '@ember-data/model';
import type { SyncHasMany } from '@ember-data/model';
import type CrmEventModel from './crm-event';
import type CrmInvoiceModel from './crm-invoice';
import type CrmContractModel from './crm-contract';

export default class CrmClientModel extends Model {
  @attr('string') declare firstName: string;
  @attr('string') declare lastName: string;
  @attr('string') declare email: string;
  @attr('string') declare phone: string;
  @attr('string') declare company: string;
  @attr('string') declare address: string;
  @attr('string') declare notes: string;
  @attr('date') declare createdAt: Date;
  @attr('date') declare updatedAt: Date;

  @hasMany('crm-event', { async: false, inverse: 'client' }) declare events: SyncHasMany<CrmEventModel>;
  @hasMany('crm-invoice', { async: false, inverse: 'client' }) declare invoices: SyncHasMany<CrmInvoiceModel>;
  @hasMany('crm-contract', { async: false, inverse: 'client' }) declare contracts: SyncHasMany<CrmContractModel>;

  get fullName(): string {
    return `${this.firstName ?? ''} ${this.lastName ?? ''}`.trim();
  }

  get totalRevenueCents(): number {
    return this.invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.total ?? 0), 0);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'crm-client': CrmClientModel;
  }
}
