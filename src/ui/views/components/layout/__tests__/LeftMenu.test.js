import Vue from 'vue';
import Vuetify from 'vuetify';
import { createLocalVue, mount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockUserStateLevel } from '@/test/helpers';
import rolesAndPermissions from '@/ui/plugins/rolesAndPermissions';
import Component from '../LeftMenu.vue';

Vue.use(Vuetify);
Vue.use(rolesAndPermissions);

describe('LeftMenu.vue', () => {
  describe('Computed properties', () => {
    describe('availableItems', () => {
      it('returns items with no level', () => {
        const items = [
          {
            to: 'routes.home.name',
            icon: 'mdi-home',
            text: 'dashboard.leftMenu.home_title',
            test: 'home',
          },
          {
            to: 'routes.caseFile.home.name',
            icon: 'mdi-clipboard-text',
            text: 'dashboard.leftMenu.caseFiles_title',
            test: 'caseFile',
          },
        ];
        const wrapper = mount(Component, {
          localVue: createLocalVue(),
          computed: {
            items() {
              return items;
            },
          },
        });
        expect(wrapper.vm.availableItems).toEqual(items);
      });

      it('returns items for which user has the proper level', () => {
        const items = [
          {
            to: 'routes.home.name',
            icon: 'mdi-home',
            text: 'dashboard.leftMenu.home_title',
            test: 'home',
            level: 'level1',
          },
          {
            to: 'routes.caseFile.home.name',
            icon: 'mdi-clipboard-text',
            text: 'dashboard.leftMenu.caseFiles_title',
            test: 'caseFile',
            level: 'level6',
          },
        ];
        const wrapper = mount(Component, {
          localVue: createLocalVue(),
          store: {
            ...mockUserStateLevel(1),
          },
          computed: {
            items() {
              return items;
            },
          },
        });
        expect(wrapper.vm.availableItems).toMatchObject([items[0]]);
      });
    });

    describe('items', () => {
      let wrapper;
      beforeEach(() => {
        wrapper = mount(Component, {
          localVue: createLocalVue(),
        });
      });

      test('Item[0]', () => {
        const item = wrapper.vm.items[0];
        expect(item.to).toBe(routes.home.name);
        expect(item.icon).toBe('mdi-home');
        expect(item.text).toBe('dashboard.leftMenu.home_title');
        expect(item.test).toBe('home');
        expect(item.level).toBe('level1');
      });

      test('Item[1]', () => {
        const item = wrapper.vm.items[1];
        expect(item.to).toBe(routes.caseFile.home.name);
        expect(item.icon).toBe('mdi-clipboard-text');
        expect(item.text).toBe('dashboard.leftMenu.caseFiles_title');
        expect(item.test).toBe('caseFile');
        expect(item.level).toBe('level1');
      });
    });
  });
});
