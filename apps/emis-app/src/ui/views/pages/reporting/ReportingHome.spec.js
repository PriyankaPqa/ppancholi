import {
  createLocalVue,
  shallowMount,
  mount,
} from '@/test/testSetup';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import { UserRoles } from '@libs/entities-lib/user';
import routes from '@/constants/routes';
import Component from './ReportingHome.vue';

const localVue = createLocalVue();

describe('ReportingHome.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(async () => {
      wrapper = mount(Component, {
        pinia: getPiniaForUser(UserRoles.level6),
        localVue,
      });
    });

    describe('Standard L6 card', () => {
      it('is displayed', async () => {
        const card = wrapper.findDataTest('standardQueriesL6');
        expect(card.exists()).toBeTruthy();
      });
    });

    describe('Custom Queries card', () => {
      it('is displayed', async () => {
        const card = wrapper.findDataTest('customQueries');
        expect(card.exists()).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    beforeEach(async () => {
      wrapper = shallowMount(Component, {
        localVue,
      });
    });

    describe('Cards', () => {
      it('includes standard L6', async () => {
        const card = wrapper.vm.cards.find((c) => c.dataTest === 'standardQueriesL6');
        expect(card).toEqual({
          title: 'reporting.standardQueriesL6',
          button: 'reporting.start',
          route: routes.reporting.home.name,
          dataTest: 'standardQueriesL6',
          level: UserRoles.level6,
        });
      });

      it('includes custom queries', async () => {
        const card = wrapper.vm.cards.find((c) => c.dataTest === 'customQueries');
        expect(card).toEqual({
          title: 'reporting.customQueries',
          button: 'reporting.start',
          route: routes.reporting.home.name,
          dataTest: 'customQueries',
          level: UserRoles.level6,
        });
      });

      it('includes event stats', async () => {
        const card = wrapper.vm.cards.find((c) => c.dataTest === 'eventStatistics');
        expect(card).toEqual({
          title: 'reporting.eventStatistics',
          button: 'reporting.start',
          route: routes.reporting.home.name,
          dataTest: 'eventStatistics',
          level: UserRoles.level6,
        });
      });
    });
  });
});
