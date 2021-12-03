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

    describe('goNext', () => {
      it('should called execute from recaptcha if on review stage ', async () => {
        wrapper.vm.$refs.recaptchaSubmit = {};
        wrapper.vm.$refs.recaptchaSubmit.execute = jest.fn();
        wrapper.vm.$storage.registration.getters.currentTab = jest.fn(() => ({
          id: 'review',
        }));
        await wrapper.vm.goNext();
        expect(wrapper.vm.$refs.recaptchaSubmit.execute).toHaveBeenCalledTimes(1);
      });
      it('should call next from mixin otherwise', async () => {
        wrapper.vm.next = jest.fn();
        wrapper.vm.$storage.registration.getters.currentTab = jest.fn(() => ({
          id: 'other',
        }));
        await wrapper.vm.goNext();
        expect(wrapper.vm.next).toHaveBeenCalledTimes(1);
      });
    });

    describe('recaptchaCallBack', () => {
      it('should set the token and call next from the mixin ', async () => {
        wrapper.vm.next = jest.fn();
        await wrapper.vm.recaptchaCallBack('token');
        expect(wrapper.vm.recaptchaToken).toBe('token');
        expect(wrapper.vm.next).toHaveBeenCalledTimes(1);
      });
    });
  });
});
