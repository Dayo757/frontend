import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';
import type CrmEventModel from 'codecrafters-frontend/models/crm-event';
import type CrmVendorModel from 'codecrafters-frontend/models/crm-vendor';

interface Signature {
  Element: HTMLDivElement;
  Args: { event: CrmEventModel };
}

export default class CrmEventDetailComponent extends Component<Signature> {
  @service declare store: Store;

  get assignedVendors(): CrmVendorModel[] {
    const ids = this.args.event.vendorIds ?? [];
    return ids
      .map((id) => this.store.peekRecord('crm-vendor', id))
      .filter(Boolean) as CrmVendorModel[];
  }

  get ticketingEvent() {
    return this.store
      .peekAll('crm-ticketing-event')
      .find((te) => te.crmEvent?.id === this.args.event.id);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::EventDetail': typeof CrmEventDetailComponent;
  }
}
