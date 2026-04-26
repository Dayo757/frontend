import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';
import type CrmTicketingService from 'codecrafters-frontend/services/crm-ticketing';
import type CrmIntegrationModel from 'codecrafters-frontend/models/crm-integration';

interface Signature {
  Element: HTMLDivElement;
  Args: { model: { integrations: CrmIntegrationModel[] } };
}

const PLATFORMS = [
  { value: 'dice', label: 'Dice.fm', description: 'Electronic music events ticketing platform' },
  { value: 'eventbrite', label: 'Eventbrite', description: 'General events ticketing and registration' },
  { value: 'resident-advisor', label: 'Resident Advisor', description: 'Electronic music events and DJ bookings' },
  { value: 'skiddle', label: 'Skiddle', description: 'UK events ticketing platform' },
];

export default class CrmIntegrationsPageComponent extends Component<Signature> {
  @service declare store: Store;
  @service declare crmTicketing: CrmTicketingService;

  @tracked addingPlatform: string | null = null;
  @tracked newApiKey = '';

  get platforms() {
    return PLATFORMS.map((p) => {
      const integration = this.args.model.integrations.find((i) => i.platform === p.value);
      return { ...p, integration };
    });
  }

  @action startConnect(platform: string): void {
    this.addingPlatform = platform;
    this.newApiKey = '';
  }

  @action cancelConnect(): void {
    this.addingPlatform = null;
    this.newApiKey = '';
  }

  @action async saveIntegration(e: Event): Promise<void> {
    e.preventDefault();
    if (!this.addingPlatform || !this.newApiKey.trim()) return;

    const existing = this.args.model.integrations.find(
      (i) => i.platform === this.addingPlatform,
    );

    if (existing) {
      existing.apiKey = this.newApiKey.trim();
      existing.status = 'connected';
      await existing.save();
    } else {
      await this.store.createRecord('crm-integration', {
        platform: this.addingPlatform,
        apiKey: this.newApiKey.trim(),
        status: 'connected',
        createdAt: new Date(),
      }).save();
    }

    this.addingPlatform = null;
    this.newApiKey = '';
  }

  @action async syncPlatform(integration: CrmIntegrationModel): Promise<void> {
    if (integration.platform === 'dice') {
      await this.crmTicketing.syncDice(integration.apiKey);
    } else if (integration.platform === 'eventbrite') {
      await this.crmTicketing.syncEventbrite(integration.apiKey);
    }
    integration.lastSyncedAt = new Date();
    integration.status = this.crmTicketing.lastError ? 'error' : 'connected';
    if (this.crmTicketing.lastError) {
      integration.lastError = this.crmTicketing.lastError;
    }
    await integration.save();
  }

  @action async disconnectPlatform(integration: CrmIntegrationModel): Promise<void> {
    if (!confirm(`Disconnect ${integration.platformLabel}?`)) return;
    await integration.destroyRecord();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::IntegrationsPage': typeof CrmIntegrationsPageComponent;
  }
}
