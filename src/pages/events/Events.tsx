import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Event, EVENT_STATUSES, formatDate, statusColor } from '../../lib/types';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('crm_events').select('*').order('event_date', { ascending: false })
      .then(({ data }) => { setEvents(data ?? []); setLoading(false); });
  }, []);

  const filtered = filter ? events.filter((e) => e.status === filter) : events;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <Link to="/events/new" className="btn-primary">+ New Event</Link>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('')} className={`pill ${filter === '' ? 'pill-active' : ''}`}>All</button>
        {EVENT_STATUSES.map((s) => <button key={s} onClick={() => setFilter(s)} className={`pill capitalize ${filter === s ? 'pill-active' : ''}`}>{s}</button>)}
      </div>
      {loading ? <p className="text-gray-500">Loading…</p> : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No events</p>
          <Link to="/events/new" className="text-brand-600 hover:underline">Create your first event →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map((e) => (
            <div key={e.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
              <div>
                <Link to={`/events/${e.id}`} className="font-medium text-gray-900 hover:text-brand-600">{e.name}</Link>
                <p className="text-sm text-gray-500">{e.venue} · {formatDate(e.event_date)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(e.status)}`}>{e.status}</span>
                <Link to={`/events/${e.id}/edit`} className="text-sm text-gray-400 hover:text-brand-600">Edit</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
