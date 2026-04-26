import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class CrmLocalStorageSerializer extends JSONAPISerializer {
  generateIdForRecord(): string {
    return crypto.randomUUID();
  }
}
