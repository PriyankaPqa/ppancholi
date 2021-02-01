import { IMultilingual } from '@/types';
import { IEventType, IEventTypeData } from './eventType.types';

export class EventType implements IEventType {
  readonly id?: string;

  readonly created?: Date;

  readonly timestamp?: Date;

  readonly eTag?: string;

  readonly name: IMultilingual;

  readonly orderRank: number;

  constructor(data: IEventTypeData) {
    this.id = data.id;
    this.created = data.created;
    this.timestamp = data.timestamp;
    this.eTag = data.eTag;
    this.name = data.name;
    this.orderRank = data.orderRank;
  }
}
