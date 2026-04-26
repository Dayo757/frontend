import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';

export default class CrmClientsShowRoute extends Route {
  @service declare store: Store;

  model({ client_id }: { client_id: string }) {
    return this.store.findRecord('crm-client', client_id);
  }
}
