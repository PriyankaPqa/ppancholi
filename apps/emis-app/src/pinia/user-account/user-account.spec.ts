import { createTestingPinia } from '@pinia/testing';
import { defineStore, setActivePinia } from 'pinia';
import { getExtensionComponents } from '@/pinia/user-account/user-account-extension';
import { mockOptionItemsService } from '@libs/services-lib/optionItems';
import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { IAddRoleToUserRequest, mockUserAccountsService } from '@libs/services-lib/user-accounts/entity';
import {
 IUserAccountEntity, IdParams, mockUserAccountEntity, mockUserFilters, FilterKey, UserAccountEntity,
} from '@libs/entities-lib/user-account';
import { mockOptionItems, mockRoles, OptionItem } from '@libs/entities-lib/optionItem';
import _sortBy from 'lodash/sortBy';
import { UserRolesNames } from '@libs/entities-lib/user';

const entityService = mockUserAccountsService();
const optionsService = mockOptionItemsService();
const baseComponents = getBaseStoreComponents<IUserAccountEntity, IdParams>(entityService);

const getPinia = () => {
  const pinia = createTestingPinia({
    initialState: {
      'test-user-account': {
        currentUserAccount: null,
        roles: [],
        rolesFetched: false,
      },
    },
    stubActions: false,
  });
  setActivePinia(pinia);
  return pinia;
};

const useUserAccountTestStore = (opts = {}) => {
  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService, optionsService);

  const useUserAccountStore = defineStore('test-user-account', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));
  return useUserAccountStore();
};

const createTestStore = (bComponents = {}) => {
  getPinia();
  return useUserAccountTestStore(bComponents);
};

describe('User Account Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
    describe('genericFilterAction', () => {
      it('should the proper method from the service with a filter as parameter and commit the result', async () => {
        const bComponents = { ...baseComponents, set: jest.fn() };
        const store = createTestStore(bComponents);
        const filter = mockUserFilters()[0];
        const res = mockUserAccountEntity();
        entityService.addFilter = jest.fn(() => res);
        await store.genericFilterAction({ payload: filter, methodName: 'addFilter' });
        expect(entityService.addFilter).toBeCalledWith(filter);
        expect(bComponents.set).toBeCalledWith(res);
      });
    });

    describe('addFilter', () => {
      it('should call genericFilterAction with proper parameters, should the proper method from the service with a filter as parameter and commit the result', async () => {
        const bComponents = { ...baseComponents, set: jest.fn() };
        const store = createTestStore(bComponents);
        store.genericFilterAction = jest.fn();
        const filter = mockUserFilters()[0];
        const res = mockUserAccountEntity();
        await store.addFilter(filter);
        expect(entityService.addFilter).toBeCalledWith(filter);
        expect(bComponents.set).toBeCalledWith(res);
      });
    });

    describe('editFilter', () => {
      it('should call genericFilterAction with proper parameters, should the proper method from the service with a filter as parameter and commit the result', async () => {
        const bComponents = { ...baseComponents, set: jest.fn() };
        const store = createTestStore(bComponents);
        const oldFilter = mockUserFilters()[0];
        const newFilter = mockUserFilters()[0];
        const payload = {
          oldFilter,
          newFilter,
        };
        const res = mockUserAccountEntity();
        await store.editFilter(payload);
        expect(entityService.editFilter).toBeCalledWith(payload);
        expect(bComponents.set).toBeCalledWith(res);
      });
    });

    describe('deleteFilter', () => {
      it('should call genericFilterAction with proper parameters, should the proper method from the service with a filter as parameter and commit the result', async () => {
        const bComponents = { ...baseComponents, set: jest.fn() };
        const store = createTestStore(bComponents);
        const filter = mockUserFilters()[0];
        const res = mockUserAccountEntity();
        await store.deleteFilter(filter);
        expect(entityService.deleteFilter).toBeCalledWith(filter);
        expect(bComponents.set).toBeCalledWith(res);
      });
    });

    describe('assignRole', () => {
      it('should call service assignRole with proper parameters and commit the result', async () => {
        const bComponents = { ...baseComponents, set: jest.fn() };
        const store = createTestStore(bComponents);
        const payload = {
          subRole: {},
          userId: '123',
        } as IAddRoleToUserRequest;
        const res = mockUserAccountEntity();
        entityService.assignRole = jest.fn(() => res);

        await store.assignRole(payload);

        expect(entityService.assignRole).toBeCalledWith(payload);
        expect(bComponents.set).toBeCalledWith(res);
      });
    });

    describe('fetchCurrentUserAccount', () => {
      it('should call service fetchCurrentUserAccount and commit the result', async () => {
        const store = createTestStore();
        const res = mockUserAccountEntity();
        entityService.fetchCurrentUserAccount = jest.fn(() => res);

        await store.fetchCurrentUserAccount();

        expect(entityService.fetchCurrentUserAccount).toBeCalledTimes(1);
        expect(store.currentUserAccount).toBe(res);
      });
    });

    describe('fetchRoles', () => {
      it('should call option service getOptionList and commit the result', async () => {
        const store = createTestStore();
        const res = mockOptionItems();
        optionsService.getOptionList = jest.fn(() => res);
        await store.fetchRoles();

        expect(optionsService.getOptionList).toBeCalledTimes(1);
        expect(store.roles).toBe(res);
      });
    });

    describe('currentUserFiltersByKey', () => {
      it('returns the correct parsed filters', () => {
        const store = createTestStore();
        store.currentUserAccount = mockUserAccountEntity();
        const key = FilterKey.CaseFiles;
        const res = store.currentUserFiltersByKey(key);
        const userAccount = new UserAccountEntity(mockUserAccountEntity());
        expect(res).toEqual([userAccount.filters[2]]);
      });
    });

    describe('getRoles', () => {
      it('returns the roles list', () => {
        const store = createTestStore();
        store.roles = mockOptionItems();
        const res = store.getRoles();
        expect(res).toEqual(_sortBy(
          mockOptionItems().map((e) => new OptionItem(e)),
          'orderRank',
        ));
      });
    });

    describe('rolesByLevels', () => {
      it('returns the roles list for specific levels', () => {
        const store = createTestStore();
        store.roles = mockRoles();
        const res = store.rolesByLevels([UserRolesNames.level5]);
        expect(res).toEqual([
          {
            id: 'abafdc5b-09ea-42d2-9d96-2ecdb36a7e24',
            name: {
              translation: {
                en: 'Systems Team Member',
                fr: "Membre de l'équipe Systèmes",
              },
            },
            status: 1,
          },
          {
            id: 'b1a85314-d88b-496d-a8c6-ebe462244311',
            name: {
              translation: {
                en: 'Test edited',
                fr: 'Test',
              },
            },
            status: 2,
          },
        ]);
      });
    });
});
