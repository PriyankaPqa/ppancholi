import { IEvent } from '@/entities/event';
import { IEventType } from '@/entities/eventType';

export interface IStorage {
  getters: {
    eventTypes(): Array<IEventType>;
  }

  actions: {
    fetchEventTypes(): Promise<IEventType[]>;
    createEvent(payload: IEvent): Promise<IEvent>;
  }
}

export interface IStorageMock {
  getters: {
    eventTypes: jest.Mock<void>
  }

  actions: {
    fetchEventTypes: jest.Mock<void>
    createEvent: jest.Mock<void>
  }
}
