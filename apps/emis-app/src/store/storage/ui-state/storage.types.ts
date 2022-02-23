export interface IGetters {
  getSearchTableState(route: string): unknown;
}

export interface IGettersMock {
  getSearchTableState: jest.Mock<void>;
}

export interface IMutations {
  setSearchTableState(route: string, state: unknown): void;
}

export interface IMutationsMock {
  setSearchTableState: jest.Mock<void>;
}

export interface IStorageMake {
  getters: IGetters;
  mutations: IMutations;
}

export interface IStorageMakeMock {
  getters: IGettersMock;
  mutations: IMutationsMock;
}

export interface IStorage {
  make(): IStorageMake
}

export interface IStorageMock {
  make(): IStorageMake
}
