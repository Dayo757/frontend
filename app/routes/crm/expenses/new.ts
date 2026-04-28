import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';
export default class CrmExpensesNewRoute extends Route {
  @service declare store: Store;
  model() {
    return this.store.createRecord('crm-expense', { category: 'other', isPaid: false, createdAt: new Date() });
  }
}
