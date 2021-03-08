export interface IAzureSearchResult <T> {
  'odataContext': string;
  'odataCount': number;
  value: Array<T>;
}
