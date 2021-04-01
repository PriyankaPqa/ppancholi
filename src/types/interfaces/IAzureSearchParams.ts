export interface IAzureSearchParams {
    filter?: Record<string, unknown> | string;
    search?: string;
    select?: Array<string>;
    orderBy?: string;
    expand?: string;
    top?: number;
    skip?: number;
    count?: boolean;
    queryType?: 'full',
    searchMode?: 'all',
  }
