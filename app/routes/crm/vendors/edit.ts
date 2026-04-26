import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';
export default class CrmVendorsEditRoute extends Route {
  @service declare store: Store;
  model({ vendor_id }: { vendor_id: string }) {
    return this.store.findRecord('crm-vendor', vendor_id);
  }
}
