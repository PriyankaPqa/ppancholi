import _chunk from 'lodash/chunk';
import isEmpty from 'lodash/isEmpty';
import { IAzureCombinedSearchResult, IAzureSearchResult, IAzureTableSearchResults } from '../types/interfaces/IAzureSearchParams';

export default {
  flattenObj(obj: Record<string, unknown>, parent?: string, res: Record<string, unknown> = {}): Record<string, unknown> {
    Object.keys(obj).forEach((key) => {
      // eslint-disable-next-line
      const propName = parent ? parent + '.' + key : key;
      if (obj[key] !== null && typeof obj[key] === 'object') {
        this.flattenObj(obj[key] as Record<string, unknown>, propName, res);
      } else {
        res[propName] = obj[key];
      }
    });
    return res;
  },
  /**
   * Look among an array of object, for an object whose any keys contains the query if searchAll is true
   * Otherwise, it will look for objects whose columns specified in searchAmong contains the query
   * Useful for comparing string
   * @param collection
   * @param query
   * @param searchAll
   * @param searchAmong
   */
  // eslint-disable-next-line
  filterCollectionByValue(collection: Array<any>, query: string, searchAll = true, searchAmong: Array<string> = null, deepSearch = false) {
    if (query == null || query === '') {
      return collection;
    }
    return collection.filter((o: Record<string, unknown>) => {
      const flat = deepSearch ? this.flattenObj(o) : o;
      return Object.keys(flat).some((k) => {
        if (!searchAll && searchAmong.indexOf(k) === -1) {
          return false;
        }

        if (typeof flat[k] === 'string') {
          return (flat[k] as string).toLowerCase().includes(query.toLowerCase());
        }
        return false;
      });
    });
  },

  /**
   * Used for calls to search that use the search.in filter and need to be split in batches,
   * otherwise the call fails when there are more than 49 ids passed as parameter to the search.in filter
   *
   * @param {string | Object} searchInFilter Filter object or string that contains the searchIn filter. IMPORTANT: the ids in the original filter syntax need to be replaced with the string '{ids}'
   * @param service Store or object that contains the search function to which the filter is applied
   * @param ids Entire list of ids that need to be passed as parameter to the search call
   * @param {string} [otherFilter] Optional. Other string filters that should be used along with the searchIn filter
   * @param {Object} [otherOptions] Optional. Other options to pass to the search call along with the filter
   * @param {number} [batchSize] Optional. Size of batch to slice the initial list of ids
   * @param {number} [api] Optional. Method to be called. Default value: 'search'
   * @returns List of promises returned by all the batched calls
   */
  // eslint-disable-next-line complexity
  async callSearchInInBatches<TEntity, TMetadata>(
    { service, ids, searchInFilter, otherFilter = '', otherOptions = {}, batchSize = 40, api = 'search' }
    : { service: any, ids: string[], searchInFilter: Record<string, unknown> | string,
      otherOptions?: Record<string, unknown>, otherFilter?: string, batchSize?: number, api?:string },
  ) {
    if (!ids?.length || !searchInFilter || !service) {
      return null;
    }

    const idBatches = _chunk(ids, batchSize);
    const calls = [] as Promise<IAzureTableSearchResults | IAzureCombinedSearchResult<TEntity, TMetadata> | IAzureSearchResult<TEntity>>[];

    idBatches.forEach((b) => {
      let filter = '' as string | Record<string, unknown>;
      if (typeof searchInFilter === 'string' && searchInFilter.length) {
        filter = searchInFilter.replace('{ids}', b.join(','));
        if (otherFilter) {
          filter += ` and ${otherFilter}`;
        }
      } else if (typeof searchInFilter === 'object' && !isEmpty(searchInFilter)) {
        try {
          filter = JSON.parse(JSON.stringify(searchInFilter).replace('"{ids}"', JSON.stringify(b)));
        } catch {
          throw new Error('There was an error in parsing the filter in callSearchInInBatches');
        }
      }
      const call = service[api]({ filter, ...otherOptions });
      calls.push(call);
    });

    const results = await Promise.all(calls);

    // Flatten the results arrays
    if (results?.length) {
      const ids = (results as IAzureTableSearchResults[])[0]?.ids
      && (results as IAzureTableSearchResults[]).reduce((acc, currentValue) => acc.concat(currentValue.ids), []);

      const count = (results as IAzureTableSearchResults[])[0]?.count
      && (results as IAzureTableSearchResults[]).reduce((acc, currentValue) => acc + currentValue.count, 0);

      const date = (results as IAzureTableSearchResults[])[0]?.date
      && (results as IAzureTableSearchResults[])[0].date;

      const odataContext = (results as IAzureSearchResult<TEntity>[])[0]?.odataContext
      && (results as IAzureSearchResult<TEntity>[])[0].odataContext;

      const odataCount = (results as IAzureSearchResult<TEntity>[])[0]?.odataCount
      && (results as IAzureSearchResult<TEntity>[]).reduce((acc, currentValue) => acc + currentValue.odataCount, 0);

      const value = (results as IAzureSearchResult<TEntity>[])[0]?.value
      && (results as IAzureSearchResult<TEntity>[]).reduce((acc, currentValue) => acc.concat(currentValue.value), []);

      // Return only the keys that do not have a null value
      return {
        ...(ids && { ids }),
        ...(count && { count }),
        ...(date && { date }),
        ...(odataContext && { odataContext }),
        ...(odataCount && { odataCount }),
        ...(value && { value }),
      };
    }
    return null;
  },
};
