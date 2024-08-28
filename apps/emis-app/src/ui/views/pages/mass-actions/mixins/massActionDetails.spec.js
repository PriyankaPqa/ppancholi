import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import {
  MassActionRunStatus, mockMassActionEntity, mockMassActionMetadata, mockMassActionRun, mockMassActionRunMetadata,
} from '@libs/entities-lib/mass-action';
import { useMockMassActionStore } from '@/pinia/mass-action/mass-action.mock';
import { GlobalHandler } from '@libs/services-lib/http-client';
import massActionDetails from './massActionDetails';

const Component = {
  render() {},
  mixins: [massActionDetails],
};

const localVue = createLocalVue();
const { pinia, massActionStore, massActionMetadataStore } = useMockMassActionStore();
let wrapper;

jest.mock('@libs/shared-lib/plugins/applicationInsights/applicationInsights');

describe('massActions', () => {
  const doMount = (shallow, {
    otherComputed, otherOptions,
  }) => {
    const options = {
      localVue,
      pinia,
      computed: {
        ...otherComputed,
      },
      ...otherOptions,
    };
    if (shallow === true) {
      wrapper = shallowMount(Component, options);
    } else {
      wrapper = mount(Component, options);
    }
  };
  describe('Computed', () => {
    beforeEach(() => {
      doMount(true, {
        otherComputed: {
          massAction: () => mockMassActionEntity(),
          massActionMetadata: () => mockMassActionMetadata(),
        },
        otherOptions: null,
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

    describe('lastRunEntity', () => {
      it('should return the most recent run of the entity', async () => {
        const lastRun = mockMassActionEntity().runs[1];
        expect(wrapper.vm.lastRunEntity).toEqual(lastRun);
      });
    });

    describe('lastRunMetadata', () => {
      it('should return the metadata run corresponding to the entity one', async () => {
        const lastRun = mockMassActionMetadata().runs[0];
        expect(wrapper.vm.lastRunMetadata).toEqual(lastRun);
      });
    });

    describe('preProcessing', () => {
      it('should return true if lastRun is pre processing', () => {
        doMount(true, {
          otherComputed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.PreProcessing }),
          },
          otherOptions: null,
        });
        expect(wrapper.vm.preProcessing).toBe(true);
      });

      it('should return false otherwise', () => {
        doMount(true, {
          otherComputed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.Processed }),
          },
          otherOptions: null,
        });
        expect(wrapper.vm.preProcessing).toBe(false);
      });
    });

    describe('processing', () => {
      it('should return true if lastRun is processing', () => {
        doMount(true, {
          otherComputed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.Processing }),
          },
          otherOptions: null,
        });
        expect(wrapper.vm.processing).toBe(true);
      });

      it('should return false otherwise', () => {
        doMount(true, {
          otherComputed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.Processed }),
          },
          otherOptions: null,
        });
        expect(wrapper.vm.processing).toBe(false);
      });
    });

    describe('preProcessed', () => {
      it('should return true if lastRun is pre-processed', () => {
        doMount(true, {
          otherComputed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.PreProcessed }),
            lastRunMetadata: () => mockMassActionRunMetadata(),
          },
          otherOptions: null,
        });
        expect(wrapper.vm.preProcessed).toBe(true);
      });

      it('should return false otherwise', () => {
        doMount(true, {
          otherComputed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.Processed }),
            lastRunMetadata: () => mockMassActionRunMetadata(),
          },
          otherOptions: null,
        });
        expect(wrapper.vm.preProcessed).toBe(false);
      });
    });

    describe('processed', () => {
      it('should return true if lastRun is processed', () => {
        doMount(true, {
          otherComputed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.Processed }),
            lastRunMetadata: () => mockMassActionRunMetadata(),
          },
          otherOptions: null,
        });
        expect(wrapper.vm.processed).toBe(true);
      });

      it('should return false otherwise', () => {
        doMount(true, {
          otherData: null,
          otherComputed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.PreProcessing }),
            lastRunMetadata: () => mockMassActionRunMetadata(),
          },
          otherOptions: null,
        });
        expect(wrapper.vm.processed).toBe(false);
      });
    });

    describe('failedPreProcessing', () => {
      it('should return true if lastRun is failed pre-processing', () => {
        doMount(true, {
          otherComputed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.FailedPreProcessing }),
            lastRunMetadata: () => mockMassActionRunMetadata(),
          },
          otherOptions: null,
        });
        expect(wrapper.vm.failedPreProcessing).toBe(true);
      });

      it('should return false otherwise', () => {
        doMount(true, {
          otherData: null,
          otherComputed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.PreProcessing }),
            lastRunMetadata: () => mockMassActionRunMetadata(),
          },
          otherOptions: null,
        });
        expect(wrapper.vm.failedPreProcessing).toBe(false);
      });
    });

    describe('failedProcessing', () => {
      it('should return true if lastRun is failed processing', () => {
        doMount(true, {
          otherComputed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.FailedProcessing }),
            lastRunMetadata: () => mockMassActionRunMetadata(),
          },
          otherOptions: null,
        });
        expect(wrapper.vm.failedProcessing).toBe(true);
      });

      it('should return false otherwise', () => {
        doMount(true, {
          otherData: null,
          otherComputed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.Processing }),
            lastRunMetadata: () => mockMassActionRunMetadata(),
          },
          otherOptions: null,
        });
        expect(wrapper.vm.failedProcessing).toBe(false);
      });
    });
  });

  describe('Lifecycle', () => {
    beforeEach(() => {
      doMount(true, {
        otherComputed: {
          massAction: () => {},
        },
        otherOptions: null,
      });
    });
    describe('Created', () => {
      it('should fetch the mass action if not already in the store', async () => {
        massActionStore.fetch = jest.fn();
        massActionMetadataStore.fetch = jest.fn();

        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(massActionStore.fetch).toHaveBeenCalledWith(wrapper.vm.massActionId);
        expect(massActionMetadataStore.fetch).toHaveBeenCalledWith(wrapper.vm.massActionId, GlobalHandler.Partial);
      });

      it('should not fetch the mass action if already in the store', async () => {
        doMount(true, {
          otherComputed: {
            massAction: () => mockMassActionRunMetadata(),
          },
          otherOptions: null,
        });
        massActionStore.fetch = jest.fn();
        massActionMetadataStore.fetch = jest.fn();

        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(massActionStore.fetch).not.toHaveBeenCalled();
        expect(massActionMetadataStore.fetch).not.toHaveBeenCalled();
      });
    });
  });
});
