import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import routes from '@/constants/routes';
import { MassActionMode, MassActionRunType, mockMassActionEntity } from '@libs/entities-lib/mass-action';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

import Component from './ImportUsersCreate.vue';

const localVue = createLocalVue();

describe('ImportUsersCreate.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
      });
    });

    describe('MassActionBaseCreate', () => {
      it('should be rendered', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).exists()).toBe(true);
      });

      it('should be linked the correct props url', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('uploadUrl')).toBe('case-file/mass-actions/import-users');
      });

      it('should have the proper mode', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('mode')).toBe(MassActionMode.File);
      });

      it('should have the proper run type', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('runType')).toBe(MassActionRunType.PreProcess);
      });

      it('should be linked the correct props formData', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('formData')).toBe(wrapper.vm.formData);
      });

      it('should call onSuccess when upload is successful', () => {
        const component = wrapper.findComponent(MassActionBaseCreate);
        wrapper.vm.onSuccess = jest.fn();
        component.vm.$emit('upload:success');
        expect(wrapper.vm.onSuccess).toBeCalled();
      });

      it('should call onUploadStart when upload is starting', () => {
        const component = wrapper.findComponent(MassActionBaseCreate);
        wrapper.vm.onUploadStart = jest.fn();
        component.vm.$emit('upload:start');
        expect(wrapper.vm.onUploadStart).toBeCalled();
      });
    });
  });

  describe('Computed', () => {
    describe('allowedExtensions', () => {
      it('should be xlsx when feature flag is on', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          featureList: [FeatureKeys.UseIdentityServer],
        });
        expect(wrapper.vm.allowedExtensions).toEqual(['xlsx']);
      });

      it('should be csv when feature flag is off', () => {
        wrapper = shallowMount(Component, {
          localVue,
        });
        expect(wrapper.vm.allowedExtensions).toEqual(['csv']);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,

      });
    });

    describe('back', () => {
      it('should redirect to home page', () => {
        wrapper.vm.back();
        expect(wrapper.vm.$router.replace).toHaveBeenLastCalledWith({ name: routes.massActions.importUsers.home.name });
      });
    });

    describe('goToDetail', () => {
      it('should redirect to detail page', () => {
        wrapper.vm.goToDetail('1');
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith(
          { name: routes.massActions.importUsers.details.name, params: { id: '1' } },
        );
      });
    });

    describe('onSuccess', () => {
      it('should call goToDetail', () => {
        wrapper.vm.goToDetail = jest.fn();
        wrapper.vm.onSuccess(mockMassActionEntity());
        expect(wrapper.vm.goToDetail).toBeCalledWith(mockMassActionEntity().id);
      });
    });
  });
});
