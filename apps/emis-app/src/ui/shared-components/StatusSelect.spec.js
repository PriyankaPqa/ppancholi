import Component from '@/ui/shared-components/StatusSelect.vue';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import helpers from '@libs/component-lib/helpers';

const localVue = createLocalVue();

describe('StatusSelect.vue', () => {
  const wrapper = shallowMount(Component, {
    localVue,
    propsData: {
      value: 1,
      statusName: 'mock-status',
    },
  });

  describe('methods', () => {
    describe('setMenuAriaLabel', () => {
      it('should set attribute for v-menu properly', async () => {
        const mockOn = {
          click: {
            length: 1,
            name: '',
          },
          keydown: {
            length: 1,
            name: 'bound onKeyDown',
          },
        };
        helpers.setElementA11yAttribute = jest.fn();
        wrapper.vm.setMenuAriaLabel(mockOn);
        expect(helpers.setElementA11yAttribute).toHaveBeenCalledWith('.v-menu__content.theme--light.menuable__content__active', 'aria-busy', 'true');
      });
    });
  });
});
