import { createLocalVue, mount, shallowMount } from '@/test/testSetup';

import Component from './Individual.vue';

const localVue = createLocalVue();

describe('Individual.vue', () => {
  let wrapper;
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        stubs: ['i18n'],
      });
    });

    describe('Event handlers', () => {
      test('Click back button triggers method', async () => {
        wrapper.vm.back = jest.fn();

        const btn = wrapper.findDataTest('backButton');
        await btn.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.back).toHaveBeenCalledTimes(1);
      });

      test('Click next button triggers method', async () => {
        wrapper.vm.next = jest.fn();

        const btn = wrapper.findDataTest('nextButton');
        await btn.trigger('click');

        expect(wrapper.vm.next).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
      });
    });

    describe('submitLoading', () => {
      it('returns proper data', () => {
        expect(wrapper.vm.submitLoading).toBe(wrapper.vm.$store.state.registration.submitLoading);
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
      test('back calls jump', async () => {
        wrapper.vm.$storage.registration.getters.currentTabIndex = jest.fn(() => 2);
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.back();

        expect(wrapper.vm.jump).toHaveBeenCalledWith(1);
      });
    });
  });
});
