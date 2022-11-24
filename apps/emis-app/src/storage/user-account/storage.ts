import { IOptionItem } from '@libs/entities-lib/optionItem';

import {
  FilterKey,
  IFilter, IUserAccountEntity, IUserAccountMetadata,
} from '@libs/entities-lib/user-account';
import { IStorage } from '@/storage/user-account/storage.types';
import { Base } from '@/storage/base/base';
import { IAddRoleToUserRequest } from '@libs/services-lib/user-accounts/entity';
import { IMultilingual } from '@libs/shared-lib/types';
import { Status } from '@libs/entities-lib/base';
import { IStore, IState } from '../../store/store.types';

export class UserAccountStorage
  extends Base<IUserAccountEntity, IUserAccountMetadata, uuid> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,
    currentUserFiltersByKey: (key: FilterKey): IFilter[] => this.store.getters[`${this.entityModuleName}/currentUserFiltersByKey`](key),

    roles: () : IOptionItem[] => this.store.getters[`${this.entityModuleName}/roles`],

    // eslint-disable-next-line max-len,vue/max-len
    rolesByLevels: (levels?: Array<string>) : { name: IMultilingual, id: string, status: Status }[] => this.store.getters[`${this.entityModuleName}/rolesByLevels`](levels),
  };

  private actions = {
    ...this.baseActions,

    addFilter: (filter: IFilter): Promise<IUserAccountEntity> => this.store.dispatch(`${this.entityModuleName}/addFilter`, filter),
    // eslint-disable-next-line
    editFilter: (oldFilter: IFilter, newFilter: IFilter): Promise<IUserAccountEntity> => this.store.dispatch(`${this.entityModuleName}/editFilter`, { oldFilter, newFilter }),

    deleteFilter: (filter: IFilter): Promise<IUserAccountEntity> => this.store.dispatch(`${this.entityModuleName}/deleteFilter`, filter),

    assignRole: (payload: IAddRoleToUserRequest): Promise<IUserAccountEntity> => this.store.dispatch(`${this.entityModuleName}/assignRole`, payload),

    fetchCurrentUserAccount: (): Promise<IUserAccountEntity> => this.store.dispatch(`${this.entityModuleName}/fetchCurrentUserAccount`),

    fetchRoles: (): Promise<IOptionItem[]> => this.store.dispatch(`${this.entityModuleName}/fetchRoles`),
  };

  private mutations = {
    ...this.baseMutations,

    setCurrentUserAccount: (entity: IUserAccountEntity) => {
      this.store.commit(`${this.entityModuleName}/setCurrentUserAccount`, entity);
    },

    setRolesFetched: (payload: boolean) => {
      this.store.commit(`${this.entityModuleName}/setRolesFetched`, payload);
    },
  };

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  });
}
