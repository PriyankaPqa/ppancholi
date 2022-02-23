import moment from 'moment';
import _orderBy from 'lodash/orderBy';
import { VersionedEntityCombined } from './versionedEntity';
import { IVersionedEntity, IVersionedEntityCombined } from './versionedEntity.types';

export default {
  combineEntities(entitiesList: IVersionedEntity[], metadataList: IVersionedEntity[]): IVersionedEntityCombined[] {
    return entitiesList.map((item) => {
      const correspondingMetadata = metadataList.find((mItem) => mItem.entity.lastActionCorrelationId === item.entity.lastActionCorrelationId
      || (mItem.entity.id === item.entity.id && moment(mItem.timestamp).isBefore(item.timestamp)));

      return new VersionedEntityCombined(item, correspondingMetadata);
    });
  },

  mapResponses(responses: IVersionedEntity[][]): IVersionedEntity[] {
    const parsedResponses = responses.map((historyItems: IVersionedEntity[]) => {
      if (!historyItems) return [];
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
