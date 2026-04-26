import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';
import type FastbootService from 'ember-cli-fastboot/services/fastboot';
import RSVP from 'rsvp';

export default class CrmRoute extends Route {
  @service declare store: Store;
  @service declare fastboot: FastbootService;

  async model() {
    if (this.fastboot.isFastBoot) {
      return { clients: [], events: [], vendors: [], expenses: [], invoices: [], lineItems: [], contracts: [], integrations: [], ticketingEvents: [] };
    }

    return RSVP.hash({
      clients: this.store.findAll('crm-client'),
      events: this.store.findAll('crm-event'),
      vendors: this.store.findAll('crm-vendor'),
      expenses: this.store.findAll('crm-expense'),
      invoices: this.store.findAll('crm-invoice'),
      lineItems: this.store.findAll('crm-invoice-line-item'),
      contracts: this.store.findAll('crm-contract'),
      integrations: this.store.findAll('crm-integration'),
      ticketingEvents: this.store.findAll('crm-ticketing-event'),
    });
  }
}
