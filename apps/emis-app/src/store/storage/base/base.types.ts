import { IAzureTableSearchResults, IAzureSearchParams } from '@libs/core-lib/types';
import { IEntity, IEntityCombined, IFullResponseCombined } from '@libs/entities-lib/base';

export interface IBaseActions<TEntity extends IEntity, TMetadata extends IEntity, IdParams> {
  fetch(idParams: IdParams, {
    useEntityGlobalHandler,
    useMetadataGlobalHandler,
  }
  ? : {
    useEntityGlobalHandler:boolean,
    useMetadataGlobalHandler: boolean,
  }) : Promise<IEntityCombined<TEntity, TMetadata>>;

  fetchFullResponse(idParams: IdParams, {
    useEntityGlobalHandler,
    useMetadataGlobalHandler,
    returnEntityFullResponse,
    returnMetadataFullResponse,
  }
  ? : {
    useEntityGlobalHandler:boolean,
    useMetadataGlobalHandler: boolean,
    returnEntityFullResponse?: boolean,
    returnMetadataFullResponse?: boolean
  }) : Promise<IFullResponseCombined<TEntity, TMetadata>>;

  fetchAll(id?: Omit<IdParams, 'id'>): Promise<IEntityCombined<TEntity, TMetadata>[]>;
  fetchAllIncludingInactive(): Promise<IEntityCombined<TEntity, TMetadata>[]>;
  deactivate(idParams: IdParams): Promise<TEntity>;
  activate(idParams: IdParams): Promise<TEntity>;
  search(params: IAzureSearchParams, searchEndpoint?: string, includeInactiveItems?: boolean): Promise<IAzureTableSearchResults>
}

export interface IBaseGetters<TEntity extends IEntity, TMetadata extends IEntity> {
  get(id: uuid): IEntityCombined<TEntity, TMetadata>;
  getNewlyCreatedIds(maxDate?: Date): Array<{id: uuid, createdOn: number}>,
  getAll(): Array<IEntityCombined<TEntity, TMetadata>>;
  getByCriteria (query: string, searchAll: boolean, searchAmong: string[]): Array<IEntityCombined<TEntity, TMetadata>>;
  getByIds (ids: uuid[], options?: { onlyActive?: boolean, prependPinnedItems?: boolean, baseDate?: Date, parentId?: Record<string, unknown> }):
    Array<IEntityCombined<TEntity, TMetadata>>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IBaseMutations<TEntity, TMetadata> {
  addNewlyCreatedId(entity: TEntity): void;
  setEntity(entity: TEntity): void;
  setAllEntities(payload: TEntity[]): void;
  setMetadata(payload: TMetadata): void;
  setAllMetadata(payload: TMetadata[]): void;
  setEntityFromOutsideNotification(entity: TEntity): void;
  setMetadataFromOutsideNotification(entity: TMetadata): void;
}

export interface IStorageMake<TEntity extends IEntity, TMetadata extends IEntity, IdParams> {
  getters: IBaseGetters<TEntity, TMetadata>;
  actions: IBaseActions<TEntity, TMetadata, IdParams>;
  mutations: IBaseMutations<TEntity, TMetadata>;
}

export interface IBaseStorage <TEntity extends IEntity, TMetadata extends IEntity, IdParams> {
  make(): IStorageMake<TEntity, TMetadata, IdParams>
}

/* ******* Mock ******** */

export interface IBaseGettersMock<TEntity extends IEntity, TMetadata extends IEntity> {
  get: jest.Mock<IEntityCombined<TEntity, TMetadata>>,
  getNewlyCreatedIds: jest.Mock<Array<{id: uuid, createdOn: number}>>,
  getAll: jest.Mock<IEntityCombined<TEntity, TMetadata>[]>,
  getByCriteria: jest.Mock<IEntityCombined<TEntity, TMetadata>[]>,
  getByIds: jest.Mock<IEntityCombined<TEntity, TMetadata>[]>,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IBaseMutationsMock<TEntity, TTMetadata> {}

export interface IBaseActionsMock<TEntity extends IEntity, TMetadata extends IEntity> {
  fetch: jest.Mock<IEntityCombined<TEntity, TMetadata>>,
  fetchAll: jest.Mock<IEntityCombined<TEntity, TMetadata>[]>,
  fetchAllIncludingInactive: jest.Mock<IEntityCombined<TEntity, TMetadata>[]>,
  deactivate: jest.Mock<TEntity>;
  activate: jest.Mock<TEntity>;
  search: jest.Mock<IAzureTableSearchResults>;
}

export interface IStorageMakeMock<TEntity extends IEntity, TMetadata extends IEntity> {
  getters: IBaseGettersMock<TEntity, TMetadata>;
  actions: IBaseActionsMock<TEntity, TMetadata>;
  mutations: IBaseMutationsMock<TEntity, TMetadata>;
}
