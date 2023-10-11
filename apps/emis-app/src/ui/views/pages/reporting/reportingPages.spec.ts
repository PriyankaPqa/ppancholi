import { UserRoles } from '@libs/entities-lib/user';
import routes from '@/constants/routes';
import { createLocalVue } from '@/test/testSetup';
import { ReportingPages } from './reportingPages';

const localVue = createLocalVue();

const reportingPages = new ReportingPages();
describe('reportingPages', () => {
  describe('Cards', () => {
    it('includes standard L6', () => {
      const card = reportingPages.cards().find((c) => c.dataTest === 'standardQueriesL6');
      expect(card).toEqual({
        title: 'reporting.standardQueriesL6',
        button: 'reporting.start',
        route: {
          name: routes.reporting.list.name,
          params: {
            queryTypeName: 'StandardL6',
          },
        },
        dataTest: 'standardQueriesL6',
        level: UserRoles.level6,
      });
    });

    it('includes custom queries', () => {
      const card = reportingPages.cards().find((c) => c.dataTest === 'customQueries');
      expect(card).toEqual({
        title: 'reporting.customQueries',
        button: 'reporting.start',
        route: {
          name: routes.reporting.list.name,
          params: {
            queryTypeName: 'Custom',
          },
        },
        dataTest: 'customQueries',
        level: UserRoles.level6,
      });
    });

    it('includes event stats', () => {
      const card = reportingPages.cards().find((c) => c.dataTest === 'eventStatistics');
      expect(card).toEqual({
        title: 'reporting.eventStatistics',
        button: 'reporting.start',
        route: { name: routes.reporting.home.name },
        dataTest: 'eventStatistics',
        level: UserRoles.level6,
      });
    });
  });

  describe('availableTabs', () => {
    localVue.prototype.$hasLevel = () => true;
    localVue.prototype.$t = (t: string) => t;
    const card = reportingPages.availableTabs(localVue.prototype).find((c) => c.test === 'eventStatistics');
    expect(card).toEqual({
      text: 'reporting.eventStatistics',
      route: { name: routes.reporting.home.name },
      test: 'eventStatistics',
      level: UserRoles.level6,
    });
  });
});
