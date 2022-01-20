/**
 * @group ui/components/system-management
 */

import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockCombinedUserAccount } from '@/entities/user-account';
import { mockOptionItemData } from '@/entities/optionItem';
import { mockStorage } from '@/store/storage';

import Component from './AccountSettings.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockUser = mockCombinedUserAccount();

describe('AccountSettings.vue', () => {
  let wrapper;
  let roleHasChanged = false;
  let isLevel6 = false;

  const doMount = async () => {
    wrapper = mount(Component, {
      localVue,
      computed: {
        user: () => mockUser,
        roleHasChanged: () => roleHasChanged,
      },
      mocks: {
        $hasLevel: jest.fn((lv) => lv !== 'level5' || isLevel6),
        $storage: storage,
      },
    });
    await wrapper.setData({
      loading: false,
    });
  };

  describe('Template', () => {
    beforeEach(async () => {
      await doMount();
    });

    describe('status', () => {
      let element;

      beforeEach(() => {
        element = wrapper.findDataTest('userAccount-status-chip');
      });

      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        expect(element.props('status')).toEqual(wrapper.vm.user.entity.accountStatus);
      });
    });

    describe('firstName', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('userAccount-status-firstName');
      });

      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        expect(element.text()).toEqual(wrapper.vm.user.metadata.givenName);
      });
    });

    describe('lastName', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('userAccount-status-lastName');
      });

      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        expect(element.text()).toEqual(wrapper.vm.user.metadata.surname);
      });
    });

    describe('roleName', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('userAccount-status-roleName');
      });

      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        element = wrapper.findDataTest('userAccount-status-roleName');
        expect(element.text()).toEqual(wrapper.vm.user.metadata.roleName.translation.en);
      });
    });

    describe('email', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('userAccount-status-email');
      });

      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        expect(element.text()).toEqual(wrapper.vm.user.metadata.emailAddress);
      });
    });

    describe('phoneNumber', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('userAccount-status-phoneNumber');
      });

      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        expect(element.text()).toEqual(wrapper.vm.user.metadata.phoneNumber);
      });
    });

    describe('preferred language', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('userAccount-language-preferences');
      });

      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('role dropdown', () => {
      let element;

      it('does not render when not level 6', async () => {
        isLevel6 = false;
        await doMount();

        element = wrapper.findDataTest('user_roleId');
        expect(element.exists()).toBeFalsy();
      });

      it('renders when level 6', async () => {
        isLevel6 = true;
        await doMount();

        element = wrapper.findDataTest('user_roleId');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('role action buttons', () => {
      let element;

      it('renders when roleHasChanged = true', async () => {
        roleHasChanged = true;
        await doMount();

        element = wrapper.findDataTest('apply-role-button');
        expect(element.exists()).toBeTruthy();
        element = wrapper.findDataTest('cancel-role-change');
        expect(element.exists()).toBeTruthy();
      });

      it('does not render when roleHasChanged = false', async () => {
        roleHasChanged = false;

        await doMount();

        element = wrapper.findDataTest('apply-role-button');
        expect(element.exists()).toBeFalsy();
        element = wrapper.findDataTest('cancel-role-change');
        expect(element.exists()).toBeFalsy();
      });
    });
  });

  describe('life cycle', () => {
    it('should call fetchUserAccount with id', async () => {
      wrapper.vm.fetchUserAccount = jest.fn();
      wrapper.vm.setRoles = jest.fn();
      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.fetchUserAccount).toHaveBeenCalledWith(wrapper.vm.id);
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      storage.userAccount.getters.get = jest.fn(() => mockUser);

      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
        store: {
          userAccount: {
            searchLoading: false,
          },
        },
      });
    });

    describe('user', () => {
      it('return the user account by id from the storage', () => {
        expect(wrapper.vm.user).toEqual(mockUser);
      });
    });

    describe('roleHasChanged', () => {
      it('returns true when current role is not equal to user role', async () => {
        await wrapper.setData({
          currentRole: { id: 'nope' },
        });
        expect(wrapper.vm.roleHasChanged).toBeTruthy();
      });
      it('returns false when current role is equal to user role', async () => {
        await wrapper.setData({
          currentRole: { id: mockUser.entity.roles[0].optionItemId },
        });
        expect(wrapper.vm.roleHasChanged).toBeFalsy();
      });
    });

    describe('preferredLanguage', () => {
      it('returns English if includes en', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            user() {
              return {
                metadata: {
                  preferredLanguage: 'en-CA',
                },
              };
            },
          },
        });

        expect(wrapper.vm.preferredLanguage).toBe('enums.preferredLanguage.English (en-CA)');
      });

      it('returns Français if includes fr', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            user() {
              return {
                metadata: {
                  preferredLanguage: 'fr-CA',
                },
              };
            },
          },
        });

        expect(wrapper.vm.preferredLanguage).toBe('enums.preferredLanguage.French (fr-CA)');
      });

      it('returns undefined if is null', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            user() {
              return {
                metadata: {
                  preferredLanguage: null,
                },
              };
            },
          },
        });

        expect(wrapper.vm.preferredLanguage).toBe('account_settings.preferredLanguage.notSet');
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        store: {
          userAccount: {
            searchLoading: false,
          },
        },
        computed: {
          user() {
            return mockUser;
          },
          roleHasChanged() {
            return true;
          },
          id: () => 'myId',
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('applyRoleChange', () => {
      it('should be called when clicking apply', async () => {
        const element = wrapper.findDataTest('apply-role-button');
        wrapper.vm.applyRoleChange = jest.fn();
        element.vm.$emit('click');
        expect(wrapper.vm.applyRoleChange).toHaveBeenCalled();
      });
      it('applies a pending role change and triggers a success toast', async () => {
        wrapper.vm.$toasted.global.success = jest.fn();
        wrapper.vm.$storage.userAccount.actions.assignRole = jest.fn(() => mockUser);
        const currentRole = { id: 'myId' };
        await wrapper.setData({ currentRole });
        await wrapper.vm.applyRoleChange();
        wrapper.vm.$nextTick();

        expect(wrapper.vm.loading).toBeFalsy();

        expect(wrapper.vm.$storage.userAccount.actions.assignRole).toBeCalledWith({
          subRole: currentRole,
          userId: mockUser.entity.id,
        });
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledTimes(1);
      });
    });

    describe('resetCurrentRole', () => {
      it('should be called when clicking cancel', async () => {
        const element = wrapper.findDataTest('cancel-role-change');
        wrapper.vm.resetCurrentRole = jest.fn();
        element.vm.$emit('click');
        expect(wrapper.vm.resetCurrentRole).toHaveBeenCalled();
      });
      it('resets currentRole to user role', async () => {
        const mockSubItemData = [...mockOptionItemData()[0].subitems, mockOptionItemData()[1]];
        const resettedOption = { id: mockUser.entity.roles[0].optionItemId, name: 'that is great' };
        await wrapper.setData({ allRoles: mockSubItemData.concat(resettedOption) });
        const currentRole = { id: 'myId', name: 'nope' };
        await wrapper.setData({ currentRole });
        wrapper.vm.resetCurrentRole();
        wrapper.vm.$nextTick();

        expect(wrapper.vm.currentRole).toEqual(resettedOption);
      });
    });

    describe('setRoles', () => {
      it('invokes the correct storage function', async () => {
        jest.clearAllMocks();
        storage.optionList.mutations.setList = jest.fn();
        await wrapper.vm.setRoles();
        expect(wrapper.vm.$storage.optionList.mutations.setList).toBeCalledWith(6); // EOptionLists.Roles
        expect(wrapper.vm.$storage.optionList.actions.fetchItems).toBeCalledTimes(1);
      });

      it('filters for active roles', async () => {
        const itemData = mockOptionItemData();
        itemData.forEach((a) => {
          a.subitems.forEach((s) => {
            s.status = 1;
          });
        });
        itemData[0].subitems[0].status = 0;
        storage.optionList.mutations.setList = jest.fn();
        wrapper.vm.$storage.optionList.actions.fetchItems = jest.fn(() => itemData);
        await wrapper.vm.setRoles();
        expect(wrapper.vm.allAccessLevelRoles).toContain(itemData[0].subitems[1]);
        expect(wrapper.vm.allAccessLevelRoles.filter((x) => x === itemData[0].subitems[0])[0]).toBeUndefined();
      });

      describe('setAllAccessLevelRoles', () => {
        it('includes current user\'s inactive role', async () => {
          const itemData = mockOptionItemData();
          itemData.forEach((a) => {
            a.subitems.forEach((s) => {
              s.status = 1;
            });
          });
          itemData[0].subitems[0].status = 0;
          storage.optionList.mutations.setList = jest.fn();
          wrapper.vm.$storage.optionList.actions.fetchItems = jest.fn(() => itemData);

          const user = mockUser;
          user.entity.roles[0].optionItemId = itemData[0].subitems[0].id;

          await wrapper.vm.setRoles();
          expect(wrapper.vm.allAccessLevelRoles).toContain(itemData[0].subitems[1]);
          expect(wrapper.vm.allAccessLevelRoles).toContain(itemData[0].subitems[0]);
        });
      });
    });

    describe('fetchUserAccount', () => {
      storage.user.getters.userId = jest.fn(() => 'mock-id');
      storage.userAccount.actions.fetch = jest.fn(() => {});

      it('should call fetchUserAccount with the response of the user storage getter if none in route params', () => {
        jest.clearAllMocks();
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.$storage.userAccount.actions.fetch).toHaveBeenCalledWith('mock-id');
      });

      it('should call fetchUserAccount with the route params', () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
            $route: {
              params: { id: 'abcd' },
            },
          },
        });
        expect(wrapper.vm.$storage.userAccount.actions.fetch).toHaveBeenCalledWith('abcd');
        expect(wrapper.vm.id).toEqual('abcd');
      });
    });

    describe('setNonEditableRolesForL5', () => {
      it('returns user if user is in the notAllowed level', () => {
        const level = {
          subitems: [
            {
              id: 'id',
            }, {
              id: mockUser.entity.roles[0].optionItemId,
            },
          ],
        };

        const result = wrapper.vm.setNonEditableRolesForL5(level);
        expect(result).toEqual([{
          id: mockUser.entity.roles[0].optionItemId,
        }]);
      });

      it('disable dropdown if user is in the notAllowed level', () => {
        const level = {
          subitems: [
            {
              id: 'id',
            }, {
              id: mockUser.entity.roles[0].optionItemId,
            },
          ],
        };

        expect(wrapper.vm.disableForL5).toEqual(false);
        wrapper.vm.setNonEditableRolesForL5(level);
        expect(wrapper.vm.disableForL5).toEqual(true);
      });

      it('returns empty array if user is not in the notAllowed level', () => {
        const level = {
          subitems: [
            {
              id: 'id1',
            }, {
              id: 'id2',
            },
          ],
        };

        const result = wrapper.vm.setNonEditableRolesForL5(level);
        expect(result).toEqual([]);
      });
    });
  });
});
