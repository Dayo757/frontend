import JSONAPIAdapter from '@ember-data/adapter/json-api';

const SUPABASE_URL = 'https://qzugzhyzzxdhzkakyiom.supabase.co';
const SUPABASE_KEY = 'sb_publishable_onTHwbiTvjbJfzgd_Z6-Gg_qA2BGvYk';

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

// FK column → { JSON:API type, camelCase relationship key }
const FK: Record<string, { type: string; key: string }> = {
  client_id: { type: 'crm-client', key: 'client' },
  event_id: { type: 'crm-event', key: 'event' },
  vendor_id: { type: 'crm-vendor', key: 'vendor' },
  invoice_id: { type: 'crm-invoice', key: 'invoice' },
  crm_event_id: { type: 'crm-event', key: 'crmEvent' },
};

function table(modelName: string): string {
  return modelName.replace(/-/g, '_') + 's';
}

function toSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
}

function toCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

type Row = Record<string, unknown>;

function rowToJsonApi(row: Row, modelName: string) {
  const attrs: Row = {};
  const rels: Record<string, unknown> = {};
  for (const [col, val] of Object.entries(row)) {
    if (col === 'id') continue;
    if (FK[col]) {
      const { type, key } = FK[col]!;
      rels[key] = { data: val ? { type, id: String(val) } : null };
    } else {
      attrs[toCamel(col)] = val;
    }
  }
  return {
    id: String(row['id']),
    type: modelName,
    attributes: attrs,
    ...(Object.keys(rels).length ? { relationships: rels } : {}),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function snapshotToRow(snapshot: any, includeId = true): Row {
  const row: Row = includeId ? { id: snapshot.id } : {};
  for (const [key, val] of Object.entries(snapshot.attributes() as Row)) {
    row[toSnake(key)] = val instanceof Date ? val.toISOString() : (val ?? null);
  }
  snapshot.eachRelationship((name: string, meta: { kind: string }) => {
    if (meta.kind === 'belongsTo') {
      const rel = snapshot.belongsTo(name) as { id: string } | null;
      row[toSnake(name) + '_id'] = rel ? rel.id : null;
    }
  });
  return row;
}

export default class CrmSupabaseAdapter extends JSONAPIAdapter {
  findAll(_store: unknown, type: { modelName: string }): Promise<unknown> {
    return fetch(`${SUPABASE_URL}/rest/v1/${table(type.modelName)}?select=*`, { headers: HEADERS })
      .then((r) => r.json() as Promise<Row[]>)
      .then((rows) => ({ data: rows.map((r) => rowToJsonApi(r, type.modelName)) }));
  }

  findRecord(_store: unknown, type: { modelName: string }, id: string): Promise<unknown> {
    return fetch(`${SUPABASE_URL}/rest/v1/${table(type.modelName)}?id=eq.${id}&select=*`, { headers: HEADERS })
      .then((r) => r.json() as Promise<Row[]>)
      .then((rows) => {
        if (!rows.length) throw new Error(`${type.modelName}:${id} not found`);
        return { data: rowToJsonApi(rows[0]!, type.modelName) };
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createRecord(_store: unknown, type: { modelName: string }, snapshot: any): Promise<unknown> {
    const body = snapshotToRow(snapshot);
    return fetch(`${SUPABASE_URL}/rest/v1/${table(type.modelName)}`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(body),
    })
      .then((r) => r.json() as Promise<Row[]>)
      .then((rows) => ({ data: rowToJsonApi(rows[0]!, type.modelName) }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateRecord(_store: unknown, type: { modelName: string }, snapshot: any): Promise<unknown> {
    const body = snapshotToRow(snapshot, false);
    return fetch(`${SUPABASE_URL}/rest/v1/${table(type.modelName)}?id=eq.${snapshot.id as string}`, {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify(body),
    })
      .then((r) => r.json() as Promise<Row[]>)
      .then((rows) => ({ data: rowToJsonApi(rows[0]!, type.modelName) }));
  }

  deleteRecord(_store: unknown, type: { modelName: string }, snapshot: { id: string }): Promise<null> {
    return fetch(`${SUPABASE_URL}/rest/v1/${table(type.modelName)}?id=eq.${snapshot.id}`, {
      method: 'DELETE',
      headers: { ...HEADERS, Prefer: 'return=minimal' },
    }).then(() => null);
  }
}
