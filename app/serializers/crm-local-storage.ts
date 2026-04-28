import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class CrmSupabaseSerializer extends JSONAPISerializer {
  generateIdForRecord(): string {
    return crypto.randomUUID();
  }

  // Keep camelCase keys to match our adapter's toCamel() output
  keyForAttribute(key: string): string {
    return key;
  }

  keyForRelationship(key: string): string {
    return key;
  }
}
