export interface ISearchParams {
  filter?: Record<string, unknown> | string;
  search?: string;
  select?: Array<string>;
  orderBy?: string;
  expand?: string;
  top?: number;
  skip?: number;
  count?: boolean;
}

export interface ISearchResult <T> {
  'odataContext'?: string;
  'odataCount'?: number;
  value: Array<T>;
}

export interface ICombinedIndex <TEntity, TMetadata> {
  id: uuid;
  entity: TEntity;
  metadata: TMetadata;
}

export interface ICombinedSearchResult <TEntity, TMetadata> {
  odataContext?: string;
  odataCount?: number;
  value: Array<ICombinedIndex<TEntity, TMetadata>>;
}

export interface ITableSearchResults<T> {
  count: number;
  ids: Array<uuid>;
  date?: Date;
  values?: T[];
}
