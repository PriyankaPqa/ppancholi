import { createLocalVue, mount } from '@libs/component-lib/tests/testSetup';
import Component from '../../components/atoms/RcAutosuggest.vue';

describe('RcAutosuggest.vue', () => {
  let localVue;
  let wrapper;

  beforeEach(() => {
    localVue = createLocalVue();

    wrapper = mount(Component, {
      localVue,
      propsData: {
        value: 'INPUT VALUE',
        items: [
          'Apples',
          'Oranges',
          'Pears',
          'Plums',
        ],
        attach: 'anchor',
        rules: {},
      },
    });
  });

  describe('Methods', () => {
    describe('getItemText', () => {
      it('returns the string value if the item is a string', () => {
        expect(wrapper.vm.getItemText('TEST')).toBe('TEST');
      });

      it('returns the correct value if itemText is a string and item is an object', () => {
        const items = [
          { name: 'Apples' },
          { name: 'Oranges' },
          { name: 'Pears' },
          { name: 'Plums' },
        ];

        wrapper = mount(Component, {
          localVue,
          propsData: {
            value: '',
            items,
            itemText: 'name',
            rules: {},
            attach: 'anchor',
          },
        });

        expect(wrapper.vm.getItemText(items[0])).toBe('Apples');
      });

      it('returns the correct value if itemText is a function', () => {
        const items = [
          { name: 'Apples' },
          { name: 'Oranges' },
          { name: 'Pears' },
          { name: 'Plums' },
        ];

        wrapper = mount(Component, {
          localVue,
          propsData: {
            value: '',
            items,
            itemText: (item) => item.name,
            rules: {},
            attach: 'anchor',
          },
        });

        expect(wrapper.vm.getItemText(items[0])).toBe('Apples');
      });
    });
  });

  describe('Computed', () => {
    describe('localValue', () => {
      it('returns the value prop', () => {
        expect(wrapper.vm.localValue).toBe('INPUT VALUE');
      });

      it('emits the input event when assigned', () => {
        wrapper.vm.localValue = 'TEST';
        expect(wrapper.emitted('input')[1]).toEqual(['TEST']);
      });
    });

    describe('itemsFiltered', () => {
      it('returns all the items if value is an empty string', async () => {
        await wrapper.setProps({
          value: '',
        });

        expect(wrapper.vm.itemsFiltered).toEqual([
          'Apples',
          'Oranges',
          'Pears',
          'Plums',
        ]);
      });

      it('returns a filtered list based on value', async () => {
        await wrapper.setProps({
          value: 'a',
        });

        expect(wrapper.vm.itemsFiltered).toEqual([
          'Apples',
          'Oranges',
          'Pears',
        ]);
      });
    });
  });
});
