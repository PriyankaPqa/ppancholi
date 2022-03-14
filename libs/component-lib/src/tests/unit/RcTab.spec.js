import Component from '../../components/atoms/RcTab.vue';
import { createLocalVue, mount } from '../testSetup';

describe('RcTab.vue', () => {
  let localVue;
  let wrapper;

  beforeEach(() => {
    localVue = createLocalVue();

    wrapper = mount(Component, {
      localVue,
      propsData: {
        label: 'TEST LABEL',
        active: false,
      },
    });
  });

  test('it emits the click event when clicked', async () => {
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  test('the label prop correctly renders', async () => {
    expect(wrapper.text()).toBe('TEST LABEL');

    await wrapper.setProps({
      label: 'ANOTHER TEST',
    });

    expect(wrapper.text()).toBe('ANOTHER TEST');
  });

  test('the active prop applies the css style', async () => {
    expect(wrapper.element.classList.contains('active')).toBe(false);

    await wrapper.setProps({
      active: true,
    });

    expect(wrapper.element.classList.contains('active')).toBe(true);
  });
});
