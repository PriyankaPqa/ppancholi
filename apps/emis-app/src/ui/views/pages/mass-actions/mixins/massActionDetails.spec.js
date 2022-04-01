import { mockStorage } from '@libs/registration-lib/store/storage';

import { createLocalVue, shallowMount } from '@/test/testSetup';
import {
  MassActionRunStatus, mockCombinedMassAction, mockMassActionRun, mockMassActionRunMetadata,
} from '@/entities/mass-action';
import massActionDetails from './massActionDetails';

const Component = {
  render() {},
  mixins: [massActionDetails],
};

const localVue = createLocalVue();
const storage = mockStorage();
let wrapper;

jest.mock('@libs/core-lib/plugins/applicationInsights/applicationInsights');

describe('massActions', () => {
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

    describe('lastRunEntity', () => {
      it('should return the most recent run of the entity', () => {
        wrapper.vm.$storage.massAction.getters.get = jest.fn(() => mockCombinedMassAction());
        const lastRun = mockCombinedMassAction().entity.runs[1];
        expect(wrapper.vm.lastRunEntity).toEqual(lastRun);
      });
    });

    describe('lastRunMetadata', () => {
      it('should return the metadata run corresponding to the entity one', () => {
        wrapper.vm.$storage.massAction.getters.get = jest.fn(() => mockCombinedMassAction());
        const lastRun = mockCombinedMassAction().metadata.runs[0];
        expect(wrapper.vm.lastRunMetadata).toEqual(lastRun);
      });
    });

    describe('preProcessing', () => {
      it('should return true if lastRun is pre processing', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.PreProcessing }),
          },
        });
        expect(wrapper.vm.preProcessing).toBe(true);
      });

      it('should return false otherwise', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.Processed }),
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
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.Processing }),
          },
        });
        expect(wrapper.vm.processing).toBe(true);
      });

      it('should return false otherwise', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.Processed }),
          },
        });
        expect(wrapper.vm.processing).toBe(false);
      });
    });

    describe('preProcessed', () => {
      it('should return true if lastRun is pre-processed', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.PreProcessed }),
            lastRunMetadata: () => mockMassActionRunMetadata(),
          },
        });
        expect(wrapper.vm.preProcessed).toBe(true);
      });

      it('should return false otherwise', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.Processed }),
            lastRunMetadata: () => mockMassActionRunMetadata(),
          },
        });
        expect(wrapper.vm.preProcessed).toBe(false);
      });
    });

    describe('processed', () => {
      it('should return true if lastRun is processed', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.Processed }),
            lastRunMetadata: () => mockMassActionRunMetadata(),
          },
        });
        expect(wrapper.vm.processed).toBe(true);
      });

      it('should return false otherwise', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.PreProcessing }),
            lastRunMetadata: () => mockMassActionRunMetadata(),
          },
        });
        expect(wrapper.vm.processed).toBe(false);
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
      });
    });

    describe('Created', () => {
      it('should fetch the mass action if not already in the store', async () => {
        wrapper.vm.$storage.massAction.actions.fetch = jest.fn();

        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.$storage.massAction.actions.fetch).toHaveBeenCalledWith(wrapper.vm.massActionId);
      });
    });
  });
});
