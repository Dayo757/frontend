import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { inject as service } from '@ember/service';
import type LocalStorageService from 'codecrafters-frontend/services/local-storage';
import type Store from '@ember-data/store';
import type Model from '@ember-data/model';

interface JsonApiDocument {
  data: JsonApiResource[];
}

interface JsonApiResource {
  id: string;
  type: string;
  attributes: Record<string, unknown>;
  relationships?: Record<string, unknown>;
}

function storageKey(modelName: string): string {
  return `crm:${modelName}`;
}

function loadCollection(localStorage: LocalStorageService, modelName: string): JsonApiDocument {
  const raw = localStorage.getItem(storageKey(modelName));
  if (!raw) return { data: [] };
  try {
    return JSON.parse(raw) as JsonApiDocument;
  } catch {
    return { data: [] };
  }
}

function saveCollection(localStorage: LocalStorageService, modelName: string, doc: JsonApiDocument): void {
  localStorage.setItem(storageKey(modelName), JSON.stringify(doc));
}

export default class CrmLocalStorageAdapter extends JSONAPIAdapter {
  @service declare localStorage: LocalStorageService;

  // Prevent any real HTTP calls
  get host(): string {
    return '';
  }

  get namespace(): string {
    return '';
  }

  findAll(_store: Store, type: { modelName: string }): Promise<JsonApiDocument> {
    const doc = loadCollection(this.localStorage, type.modelName);
    return Promise.resolve(doc);
  }

  findRecord(_store: Store, type: { modelName: string }, id: string): Promise<{ data: JsonApiResource }> {
    const doc = loadCollection(this.localStorage, type.modelName);
    const record = doc.data.find((r) => r.id === id);
    if (!record) {
      return Promise.reject(new Error(`Record ${type.modelName}:${id} not found`));
    }
    return Promise.resolve({ data: record });
  }

  createRecord(_store: Store, type: { modelName: string }, snapshot: { id: string; serialize: (opts: object) => { data: JsonApiResource } }): Promise<{ data: JsonApiResource }> {
    const doc = loadCollection(this.localStorage, type.modelName);
    const serialized = snapshot.serialize({ includeId: true });
    const resource = serialized.data;
    resource.id = snapshot.id || crypto.randomUUID();
    doc.data.push(resource);
    saveCollection(this.localStorage, type.modelName, doc);
    return Promise.resolve({ data: resource });
  }

  updateRecord(_store: Store, type: { modelName: string }, snapshot: { id: string; serialize: (opts: object) => { data: JsonApiResource } }): Promise<{ data: JsonApiResource }> {
    const doc = loadCollection(this.localStorage, type.modelName);
    const serialized = snapshot.serialize({ includeId: true });
    const resource = serialized.data;
    const idx = doc.data.findIndex((r) => r.id === snapshot.id);
    if (idx === -1) {
      doc.data.push(resource);
    } else {
      doc.data[idx] = resource;
    }
    saveCollection(this.localStorage, type.modelName, doc);
    return Promise.resolve({ data: resource });
  }

  deleteRecord(_store: Store, type: { modelName: string }, snapshot: { id: string }): Promise<null> {
    const doc = loadCollection(this.localStorage, type.modelName);
    doc.data = doc.data.filter((r) => r.id !== snapshot.id);
    saveCollection(this.localStorage, type.modelName, doc);
    return Promise.resolve(null);
  }
}
