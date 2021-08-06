import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import routes from '@/constants/routes';
import {
  massActionRun, MassActionRunStatus, mockCombinedMassAction,
} from '@/entities/mass-action';
import { mockStorage } from '@/store/storage';
import ImportValidationStatusPreProcessing
  from '@/ui/views/pages/mass-actions/import-validation-status/components/ImportValidationStatusPreProcessing.vue';
import ImportValidationStatusProcessing from '@/ui/views/pages/mass-actions/import-validation-status/components/ImportValidationStatusProcessing.vue';
import Component from './ImportValidationStatusDetails.vue';

const localVue = createLocalVue();

const storage = mockStorage();

describe('ImportValidationStatusDetails.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('should render processing component if processing', () => {
      wrapper = mount(Component, {
        localVue,
        computed: {
          processing: () => true,
          massAction: () => mockCombinedMassAction(),
        },
      });
      expect(wrapper.findComponent(ImportValidationStatusProcessing).exists()).toBe(true);
    });

    it('should render pre-processing component if pre-processing', () => {
      wrapper = mount(Component, {
        localVue,
        computed: {
          preProcessing: () => true,
          massAction: () => mockCombinedMassAction(),
        },
      });
      expect(wrapper.findComponent(ImportValidationStatusPreProcessing).exists()).toBe(true);
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('back', () => {
      it('should redirect to home page', () => {
        wrapper.vm.back();
        expect(wrapper.vm.$router.replace).toHaveBeenLastCalledWith({ name: routes.massActions.importValidationStatus.home.name });
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('massActionId', () => {
      it('should be the id from the route', () => {
        wrapper.vm.$route.params = {
          id: '1',
        };
        expect(wrapper.vm.massActionId).toEqual('1');
      });
    });

    describe('massAction', () => {
      it('should be linked to massAction get', () => {
        wrapper.vm.$storage.massAction.getters.get = jest.fn(() => mockCombinedMassAction());
        expect(wrapper.vm.massAction).toEqual(mockCombinedMassAction());
      });
    });

    describe('lastRun', () => {
      it('should return the most recent run', () => {
        wrapper.vm.$storage.massAction.getters.get = jest.fn(() => mockCombinedMassAction());
        const lastRun = mockCombinedMassAction().entity.runs[1];
        expect(wrapper.vm.lastRun).toEqual(lastRun);
      });
    });

    describe('preProcessing', () => {
      it('should return true if lastRun is pre processing', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            lastRun: () => massActionRun({ runStatus: MassActionRunStatus.PreProcessing }),
          },
        });
        expect(wrapper.vm.preProcessing).toBe(true);
      });

      it('should return false otherwise', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            lastRun: () => massActionRun({ runStatus: MassActionRunStatus.Processed }),
          },
        });
        expect(wrapper.vm.preProcessing).toBe(false);
      });
    });

    describe('processing', () => {
      it('should return true if lastRun is processing', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            lastRun: () => massActionRun({ runStatus: MassActionRunStatus.Processing }),
          },
        });
        expect(wrapper.vm.processing).toBe(true);
      });

      it('should return false otherwise', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            lastRun: () => massActionRun({ runStatus: MassActionRunStatus.Processed }),
          },
        });
        expect(wrapper.vm.processing).toBe(false);
      });
    });

    describe('title', () => {
      it('should return proper title if processing', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            lastRun: () => massActionRun({ runStatus: MassActionRunStatus.Processing }),
          },
        });
        expect(wrapper.vm.title).toBe('massActions.impactValidation.status.processing.title');
      });

      it('should return proper title if pre-processing', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            lastRun: () => massActionRun({ runStatus: MassActionRunStatus.PreProcessing }),
          },
        });
        expect(wrapper.vm.title).toBe('massActions.impactValidation.status.preprocessing.title');
      });
    });
  });

  describe('Lifecycle', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        computed: {
          massAction: () => ({ entity: {} }),
        },
        mocks: {
          $storage: storage,
        },
      });
    });
    describe('Created', () => {
      it('should fetch the mass action if not already in the store', async () => {
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.$storage.massAction.actions.fetch).toHaveBeenCalledWith(wrapper.vm.massActionId);
      });
    });
  });
});
