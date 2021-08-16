import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import { MassActionRunStatus, mockCombinedMassAction } from '@/entities/mass-action';
import Component from './MassActionPreProcessedProcessedBase.vue';
import { mockCombinedUserAccount } from '@/entities/user-account';
import MassActionTitleDescription from '@/ui/views/pages/mass-actions/components/MassActionTitleDescription.vue';
import MassActionDetailsTable from '@/ui/views/pages/mass-actions/components/MassActionDetailsTable.vue';
import MassActionEditTitleDescription from '@/ui/views/pages/mass-actions/components/MassActionEditTitleDescription.vue';

const localVue = createLocalVue();

describe('MassActionPreProcessedProcessedBase.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
          massActionType: 'massActionType',
          massActionStatus: MassActionRunStatus.PreProcessed,
          total: 100,
          successes: 50,
          failures: 50,
          failuresLabel: 'failuresLabel',
          successesLabel: 'successesLabel',
          totalLabel: 'totalLabel',
        },
        data() {
          return {
            userAccount: mockCombinedUserAccount(),
          };
        },
      });
    });

    describe('Template', () => {
      it('should render MassActionTitleDescription if editMode is false', () => {
        expect(wrapper.findComponent(MassActionTitleDescription).exists()).toBe(true);
      });

      it('should render MassActionTitleDescription if editMode is true', async () => {
        await wrapper.setData({
          editMode: true,
        });
        expect(wrapper.findComponent(MassActionEditTitleDescription).exists()).toBe(true);
      });

      it('should render MassActionDetailsTable', () => {
        expect(wrapper.findComponent(MassActionDetailsTable).exists()).toBe(true);
      });

      it('should display the total items processed', () => {
        expect(wrapper.findDataTest('total').text()).toEqual(wrapper.vm.total.toString());
      });

      it('should display the successful items processed', () => {
        expect(wrapper.findDataTest('successes').text()).toEqual(wrapper.vm.successes.toString());
      });

      it('should display the failures items', () => {
        expect(wrapper.findDataTest('failures').text()).toEqual(wrapper.vm.failures.toString());
      });

      it('should display processButton if the props showProcessButton is true ', async () => {
        await wrapper.setProps({
          showProcessButton: true,
        });
        expect(wrapper.findDataTest('failures').text()).toEqual(wrapper.vm.failures.toString());
      });

      it('should display processButton if the props showProcessButton is true ', async () => {
        await wrapper.setProps({
          showProcessButton: true,
        });
        expect(wrapper.findDataTest('processButton').exists()).toBe(true);
      });

      it('should display downloadButton if the props showProcessButton is true ', async () => {
        await wrapper.setProps({
          showDownloadButton: true,
        });
        expect(wrapper.findDataTest('downloadButton').exists()).toBe(true);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
          massActionType: 'massActionType',
          massActionStatus: MassActionRunStatus.PreProcessed,
          total: 100,
          successes: 50,
          failures: 50,
          failuresLabel: 'failuresLabel',
          successesLabel: 'successesLabel',
          totalLabel: 'totalLabel',
        },
        data() {
          return {
            userAccount: mockCombinedUserAccount(),
          };
        },
      });
    });
    describe('update', () => {
      it('should set editMode to false', async () => {
        await wrapper.setData({
          editMode: true,
        });
        wrapper.vm.update();
        expect(wrapper.vm.editMode).toBe(false);
      });

      it('should emit update', () => {
        wrapper.vm.update();
        expect(wrapper.emitted('update')).toBeTruthy();
      });
    });
  });
});
