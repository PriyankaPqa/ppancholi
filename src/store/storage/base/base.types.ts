import { IEntity, IEntityCombined } from '@/entities/base';

export interface IBaseActions<TEntity extends IEntity, TMetadata extends IEntity> {
  fetch(id: uuid): Promise<IEntityCombined<TEntity, TMetadata>>;
  fetchAll(): Promise<IEntityCombined<TEntity, TMetadata>[]>;
  fetchAllIncludingInactive(): Promise<IEntityCombined<TEntity, TMetadata>[]>;
  deactivate(id: uuid): Promise<TEntity>;
  activate(id: uuid): Promise<TEntity>;
}

export interface IBaseGetters<TEntity extends IEntity, TMetadata extends IEntity> {
  get(id: uuid): IEntityCombined<TEntity, TMetadata>;
  getAll(): Array<IEntityCombined<TEntity, TMetadata>>;
  getByCriteria (query: string, searchAll: boolean, searchAmong: string[]): Array<IEntityCombined<TEntity, TMetadata>>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IBaseMutations<TEntity, TMetadata> {
  setEntity(entity: TEntity): void;
  setAllEntities(payload: TEntity[]): void;
  setMetadata(payload: TMetadata): void;
  setAllMetadata(payload: TMetadata[]): void;
}

export interface IStorageMake<TEntity extends IEntity, TMetadata extends IEntity> {
  getters: IBaseGetters<TEntity, TMetadata>;
  actions: IBaseActions<TEntity, TMetadata>;
  mutations: IBaseMutations<TEntity, TMetadata>;
}

export interface IBaseStorage <TEntity extends IEntity, TMetadata extends IEntity> {
  make(): IStorageMake<TEntity, TMetadata>
}

/* ******* Mock ******** */

export interface IBaseGettersMock<TEntity extends IEntity, TMetadata extends IEntity> {
  get: jest.Mock<IEntityCombined<TEntity, TMetadata>>,
  getAll: jest.Mock<IEntityCombined<TEntity, TMetadata>[]>,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IBaseMutationsMock<TEntity, TTMetadata> {}

export interface IBaseActionsMock<TEntity extends IEntity, TMetadata extends IEntity> {
  fetch: jest.Mock<IEntityCombined<TEntity, TMetadata>>,
  fetchAll: jest.Mock<IEntityCombined<TEntity, TMetadata>[]>,
  fetchAllIncludingInactive: jest.Mock<IEntityCombined<TEntity, TMetadata>[]>,
  deactivate: jest.Mock<TEntity>;
  activate: jest.Mock<TEntity>;
}

export interface IStorageMakeMock<TEntity extends IEntity, TMetadata extends IEntity> {
  getters: IBaseGettersMock<TEntity, TMetadata>;
  actions: IBaseActionsMock<TEntity, TMetadata>;
  mutations: IBaseMutationsMock<TEntity, TMetadata>;
}
