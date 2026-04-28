import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';
export default class CrmEventsNewRoute extends Route {
  @service declare store: Store;
  model() {
    return this.store.createRecord('crm-event', { status: 'enquiry', createdAt: new Date(), updatedAt: new Date(), vendorIds: [] });
  }
}
