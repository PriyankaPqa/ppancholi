import { mockStore } from '@/store';
import { UserAccountStorage } from '@/store/storage/user-account/storage';
import { USER_ACCOUNT_ENTITIES, USER_ACCOUNT_METADATA } from '@/constants/vuex-modules';
import { FilterKey, mockUserAccountEntity, mockUserFilters } from '@/entities/user-account';
import { IAddRoleToUserRequest } from '@/services/user-accounts/entity';

const entityModuleName = USER_ACCOUNT_ENTITIES;
const metadataModuleName = USER_ACCOUNT_METADATA;

const store = mockStore({
  modules: {
    [entityModuleName]: {
      state: {
        currentUserAccount: mockUserAccountEntity(),
      },
    },
  },
}, { commit: true, dispatch: true });

const storage = new UserAccountStorage(store, entityModuleName, metadataModuleName).make();

describe('>>> User Account Storage', () => {
  describe('>> Actions', () => {
    it('should proxy addFilter', () => {
      const filter = mockUserFilters()[0];
      storage.actions.addFilter(filter);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/addFilter`, filter);
    });

    it('should proxy editFilter', () => {
      const oldFilter = mockUserFilters()[0];
      const newFilter = mockUserFilters()[0];
      storage.actions.editFilter(oldFilter, newFilter);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/editFilter`, { oldFilter, newFilter });
    });

    it('should proxy deleteFilter', () => {
      const filter = mockUserFilters()[0];
      storage.actions.deleteFilter(filter);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/deleteFilter`, filter);
    });

    it('should proxy assignRole', () => {
      const payload = {
        subRole: {},
        userId: '123',
      } as IAddRoleToUserRequest;

      storage.actions.assignRole(payload);

      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/assignRole`, payload);
    });

    it('should proxy setUserPreferredLanguage', () => {
      const payload = {
        id: '123',
        languageCode: 'fr',
      };

      storage.actions.setUserPreferredLanguage(payload.id, payload.languageCode);

      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/setUserPreferredLanguage`, payload);
    });

    it('should proxy setCurrentUserPreferredLanguage', () => {
      const payload = 'fr';

      storage.actions.setCurrentUserPreferredLanguage(payload);

      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/setCurrentUserPreferredLanguage`, payload);
    });

    it('should proxy fetchCurrentUserAccount', () => {
      storage.actions.fetchCurrentUserAccount();

      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchCurrentUserAccount`);
    });
  });

  describe('>> Getters', () => {
    describe('currentUserFiltersByKey', () => {
      it('should proxy currentUserFiltersByKey', () => {
        store.commit(`${entityModuleName}/setCurrentUserAccount`, mockUserAccountEntity());
        const storageGetter = storage.getters.currentUserFiltersByKey(FilterKey.CaseFiles);
        const storeGetter = store.getters[`${entityModuleName}/currentUserFiltersByKey`](FilterKey.CaseFiles);
        expect(storageGetter).toEqual(storeGetter);
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setCurrentUserAccount', () => {
      it('should proxy setCurrentUserAccount', () => {
        const payload = mockUserAccountEntity();
        storage.mutations.setCurrentUserAccount(payload);
        expect(store.commit).toBeCalledWith(`${entityModuleName}/setCurrentUserAccount`, payload);
      });
    });
  });
});
