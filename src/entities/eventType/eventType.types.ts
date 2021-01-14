import { IMultilingual } from '@/types';

export interface IEventTypeData {
  id?: string;
  created?: Date;
  timestamp?: Date;
  eTag?: string;
  name: IMultilingual;
}

export interface IEventType {
  readonly id?: string;
  readonly created?: Date;
  readonly timestamp?: Date;
  readonly eTag?: string;
  readonly name: IMultilingual;
}
