import { IMultilingual, EOptionListItemStatus } from '@/types';
import { IEventType, IEventTypeData } from './eventType.types';

export class EventType implements IEventType {
  readonly id?: string;

  readonly created?: Date;

  readonly timestamp?: Date;

  readonly eTag?: string;

  readonly name: IMultilingual;

  readonly orderRank: number;

  readonly status: EOptionListItemStatus;

  readonly itemStatus: EOptionListItemStatus;

  constructor(data: IEventTypeData) {
    this.id = data.id;
    this.created = data.created;
    this.timestamp = data.timestamp;
    this.eTag = data.eTag;
    this.name = data.name;
    this.orderRank = data.orderRank;
    this.status = data.status;
    this.itemStatus = data.itemStatus;
  }
}
