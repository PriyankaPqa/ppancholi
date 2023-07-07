import _orderBy from 'lodash/orderBy';
import { IVersionedEntity } from './versionedEntity.types';

export default {
  mapResponses(responses: IVersionedEntity[][]): IVersionedEntity[] {
    const parsedResponses = responses.map((historyItems: IVersionedEntity[]) => {
      if (!historyItems) {
        return [];
      }
      // Order items and add the previous entity to each history item
      const orderedItems = _orderBy(historyItems, 'timestamp', 'desc');
      const itemsWithPreviousState = this.addPreviousState(orderedItems);
      return itemsWithPreviousState;
    });

    const flattenResponses = parsedResponses.reduce((a, b) => a.concat(b), []);
    return _orderBy(flattenResponses, 'timestamp', 'desc');
  },

  addPreviousState(items: IVersionedEntity[]): IVersionedEntity[] {
    return items.map((item: IVersionedEntity, index) => {
      if (index < items.length - 1) {
        item.previousEntity = items[index + 1].entity;
      }
      return item;
    });
  },

};
