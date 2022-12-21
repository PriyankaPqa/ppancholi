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
};
