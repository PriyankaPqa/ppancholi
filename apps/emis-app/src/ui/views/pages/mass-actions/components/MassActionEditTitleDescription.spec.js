import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import { mockCombinedMassAction } from '@/entities/mass-action';
import { MAX_LENGTH_LG, MAX_LENGTH_MD } from '@/constants/validations';
import Component from './MassActionEditTitleDescription.vue';

const localVue = createLocalVue();

describe('MassActionEditTitleDescription.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
        },
      });
    });

    it('should render name input', () => {
      const component = wrapper.findDataTest('name');
      expect(component.exists()).toBe(true);
    });

    it('should description input', () => {
      const component = wrapper.findDataTest('description');
      expect(component.exists()).toBe(true);
    });

    it('should description cancel button', () => {
      const component = wrapper.findDataTest('cancel');
      expect(component.exists()).toBe(true);
    });

    it('should description save button', () => {
      const component = wrapper.findDataTest('save');
      expect(component.exists()).toBe(true);
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
        },
      });
    });

    describe('Rules', () => {
      it('should have name rule', () => {
        expect(wrapper.vm.rules.name).toEqual({
          required: true,
          max: MAX_LENGTH_MD,
        });
      });

      it('should have description rule', () => {
        expect(wrapper.vm.rules.description).toEqual({
          max: MAX_LENGTH_LG,
        });
      });
    });

    describe('hasChanged', () => {
      it('should return true if data has been edited', async () => {
        await wrapper.setData({
          name: 'hi',
        });
        expect(wrapper.vm.hasChanged).toEqual(true);
      });
    });
  });
});
