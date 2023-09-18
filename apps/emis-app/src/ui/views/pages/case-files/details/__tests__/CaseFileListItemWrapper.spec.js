import { createLocalVue, mount } from '@/test/testSetup';
import { CaseFileActivityType, mockCaseFileActivities } from '@libs/entities-lib/case-file';
import { mockCombinedCaseNote } from '@libs/entities-lib/case-note';
import { system } from '@/constants/system';

import Component from '../components/CaseFileListItemWrapper.vue';

const localVue = createLocalVue();
const item = mockCombinedCaseNote();

describe('CaseFileListItemWrapper.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(async () => {
      jest.clearAllMocks();

      wrapper = mount(Component, {
        localVue,
        propsData: {
          item,
          sidebarIcon: 'mock-icon',
          isCaseNote: true,
        },
        computed: {
          listItem() {
            return ({
              userName: item.entity.userCreatedBy.userName,
              roleName: item.entity.userCreatedBy.roleName,
              created: item.entity.created,
              lastModifiedDate: item.entity.updatedDate,
              lastModifiedByFullName: item.entity.userCreatedBy.userName,
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
        expect(element.text()).toEqual('Apr 6, 2021 6:39 AM');
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
          propsData: {
            item,
            sidebarIcon: 'mock-icon',
            isCaseNote: true,
          },
        });

        expect(wrapper.vm.listItem).toEqual({
          userName: item.entity.userCreatedBy.userName,
          roleName: item.entity.userCreatedBy.roleName,
          isPinned: item.entity.isPinned,
          lastModifiedByFullName: item.entity.userUpdatedBy
            ? item.entity.userUpdatedBy.userName
            : item.entity.userCreatedBy.userName,
          lastModifiedDate: item.entity.updatedDate
            ? item.entity.updatedDate
            : item.entity.created,
          created: item.entity.created,
        });
      });

      it('sets the right data if item is an activity item', () => {
        const item = mockCaseFileActivities()[0];
        wrapper = mount(Component, {
          localVue,
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
      it('should be true when isCaseNote false, activity type is FinancialAssistancePayment and activity is triggered by mass action', () => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            item: {
              ...mockCaseFileActivities(CaseFileActivityType.FinancialAssistancePayment)[0],
              triggeredByMassAction: true,
            },
            isCaseNote: false,
          },
        });
        expect(wrapper.vm.displaySystemAdminOnly).toEqual(true);
      });

      it('should be false when isCaseNote false, activity type is not FinancialAssistancePayment', () => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            item: {
              ...mockCaseFileActivities(CaseFileActivityType.ImpactedIndividualReceivingAssistance)[0],
            },
            isCaseNote: false,
          },
        });
        expect(wrapper.vm.displaySystemAdminOnly).toEqual(false);
      });

      it('should be false when isCaseNote false, activity type is FinancialAssistancePayment and activity is not triggered by mass action', () => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            item: {
              ...mockCaseFileActivities(CaseFileActivityType.FinancialAssistancePayment)[0],
              triggeredByMassAction: false,
            },
            isCaseNote: false,
          },
        });
        expect(wrapper.vm.displaySystemAdminOnly).toEqual(false);
      });
    });
  });
});
