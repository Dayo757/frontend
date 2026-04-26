import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';
import type CrmContractModel from 'codecrafters-frontend/models/crm-contract';
import type CrmClientModel from 'codecrafters-frontend/models/crm-client';
import type CrmEventModel from 'codecrafters-frontend/models/crm-event';
import type CrmVendorModel from 'codecrafters-frontend/models/crm-vendor';

interface Signature {
  Element: HTMLDivElement;
  Args: { contract: CrmContractModel; isNew: boolean };
}

export default class CrmContractFormComponent extends Component<Signature> {
  @service declare router: RouterService;
  @service declare store: Store;

  @tracked previewMode = false;

  get allClients(): CrmClientModel[] {
    return this.store.peekAll('crm-client').slice();
  }

  get allEvents(): CrmEventModel[] {
    return this.store.peekAll('crm-event').slice();
  }

  get allVendors(): CrmVendorModel[] {
    return this.store.peekAll('crm-vendor').slice();
  }

  @action togglePreview(): void {
    this.previewMode = !this.previewMode;
  }

  @action handleClientChange(e: Event): void {
    const id = (e.target as HTMLSelectElement).value;
    this.args.contract.client = id
      ? (this.store.peekRecord('crm-client', id) as unknown as typeof this.args.contract.client)
      : null as unknown as typeof this.args.contract.client;
  }

  @action handleEventChange(e: Event): void {
    const id = (e.target as HTMLSelectElement).value;
    this.args.contract.event = id
      ? (this.store.peekRecord('crm-event', id) as unknown as typeof this.args.contract.event)
      : null as unknown as typeof this.args.contract.event;
  }

  @action handleVendorChange(e: Event): void {
    const id = (e.target as HTMLSelectElement).value;
    this.args.contract.vendor = id
      ? (this.store.peekRecord('crm-vendor', id) as unknown as typeof this.args.contract.vendor)
      : null as unknown as typeof this.args.contract.vendor;
  }

  @action async handleSave(e: Event): Promise<void> {
    e.preventDefault();
    const c = this.args.contract;
    c.updatedAt = new Date();
    if (this.args.isNew) c.createdAt = new Date();
    await c.save();
    this.router.transitionTo('crm.contracts.show', c.id);
  }

  @action async handleDelete(): Promise<void> {
    if (!confirm('Delete this contract?')) return;
    await this.args.contract.destroyRecord();
    this.router.transitionTo('crm.contracts');
  }

  @action handleCancel(): void {
    this.args.contract.rollbackAttributes();
    if (this.args.isNew) {
      this.router.transitionTo('crm.contracts');
    } else {
      this.router.transitionTo('crm.contracts.show', this.args.contract.id);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::ContractForm': typeof CrmContractFormComponent;
  }
}
