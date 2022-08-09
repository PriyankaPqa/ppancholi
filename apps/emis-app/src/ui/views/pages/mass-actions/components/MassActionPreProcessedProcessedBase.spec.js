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
import { mockStorage } from '@/storage';
import helpers from '@/ui/helpers/helpers';
import Component from './MassActionPreProcessedProcessedBase.vue';

const localVue = createLocalVue();
const storage = mockStorage();
let wrapper;

const doMount = (mountMode = false, runStatus = MassActionRunStatus.Processed) => {
  const options = {
    localVue,
    propsData: {
      massAction: {
        entity: mockMassActionEntity(),
        metadata: mockMassActionMetadata({}, { runStatus }),
      },
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
    mocks: {
      $storage: storage,
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
      doMount(true);
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

      it('should display processButton if the props showProcessButton is true and status is different from Processed', async () => {
        doMount(true, MassActionRunStatus.PreProcessed);
        await wrapper.setProps({
          showProcessButton: true,
        });
        expect(wrapper.findDataTest('processButton').exists()).toBe(true);
      });

      it('should display invalidDownloadButton if the props showInvalidDownloadButton is true and status is Processed ', async () => {
        await wrapper.setProps({
          showInvalidDownloadButton: true,
        });
        expect(wrapper.findDataTest('invalidDownloadButton').exists()).toBe(true);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      doMount(false);
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
        expect(wrapper.vm.$storage.massAction.actions.update).toHaveBeenLastCalledWith(wrapper.vm.massAction.entity.id, payload);
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
        expect(wrapper.vm.$storage.massAction.actions.process).toHaveBeenCalledWith(wrapper.vm.massAction.entity.id, MassActionRunType.Process);
      });
    });

    describe('onDelete', () => {
      it('should display confirmation dialog', async () => {
        await wrapper.vm.onDelete();
        expect(wrapper.vm.$confirm).toBeCalled();
      });

      it('should trigger deactivate action with correct params', async () => {
        await wrapper.vm.onDelete();
        expect(wrapper.vm.$storage.massAction.actions.deactivate).toHaveBeenCalledWith(wrapper.vm.massAction.entity.id);
      });

      it('should emit delete:success to home page', async () => {
        await wrapper.vm.onDelete();
        expect(wrapper.emitted('delete:success')).toBeTruthy();
      });
    });

    describe('update', () => {
      it('should trigger update action with correct params', async () => {
        const payload = { name: 'test', description: 'description' };
        await wrapper.vm.update(payload);
        expect(wrapper.vm.$storage.massAction.actions.update).toHaveBeenCalledWith(wrapper.vm.massAction.entity.id, payload);
      });
    });

    describe('downloadInvalid', () => {
      it('should call service getInvalidFile with proper params', async () => {
        await wrapper.vm.downloadInvalid();
        expect(wrapper.vm.$services.massActions.getInvalidFile)
          .toHaveBeenCalledWith({
            massActionId: wrapper.vm.massAction.entity.id,
            runId: wrapper.vm.massAction.metadata.lastRun.runId,
            language: 'en',
          });
      });

      it('should call helpers downloadFile', async () => {
        wrapper.vm.$services.massActions.getInvalidFile = jest.fn(() => true);
        helpers.downloadFile = jest.fn();

        await wrapper.vm.downloadInvalid();

        expect(helpers.downloadFile).toBeCalled();
      });
    });

    describe('downloadValid', () => {
      it('should call service getValidFile with proper params', async () => {
        await wrapper.vm.downloadValid();
        expect(wrapper.vm.$services.massActions.getValidFile)
          .toHaveBeenCalledWith({
            massActionId: wrapper.vm.massAction.entity.id,
            runId: wrapper.vm.massAction.metadata.lastRun.runId,
            language: 'en',
          });
      });

      it('should call helpers downloadFile', async () => {
        wrapper.vm.$services.massActions.getValidFile = jest.fn(() => true);
        helpers.downloadFile = jest.fn();

        await wrapper.vm.downloadValid();

        expect(helpers.downloadFile).toBeCalled();
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      doMount(false, MassActionRunStatus.PreProcessed);
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
