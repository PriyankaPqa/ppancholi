import { IOptionItem } from '@libs/entities-lib/optionItem';

import {
  FilterKey,
  IFilter, IUserAccountEntity, IUserAccountMetadata,
} from '@libs/entities-lib/user-account';
import { IStorage } from '@/store/storage/user-account/storage.types';
import { Base } from '@/store/storage/base/base';
import { IAddRoleToUserRequest } from '@/services/user-accounts/entity';
import { IStore, IState } from '../../store.types';

export class UserAccountStorage
  extends Base<IUserAccountEntity, IUserAccountMetadata, uuid> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,
    currentUserFiltersByKey: (key: FilterKey): IFilter[] => this.store.getters[`${this.entityModuleName}/currentUserFiltersByKey`](key),

    roles: () : IOptionItem[] => this.store.getters[`${this.entityModuleName}/roles`],
  }

  private actions = {
    ...this.baseActions,

    addFilter: (filter: IFilter): Promise<IUserAccountEntity> => this.store.dispatch(`${this.entityModuleName}/addFilter`, filter),
    // eslint-disable-next-line
    editFilter: (oldFilter: IFilter, newFilter: IFilter): Promise<IUserAccountEntity> => this.store.dispatch(`${this.entityModuleName}/editFilter`, { oldFilter, newFilter }),

    deleteFilter: (filter: IFilter): Promise<IUserAccountEntity> => this.store.dispatch(`${this.entityModuleName}/deleteFilter`, filter),

    assignRole: (payload: IAddRoleToUserRequest): Promise<IUserAccountEntity> => this.store.dispatch(`${this.entityModuleName}/assignRole`, payload),

    fetchCurrentUserAccount: (): Promise<IUserAccountEntity> => this.store.dispatch(`${this.entityModuleName}/fetchCurrentUserAccount`),

    fetchRoles: (): Promise<IOptionItem[]> => this.store.dispatch(`${this.entityModuleName}/fetchRoles`),
  }

  private mutations = {
    ...this.baseMutations,

    setCurrentUserAccount: (entity: IUserAccountEntity) => {
      this.store.commit(`${this.entityModuleName}/setCurrentUserAccount`, entity);
    },

    setRolesFetched: (payload: boolean) => {
      this.store.commit(`${this.entityModuleName}/setRolesFetched`, payload);
    },
  }

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  })
}
