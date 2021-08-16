import { createLocalVue, mount, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import Component from './ImportValidationStatusPreProcessed.vue';
import MassActionPreProcessedProcessedBase from '@/ui/views/pages/mass-actions/components/MassActionPreProcessedProcessedBase.vue';
import { MassActionRunType, mockCombinedMassAction } from '@/entities/mass-action';

const localVue = createLocalVue();

const storage = mockStorage();

describe('ImportValidationStatusPreProcessed.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
          total: 10,
          successes: 5,
          failures: 5,
        },
      });
    });

    describe('MassActionPreProcessedProcessedBase', () => {
      it('should be rendered', () => {
        expect(wrapper.findComponent(MassActionPreProcessedProcessedBase)
          .exists())
          .toBe(true);
      });

      it('should call download', async () => {
        const component = wrapper.findComponent(MassActionPreProcessedProcessedBase);
        wrapper.vm.download = jest.fn();

        await component.vm.$emit('download');

        expect(wrapper.vm.download).toBeCalled();
      });

      it('should call onProcess', async () => {
        const component = wrapper.findComponent(MassActionPreProcessedProcessedBase);
        wrapper.vm.onProcess = jest.fn();

        await component.vm.$emit('process');

        expect(wrapper.vm.onProcess).toBeCalled();
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
          total: 10,
          successes: 5,
          failures: 5,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('startProcess', () => {
      it('should call mass action process with correct params', async () => {
        const id = '1';
        const runType = MassActionRunType.Process;

        await wrapper.vm.startProcess(id, runType);

        expect(wrapper.vm.$storage.massAction.actions.process).toHaveBeenCalledWith(id, runType);
      });
    });

    describe('onProcess', () => {
      it('should display confirmation dialog', async () => {
        await wrapper.vm.onProcess();
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith('massAction.confirm.processing.title', 'massAction.confirm.processing.message');
      });

      it('should call startProcess method with proper params', async () => {
        wrapper.vm.startProcess = jest.fn();
        await wrapper.vm.onProcess();
        expect(wrapper.vm.startProcess).toHaveBeenCalledWith(wrapper.vm.massAction.entity.id, MassActionRunType.Process);
      });
    });

    describe('download', () => {
      it('should do nothing', async () => {
        expect(wrapper.vm.download()).toEqual(false);
      });
    });

    describe('update', () => {
      it('should trigger update action with correct params', async () => {
        const payload = { name: 'test', description: 'description' };
        await wrapper.vm.update(payload);
        expect(wrapper.vm.$storage.massAction.actions.update).toHaveBeenCalledWith(wrapper.vm.massAction.entity.id, payload);
      });
    });
  });
});
