import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';
export default class CrmEventsShowRoute extends Route {
  @service declare store: Store;
  model({ event_id }: { event_id: string }) {
    return this.store.findRecord('crm-event', event_id);
  }
}
