/**
 * @group ui/components/system-management
 */
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockCombinedFeature } from '@/entities/feature';
import Component from '../FeatureWrapper.vue';

const localVue = createLocalVue();
const storage = mockStorage();
let wrapper;

const mockFeature = mockCombinedFeature().entity;

beforeEach(() => {
  jest.clearAllMocks();

  wrapper = shallowMount(Component, {
    localVue,
    propsData: {
      feature: mockFeature,
    },
    mocks: {
      $storage: storage,
    },
  });
});

describe('FeatureWrapper.vue', () => {
  describe('>> Template', () => {
    it('renders feature name', () => {
      const name = wrapper.findDataTest(`feature-name-${mockFeature.id}`);
      expect(name.text()).toBe(mockFeature.name);
    });

    it('renders feature status switch', () => {
      const featureSwitch = wrapper.findDataTest(`feature-switch-${mockFeature.id}`);
      expect(featureSwitch.exists()).toBeTruthy();
    });

    it('renders feature description', () => {
      const description = wrapper.findDataTest(`feature-description-${mockFeature.id}`);
      expect(description.text()).toBe(mockFeature.description.translation.en);
    });
  });

  describe('>> Methods', () => {
    describe('onChange', () => {
      it('calls storage to enable feature', async () => {
        await wrapper.vm.onChange(true);

        expect(storage.feature.actions.enableFeature).toHaveBeenCalledTimes(1);
        expect(storage.feature.actions.enableFeature).toHaveBeenCalledWith(mockFeature.id);
      });

      it('calls storage to disable feature', async () => {
        await wrapper.vm.onChange(false);

        expect(storage.feature.actions.disableFeature).toHaveBeenCalledTimes(1);
        expect(storage.feature.actions.disableFeature).toHaveBeenCalledWith(mockFeature.id);
      });

      it('roll back data if request failed', async () => {
        storage.feature.actions.enableFeature.mockReturnValueOnce(null);

        await wrapper.vm.onChange(true);

        expect(wrapper.vm.enabled).toBe(false);
      });
    });
  });
});
