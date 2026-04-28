import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type CrmVendorModel from 'codecrafters-frontend/models/crm-vendor';

interface Signature {
  Element: HTMLDivElement;
  Args: { vendor: CrmVendorModel; isNew: boolean };
}

export default class CrmVendorFormComponent extends Component<Signature> {
  @service declare router: RouterService;

  get feeInDollars(): string {
    return this.args.vendor.defaultFee ? (this.args.vendor.defaultFee / 100).toFixed(2) : '';
  }

  @action
  handleFeeChange(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.args.vendor.defaultFee = isNaN(val) ? 0 : Math.round(val * 100);
  }

  @action
  async handleSave(e: Event): Promise<void> {
    e.preventDefault();
    const v = this.args.vendor;
    if (this.args.isNew) v.createdAt = new Date();
    await v.save();
    this.router.transitionTo('crm.vendors.show', v.id);
  }

  @action
  async handleDelete(): Promise<void> {
    if (!confirm('Delete this vendor?')) return;
    await this.args.vendor.destroyRecord();
    this.router.transitionTo('crm.vendors');
  }

  @action
  handleCancel(): void {
    this.args.vendor.rollbackAttributes();
    if (this.args.isNew) {
      this.router.transitionTo('crm.vendors');
    } else {
      this.router.transitionTo('crm.vendors.show', this.args.vendor.id);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::VendorForm': typeof CrmVendorFormComponent;
  }
}
