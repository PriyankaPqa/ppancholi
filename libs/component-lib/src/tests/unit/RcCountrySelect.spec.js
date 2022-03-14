import Component from '../../components/atoms/RcCountrySelect/RcCountrySelect.vue';
import { createLocalVue, mount } from '../testSetup';

describe('RcCountrySelect.vue', () => {
  let localVue;

  beforeEach(() => {
    localVue = createLocalVue();
  });

  test('it displays the correct flag when the country is set', async () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        value: 'CA',
      },
    });

    await wrapper.vm.$nextTick();

    const flag = wrapper.find('.vti__flag');

    expect(flag.element.classList.contains('ca')).toBe(true);
  });

  test('setting the language changes the dropdown entries', async () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        value: 'US',
        language: 'fr',
      },
    });

    await wrapper.vm.$nextTick();

    const selection = wrapper.find('[data-test="selection"]');
    expect(selection.text()).toBe("États-Unis d'Amérique");
  });

  test('onInput emits the input event', async () => {
    const wrapper = mount(Component, {
      localVue,
    });

    await wrapper.vm.onInput('CA');
    expect(wrapper.emitted('input')[0][0]).toBe('CA');
  });
});
