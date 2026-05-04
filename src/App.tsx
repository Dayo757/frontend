import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/clients/Clients';
import ClientNew from './pages/clients/ClientNew';
import ClientShow from './pages/clients/ClientShow';
import ClientEdit from './pages/clients/ClientEdit';
import Events from './pages/events/Events';
import EventNew from './pages/events/EventNew';
import EventShow from './pages/events/EventShow';
import EventEdit from './pages/events/EventEdit';
import Vendors from './pages/vendors/Vendors';
import VendorNew from './pages/vendors/VendorNew';
import VendorShow from './pages/vendors/VendorShow';
import VendorEdit from './pages/vendors/VendorEdit';
import Expenses from './pages/expenses/Expenses';
import ExpenseNew from './pages/expenses/ExpenseNew';
import Invoices from './pages/invoices/Invoices';
import InvoiceNew from './pages/invoices/InvoiceNew';
import InvoiceShow from './pages/invoices/InvoiceShow';
import InvoiceEdit from './pages/invoices/InvoiceEdit';
import Contracts from './pages/contracts/Contracts';
import ContractNew from './pages/contracts/ContractNew';
import ContractShow from './pages/contracts/ContractShow';
import ContractEdit from './pages/contracts/ContractEdit';
import Documents from './pages/Documents';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/new" element={<ClientNew />} />
          <Route path="clients/:id" element={<ClientShow />} />
          <Route path="clients/:id/edit" element={<ClientEdit />} />
          <Route path="events" element={<Events />} />
          <Route path="events/new" element={<EventNew />} />
          <Route path="events/:id" element={<EventShow />} />
          <Route path="events/:id/edit" element={<EventEdit />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="vendors/new" element={<VendorNew />} />
          <Route path="vendors/:id" element={<VendorShow />} />
          <Route path="vendors/:id/edit" element={<VendorEdit />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="expenses/new" element={<ExpenseNew />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/new" element={<InvoiceNew />} />
          <Route path="invoices/:id" element={<InvoiceShow />} />
          <Route path="invoices/:id/edit" element={<InvoiceEdit />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="contracts/new" element={<ContractNew />} />
          <Route path="contracts/:id" element={<ContractShow />} />
          <Route path="contracts/:id/edit" element={<ContractEdit />} />
          <Route path="documents" element={<Documents />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
