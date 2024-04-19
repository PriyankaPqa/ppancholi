import { BaseStoreComponents } from '@libs/stores-lib/base';
import { IOptionItemsServiceMock, OptionItemsService } from '@libs/services-lib/optionItems';
import {
 IAddRoleToUserRequest, ICreateUserRequest, IEditFilterRequest, IUserAccountsService, IUserAccountsServiceMock,
} from '@libs/services-lib/user-accounts/entity';
import {
 FilterKey, IFilter, IUserAccountEntity, UserAccountEntity, IdParams,
} from '@libs/entities-lib/user-account';
import { Ref, ref } from 'vue';
import {
 EOptionLists, IOptionItem, IOptionSubItem, OptionItem,
} from '@libs/entities-lib/optionItem';
import _sortBy from 'lodash/sortBy';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IUserAccountEntity, IdParams>,
  service: IUserAccountsService | IUserAccountsServiceMock,
  optionItemService: OptionItemsService | IOptionItemsServiceMock,
) {
  const currentUserAccount = ref(null) as Ref<IUserAccountEntity>;
  const roles = ref([]) as Ref<IOptionItem[]>;
  const rolesFetched = ref(false);

  function currentUserFiltersByKey(key: FilterKey) {
    if (currentUserAccount.value) {
      const userAccount = new UserAccountEntity(currentUserAccount.value);
      return userAccount.filters.filter((f: IFilter) => f.filterKey === key);
    }
    return [];
  }

  function getRoles() {
    return roles.value ? _sortBy(roles.value.map((e) => new OptionItem(e)), 'orderRank') : [];
  }

  function rolesByLevels(levels?: Array<string>) {
    let res = roles.value;
    if (res) {
      if (levels) {
        res = res.filter((r: IOptionItem) => levels.includes(r.name.translation.en));
      }
      if (res.length > 0) {
        return res.map((r) => r.subitems)
          .reduce((prev, current) => [...prev, ...current])
          .map((r: IOptionSubItem) => ({ name: r.name, id: r.id, status: r.status }));
      }
    }
    return [];
  }

  async function genericFilterAction({ payload, methodName }: { payload: IFilter | IEditFilterRequest, methodName: 'addFilter' | 'editFilter' | 'deleteFilter' })
    : Promise<IUserAccountEntity> {
    try {
      const res = await service[methodName](payload);
      baseComponents.set(res);
      return res;
    } catch (e) {
      applicationInsights.trackException(e, { payload }, 'module.userAccountEntity', 'genericFilterAction');
      return null;
    }
  }

  async function addFilter(filter: IFilter) {
      return genericFilterAction({ payload: filter, methodName: 'addFilter' });
    }

  async function editFilter(payload: IEditFilterRequest) {
    return genericFilterAction({ payload, methodName: 'editFilter' });
  }

  async function deleteFilter(filter: IFilter) {
    return genericFilterAction({ payload: filter, methodName: 'deleteFilter' });
  }

  async function createUserAccount(payload: ICreateUserRequest, rethrowExceptions: boolean): Promise<IUserAccountEntity> {
    try {
      const res = await service.createUserAccount(payload);
      if (res) {
        baseComponents.set(res);
        baseComponents.addNewlyCreatedId(res);
      }
      return res;
    } catch (e) {
      applicationInsights.trackException(e, { payload }, 'module.userAccountEntity', 'createUserAccount');
      if (rethrowExceptions) {
throw e;
}
      return null;
    }
  }

  async function assignRole(payload: IAddRoleToUserRequest): Promise<IUserAccountEntity> {
    try {
      const res = await service.assignRole(payload);
      if (res) {
        baseComponents.set(res);
      }
      return res;
    } catch (e) {
      applicationInsights.trackException(e, { payload }, 'module.userAccountEntity', 'assignRole');
      return null;
    }
  }

  async function fetchCurrentUserAccount(): Promise<IUserAccountEntity> {
    try {
      if (!currentUserAccount.value) {
        const res = await service.fetchCurrentUserAccount();
        currentUserAccount.value = res;
      }
      return currentUserAccount.value;
    } catch (e) {
      applicationInsights.trackException(e, {}, 'module.userAccountEntity', 'fetchCurrentUserAccount');
      return null;
    }
  }

  async function fetchRoles(): Promise<IOptionItem[]> {
    if (!rolesFetched.value) {
      const data = await optionItemService.getOptionList(EOptionLists.Roles);
      roles.value = data;
      rolesFetched.value = true;
    }

    return getRoles();
  }

  return {
    currentUserAccount,
    roles,
    rolesFetched,
    currentUserFiltersByKey,
    getRoles,
    rolesByLevels,
    genericFilterAction,
    addFilter,
    editFilter,
    deleteFilter,
    createUserAccount,
    assignRole,
    fetchCurrentUserAccount,
    fetchRoles,
  };
}
