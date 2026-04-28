import Model, { attr } from '@ember-data/model';

export type ServiceType = 'dj' | 'photographer' | 'videographer' | 'caterer' | 'florist' | 'venue' | 'entertainment' | 'other';
export type FeeType = 'flat' | 'hourly' | 'per-head';

export default class CrmVendorModel extends Model {
  @attr('string') declare name: string;
  @attr('string') declare serviceType: ServiceType;
  @attr('string') declare contactName: string;
  @attr('string') declare email: string;
  @attr('string') declare phone: string;
  @attr('string') declare website: string;
  @attr('string') declare notes: string;
  @attr('number') declare defaultFee: number; // cents
  @attr('string') declare feeType: FeeType;
  @attr('date') declare createdAt: Date;

  get defaultFeeDisplay(): string {
    if (!this.defaultFee) return '—';
    const dollars = (this.defaultFee / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    const suffix = this.feeType === 'hourly' ? '/hr' : this.feeType === 'per-head' ? '/head' : '';
    return `${dollars}${suffix}`;
  }

  get serviceTypeLabel(): string {
    const labels: Record<ServiceType, string> = {
      dj: 'DJ',
      photographer: 'Photographer',
      videographer: 'Videographer',
      caterer: 'Caterer',
      florist: 'Florist',
      venue: 'Venue',
      entertainment: 'Entertainment',
      other: 'Other',
    };
    return labels[this.serviceType] ?? this.serviceType;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'crm-vendor': CrmVendorModel;
  }
}
