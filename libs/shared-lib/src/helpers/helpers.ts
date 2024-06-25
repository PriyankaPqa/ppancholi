import { parsePhoneNumber } from 'awesome-phonenumber';
import _chunk from 'lodash/chunk';
import isEmpty from 'lodash/isEmpty';
import { Status } from '../types';
import { ICombinedIndex, ICombinedSearchResult, ISearchParams, ISearchResult, ITableSearchResults } from '../types/interfaces/ISearchParams';

export default {
  /**
  * Returns a normalized string value (replaces accents and special characters)
  * Useful for comparing string
  * @param value The string to normalize
  */
  getNormalizedString(value: string) {
  if (!value) {
    return value;
  }

  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },

  getEnumKeyText(myEnum: Record<string, unknown>, value: number) {
    // eslint-disable-next-line radix
    return Object.keys(myEnum).find((x) => !(parseInt(x, 0) >= 0) && myEnum[x] === value);
  },

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
    const normalizedQuery = this.getNormalizedString(query).toLowerCase();
    return collection.filter((o: Record<string, unknown>) => {
      const flat = deepSearch ? this.flattenObj(o) : o;
      return Object.keys(flat).some((k) => {
        if (!searchAll && searchAmong.indexOf(k) === -1) {
          return false;
        }

        if (typeof flat[k] === 'string') {
          return this.getNormalizedString((flat[k] as string)).toLowerCase().includes(normalizedQuery);
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
    { service, ids, searchInFilter, otherFilter = '', otherOptions = {}, batchSize = 40, api = 'search', otherApiParameters = [] }
    : { service: any, ids: string[], searchInFilter: Record<string, unknown> | string,
      otherOptions?: Record<string, unknown>, otherFilter?: string | Record<string, unknown>, batchSize?: number, api?:string, otherApiParameters?: any[] },
  ) {
    if (!ids?.length || !searchInFilter || !service) {
      return null;
    }

    const idBatches = _chunk(ids, batchSize);
    const calls = [] as Promise<ITableSearchResults<ICombinedIndex<TEntity, TMetadata>> | ICombinedSearchResult<TEntity, TMetadata> | ISearchResult<TEntity>>[];

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
          if (typeof otherFilter === 'object' && !isEmpty(otherFilter)) {
            filter = { ...(filter as Record<string, unknown>), ...otherFilter };
          }
        } catch {
          throw new Error('There was an error in parsing the filter in callSearchInInBatches');
        }
      }
      const call = service[api]({ filter, ...otherOptions }, ...otherApiParameters);
      calls.push(call);
    });

    const results = await Promise.all(calls);

    // Flatten the results arrays
    if (results?.length) {
      const ids = (results as ITableSearchResults<ICombinedIndex<TEntity, TMetadata>>[])[0]?.ids
      && (results as ITableSearchResults<ICombinedIndex<TEntity, TMetadata>>[]).reduce((acc, currentValue) => acc.concat(currentValue.ids), []);

      const count = (results as ITableSearchResults<ICombinedIndex<TEntity, TMetadata>>[])[0]?.count
      && (results as ITableSearchResults<ICombinedIndex<TEntity, TMetadata>>[]).reduce((acc, currentValue) => acc + currentValue.count, 0);

      const date = (results as ITableSearchResults<ICombinedIndex<TEntity, TMetadata>>[])[0]?.date
      && (results as ITableSearchResults<ICombinedIndex<TEntity, TMetadata>>[])[0].date;

      const odataContext = (results as ISearchResult<TEntity>[])[0]?.odataContext
      && (results as ISearchResult<TEntity>[])[0].odataContext;

      const odataCount = (results as ISearchResult<TEntity>[])[0]?.odataCount
      && (results as ISearchResult<TEntity>[]).reduce((acc, currentValue) => acc + currentValue.odataCount, 0);

      const value = (results as ISearchResult<TEntity>[])[0]?.value
      && (results as ISearchResult<TEntity>[]).reduce((acc, currentValue) => acc.concat(currentValue.value), []);

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

  capitalize(str: string): string {
    if (str) {
      return str.charAt(0).toUpperCase() + str.substring(1);
    }
    return '';
  },

  // format 'abc abc abc' into 'Abc Abc Abc'
  toTitleCase(str: string): string {
    if (str) {
      const words = str.split(' ');
      const formattedWords = words.map((word :string) => this.capitalize(word));
      return formattedWords.join(' ');
    }
    return '';
  },

  getFormattedPhoneNumber(value: string, showCountryCode = true): string {
    if (!value) {
      return '';
    }
    const phoneObject = parsePhoneNumber(value);
    if (phoneObject?.valid) {
      if (showCountryCode) {
        return `${phoneObject.countryCode} ${phoneObject.number.national}`;
      }
      return phoneObject.number.national;
    }
    return value;
  },

  timeout(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  },

  convertDateStringToDateObject(obj: Record<string, unknown>) {
  for (const key of Object.keys(obj)) {
      const value = obj[key];
      // Check if the value is a valid date string, also check if string has a length of 24 and the end with Z
      if (typeof value === 'string' && !Number.isNaN(Date.parse(value)) && value.length === 24 && value[23] === 'Z') {
        obj[key] = new Date(value); // Convert to Date object
      } else if (typeof value === 'object' && value !== null) {
        this.convertDateStringToDateObject(value as Record<string, unknown>);
      }
  }
},
   removeInactiveItemsFilterOdata(params: ISearchParams): ISearchParams {
    const newParams = { ...params };
    newParams.filter = newParams.filter || {};
    if (typeof (newParams.filter) === 'string') {
      newParams.filter = `${newParams.filter} and Entity/Status eq '${this.getEnumKeyText(Status, Status.Active)}'`;
    } else {
      newParams.filter = {
        ...newParams.filter as Record<string, unknown>,
        'Entity/Status': this.getEnumKeyText(Status, Status.Active),
      };
    }
    return newParams;
  },
};
