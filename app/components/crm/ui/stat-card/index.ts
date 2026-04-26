import Component from '@glimmer/component';

interface Signature {
  Element: HTMLDivElement;
  Args: {
    label: string;
    value: string | number;
    sub?: string;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  };
}

export default class CrmUiStatCardComponent extends Component<Signature> {
  get colorClasses(): string {
    const map = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      yellow: 'text-yellow-600',
      red: 'text-red-600',
      gray: 'text-gray-600',
    };
    return map[this.args.color ?? 'blue'];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::Ui::StatCard': typeof CrmUiStatCardComponent;
  }
}
