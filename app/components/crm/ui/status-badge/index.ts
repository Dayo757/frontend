import Component from '@glimmer/component';

interface Signature {
  Element: HTMLSpanElement;
  Args: { colorClass: string; label: string };
}

export default class CrmUiStatusBadgeComponent extends Component<Signature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::Ui::StatusBadge': typeof CrmUiStatusBadgeComponent;
  }
}
