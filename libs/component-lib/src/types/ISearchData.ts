export interface ISearchData {
  search?: string;
  searchFields?: Array<string>;
  filters?: Array<string>; // ['columnToBeFiltered, filterA, filterB', 'column, filterC']
  orderBy?: string | Array<string>;
  descending?: boolean | Array<boolean>;
  includeCount?: boolean;
  pageIndex?: number;
  pageSize?: number;
}
