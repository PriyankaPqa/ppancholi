import { ISearchData } from '@/types';
import { IEvent } from '@/entities/event';

export interface IStorage {
  getters: {
    event(): IEvent;
  }

  actions: {
    fetchEvent(params: ISearchData): Promise<IEvent>
  }
}

export interface IStorageMock {
  getters: {
    event: jest.Mock<IEvent>;
  }

  actions: {
    fetchEvent: jest.Mock<void>;
  }
}
