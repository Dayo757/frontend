import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type CrmVendorModel from 'codecrafters-frontend/models/crm-vendor';

interface Signature {
  Element: HTMLDivElement;
  Args: { model: { vendors: CrmVendorModel[] } };
}

export default class CrmVendorsPageComponent extends Component<Signature> {
  @tracked typeFilter = '';

  get filteredVendors(): CrmVendorModel[] {
    return this.args.model.vendors.filter(
      (v) => !this.typeFilter || v.serviceType === this.typeFilter,
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::VendorsPage': typeof CrmVendorsPageComponent;
  }
}
