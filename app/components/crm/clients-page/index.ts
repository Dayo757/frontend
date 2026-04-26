import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type CrmClientModel from 'codecrafters-frontend/models/crm-client';

interface Signature {
  Element: HTMLDivElement;
  Args: { model: { clients: CrmClientModel[] } };
}

export default class CrmClientsPageComponent extends Component<Signature> {
  @tracked searchQuery = '';

  get filteredClients(): CrmClientModel[] {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.args.model.clients.slice();
    return this.args.model.clients.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        (c.email ?? '').toLowerCase().includes(q) ||
        (c.company ?? '').toLowerCase().includes(q),
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::ClientsPage': typeof CrmClientsPageComponent;
  }
}
