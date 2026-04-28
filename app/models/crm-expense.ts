import Model, { attr, belongsTo } from '@ember-data/model';
import type { SyncBelongsTo } from '@ember-data/model';
import type CrmEventModel from './crm-event';

export type ExpenseCategory = 'venue' | 'catering' | 'decor' | 'entertainment' | 'equipment' | 'travel' | 'staffing' | 'other';

export default class CrmExpenseModel extends Model {
  @attr('string') declare description: string;
  @attr('string') declare category: ExpenseCategory;
  @attr('string') declare notes: string;
  @attr('number') declare amount: number; // cents
  @attr('boolean') declare isPaid: boolean;
  @attr('date') declare paidAt: Date;
  @attr('date') declare createdAt: Date;

  @belongsTo('crm-event', { async: false, inverse: 'expenses' }) declare event: SyncBelongsTo<CrmEventModel>;

  get amountInDollars(): number {
    return (this.amount ?? 0) / 100;
  }

  get categoryLabel(): string {
    const labels: Record<ExpenseCategory, string> = {
      venue: 'Venue',
      catering: 'Catering',
      decor: 'Decor',
      entertainment: 'Entertainment',
      equipment: 'Equipment',
      travel: 'Travel',
      staffing: 'Staffing',
      other: 'Other',
    };
    return labels[this.category] ?? this.category;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'crm-expense': CrmExpenseModel;
  }
}
