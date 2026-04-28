import Model, { attr, belongsTo } from '@ember-data/model';
import type { SyncBelongsTo } from '@ember-data/model';
import type CrmClientModel from './crm-client';
import type CrmEventModel from './crm-event';
import type CrmVendorModel from './crm-vendor';

export type ContractType = 'vendor' | 'client' | 'venue' | 'other';
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'cancelled';

export default class CrmContractModel extends Model {
  @attr('string') declare title: string;
  @attr('string') declare contractType: ContractType;
  @attr('string') declare status: ContractStatus;
  @attr('string') declare content: string; // Markdown or plain text
  @attr('string') declare notes: string;
  @attr('date') declare signedAt: Date;
  @attr('date') declare expiresAt: Date;
  @attr('date') declare createdAt: Date;
  @attr('date') declare updatedAt: Date;

  @belongsTo('crm-client', { async: false, inverse: 'contracts' }) declare client: SyncBelongsTo<CrmClientModel>;
  @belongsTo('crm-event', { async: false, inverse: 'contracts' }) declare event: SyncBelongsTo<CrmEventModel>;
  @belongsTo('crm-vendor', { async: false, inverse: null }) declare vendor: SyncBelongsTo<CrmVendorModel>;

  get statusColor(): string {
    const colors: Record<ContractStatus, string> = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-800',
      signed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[this.status] ?? 'bg-gray-100 text-gray-700';
  }

  get contractTypeLabel(): string {
    const labels: Record<ContractType, string> = {
      vendor: 'Vendor',
      client: 'Client',
      venue: 'Venue',
      other: 'Other',
    };
    return labels[this.contractType] ?? this.contractType;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'crm-contract': CrmContractModel;
  }
}
