export interface IGetters {
  getSearchTableState(key: string): unknown;
  getAllSearchIds(): uuid[];
}

export interface IGettersMock {
  getSearchTableState: jest.Mock<void>;
  getAllSearchIds: jest.Mock<uuid[]>;
}

export interface IMutations {
  setSearchTableState(key: string, state: unknown): void;
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
