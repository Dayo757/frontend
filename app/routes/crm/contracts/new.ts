import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';
export default class CrmContractsNewRoute extends Route {
  @service declare store: Store;
  model() {
    return this.store.createRecord('crm-contract', { status: 'draft', contractType: 'vendor', createdAt: new Date(), updatedAt: new Date() });
  }
}
