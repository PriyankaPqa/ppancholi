import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import { MassActionRunStatus, mockMassActionEntity } from '@libs/entities-lib/mass-action';
import MassActionDetailsTable from '@/ui/views/pages/mass-actions/components/MassActionDetailsTable.vue';
import MassActionTitleDescription from '@/ui/views/pages/mass-actions/components/MassActionTitleDescription.vue';
import { mockProvider } from '@/services/provider';
import { useMockMassActionStore } from '@/pinia/mass-action/mass-action.mock';
import { mockServerError } from '@libs/services-lib/http-client';
import Component from './MassActionFailedBase.vue';

const localVue = createLocalVue();
const services = mockProvider();

const { pinia, massActionStore } = useMockMassActionStore();
let wrapper;

const doMount = ({ otherProps, otherData }, mountMode = false, runStatus = MassActionRunStatus.FailedPreProcessing) => {
  const options = {
    localVue,
    pinia,
    propsData: {
      massAction: mockMassActionEntity(),
      massActionStatus: runStatus,
      ...otherProps,
    },
    data() {
      return {
        ...otherData,
      };
    },
    mocks: {
      $services: services,
    },
  };
  if (mountMode) {
    wrapper = mount(Component, options);
  } else {
    wrapper = shallowMount(Component, options);
  }
};

describe('MassActionFailedBase.vue', () => {
  describe('Template', () => {
    describe('Common', () => {
      beforeEach(() => {
        doMount({ otherProps: null, otherData: null }, true);
      });

      it('should render MassActionTitleDescription', () => {
        expect(wrapper.findComponent(MassActionTitleDescription).exists()).toBe(true);
      });

      it('should render MassActionDetailsTable', () => {
        expect(wrapper.findComponent(MassActionDetailsTable).exists()).toBe(true);
      });
    });

    describe('Failed pre-processing', () => {
      beforeEach(() => {
        doMount({ otherProps: null, otherData: null }, true);
      });

      it('should render title', () => {
        expect(wrapper.findDataTest('pre-failed-title').exists()).toBe(true);
      });

      it('should render message 1', () => {
        expect(wrapper.findDataTest('pre-failed-msg-1').exists()).toBe(true);
      });

      it('should render message 2', () => {
        expect(wrapper.findDataTest('pre-failed-msg-2').exists()).toBe(true);
      });
    });

    describe('Failed processing', () => {
      beforeEach(() => {
        doMount({ otherProps: null, otherData: null }, true, MassActionRunStatus.FailedProcessing);
      });

      it('should render title', () => {
        expect(wrapper.findDataTest('proc-failed-title').exists()).toBe(true);
      });

      it('should render message 1', () => {
        expect(wrapper.findDataTest('proc-failed-msg-1').exists()).toBe(true);
      });

      it('should render message 2', () => {
        expect(wrapper.findDataTest('proc-failed-msg-2').exists()).toBe(true);
      });
    });
  });

  describe('Computed', () => {
    describe('isFailedPreProcessing', () => {
      it('is true when run status is FailedPreProcessing', () => {
        doMount({ otherProps: null, otherData: null }, true);
        expect(wrapper.vm.isFailedPreprocessing).toBe(true);
      });
      it('is false when run status is FailedProcessing', () => {
        doMount({ otherProps: null, otherData: null }, true, MassActionRunStatus.FailedProcessing);
        expect(wrapper.vm.isFailedPreprocessing).toBe(false);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      doMount({ otherProps: null, otherData: null }, false);
    });

    describe('onDelete', () => {
      it('should display confirmation dialog', async () => {
        await wrapper.vm.onDelete();
        expect(wrapper.vm.$confirm).toBeCalled();
      });

      it('should trigger deactivate action with correct params', async () => {
        await wrapper.vm.onDelete();
        expect(massActionStore.deactivate).toHaveBeenCalledWith(wrapper.vm.massAction.id);
      });

      it('should emit delete:success to home page', async () => {
        doMount({ otherProps: null, otherData: null }, false);
        massActionStore.deactivate = jest.fn(() => mockMassActionEntity());
        await wrapper.vm.onDelete();
        expect(wrapper.emitted('delete:success')).toBeTruthy();
      });

      it('should call handleResponseError when the call returns an error', async () => {
        massActionStore.deactivate = jest.fn(() => Promise.reject(mockServerError([], 403)));
        wrapper.vm.handleResponseError = jest.fn();
        await wrapper.vm.onDelete();
        expect(wrapper.vm.handleResponseError).toBeCalledWith(mockServerError([], 403));
      });
    });

    describe('handleResponseError', () => {
      it('should display an error toast when the call returns status 403', async () => {
        await wrapper.vm.handleResponseError(mockServerError([], 403));
        expect(wrapper.vm.$toasted.global.error).toBeCalledWith('massAction.processing.error.noPermission');
      });

      it('should display a report error toast when the call returns another error', async () => {
        await wrapper.vm.handleResponseError(mockServerError([]));
        expect(wrapper.vm.$reportToasted).toBeCalled();
      });

      it('should display an error toast with the right message when the call returns a specific error', async () => {
        const error = mockServerError([{ code: 'error-message' }]);
        wrapper.vm.$te = jest.fn(() => true);
        await wrapper.vm.handleResponseError(error);
        expect(wrapper.vm.$toasted.global.error).toHaveBeenCalledWith('error-message');
      });
    });
  });
});
