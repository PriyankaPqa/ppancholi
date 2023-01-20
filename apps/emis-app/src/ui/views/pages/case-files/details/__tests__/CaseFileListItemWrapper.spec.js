import { createLocalVue, mount } from '@/test/testSetup';
import { mockCaseFileActivities } from '@libs/entities-lib/case-file';
import { mockCombinedCaseNote } from '@libs/entities-lib/case-note';
import moment from '@libs/shared-lib/plugins/moment';

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
        expect(element.text()).toBe(moment(wrapper.vm.listItem.lastModifiedDate).format('ll'));
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
    });
  });
});
