import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockFeatures } from '@/entities/tenantSettings';
import Component from '../FeatureTable.vue';
import FeatureWrapper from '../FeatureWrapper.vue';

const localVue = createLocalVue();
let wrapper;

beforeEach(() => {
  jest.clearAllMocks();

  wrapper = shallowMount(Component, {
    localVue,
    propsData: {
      features: mockFeatures(),
    },
  });
});

describe('FeatureTable.vue', () => {
  describe('>> Template', () => {
    it('renders all features', () => {
      const children = wrapper.findAllComponents(FeatureWrapper);
      expect(children).toHaveLength(mockFeatures().length);
    });
  });
});
