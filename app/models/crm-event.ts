import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import type { SyncBelongsTo, SyncHasMany } from '@ember-data/model';
import type CrmClientModel from './crm-client';
import type CrmExpenseModel from './crm-expense';
import type CrmInvoiceModel from './crm-invoice';
import type CrmContractModel from './crm-contract';

export type EventType = 'wedding' | 'corporate' | 'birthday' | 'party' | 'concert' | 'other';
export type EventStatus = 'enquiry' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

export default class CrmEventModel extends Model {
  @attr('string') declare name: string;
  @attr('string') declare eventType: EventType;
  @attr('string') declare status: EventStatus;
  @attr('string') declare venue: string;
  @attr('string') declare notes: string;
  @attr('date') declare eventDate: Date;
  @attr('date') declare endDate: Date;
  @attr('number') declare guestCount: number;
  @attr('number') declare budget: number; // cents
  @attr() declare vendorIds: string[]; // JSON array of crm-vendor IDs
  @attr('date') declare createdAt: Date;
  @attr('date') declare updatedAt: Date;

  @belongsTo('crm-client', { async: false, inverse: 'events' }) declare client: SyncBelongsTo<CrmClientModel>;
  @hasMany('crm-expense', { async: false, inverse: 'event' }) declare expenses: SyncHasMany<CrmExpenseModel>;
  @hasMany('crm-invoice', { async: false, inverse: 'event' }) declare invoices: SyncHasMany<CrmInvoiceModel>;
  @hasMany('crm-contract', { async: false, inverse: 'event' }) declare contracts: SyncHasMany<CrmContractModel>;

  get totalExpensesCents(): number {
    return this.expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  }

  get isPast(): boolean {
    return this.eventDate ? this.eventDate < new Date() : false;
  }

  get statusColor(): string {
    const colors: Record<EventStatus, string> = {
      enquiry: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[this.status] ?? 'bg-gray-100 text-gray-800';
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'crm-event': CrmEventModel;
  }
}
