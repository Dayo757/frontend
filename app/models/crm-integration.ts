import Model, { attr } from '@ember-data/model';

export type IntegrationPlatform = 'dice' | 'eventbrite' | 'resident-advisor' | 'skiddle';

export default class CrmIntegrationModel extends Model {
  @attr('string') declare platform: IntegrationPlatform;
  @attr('string') declare apiKey: string; // stored locally; mask in UI
  @attr('string') declare status: 'connected' | 'disconnected' | 'error';
  @attr('date') declare lastSyncedAt: Date;
  @attr('string') declare lastError: string;
  @attr('date') declare createdAt: Date;

  get platformLabel(): string {
    const labels: Record<IntegrationPlatform, string> = {
      dice: 'Dice.fm',
      eventbrite: 'Eventbrite',
      'resident-advisor': 'Resident Advisor',
      skiddle: 'Skiddle',
    };
    return labels[this.platform] ?? this.platform;
  }

  get maskedApiKey(): string {
    if (!this.apiKey) return '';
    const visible = this.apiKey.slice(-4);
    return `${'•'.repeat(Math.max(0, this.apiKey.length - 4))}${visible}`;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'crm-integration': CrmIntegrationModel;
  }
}
