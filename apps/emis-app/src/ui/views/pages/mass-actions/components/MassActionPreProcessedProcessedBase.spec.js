import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import {
  MassActionRunStatus, MassActionRunType, mockMassActionEntity, mockMassActionMetadata,
} from '@libs/entities-lib/mass-action';
import { mockCombinedUserAccount } from '@libs/entities-lib/user-account';
import MassActionTitleDescription from '@/ui/views/pages/mass-actions/components/MassActionTitleDescription.vue';
import MassActionDetailsTable from '@/ui/views/pages/mass-actions/components/MassActionDetailsTable.vue';
import MassActionEditTitleDescription from '@/ui/views/pages/mass-actions/components/MassActionEditTitleDescription.vue';
import helpers from '@/ui/helpers/helpers';
import { mockServerError } from '@libs/services-lib/http-client';
import { useMockMassActionStore } from '@/pinia/mass-action/mass-action.mock';

import { mockProvider } from '@/services/provider';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import Component from './MassActionPreProcessedProcessedBase.vue';

const localVue = createLocalVue();
const services = mockProvider();

const { pinia, massActionStore } = useMockMassActionStore();
useMockUserAccountStore(pinia);
let wrapper;

const doMount = ({ otherProps, otherData }, mountMode = false, runStatus = MassActionRunStatus.Processed) => {
  const options = {
    localVue,
    pinia,
    propsData: {
      massAction: mockMassActionEntity(),
      massActionMetadata: mockMassActionMetadata({}, { runStatus }),
      massActionStatus: MassActionRunStatus.PreProcessed,
      total: 100,
      successes: 50,
      failures: 50,
      failuresLabel: 'failuresLabel',
      successesLabel: 'successesLabel',
      totalLabel: 'totalLabel',
      ...otherProps,
    },
    data() {
      return {
        userAccount: mockCombinedUserAccount(),
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

describe('MassActionPreProcessedProcessedBase.vue', () => {
  describe('Template', () => {
    beforeEach(() => {
      doMount({ otherProps: null, otherData: null }, true);
    });

    describe('Template', () => {
      it('should render MassActionTitleDescription if editMode is false', () => {
        expect(wrapper.findComponent(MassActionTitleDescription).exists()).toBe(true);
      });

      it('should render MassActionTitleDescription if editMode is true', async () => {
        doMount({ otherProps: null, otherData: { editMode: true } }, true, null);

        expect(wrapper.findComponent(MassActionEditTitleDescription).exists()).toBe(true);
      });

      it('should render MassActionDetailsTable', () => {
        expect(wrapper.findComponent(MassActionDetailsTable).exists()).toBe(true);
      });

      it('should display the total items processed', () => {
        expect(wrapper.findDataTest('total').text()).toEqual(wrapper.vm.total.toString());
      });

      it('should display the projected amount if it is a financial assistance type mass action', () => {
        expect(wrapper.findDataTest('projectedAmount').text()).toEqual(wrapper.vm.$formatCurrency(wrapper.vm.projectedAmount.toString()));
      });

      it('should display the successes amount if it is a financial assistance type mass action', () => {
        expect(wrapper.findDataTest('successesAmount').text()).toEqual(wrapper.vm.$formatCurrency(wrapper.vm.successesAmount.toString()));
      });

      it('should display the successful items processed', () => {
        expect(wrapper.findDataTest('successes').text()).toEqual(wrapper.vm.successes.toString());
      });

      it('should display the failures items', () => {
        expect(wrapper.findDataTest('failures').text()).toEqual(wrapper.vm.failures.toString());
      });

      it('should display processButton if the props showProcessButton is true and status is different from Processed', () => {
        doMount({ otherProps: { showProcessButton: true }, otherData: null }, true, MassActionRunStatus.PreProcessed);
        expect(wrapper.findDataTest('processButton').exists()).toBe(true);
      });

      it('should display invalidDownloadButton if the props showInvalidDownloadButton is true and status is Processed ', () => {
        doMount({ otherProps: { showInvalidDownloadButton: true }, otherData: null }, true, MassActionRunStatus.Processed);
        expect(wrapper.findDataTest('invalidDownloadButton').exists()).toBe(true);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      doMount({ otherProps: null, otherData: null }, false);
    });

    describe('update', () => {
      it('should set editMode to false', async () => {
        await wrapper.setData({
          editMode: true,
        });
        wrapper.vm.update();
        expect(wrapper.vm.editMode).toBe(false);
      });

      it('should trigger update action update', async () => {
        const payload = { name: 'test', description: 'test' };
        await wrapper.vm.update(payload);
        expect(massActionStore.update).toHaveBeenLastCalledWith(wrapper.vm.massAction.id, payload);
      });

      it('should call handleResponseError when the call returns an error', async () => {
        massActionStore.update = jest.fn(() => Promise.reject(mockServerError([], 403)));
        const payload = { name: 'test', description: 'test' };
        wrapper.vm.handleResponseError = jest.fn();
        await wrapper.vm.update(payload);
        expect(wrapper.vm.handleResponseError).toBeCalledWith(mockServerError([], 403));
      });
    });

    describe('onProcess', () => {
      it('should display confirmation dialog', async () => {
        await wrapper.vm.onProcess();
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith(
          {
            title: 'massAction.confirm.processing.title',
            messages: 'massAction.confirm.processing.message',
          },
        );
      });

      it('should call process actions with proper params', async () => {
        await wrapper.vm.onProcess();
        expect(massActionStore.process).toHaveBeenCalledWith(wrapper.vm.massAction.id, MassActionRunType.Process);
      });

      it('should call handleResponseError when the call returns an error', async () => {
        massActionStore.process = jest.fn(() => Promise.reject(mockServerError([], 403)));
        wrapper.vm.handleResponseError = jest.fn();
        await wrapper.vm.onProcess();
        expect(wrapper.vm.handleResponseError).toBeCalledWith(mockServerError([], 403));
      });
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

    describe('update', () => {
      it('should trigger update action with correct params', async () => {
        const payload = { name: 'test', description: 'description' };
        await wrapper.vm.update(payload);
        expect(massActionStore.update).toHaveBeenCalledWith(wrapper.vm.massAction.id, payload);
      });
    });

    describe('downloadInvalid', () => {
      it('should call service getInvalidFile with proper params', async () => {
        await wrapper.vm.downloadInvalid();
        expect(wrapper.vm.$services.massActions.getInvalidFile)
          .toHaveBeenCalledWith({
            massActionId: wrapper.vm.massAction.id,
            runId: wrapper.vm.massActionMetadata.lastRun.runId,
            language: 'en',
          });
      });

      it('should call helpers downloadFile', async () => {
        wrapper.vm.$services.massActions.getInvalidFile = jest.fn(() => true);
        helpers.downloadFile = jest.fn();

        await wrapper.vm.downloadInvalid();

        expect(helpers.downloadFile).toBeCalled();
      });

      it('should call handleResponseError when the call returns an error', async () => {
        wrapper.vm.$services.massActions.getInvalidFile = jest.fn(() => Promise.reject(mockServerError([], 403)));
        wrapper.vm.handleResponseError = jest.fn();
        await wrapper.vm.downloadInvalid();
        expect(wrapper.vm.handleResponseError).toBeCalledWith(mockServerError([], 403));
      });
    });

    describe('downloadValid', () => {
      it('should call service getValidFile with proper params', async () => {
        await wrapper.vm.downloadValid();
        expect(wrapper.vm.$services.massActions.getValidFile)
          .toHaveBeenCalledWith({
            massActionId: wrapper.vm.massAction.id,
            runId: wrapper.vm.massActionMetadata.lastRun.runId,
            language: 'en',
            massActionType: wrapper.vm.massAction.type,
          });
      });

      it('should call helpers downloadFile', async () => {
        wrapper.vm.$services.massActions.getValidFile = jest.fn(() => true);
        helpers.downloadFile = jest.fn();

        await wrapper.vm.downloadValid();

        expect(helpers.downloadFile).toBeCalled();
      });
    });

    describe('handleResponseError', () => {
      it('should display an error toast when the call returns status 403', async () => {
        await wrapper.vm.handleResponseError(mockServerError([], 403));
        expect(wrapper.vm.$toasted.global.error).toBeCalledWith('massAction.processing.error.noPermission');
      });

      it('should display a report error toast when the call returns another error', async () => {
        wrapper.vm.$reportToasted = jest.fn();
        await wrapper.vm.handleResponseError(mockServerError([{}]));
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

  describe('Computed', () => {
    beforeEach(() => {
      doMount({ otherProps: null, otherData: null }, false, MassActionRunStatus.PreProcessed);
    });

    describe('hasErrors', () => {
      it('should return true in case of errors', () => {
        expect(wrapper.vm.hasErrors).toBe(true);
      });
    });

    describe('hasFailures', () => {
      it('should return true in case of failures', () => {
        expect(wrapper.vm.hasFailures).toBe(true);
      });
    });

    describe('isPreprocessed', () => {
      it('should return true if the last run status is preprocessed', () => {
        doMount({ otherProps: null, otherData: null }, true, MassActionRunStatus.PreProcessed);
        expect(wrapper.vm.isPreprocessed).toBe(true);
      });
    });

    describe('isFinancial', () => {
      it('should return true if the mass action type is financial assistance', () => {
        expect(wrapper.vm.isFinancial).toBe(true);
      });
    });
  });
});
