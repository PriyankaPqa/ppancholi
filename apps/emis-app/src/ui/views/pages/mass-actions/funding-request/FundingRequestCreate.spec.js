import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import routes from '@/constants/routes';
import { MassActionMode, MassActionType, mockMassActionEntity } from '@libs/entities-lib/mass-action';
import { useMockMassActionStore } from '@/pinia/mass-action/mass-action.mock';

import Component from './FundingRequestCreate.vue';

const localVue = createLocalVue();

const { pinia, massActionStore } = useMockMassActionStore();

describe('FundingRequestCreate.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        pinia,
      });
    });

    describe('MassActionBaseCreate', () => {
      it('should be rendered', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).exists()).toBe(true);
      });

      it('should have the proper mode', () => {
        expect(wrapper.findComponent(MassActionBaseCreate).props('mode')).toBe(MassActionMode.NoAttachment);
      });

      it('should call onPost when pre-processing is starting', () => {
        const component = wrapper.findComponent(MassActionBaseCreate);
        wrapper.vm.onPost = jest.fn();
        component.vm.$emit('post');
        expect(wrapper.vm.onPost).toBeCalled();
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,

      });
    });

    describe('back', () => {
      it('should redirect to home page', () => {
        wrapper.vm.back();
        expect(wrapper.vm.$router.replace).toHaveBeenLastCalledWith({ name: routes.massActions.fundingRequest.home.name });
      });
    });

    describe('goToDetail', () => {
      it('should redirect to detail page', () => {
        wrapper.vm.goToDetail('1');
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith(
          { name: routes.massActions.fundingRequest.details.name, params: { id: '1' } },
        );
      });
    });

    describe('onPost', () => {
      it('should call create action with proper parameters', async () => {
        const name = 'Mass action';
        const description = '';
        await wrapper.vm.onPost({ name, description });

        expect(massActionStore.create).toHaveBeenCalledWith(MassActionType.GenerateFundingRequest, { name, description });
      });

      it('should call goToDetail method with proper parameters', async () => {
        const name = 'Mass action';
        const description = '';

        wrapper.vm.goToDetail = jest.fn();

        await wrapper.vm.onPost({ name, description });

        expect(wrapper.vm.goToDetail).toHaveBeenLastCalledWith(mockMassActionEntity().id);
      });
    });
  });
});
