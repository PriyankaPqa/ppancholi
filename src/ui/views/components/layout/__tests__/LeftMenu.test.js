import Vue from 'vue';
import Vuetify from 'vuetify';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockUserStateLevel } from '@/test/helpers';
import rolesAndPermissions from '@/ui/plugins/rolesAndPermissions';
import { mockUsersData, NO_ROLE } from '@/entities/user';
import routes from '@/constants/routes';
import Component from '../LeftMenu.vue';

Vue.use(Vuetify);
Vue.use(rolesAndPermissions);

describe('LeftMenu.vue', () => {
  describe('Computed properties', () => {
    describe('availableItems', () => {
      it('does not return items with no level', () => {
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
        const wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          computed: {
            items() {
              return items;
            },
          },
        });
        expect(wrapper.vm.availableItems).toEqual([]);
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
        const wrapper = shallowMount(Component, {
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

      it('returns items for which user has the proper role', () => {
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
            roles: ['contributorIM'],
          },
        ];
        const wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          store: {
            modules: {
              user: {
                state: {
                  ...mockUsersData()[6],
                },
              },
            },
          },
          computed: {
            items() {
              return items;
            },
          },
        });
        expect(wrapper.vm.availableItems).toMatchObject([items[1]]);
      });
    });

    describe('approvalRedirection', () => {
      it('returns approvals home for a level 6 user', () => {
        const wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          store: {
            ...mockUserStateLevel(6),
          },
        });
        expect(wrapper.vm.approvalRedirection).toEqual(routes.approvals.templates.name);
      });

      it('returns approvals request for a level 3 user', () => {
        const wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          store: {
            ...mockUserStateLevel(3),
          },
        });
        expect(wrapper.vm.approvalRedirection).toEqual(routes.approvals.request.name);
      });

      it('returns approvals request for a level 4 user', () => {
        const wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          store: {
            ...mockUserStateLevel(4),
          },
        });
        expect(wrapper.vm.approvalRedirection).toEqual(routes.approvals.request.name);
      });
    });

    describe('items', () => {
      let wrapper;
      beforeEach(() => {
        wrapper = shallowMount(Component, {
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
        expect(item.roles).toEqual(['contributorIM', 'contributorFinance', 'contributor3', 'readonly', NO_ROLE]);
      });

      describe('Item[1]', () => {
        test('its properties are ok', () => {
          const item = wrapper.vm.items[1];
          expect(item.to).toBe(routes.caseFile.home.name);
          expect(item.icon).toBe('mdi-clipboard-text');
          expect(item.text).toBe('dashboard.leftMenu.caseFiles_title');
          expect(item.test).toBe('caseFile');
          expect(item.level).toBe('level1');
          expect(item.disabled).toBe(false);
          expect(item.roles).toEqual(['contributorIM', 'contributorFinance', 'contributor3', 'readonly', NO_ROLE]);
        });
        test('It is disabled if user has no role', () => {
          const wrapper = shallowMount(Component, {
            localVue: createLocalVue(),
            store: {
              modules: {
                user: {
                  state: mockUsersData()[10],
                },
              },
            },
          });
          const item = wrapper.vm.items[1];
          expect(item.disabled).toBe(true);
        });
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
        expect(item.to).toBe(wrapper.vm.approvalRedirection);
        expect(item.icon).toBe('mdi-check');
        expect(item.text).toBe('dashboard.leftMenu.approvals_title');
        expect(item.test).toBe('approvals');
        expect(item.roles).toEqual(['level3', 'level4', 'level6']);
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
        expect(item.roles).toEqual(['contributorIM', 'contributorFinance']);
      });
    });
  });
});
