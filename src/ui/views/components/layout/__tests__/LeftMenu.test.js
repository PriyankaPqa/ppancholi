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

      test('Item[2]', () => {
        const item = wrapper.vm.items[2];
        expect(item.to).toBe(routes.events.home.name);
        expect(item.icon).toBe('mdi-calendar');
        expect(item.text).toBe('dashboard.leftMenu.events_title');
        expect(item.test).toBe('events');
        expect(item.level).toBe('level4');
      });
      test('Item[3]', () => {
        const item = wrapper.vm.items[3];
        expect(item.to).toBe(routes.teams.home.name);
        expect(item.icon).toBe('mdi-account-multiple-plus');
        expect(item.text).toBe('dashboard.leftMenu.teams_title');
        expect(item.test).toBe('teams');
        expect(item.level).toBe('level3');
      });
      test('Item[4]', () => {
        const item = wrapper.vm.items[4];
        expect(item.to).toBe(routes.financialAssistance.home.name);
        expect(item.icon).toBe('mdi-currency-usd');
        expect(item.text).toBe('dashboard.leftMenu.financial_title');
        expect(item.test).toBe('financial');
        expect(item.level).toBe('level6');
      });
      test('Item[5]', () => {
        const item = wrapper.vm.items[5];
        expect(item.to).toBe(routes.approvals.home.name);
        expect(item.icon).toBe('mdi-check');
        expect(item.text).toBe('dashboard.leftMenu.approvals_title');
        expect(item.test).toBe('approvals');
        expect(item.level).toBe('level3');
      });
      test('Item[6]', () => {
        const item = wrapper.vm.items[6];
        expect(item.to).toBe(routes.massActions.home.name);
        expect(item.icon).toBe('mdi-file-document');
        expect(item.text).toBe('dashboard.leftMenu.mass_actions_title');
        expect(item.test).toBe('mass_actions');
        expect(item.level).toBe('level5');
      });
      test('Item[7]', () => {
        const item = wrapper.vm.items[7];
        expect(item.to).toBe(routes.assessments.home.name);
        expect(item.icon).toBe('mdi-poll-box');
        expect(item.text).toBe('dashboard.leftMenu.assessments_title');
        expect(item.test).toBe('assessments');
        expect(item.level).toBe('level6');
      });
      test('Item[8]', () => {
        const item = wrapper.vm.items[8];
        expect(item.to).toBe(routes.systemManagement.home.name);
        expect(item.icon).toBe('dvr');
        expect(item.text).toBe('dashboard.system_management.leftMenu.title');
        expect(item.test).toBe('system_management');
        expect(item.level).toBe('level6');
      });
      test('Item[9]', () => {
        const item = wrapper.vm.items[9];
        expect(item.to).toBe(routes.reports.home.name);
        expect(item.icon).toBe('mdi-alert-octagon');
        expect(item.text).toBe('dashboard.leftMenu.reports_title');
        expect(item.test).toBe('reports');
        expect(item.level).toBe('level5');
      });
    });
  });
});
