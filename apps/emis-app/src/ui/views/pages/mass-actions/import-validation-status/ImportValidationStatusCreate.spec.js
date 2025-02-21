import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import routes from '@/constants/routes';
import { MassActionMode, mockMassActionEntity } from '@libs/entities-lib/mass-action';

import Component from './ImportValidationStatusCreate.vue';

const localVue = createLocalVue();

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

      it('should be linked the correct props upload-url', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('uploadUrl')).toBe('case-file/mass-actions/validate-impact-status');
      });

      it('should be linked the correct props formData', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('formData')).toBe(wrapper.vm.formData);
      });

      it('should have the proper mode', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('mode')).toBe(MassActionMode.File);
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

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,

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

    describe('onSuccess', () => {
      it('should call goToDetail', () => {
        wrapper.vm.goToDetail = jest.fn();
        wrapper.vm.onSuccess(mockMassActionEntity());
        expect(wrapper.vm.goToDetail).toBeCalledWith(mockMassActionEntity().id);
      });
    });

    describe('onUploadStart', () => {
      it('should call upload child method', () => {
        wrapper.vm.$refs.base.upload = jest.fn();
        wrapper.vm.onUploadStart();
        expect(wrapper.vm.$refs.base.upload).toBeCalled();
      });
    });
  });
});
