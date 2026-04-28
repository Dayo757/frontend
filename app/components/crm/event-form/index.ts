import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';
import type CrmEventModel from 'codecrafters-frontend/models/crm-event';
import type CrmVendorModel from 'codecrafters-frontend/models/crm-vendor';

interface Signature {
  Element: HTMLDivElement;
  Args: { event: CrmEventModel; isNew: boolean };
}

export default class CrmEventFormComponent extends Component<Signature> {
  @service declare router: RouterService;
  @service declare store: Store;

  get allVendors(): CrmVendorModel[] {
    return this.store.peekAll('crm-vendor').slice();
  }

  get eventDateString(): string {
    const d = this.args.event.eventDate;
    if (!d) return '';
    return d.toISOString().slice(0, 10);
  }

  get budgetInDollars(): string {
    const b = this.args.event.budget;
    if (!b) return '';
    return (b / 100).toFixed(2);
  }

  @action
  handleDateChange(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.args.event.eventDate = val ? new Date(val) : null as unknown as Date;
  }

  @action
  handleBudgetChange(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.args.event.budget = isNaN(val) ? 0 : Math.round(val * 100);
  }

  @action
  toggleVendor(vendorId: string, e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    const ids = [...(this.args.event.vendorIds ?? [])];
    if (checked) {
      if (!ids.includes(vendorId)) ids.push(vendorId);
    } else {
      const idx = ids.indexOf(vendorId);
      if (idx !== -1) ids.splice(idx, 1);
    }
    this.args.event.vendorIds = ids;
  }

  isVendorSelected(vendorId: string): boolean {
    return (this.args.event.vendorIds ?? []).includes(vendorId);
  }

  @action
  async handleSave(e: Event): Promise<void> {
    e.preventDefault();
    const ev = this.args.event;
    ev.updatedAt = new Date();
    if (this.args.isNew) ev.createdAt = new Date();
    await ev.save();
    this.router.transitionTo('crm.events.show', ev.id);
  }

  @action
  async handleDelete(): Promise<void> {
    if (!confirm('Delete this event?')) return;
    await this.args.event.destroyRecord();
    this.router.transitionTo('crm.events');
  }

  @action
  handleCancel(): void {
    this.args.event.rollbackAttributes();
    if (this.args.isNew) {
      this.router.transitionTo('crm.events');
    } else {
      this.router.transitionTo('crm.events.show', this.args.event.id);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::EventForm': typeof CrmEventFormComponent;
  }
}
