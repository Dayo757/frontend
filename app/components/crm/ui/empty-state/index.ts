import Component from '@glimmer/component';

interface Signature {
  Element: HTMLDivElement;
  Args: { title: string; description: string };
  Blocks: { action: [] };
}

export default class CrmUiEmptyStateComponent extends Component<Signature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::Ui::EmptyState': typeof CrmUiEmptyStateComponent;
  }
}
