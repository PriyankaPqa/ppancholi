import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import Component from '../LeftMenu.vue';

const localVue = createLocalVue();
const { pinia, registrationStore } = useMockRegistrationStore();
describe('LeftMenu.vue', () => {
  let wrapper;
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
      });
    });

    describe('isLeftMenuOpen', () => {
      it('returns true if the left menu is open, false otherwise', () => {
        registrationStore.isLeftMenuOpen = true;
        expect(wrapper.vm.isLeftMenuOpen).toBeTruthy();

        registrationStore.isLeftMenuOpen = false;
        expect(wrapper.vm.isLeftMenuOpen).toBeFalsy();
      });
    });
    describe('tabs', () => {
      it('returns tabs in store', () => {
        expect(wrapper.vm.tabs).toEqual(registrationStore.tabs);
      });
    });
    describe('currentTab', () => {
      it('returns current tab in store', () => {
        expect(wrapper.vm.currentTab).toEqual(registrationStore.getCurrentTab());
      });
    });
  });

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        pinia,
      });
    });
    describe('Event handlers', () => {
      test('Click tab emits event', async () => {
        const btn = wrapper.find('[data-test="registration-tab-personalInfo"]');
        await btn.trigger('click');

        expect(wrapper.emitted('jump')[0][0]).toBe(1);
      });
    });
  });
});
