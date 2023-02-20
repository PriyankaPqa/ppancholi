export interface IAzureSearchParams {
  filter?: Record<string, unknown> | string;
  search?: string;
  select?: Array<string>;
  orderBy?: string;
  expand?: string;
  top?: number;
  skip?: number;
  count?: boolean;
  queryType?: string;
  searchMode?: string;
  searchFields?: string;
}

export interface IAzureSearchResult <T> {
  'odataContext'?: string;
  'odataCount'?: number;
  value: Array<T>;
}

export interface ICombinedIndex <TEntity, TMetadata> {
  id: uuid;
  tenantId: uuid;
  entity: TEntity;
  metadata: TMetadata;
}

export interface IAzureCombinedSearchResult <TEntity, TMetadata> {
  odataContext?: string;
  odataCount?: number;
  value: Array<ICombinedIndex<TEntity, TMetadata> & { id: uuid, tenantId: uuid }>;
}

export interface IAzureTableSearchResults {
  count: number;
  ids: Array<uuid>;
  date?: Date;
}
