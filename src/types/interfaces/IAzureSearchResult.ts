export interface IAzureSearchResult <T> {
  'odataContext': string;
  'odataCount': number;
  value: Array<T>;
}

export interface ICombinedIndex <TEntity, TMetadata> {
  '@search.score': number,
  id: uuid,
  tenantId: uuid,
  entityETag: string,
  entityTimestamp: number,
  metadataETag: string,
  metadataTimestamp:number,
  entity: TEntity,
  metadata: TMetadata,
}

export interface IAzureCombinedSearchResult <TEntity, TMetadata> {
  odataContext: string;
  odataCount: number;
  value: Array<ICombinedIndex<TEntity, TMetadata>>;
}

export interface IAzureTableSearchResults {
  count: number;
  ids: Array<uuid>;
  date?: Date;
}
