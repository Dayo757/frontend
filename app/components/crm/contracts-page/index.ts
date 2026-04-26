import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type CrmContractModel from 'codecrafters-frontend/models/crm-contract';

interface Signature {
  Element: HTMLDivElement;
  Args: { model: { contracts: CrmContractModel[] } };
}

export default class CrmContractsPageComponent extends Component<Signature> {
  @tracked statusFilter = '';
  @tracked typeFilter = '';

  get filteredContracts(): CrmContractModel[] {
    return this.args.model.contracts
      .filter((c) => !this.statusFilter || c.status === this.statusFilter)
      .filter((c) => !this.typeFilter || c.contractType === this.typeFilter)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::ContractsPage': typeof CrmContractsPageComponent;
  }
}
