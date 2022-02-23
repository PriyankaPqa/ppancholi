/**
 * @group ui/components/mass-action
 */

import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import {
  MassActionRunStatus, mockCombinedMassAction, MassActionType,
} from '@/entities/mass-action';
import { mockStorage } from '@/store/storage';

import Component from './MassActionBaseDetails.vue';
import MassActionPreProcessingBase from '@/ui/views/pages/mass-actions/components/MassActionPreProcessingBase.vue';
import MassActionProcessingBase from '@/ui/views/pages/mass-actions/components/MassActionProcessingBase.vue';
import MassActionPreProcessedProcessedBase from '@/ui/views/pages/mass-actions/components/MassActionPreProcessedProcessedBase.vue';

const localVue = createLocalVue();

const storage = mockStorage();

let wrapper;

const doMount = (fullMount = false, {
  processing, preProcessing, preProcessed, processed, showValidDownload = false,
}) => {
  const options = {
    localVue,
    computed: {
      massAction: () => mockCombinedMassAction(),
      processing: () => processing,
      preProcessing: () => preProcessing,
      preProcessed: () => preProcessed,
      processed: () => processed,

    },
    propsData: {
      massActionType: MassActionType.ImportValidationOfImpactStatus,
      preProcessingTitle: 'preProcessingTitle',
      processingTitle: 'processingTitle',
      detailsTitle: 'detailsTitle',
      backRouteName: 'backRouteName',
      showValidDownload,
    },
    mocks: {
      $storage: storage,
    },
  };
  if (fullMount) {
    wrapper = mount(Component, options);
  } else {
    wrapper = shallowMount(Component, options);
  }
};

describe('MassActionBaseDetails.vue', () => {
  describe('Template', () => {
    describe('Processing', () => {
      it('should render processing component if processing', () => {
        doMount(true, {
          processing: true, preProcessing: false, preProcessed: false, processed: false,
        });
        expect(wrapper.findComponent(MassActionProcessingBase).exists()).toBe(true);
      });
    });

    describe('Pre-processing', () => {
      it('should render pre-processing component if pre-processing', () => {
        doMount(true, {
          processing: false, preProcessing: true, preProcessed: false, processed: false,
        });
        expect(wrapper.findComponent(MassActionPreProcessingBase).exists()).toBe(true);
      });
    });

    describe('Pre-processed', () => {
      it('should render pre-processed component if pre-processed', () => {
        doMount(true, {
          processing: false, preProcessing: false, preProcessed: true, processed: false,
        });
        const component = wrapper.findComponent(MassActionPreProcessedProcessedBase);
        expect(component.exists()).toBe(true);
        expect(component.props('massActionStatus')).toBe(MassActionRunStatus.PreProcessed);
      });
    });

    describe('Processed', () => {
      it('should render processed component if processed', () => {
        doMount(true, {
          processing: false, preProcessing: false, preProcessed: false, processed: true,
        });
        const component = wrapper.findComponent(MassActionPreProcessedProcessedBase);
        expect(component.exists()).toBe(true);
        expect(component.props('massActionStatus')).toBe(MassActionRunStatus.Processed);
      });

      it('should link show-valid-download-button', () => {
        doMount(true, {
          processing: false, preProcessing: false, preProcessed: false, processed: true, showValidDownload: true,
        });
        const component = wrapper.findComponent(MassActionPreProcessedProcessedBase);
        expect(component.props('showValidDownloadButton')).toBe(true);
      });
    });
  });

  describe('Methods', () => {
    describe('back', () => {
      it('should redirect to home page', () => {
        doMount(false, {
          processing: true, preProcessing: false, preProcessed: false, processed: false,
        });
        wrapper.vm.back();
        expect(wrapper.vm.$router.replace).toHaveBeenLastCalledWith({ name: 'backRouteName' });
      });
    });
  });

  describe('Computed', () => {
    describe('title', () => {
      it('should return proper title if processing', () => {
        doMount(false, {
          processing: true, preProcessing: false, preProcessed: false, processed: false,
        });
        expect(wrapper.vm.title).toBe('processingTitle');
      });

      it('should return proper title if pre-processing', () => {
        doMount(false, {
          processing: false, preProcessing: true, preProcessed: false, processed: false,
        });
        expect(wrapper.vm.title).toBe('preProcessingTitle');
      });

      it('should return proper title otherwise', () => {
        doMount(false, {
          processing: false, preProcessing: false, preProcessed: false, processed: true,
        });
        expect(wrapper.vm.title).toBe('detailsTitle');
      });
    });
  });
});
