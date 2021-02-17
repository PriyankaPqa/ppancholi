import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockUserStateLevel } from '@/test/helpers';
import { RcDataTable } from '@crctech/component-library';
import Component from './EventsTable.vue';

const localVue = createLocalVue();

describe('EventsTable.vue', () => {
  let wrapper;

  describe('Template', () => {
    describe('showAddButton props', () => {
      it('is true for level 6 users', () => {
        wrapper = shallowMount(Component, {
          localVue,
          store: {
            ...mockUserStateLevel(6),
          },
        });
        expect(wrapper.findComponent(RcDataTable).props('showAddButton')).toBe(true);
      });

      it('is false for level 5 users and lower', () => {
        wrapper = shallowMount(Component, {
          localVue,
          store: {
            ...mockUserStateLevel(5),
          },
        });
        expect(wrapper.findComponent(RcDataTable).props('showAddButton')).toBe(false);
      });
    });
  });
});
