import { UserRoles } from '@libs/entities-lib/user';
import routes from '@/constants/routes';
import { createLocalVue } from '@/test/testSetup';
import { createTestingPinia } from '@pinia/testing';
import { useMockUserStore } from '@/pinia/user/user.mock';
import { IQuery, QueryType } from '@libs/entities-lib/reporting';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { ReportingPages } from './reportingPages';

const pinia = createTestingPinia({ stubActions: false });
useMockUserStore(pinia);

const localVue = createLocalVue();
localVue.prototype.$hasLevel = () => true;
localVue.prototype.$t = (t: string) => t;
localVue.prototype.$currentUser = () => ({ currentRole: () => 'level6' });

const reportingPages = new ReportingPages();
describe('reportingPages', () => {
  describe('Cards', () => {
    it('includes standard L6', () => {
      const card = reportingPages.cards(localVue.prototype).find((c) => c.dataTest === 'standardQueriesL6');
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
    it('includes standard L5', () => {
      const card = reportingPages.cards(localVue.prototype).find((c) => c.dataTest === 'standardQueriesL5');
      expect(card).toEqual({
        title: 'reporting.standardQueriesL5',
        button: 'reporting.start',
        route: {
          name: routes.reporting.list.name,
          params: {
            queryTypeName: 'StandardL5',
          },
        },
        dataTest: 'standardQueriesL5',
        level: UserRoles.level5,
        strictLevel: false,
      });
    });
    it('includes standard L4', () => {
      const card = reportingPages.cards(localVue.prototype).find((c) => c.dataTest === 'standardQueriesL4');
      expect(card).toEqual({
        title: 'reporting.standardQueriesL4',
        button: 'reporting.start',
        route: {
          name: routes.reporting.list.name,
          params: {
            queryTypeName: 'StandardL4',
          },
        },
        dataTest: 'standardQueriesL4',
        level: UserRoles.level4,
        strictLevel: false,
      });
    });
    it('includes standard IM', () => {
      const card = reportingPages.cards(localVue.prototype).find((c) => c.dataTest === 'standardQueriesIM');
      expect(card).toEqual({
        title: 'reporting.standardQueriesIM',
        button: 'reporting.start',
        route: {
          name: routes.reporting.list.name,
          params: {
            queryTypeName: 'StandardIM',
          },
        },
        dataTest: 'standardQueriesIM',
        level: UserRoles.level6,
        strictLevel: true,
        roles: [UserRoles.contributorIM],
      });
    });

    it('includes sentEmailIssues', () => {
      const card = reportingPages.cards(localVue.prototype).find((c) => c.dataTest === 'sentEmailIssuesQueries');
      expect(card).toEqual({
        title: 'reporting.sentEmailIssuesQueries',
        button: 'reporting.start',
        route: {
          name: routes.reporting.query.name,
          params: {
            queryTypeName: 'StandardL6',
            queryId: 'SentEmailIssuesL6',
          },
        },
        dataTest: 'sentEmailIssuesQueries',
        level: UserRoles.level6,
        roles: [UserRoles.contributorIM],
        feature: FeatureKeys.GeographicMapping,
      });
    });

    it('includes custom queries', () => {
      const card = reportingPages.cards(localVue.prototype).find((c) => c.dataTest === 'customQueries');
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
        level: UserRoles.level4,
        roles: [UserRoles.contributorIM],
      });
    });
  });

  describe('availableCards', () => {
    it('includes powerbi cards', () => {
      const card = reportingPages.availableCards(localVue.prototype).find((c) => c.dataTest === 'pbiCardHouseholdStatistics');
      expect(card).toEqual({
        title: 'Household Statistics',
        button: 'reporting.start',
        route: { name: routes.reporting.powerbi.name, params: { queryId: 'HouseholdStatistics', queryTypeName: 'Cardslevel6' } },
        dataTest: 'pbiCardHouseholdStatistics',
      });
    });
  });

  describe('availableTabs', () => {
    it('returns data in correct format', () => {
      localVue.prototype.$hasLevel = () => true;
      localVue.prototype.$t = (t: string) => t;
      const card = reportingPages.availableTabs(localVue.prototype).find((c) => c.test === 'pbiCardHouseholdStatistics');
      expect(card).toEqual({
        text: 'Household Statistics',
        route: { name: routes.reporting.powerbi.name, params: { queryId: 'HouseholdStatistics', queryTypeName: 'Cardslevel6' } },
        test: 'pbiCardHouseholdStatistics',
      });
    });
  });

  describe('queryTypeByName', () => {
    it('returns the correct QueryType', async () => {
      expect(ReportingPages.queryTypeByName('Custom', 'en')).toEqual(QueryType.Custom);
      expect(ReportingPages.queryTypeByName('StandardL6', 'en')).toEqual(QueryType.StandardL6en);
    });
  });

  describe('titleForQuery', () => {
    it('returns the title according to the query', async () => {
      localVue.prototype.$t = (t: string) => t;
      expect(ReportingPages.titleForQuery({ queryType: QueryType.Custom, topic: 1 } as IQuery, localVue.prototype))
        .toBe('reporting.query.title.Custom: reporting.query.theme.HouseholdMembers');
      expect(ReportingPages.titleForQuery({ name: 'some name', queryType: QueryType.Custom, topic: 1 } as IQuery, localVue.prototype))
        .toBe('reporting.query.title.Custom: some name');
    });
  });
});
