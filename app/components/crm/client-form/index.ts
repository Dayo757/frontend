import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type CrmClientModel from 'codecrafters-frontend/models/crm-client';

interface Signature {
  Element: HTMLDivElement;
  Args: { client: CrmClientModel; isNew: boolean };
}

export default class CrmClientFormComponent extends Component<Signature> {
  @service declare router: RouterService;

  @action
  async handleSave(e: Event): Promise<void> {
    e.preventDefault();
    const client = this.args.client;
    client.updatedAt = new Date();
    if (this.args.isNew) client.createdAt = new Date();
    await client.save();
    this.router.transitionTo('crm.clients.show', client.id);
  }

  @action
  async handleDelete(): Promise<void> {
    if (!confirm('Delete this client?')) return;
    await this.args.client.destroyRecord();
    this.router.transitionTo('crm.clients');
  }

  @action
  handleCancel(): void {
    if (this.args.isNew) {
      this.args.client.rollbackAttributes();
      this.router.transitionTo('crm.clients');
    } else {
      this.args.client.rollbackAttributes();
      this.router.transitionTo('crm.clients.show', this.args.client.id);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::ClientForm': typeof CrmClientFormComponent;
  }
}
