import { mockEventTypeData } from '@/entities/eventType';
import { IEventTypesServiceMock } from './eventTypes.types';

export const mockEventTypesService = (): IEventTypesServiceMock => ({
  getEventTypes: jest.fn(() => mockEventTypeData()),

  createEventType: jest.fn(() => mockEventTypeData()[0]),

  updateEventTypeName: jest.fn(() => mockEventTypeData()[0]),

  updateEventTypeStatus: jest.fn(() => mockEventTypeData()[0]),

  updateEventTypeOrderRanks: jest.fn(() => mockEventTypeData()),

  setEventTypeIsOther: jest.fn(() => mockEventTypeData()[0]),

  setEventTypeIsDefault: jest.fn(() => mockEventTypeData()[0]),
});
