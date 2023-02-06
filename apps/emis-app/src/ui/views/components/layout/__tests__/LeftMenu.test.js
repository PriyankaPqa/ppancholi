import { createLocalVue, shallowMount } from '@/test/testSetup';
import { NO_ROLE } from '@libs/entities-lib/user';
import routes from '@/constants/routes';
import { createTestingPinia } from '@pinia/testing';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import Component from '../LeftMenu.vue';

const localVue = createLocalVue();

describe('LeftMenu.vue', () => {
  describe('Computed properties', () => {
    describe('availableItems', () => {
      it('does not return items with no level', () => {
        const items = [
          {
            to: 'routes.home.name',
            icon: 'mdi-home',
            text: 'leftMenu.home_title',
            test: 'home',
          },
          {
            to: 'routes.caseFile.home.name',
            icon: 'mdi-clipboard-text',
            text: 'leftMenu.caseFiles_title',
            test: 'caseFile',
          },
        ];
        const wrapper = shallowMount(Component, {
          localVue,
          pinia: createTestingPinia({ stubActions: false }),
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
            text: 'leftMenu.home_title',
            test: 'home',
            level: 'level1',
          },
          {
            to: 'routes.caseFile.home.name',
            icon: 'mdi-clipboard-text',
            text: 'leftMenu.caseFiles_title',
            test: 'caseFile',
            level: 'level6',
          },
        ];
        const pinia = getPiniaForUser('level1');
        const wrapper = shallowMount(Component, {
          localVue,
          pinia,
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
            text: 'leftMenu.home_title',
            test: 'home',
            level: 'level1',
          },
          {
            to: 'routes.caseFile.home.name',
            icon: 'mdi-clipboard-text',
            text: 'leftMenu.caseFiles_title',
            test: 'caseFile',
            level: 'level6',
            roles: ['contributorIM'],
          },
        ];
        const pinia = getPiniaForUser('contributorIM');
        const wrapper = shallowMount(Component, {
          localVue,
          pinia,
          computed: {
            items() {
              return items;
            },
          },
        });
        expect(wrapper.vm.availableItems).toMatchObject([items[1]]);
      });

      it('does not return items with feature disabled', () => {
        const items = [
          {
            to: 'routes.home.name',
            icon: 'mdi-home',
            text: 'leftMenu.home_title',
            test: 'home',
            level: 'level6',
            roles: ['contributorIM'],
            feature: 'feature',
          },
        ];
        const pinia = getPiniaForUser('level6');
        const wrapper = shallowMount(Component, {
          localVue,
          pinia,
          computed: {
            items() {
              return items;
            },
          },
          mocks: {
            $storage: {
              feature: {
                getters: {
                  feature: jest.fn(() => ({ enabled: false })),
                },
              },
            },
            $hasLevel: jest.fn(() => true),
            $hasRole: jest.fn(() => true),
          },
        });

        expect(wrapper.vm.availableItems).toEqual([]);
      });

      it('returns items with feature enabled', () => {
        const items = [
          {
            to: 'routes.home.name',
            icon: 'mdi-home',
            text: 'leftMenu.home_title',
            test: 'home',
            level: 'level6',
            roles: ['contributorIM'],
            feature: 'feature',
          },
        ];

        const wrapper = shallowMount(Component, {
          localVue,
          computed: {
            items() {
              return items;
            },
          },
          mocks: {
            $hasLevel: jest.fn(() => true),
            $hasRole: jest.fn(() => true),
            $hasFeature: jest.fn(() => true),
          },
        });

        expect(wrapper.vm.availableItems).toEqual(items);
      });
    });

    describe('approvalRedirection', () => {
      it('returns approvals home for a level 6 user', () => {
        const pinia = getPiniaForUser('level6');
        const wrapper = shallowMount(Component, {
          localVue,
          pinia,
        });
        expect(wrapper.vm.approvalRedirection).toEqual(routes.approvals.templates.home.name);
      });

      it('returns approvals request for a level 3 user', () => {
        const pinia = getPiniaForUser('level3');
        const wrapper = shallowMount(Component, {
          localVue,
          pinia,
        });
        expect(wrapper.vm.approvalRedirection).toEqual(routes.approvals.request.name);
      });

      it('returns approvals request for a level 4 user', () => {
        const pinia = getPiniaForUser('level4');
        const wrapper = shallowMount(Component, {
          localVue,
          pinia,
        });
        expect(wrapper.vm.approvalRedirection).toEqual(routes.approvals.request.name);
      });
    });

    describe('items', () => {
      let wrapper;
      beforeEach(() => {
        const pinia = getPiniaForUser('level6');
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
        });
      });

      test('Item[0]', () => {
        const item = wrapper.vm.items[0];
        expect(item.to).toBe(routes.home.name);
        expect(item.icon).toBe('mdi-home');
        expect(item.text).toBe('leftMenu.home_title');
        expect(item.test).toBe('home');
        expect(item.level).toBe('level0');
        expect(item.roles).toEqual(['contributorIM', 'contributorFinance', 'contributor3', 'readonly', NO_ROLE]);
      });

      describe('Item[1]', () => {
        test('its properties are ok', () => {
          const item = wrapper.vm.items[1];
          expect(item.to).toBe(routes.caseFile.home.name);
          expect(item.icon).toBe('mdi-clipboard-text');
          expect(item.text).toBe('leftMenu.caseFiles_title');
          expect(item.test).toBe('caseFile');
          expect(item.level).toBe('level0');
          expect(item.disabled).toBe(false);
          expect(item.roles).toEqual(['contributorIM', 'contributorFinance', 'contributor3', 'readonly', NO_ROLE]);
        });
        test('It is disabled if user has no role', () => {
          const pinia = getPiniaForUser('noRole');
          const wrapper = shallowMount(Component, {
            localVue,
            pinia,
          });
          const item = wrapper.vm.items[1];
          expect(item.disabled).toBe(true);
        });
      });

      test('Item[2]', () => {
        const item = wrapper.vm.items[2];
        expect(item.to).toBe(routes.householdSearch.name);
        expect(item.icon).toBe('$rctech-search-person');
        expect(item.text).toBe('leftMenu.search_household_title');
        expect(item.test).toBe('search_household');
        expect(item.level).toBe('level0');
      });

      test('Item[3]', () => {
        const item = wrapper.vm.items[3];
        expect(item.to).toBe(routes.events.home.name);
        expect(item.icon).toBe('mdi-calendar');
        expect(item.text).toBe('leftMenu.events_title');
        expect(item.test).toBe('events');
        expect(item.level).toBe('level4');
      });

      test('Item[4]', () => {
        const item = wrapper.vm.items[4];
        expect(item.to).toBe(routes.teams.home.name);
        expect(item.icon).toBe('mdi-account-multiple-plus');
        expect(item.text).toBe('leftMenu.teams_title');
        expect(item.test).toBe('teams');
        expect(item.level).toBe('level3');
      });

      test('Item[5]', () => {
        const item = wrapper.vm.items[5];
        expect(item.to).toBe(routes.financialAssistance.home.name);
        expect(item.icon).toBe('mdi-currency-usd');
        expect(item.text).toBe('leftMenu.financial_title');
        expect(item.test).toBe('financial');
        expect(item.level).toBe('level6');
      });

      test('Item[6]', () => {
        const item = wrapper.vm.items[6];
        expect(item.to).toBe(wrapper.vm.approvalRedirection);
        expect(item.icon).toBe('mdi-check');
        expect(item.text).toBe('leftMenu.approvals_title');
        expect(item.test).toBe('approvals');
        expect(item.roles).toEqual(['level3', 'level4', 'level6']);
      });

      test('Item[7]', () => {
        const item = wrapper.vm.items[7];
        expect(item.to).toBe(routes.massActions.home.name);
        expect(item.icon).toBe('mdi-file-document');
        expect(item.text).toBe('leftMenu.mass_actions_title');
        expect(item.test).toBe('mass_actions');
        expect(item.level).toBe('level6');
        expect(item.roles).toEqual(['contributorIM', 'contributorFinance']);
      });

      test('Item[8]', () => {
        const item = wrapper.vm.items[8];
        expect(item.to).toBe(routes.assessmentTemplates.home.name);
        expect(item.icon).toBe('mdi-chart-box');
        expect(item.text).toBe('leftMenu.assessments_title');
        expect(item.test).toBe('assessments');
        expect(item.level).toBe('level6');
      });

      test('Item[9]', () => {
        const item = wrapper.vm.items[9];
        expect(item.to).toBe(routes.systemManagement.home.name);
        expect(item.icon).toBe('dvr');
        expect(item.text).toBe('system_management.leftMenu.title');
        expect(item.test).toBe('system_management');
        expect(item.level).toBe('level5');
      });
    });
  });
});
