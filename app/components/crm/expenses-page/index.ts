import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type CrmExpenseModel from 'codecrafters-frontend/models/crm-expense';
import type CrmEventModel from 'codecrafters-frontend/models/crm-event';

interface Signature {
  Element: HTMLDivElement;
  Args: { model: { expenses: CrmExpenseModel[]; events: CrmEventModel[] } };
}

export default class CrmExpensesPageComponent extends Component<Signature> {
  @tracked eventFilter = '';
  @tracked categoryFilter = '';

  get filteredExpenses(): CrmExpenseModel[] {
    return this.args.model.expenses
      .filter((e) => !this.eventFilter || e.event?.id === this.eventFilter)
      .filter((e) => !this.categoryFilter || e.category === this.categoryFilter)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }

  get totalFiltered(): number {
    return this.filteredExpenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::ExpensesPage': typeof CrmExpensesPageComponent;
  }
}
