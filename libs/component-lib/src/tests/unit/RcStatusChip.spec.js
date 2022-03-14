import Component from '../../components/atoms/RcStatusChip.vue';
import { createLocalVue, mount } from '../testSetup';

const localVue = createLocalVue();

describe('RcStatusChip.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Component, {
      localVue,
      propsData: {
        color: '#000000',
        textColor: '#333333',
      },
    });
  });

  describe('Props', () => {
    it('passes the color prop to the v-chip component', () => {
      expect(wrapper.findComponent({ ref: 'vchip' }).props('color')).toBe('#000000');
    });

    it('passes the textColor prop to the v-chip component', () => {
      expect(wrapper.findComponent({ ref: 'vchip' }).props('textColor')).toBe('#333333');
    });
  });
});
