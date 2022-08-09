import { IState } from '@/store/modules/dashboard';

export interface IStorage {
  mutations: {
    setProperty({ property, value }: { property: keyof IState, value: boolean }): void;
  }
}

export interface IStorageMock {
  mutations: {
    setProperty:jest.Mock<void>
  }
}
