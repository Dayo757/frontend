import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type Store from '@ember-data/store';
import type CrmVendorModel from 'codecrafters-frontend/models/crm-vendor';
import type CrmEventModel from 'codecrafters-frontend/models/crm-event';

interface Signature {
  Element: HTMLDivElement;
  Args: { vendor: CrmVendorModel };
}

export default class CrmVendorDetailComponent extends Component<Signature> {
  @service declare store: Store;

  get assignedEvents(): CrmEventModel[] {
    const id = this.args.vendor.id;
    return this.store
      .peekAll('crm-event')
      .filter((e) => (e.vendorIds ?? []).includes(id));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::VendorDetail': typeof CrmVendorDetailComponent;
  }
}
