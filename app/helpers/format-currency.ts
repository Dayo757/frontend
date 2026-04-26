import { helper } from '@ember/component/helper';

const formatCurrency = helper(function formatCurrency([cents]: [number]) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
});

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'format-currency': typeof formatCurrency;
  }
}

export default formatCurrency;
