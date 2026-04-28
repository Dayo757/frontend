import Component from '@glimmer/component';
import type CrmClientModel from 'codecrafters-frontend/models/crm-client';

interface Signature {
  Element: HTMLDivElement;
  Args: { client: CrmClientModel };
}

export default class CrmClientDetailComponent extends Component<Signature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::ClientDetail': typeof CrmClientDetailComponent;
  }
}
