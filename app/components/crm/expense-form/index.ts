import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';
import type CrmExpenseModel from 'codecrafters-frontend/models/crm-expense';
import type CrmEventModel from 'codecrafters-frontend/models/crm-event';

interface Signature {
  Element: HTMLDivElement;
  Args: { expense: CrmExpenseModel; isNew: boolean };
}

export default class CrmExpenseFormComponent extends Component<Signature> {
  @service declare router: RouterService;
  @service declare store: Store;

  get allEvents(): CrmEventModel[] {
    return this.store.peekAll('crm-event').slice();
  }

  get amountInDollars(): string {
    return this.args.expense.amount ? (this.args.expense.amount / 100).toFixed(2) : '';
  }

  @action
  handleAmountChange(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.args.expense.amount = isNaN(val) ? 0 : Math.round(val * 100);
  }

  @action
  handleEventChange(e: Event): void {
    const id = (e.target as HTMLSelectElement).value;
    if (id) {
      this.args.expense.event = this.store.peekRecord('crm-event', id) as unknown as typeof this.args.expense.event;
    }
  }

  @action
  async handleSave(e: Event): Promise<void> {
    e.preventDefault();
    const exp = this.args.expense;
    if (this.args.isNew) exp.createdAt = new Date();
    await exp.save();
    const eventId = exp.event?.id;
    if (eventId) {
      this.router.transitionTo('crm.events.show', eventId);
    } else {
      this.router.transitionTo('crm.expenses');
    }
  }

  @action
  handleCancel(): void {
    this.args.expense.rollbackAttributes();
    this.router.transitionTo('crm.expenses');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::ExpenseForm': typeof CrmExpenseFormComponent;
  }
}
