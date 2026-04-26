import Component from '@glimmer/component';
import type CrmClientModel from 'codecrafters-frontend/models/crm-client';
import type CrmEventModel from 'codecrafters-frontend/models/crm-event';
import type CrmInvoiceModel from 'codecrafters-frontend/models/crm-invoice';
import type CrmExpenseModel from 'codecrafters-frontend/models/crm-expense';

interface CrmModel {
  clients: CrmClientModel[];
  events: CrmEventModel[];
  invoices: CrmInvoiceModel[];
  expenses: CrmExpenseModel[];
}

interface Signature {
  Element: HTMLDivElement;
  Args: { model: CrmModel };
}

export default class CrmDashboardComponent extends Component<Signature> {
  get upcomingEvents(): CrmEventModel[] {
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return this.args.model.events
      .filter((e) => e.eventDate && e.eventDate >= now && e.eventDate <= thirtyDays && e.status !== 'cancelled')
      .sort((a, b) => (a.eventDate?.getTime() ?? 0) - (b.eventDate?.getTime() ?? 0))
      .slice(0, 5);
  }

  get pendingInvoices(): CrmInvoiceModel[] {
    return this.args.model.invoices
      .filter((inv) => inv.status === 'sent' || inv.status === 'overdue')
      .sort((a, b) => (a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0))
      .slice(0, 5);
  }

  get totalRevenueCents(): number {
    return this.args.model.invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.total ?? 0), 0);
  }

  get pendingRevenueCents(): number {
    return this.pendingInvoices.reduce((sum, inv) => sum + (inv.total ?? 0), 0);
  }

  get totalExpensesCents(): number {
    return this.args.model.expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Crm::Dashboard': typeof CrmDashboardComponent;
  }
}
