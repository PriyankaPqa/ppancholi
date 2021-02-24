import { IEventTypeData } from '@/entities/eventType';
import { IMultilingual } from '@/types';
import { EOptionListItemStatus } from '@/types/enums/EOptionListItemStatus';

export interface IEventTypesService {
  getEventTypes(): Promise<IEventTypeData[]>;

  createEventType(eventType: IEventTypeData): Promise<IEventTypeData>;

  updateEventTypeName(id: string, name: IMultilingual): Promise<IEventTypeData>;

  updateEventTypeStatus(id: string, status: EOptionListItemStatus): Promise<IEventTypeData>;

  updateEventTypeOrderRanks(orders: Record<string, number>): Promise<IEventTypeData[]>;

  setEventTypeIsOther(id: string, isOther: boolean): Promise<IEventTypeData>;

  setEventTypeIsDefault(id: string, isDefault: boolean): Promise<IEventTypeData>;
}

export interface IEventTypesServiceMock {
  getEventTypes: jest.Mock<IEventTypeData[]>;

  createEventType: jest.Mock<IEventTypeData>;

  updateEventTypeName: jest.Mock<IEventTypeData>;

  updateEventTypeStatus: jest.Mock<IEventTypeData>;

  updateEventTypeOrderRanks: jest.Mock<IEventTypeData[]>;

  setEventTypeIsOther: jest.Mock<IEventTypeData>;

  setEventTypeIsDefault: jest.Mock<IEventTypeData>;
}
