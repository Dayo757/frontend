import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type Store from '@ember-data/store';
import type CrmSettingsService from './crm-settings';

export default class CrmTicketingService extends Service {
  @service declare store: Store;
  @service declare crmSettings: CrmSettingsService;

  @tracked isSyncing = false;
  @tracked lastError: string | null = null;

  // Dice.fm sync — requires a backend proxy at /api/v1/integrations/dice/events
  // due to CORS. Uses mock data when no proxy is available.
  async syncDice(apiKey: string): Promise<void> {
    this.isSyncing = true;
    this.lastError = null;
    try {
      const response = await fetch('/api/v1/integrations/dice/events', {
        headers: { 'x-dice-api-key': apiKey },
      });
      if (!response.ok) throw new Error(`Dice sync failed: ${response.status}`);
      const events = (await response.json()) as DiceSyncEvent[];
      await this.upsertTicketingEvents('dice', events);
    } catch (e) {
      this.lastError = e instanceof Error ? e.message : 'Dice sync failed';
    } finally {
      this.isSyncing = false;
    }
  }

  // Eventbrite sync — requires a backend proxy at /api/v1/integrations/eventbrite/events
  async syncEventbrite(apiKey: string): Promise<void> {
    this.isSyncing = true;
    this.lastError = null;
    try {
      const response = await fetch('/api/v1/integrations/eventbrite/events', {
        headers: { 'x-eventbrite-api-key': apiKey },
      });
      if (!response.ok) throw new Error(`Eventbrite sync failed: ${response.status}`);
      const events = (await response.json()) as DiceSyncEvent[];
      await this.upsertTicketingEvents('eventbrite', events);
    } catch (e) {
      this.lastError = e instanceof Error ? e.message : 'Eventbrite sync failed';
    } finally {
      this.isSyncing = false;
    }
  }

  private async upsertTicketingEvents(platform: string, events: DiceSyncEvent[]): Promise<void> {
    const existing = this.store.peekAll('crm-ticketing-event');
    for (const ev of events) {
      const match = existing.find(
        (r) => r.platform === platform && r.externalId === ev.id,
      );
      if (match) {
        match.set('eventName', ev.name);
        match.set('eventDate', new Date(ev.date));
        match.set('venue', ev.venue ?? '');
        match.set('ticketsSold', ev.tickets_sold ?? 0);
        match.set('grossRevenueCents', ev.gross_revenue_cents ?? 0);
        match.set('platformUrl', ev.url ?? '');
        await match.save();
      } else {
        const record = this.store.createRecord('crm-ticketing-event', {
          platform,
          externalId: ev.id,
          eventName: ev.name,
          eventDate: new Date(ev.date),
          venue: ev.venue ?? '',
          ticketsSold: ev.tickets_sold ?? 0,
          grossRevenueCents: ev.gross_revenue_cents ?? 0,
          platformUrl: ev.url ?? '',
        });
        await record.save();
      }
    }
  }
}

interface DiceSyncEvent {
  id: string;
  name: string;
  date: string;
  venue?: string;
  tickets_sold?: number;
  gross_revenue_cents?: number;
  url?: string;
}

declare module '@ember/service' {
  interface Registry {
    'crm-ticketing': CrmTicketingService;
  }
}
