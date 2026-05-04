import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Expense, Event, formatDate, formatCurrency } from '../../lib/types';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [events, setEvents] = useState<Record<string, Event>>({});
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('crm_expenses').select('*').order('created_at', { ascending: false }),
      supabase.from('crm_events').select('id, name'),
    ]).then(([{ data: exps }, { data: evts }]) => {
      setExpenses(exps ?? []);
      const map: Record<string, Event> = {};
      (evts ?? []).forEach((e) => { map[e.id] = e as Event; });
      setEvents(map);
      setLoading(false);
    });
  }, []);

  const filtered = filter ? expenses.filter((e) => e.event_id === filter) : expenses;
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <Link to="/expenses/new" className="btn-primary">+ New Expense</Link>
      </div>
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All events</option>
          {Object.values(events).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        {filtered.length > 0 && <span className="text-sm text-gray-500">Total: <strong>{formatCurrency(total)}</strong></span>}
      </div>
      {loading ? <p className="text-gray-500">Loading…</p> : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No expenses yet</p>
          <Link to="/expenses/new" className="text-brand-600 hover:underline">Log your first expense →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map((exp) => (
            <div key={exp.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">{exp.description}</p>
                <p className="text-sm text-gray-500 capitalize">{exp.category}{exp.event_id && events[exp.event_id] ? ` · ${events[exp.event_id]!.name}` : ''} · {formatDate(exp.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{formatCurrency(exp.amount)}</p>
                <span className={`text-xs font-medium ${exp.is_paid ? 'text-green-600' : 'text-yellow-600'}`}>{exp.is_paid ? 'Paid' : 'Unpaid'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
