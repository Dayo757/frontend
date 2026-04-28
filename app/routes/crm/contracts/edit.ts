import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';
export default class CrmContractsEditRoute extends Route {
  @service declare store: Store;
  model({ contract_id }: { contract_id: string }) {
    return this.store.findRecord('crm-contract', contract_id);
  }
}
