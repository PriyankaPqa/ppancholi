import Component from '../../components/pages/RcRegistrationLandingPage/RcRegistrationLandingPage.vue';
import { createLocalVue, mount } from '../testSetup';

describe('RcRegistrationLandingPage.vue', () => {
  let wrapper;
  let localVue;

  beforeEach(() => {
    localVue = createLocalVue();

    wrapper = mount(Component, {
      localVue,
      propsData: {
        title: 'foo',
        phoneNumber: '+15144567777',
        canRegister: true,
      },
    });
  });

  describe('Template', () => {
    describe('Elements on page', () => {
      test('The page displays the phone number of the selected event, if a number is passed in props', () => {
        const element = wrapper.findDataTest('registration__phoneNumber');
        expect(element.exists()).toBe(true);
      });

      test('The page does NOT display the phone number of the selected event, if a number is NOT passed in props', async () => {
        wrapper.setProps({ phoneNumber: '' });
        await wrapper.vm.$nextTick();
        const element = wrapper.findDataTest('registration__phoneNumber');
        expect(element.exists()).toBe(false);
      });

      test('The Begin Registration button is disabled if registration is not allowed', async () => {
        const element = wrapper.findDataTest('startRegistration-individual-button');
        expect(element.attributes('disabled')).toBeFalsy();

        wrapper.setProps({ canRegister: false });
        await wrapper.vm.$nextTick();

        expect(element.attributes('disabled')).toBe('disabled');
      });
    });

    describe('Events handlers', () => {
      test('The Begin Registration button emits redirect when clicked', async () => {
        const element = wrapper.findDataTest('startRegistration-individual-button');
        await element.trigger('click');
        expect(wrapper.emitted('redirect')).toBeTruthy();
      });
    });
  });
});
