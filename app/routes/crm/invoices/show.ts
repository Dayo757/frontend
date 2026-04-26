import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';
export default class CrmInvoicesShowRoute extends Route {
  @service declare store: Store;
  model({ invoice_id }: { invoice_id: string }) {
    return this.store.findRecord('crm-invoice', invoice_id);
  }
}
