import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import { MAX_LENGTH_LG, MAX_LENGTH_MD } from '@/constants/validations';
import routes from '@/constants/routes';
import { mockMassActionEntity } from '@/entities/mass-action';
import { mockStorage } from '@/store/storage';
import Component from './ImportValidationStatusCreate.vue';

const localVue = createLocalVue();

const storage = mockStorage();

describe('ImportValidationStatusCreate.vue', () => {
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
        expect(wrapper.findComponent(MassActionBaseCreate).props('url')).toBe('case-file/mass-actions/validate-impact-status');
      });

      it('should be linked the correct props formData', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('formData')).toBe(wrapper.vm.formData);
      });

      it('should call prepareFormData when upload start', () => {
        const component = wrapper.findComponent(MassActionBaseCreate);
        wrapper.vm.prepareFormData = jest.fn();
        component.vm.$emit('upload:start');
        expect(wrapper.vm.prepareFormData).toBeCalled();
      });

      it('should call onSuccess when upload is successful', () => {
        const component = wrapper.findComponent(MassActionBaseCreate);
        wrapper.vm.onSuccess = jest.fn();
        component.vm.$emit('upload:success');
        expect(wrapper.vm.onSuccess).toBeCalled();
      });
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

    describe('goToDetail', () => {
      it('should redirect to detail page', () => {
        wrapper.vm.goToDetail('1');
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith(
          { name: routes.massActions.importValidationStatus.details.name, params: { id: '1' } },
        );
      });
    });

    describe('prepareFormData', () => {
      it('should append the name to the formData', () => {
        wrapper.vm.formData.append = jest.fn();
        wrapper.vm.prepareFormData();
        expect(wrapper.vm.formData.append).toHaveBeenCalledWith('name', wrapper.vm.name);
      });

      it('should append the description to the formData', () => {
        wrapper.vm.formData.append = jest.fn();
        wrapper.vm.prepareFormData();
        expect(wrapper.vm.formData.append).toHaveBeenLastCalledWith('description', wrapper.vm.description);
      });
    });

    describe('onSuccess', () => {
      it('should add the new mass action to the store', () => {
        wrapper.vm.onSuccess(mockMassActionEntity());
        expect(wrapper.vm.$storage.massAction.mutations.setEntity).toHaveBeenLastCalledWith(mockMassActionEntity());
      });

      it('should call goToDetail', () => {
        wrapper.vm.goToDetail = jest.fn();
        wrapper.vm.onSuccess(mockMassActionEntity());
        expect(wrapper.vm.goToDetail).toBeCalled();
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
      });
    });
    describe('rules', () => {
      it('should have proper rules for name', () => {
        expect(wrapper.vm.rules.name).toEqual({
          required: true,
          max: MAX_LENGTH_MD,
        });
      });

      it('should have proper rules for description', () => {
        expect(wrapper.vm.rules.description).toEqual({
          max: MAX_LENGTH_LG,
        });
      });
    });
  });
});
