import { IMultilingual } from '@/types';
import { EOptionListItemStatus } from '@/types/enums/EOptionListItemStatus';

export interface IEventTypeData {
  id?: string;
  created?: Date;
  timestamp?: Date;
  eTag?: string;
  name: IMultilingual;
  orderRank: number;
  status: EOptionListItemStatus;
  itemStatus: EOptionListItemStatus;
}

export interface IEventType {
  readonly id?: string;
  readonly created?: Date;
  readonly timestamp?: Date;
  readonly eTag?: string;
  readonly name: IMultilingual;
  readonly orderRank: number;
  readonly status: EOptionListItemStatus;
  readonly itemStatus: EOptionListItemStatus;
}
