import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type CrmEventModel from 'codecrafters-frontend/models/crm-event';

interface Signature {
  Element: HTMLDivElement;
  Args: { model: { events: CrmEventModel[] } };
}

export default class CrmEventsPageComponent extends Component<Signature> {
  @tracked statusFilter = '';
  @tracked typeFilter = '';

  get filteredEvents(): CrmEventModel[] {
    return this.args.model.events
      .filter((e) => !this.statusFilter || e.status === this.statusFilter)
      .filter((e) => !this.typeFilter || e.eventType === this.typeFilter)
      .sort((a, b) => {
        const da = a.eventDate?.getTime() ?? 0;
        const db = b.eventDate?.getTime() ?? 0;
        return db - da;
      });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::EventsPage': typeof CrmEventsPageComponent;
  }
}
