import { IStore, IState } from '@/store';

import {
  FilterKey,
  IFilter, IUserAccountEntity, IUserAccountMetadata,
} from '@/entities/user-account';
import { IStorage } from '@/store/storage/user-account/storage.types';
import { Base } from '@/store/storage/base/base';
import { IAddRoleToUserRequest } from '@/services/user-accounts/entity';

export class UserAccountStorage
  extends Base<IUserAccountEntity, IUserAccountMetadata, uuid> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,
    currentUserFiltersByKey: (key: FilterKey): IFilter[] => this.store.getters[`${this.entityModuleName}/currentUserFiltersByKey`](key),
  }

  private actions = {
    ...this.baseActions,

    addFilter: (filter: IFilter): Promise<IUserAccountEntity> => this.store.dispatch(`${this.entityModuleName}/addFilter`, filter),
    // eslint-disable-next-line
    editFilter: (oldFilter: IFilter, newFilter: IFilter): Promise<IUserAccountEntity> => this.store.dispatch(`${this.entityModuleName}/editFilter`, { oldFilter, newFilter }),

    deleteFilter: (filter: IFilter): Promise<IUserAccountEntity> => this.store.dispatch(`${this.entityModuleName}/deleteFilter`, filter),

    assignRole: (payload: IAddRoleToUserRequest): Promise<IUserAccountEntity> => this.store.dispatch(`${this.entityModuleName}/assignRole`, payload),

    fetchCurrentUserAccount: (): Promise<IUserAccountEntity> => this.store.dispatch(`${this.entityModuleName}/fetchCurrentUserAccount`),
  }

  private mutations = {
    ...this.baseMutations,

    setCurrentUserAccount: (entity: IUserAccountEntity) => {
      this.store.commit(`${this.entityModuleName}/setCurrentUserAccount`, entity);
    },
  }

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  })
}
