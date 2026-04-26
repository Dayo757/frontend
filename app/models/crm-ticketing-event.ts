import Model, { attr, belongsTo } from '@ember-data/model';
import type { SyncBelongsTo } from '@ember-data/model';
import type CrmEventModel from './crm-event';

export default class CrmTicketingEventModel extends Model {
  @attr('string') declare platform: string; // 'dice' | 'eventbrite' etc.
  @attr('string') declare externalId: string;
  @attr('string') declare eventName: string;
  @attr('date') declare eventDate: Date;
  @attr('string') declare venue: string;
  @attr('number') declare ticketsSold: number;
  @attr('number') declare grossRevenueCents: number;
  @attr('string') declare platformUrl: string;
  @attr('date') declare syncedAt: Date;

  @belongsTo('crm-event', { async: false, inverse: null }) declare crmEvent: SyncBelongsTo<CrmEventModel>;

  get grossRevenueInDollars(): number {
    return (this.grossRevenueCents ?? 0) / 100;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'crm-ticketing-event': CrmTicketingEventModel;
  }
}
