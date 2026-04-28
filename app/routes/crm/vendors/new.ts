import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';
export default class CrmVendorsNewRoute extends Route {
  @service declare store: Store;
  model() {
    return this.store.createRecord('crm-vendor', { feeType: 'flat', createdAt: new Date() });
  }
}
