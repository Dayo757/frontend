import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type CrmContractModel from 'codecrafters-frontend/models/crm-contract';

interface Signature {
  Element: HTMLDivElement;
  Args: { contract: CrmContractModel };
}

export default class CrmContractDetailComponent extends Component<Signature> {
  @service declare router: RouterService;

  @action async markSigned(): Promise<void> {
    this.args.contract.status = 'signed';
    this.args.contract.signedAt = new Date();
    await this.args.contract.save();
  }

  @action async markSent(): Promise<void> {
    this.args.contract.status = 'sent';
    await this.args.contract.save();
  }

  @action async handleDelete(): Promise<void> {
    if (!confirm('Delete this contract?')) return;
    await this.args.contract.destroyRecord();
    this.router.transitionTo('crm.contracts');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::ContractDetail': typeof CrmContractDetailComponent;
  }
}
