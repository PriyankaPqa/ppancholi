import { IAzureSearchParams } from '@libs/shared-lib/types';

export interface ItemState {
  azureSearchParams?: {
    search?: string,
    skip?: number,
    top?: number,
    orderBy?: string,
    filter?: Record<string, unknown>,
  };
  filterState?: unknown;
  itemsCount?: number;
  options?: Record<string, unknown>;
  params?: IAzureSearchParams & { pageSize?: number, pageIndex?: number, descending?: boolean };
  previousPageIndex?: number;
  searchExecutionDate?: Date;
  searchResultIds?: Array<string>;
  userFilters?: Record<string, unknown>;
  userSearchFilters?: string;
  itemsPerPage?: number;
}

export interface IUIStateState {
  key: string;
  state: ItemState;
}
