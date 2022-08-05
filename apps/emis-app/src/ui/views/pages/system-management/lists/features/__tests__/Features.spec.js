import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import routes from '@/constants/routes';
import { FeatureType } from '@libs/entities-lib/tenantSettings';
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
    it('renders temporary features and permanent features', () => {
      const temporaryFeaturesComponent = wrapper.findDataTest('temporary-features');
      expect(temporaryFeaturesComponent.exists()).toBeTruthy();

      const permanentFeaturesComponent = wrapper.findDataTest('permanent-features');
      expect(permanentFeaturesComponent.exists()).toBeTruthy();
    });
  });

  describe('>> Computed', () => {
    describe('temporaryFeatures', () => {
      it('returns correct value', () => {
        expect(wrapper.vm.temporaryFeatures).toEqual(
          storage.tenantSettings.getters.currentTenantSettings().features.filter((f) => f.type === FeatureType.Temporary),
        );
      });
    });

    describe('permanentFeatures', () => {
      it('returns correct value', () => {
        expect(wrapper.vm.permanentFeatures).toEqual(
          storage.tenantSettings.getters.currentTenantSettings().features.filter((f) => f.type === FeatureType.Permanent),
        );
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
