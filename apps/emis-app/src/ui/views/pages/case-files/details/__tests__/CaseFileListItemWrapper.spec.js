import { createLocalVue, mount } from '@/test/testSetup';
import { CaseFileActivityType, mockCaseFileActivities } from '@libs/entities-lib/case-file';
import { mockCaseNoteEntity } from '@libs/entities-lib/case-note';
import { system } from '@/constants/system';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';

import Component from '../components/CaseFileListItemWrapper.vue';

const localVue = createLocalVue();
const item = mockCaseNoteEntity();
const { pinia, userAccountStore } = useMockUserAccountStore();

describe('CaseFileListItemWrapper.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(async () => {
      jest.clearAllMocks();

      wrapper = mount(Component, {
        localVue,
        pinia,
        propsData: {
          item,
          sidebarIcon: 'mock-icon',
          isCaseNote: true,
        },
        computed: {
          listItem() {
            return ({
              userName: item.userCreatedBy.userName,
              roleName: item.userCreatedBy.roleName,
              created: item.created,
              lastModifiedDate: item.updatedDate,
              lastModifiedByFullName: item.userCreatedBy.userName,
            });
          },
        },
      });
    });

    describe('username', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('caseFileItem__userName');
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        const element = wrapper.findDataTest('caseFileItem__userName');
        expect(element.text()).toEqual(wrapper.vm.listItem.userName);
      });
    });

    describe('roleName', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('caseFileItem__roleName');
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        const element = wrapper.findDataTest('caseFileItem__roleName');
        expect(element.text()).toEqual(`(${wrapper.vm.listItem.roleName.translation.en})`);
      });
    });

    describe('created date', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('caseFileItem__created');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toEqual('Apr 6, 2021, 6:39 AM');
      });
    });

    describe('last modified by full name', () => {
      it('renders', async () => {
        const element = wrapper.findDataTest('caseFileItem__lastEditBy');
        expect(element.text()).toBe(wrapper.vm.listItem.lastModifiedByFullName);
      });
    });

    describe('last modified date', () => {
      it('renders', async () => {
        const element = wrapper.findDataTest('caseFileItem__lastModifiedDate');
        expect(element.text()).toBe('Jan 1, 2001');
      });
    });

    describe('Pinned Item', () => {
      it('should have proper class name when item is pinned', async () => {
        await wrapper.setProps({
          item: { pinned: true },
        });
        const element = wrapper.findDataTest('caseFileItem__header');
        expect(element.classes('item__header--pinned')).toBeTruthy();
      });
    });
  });

  describe('computed', () => {
    describe('listItem', () => {
      it('sets the right  data if item is case note', () => {
        wrapper = mount(Component, {
          localVue,
          pinia,
          propsData: {
            item,
            sidebarIcon: 'mock-icon',
            isCaseNote: true,
          },
        });

        expect(wrapper.vm.listItem).toEqual({
          userName: item.userCreatedBy.userName,
          roleName: item.userCreatedBy.roleName,
          isPinned: item.isPinned,
          lastModifiedByFullName: item.userUpdatedBy
            ? item.userUpdatedBy.userName
            : item.userCreatedBy.userName,
          lastModifiedDate: item.updatedDate
            ? item.updatedDate
            : item.created,
          created: item.created,
        });
      });

      it('sets the right data if item is an activity item', () => {
        const item = mockCaseFileActivities()[0];
        wrapper = mount(Component, {
          localVue,
          pinia,
          propsData: {
            item: mockCaseFileActivities()[0],
            sidebarIcon: 'mock-icon',
            isCaseNote: false,
          },
        });

        expect(wrapper.vm.listItem).toEqual({
          userName: item.user.name,
          roleName: item.role.name,
          created: item.created,
        });
      });

      it('overwrites the name for system users if item is an activity item', () => {
        const item = mockCaseFileActivities()[0];
        item.role = null;
        item.user.id = system.public_user_id;
        wrapper = mount(Component, {
          localVue,
          pinia,
          propsData: {
            item,
            sidebarIcon: 'mock-icon',
            isCaseNote: false,
          },
        });

        expect(wrapper.vm.listItem).toEqual({
          userName: 'system.public_user_id',
          roleName: undefined,
          created: item.created,
        });

        item.user.id = system.system_user_id;
        expect(wrapper.vm.listItem).toEqual({
          userName: 'system.system_user_id',
          roleName: undefined,
          created: item.created,
        });
      });
    });

    describe('displaySystemAdminOnly', () => {
      it('should be true when activity is triggered by mass action and activity user role is L6', () => {
        wrapper = mount(Component, {
          localVue,
          pinia,
          propsData: {
            item: {
              ...mockCaseFileActivities(CaseFileActivityType.FinancialAssistancePayment)[0],
              triggeredByMassAction: true,
              role: { id: 'level-6-role-id' },
            },
          },
        });
        userAccountStore.rolesByLevels = jest.fn(() => [{ id: 'level-6-role-id' }]);
        expect(wrapper.vm.displaySystemAdminOnly).toEqual(true);
      });

      it('should be false when activity is not triggered by mass action', () => {
        wrapper = mount(Component, {
          localVue,
          pinia,
          propsData: {
            item: {
              ...mockCaseFileActivities(CaseFileActivityType.FinancialAssistancePayment)[0],
              triggeredByMassAction: false,
            },
          },
        });
        expect(wrapper.vm.displaySystemAdminOnly).toEqual(false);
      });

      it('should return false if the activity user is not level 6', () => {
        wrapper = mount(Component, {
          localVue,
          pinia,
          propsData: {
            item: {
              ...mockCaseFileActivities(CaseFileActivityType.FinancialAssistancePayment)[0],
              triggeredByMassAction: true,
              role: { id: 'level-5-role-id' },
            },
          },
        });
        userAccountStore.rolesByLevels = jest.fn(() => [{ id: 'level-6-role-id' }]);
        expect(wrapper.vm.displaySystemAdminOnly).toEqual(false);
      });
    });
  });
});
