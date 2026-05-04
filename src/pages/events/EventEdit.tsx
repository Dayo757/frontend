import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Event } from '../../lib/types';
import EventForm from './EventForm';

export default function EventEdit() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  useEffect(() => { supabase.from('crm_events').select('*').eq('id', id!).single().then(({ data }) => setEvent(data)); }, [id]);
  if (!event) return <div className="p-6 text-gray-500">Loading…</div>;
  return <EventForm id={id} initial={event} />;
}
