import { createLocalVue, mount } from '@/test/testSetup';
import { mockCaseFileActivities } from '@/entities/case-file';

import Component from '../components/CaseFileListItemWrapper.vue';

const localVue = createLocalVue();
const item = mockCaseFileActivities()[0];

describe('CaseFileListItemWrapper.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      wrapper = mount(Component, {
        localVue,
        propsData: {
          item,
          sidebarIcon: 'mock-icon',
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
        expect(element.text()).toEqual(wrapper.vm.item.user.name);
      });
    });

    describe('roleName', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('caseFileItem__roleName');
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        const element = wrapper.findDataTest('caseFileItem__roleName');
        expect(element.text()).toEqual(`(${wrapper.vm.item.role.name.translation.en})`);
      });
    });

    describe('created date', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('caseFileItem__created');
        expect(element.exists()).toBeTruthy();
      });
    });
  });
});
