/**
 * @group ui/components/system-management
 */
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import routes from '@/constants/routes';
import FeatureWrapper from '../FeatureWrapper.vue';
import { mockCombinedFeatures } from '@/entities/feature';
import Component from '../Features.vue';

const localVue = createLocalVue();
const storage = mockStorage();
let wrapper;

beforeEach(() => {
  jest.clearAllMocks();

  wrapper = shallowMount(Component, {
    localVue,
    mocks: {
      $storage: storage,
    },
  });
});

describe('Features.vue', () => {
  describe('>> Template', () => {
    it('renders child components', () => {
      const children = wrapper.findAllComponents(FeatureWrapper);
      expect(children).toHaveLength(mockCombinedFeatures().length);
    });
  });

  describe('>> Computed', () => {
    describe('features', () => {
      it('returns correct value', () => {
        expect(wrapper.vm.features).toEqual(storage.feature.getters.getAll().map((f) => f.entity));
      });
    });
  });

  describe('>> Methods', () => {
    describe('back', () => {
      it('redirects', () => {
        wrapper.vm.back();

        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.systemManagement.home.name,
        });
      });
    });
  });
});
