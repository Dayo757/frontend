import Component from '@glimmer/component';

interface Signature {
  Element: HTMLDivElement;
  Args: { title: string };
  Blocks: { action: [] };
}

export default class CrmUiSectionHeaderComponent extends Component<Signature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::Ui::SectionHeader': typeof CrmUiSectionHeaderComponent;
  }
}
