import routes from '@/constants/routes';
import { UserRoles } from '@libs/entities-lib/user';
import { ICardSettings } from '@/types/interfaces/ICardSettings';
import helpers from '@/ui/helpers/helpers';
import { VuePlugin } from '@/ui/plugins/features';
import { INavigationTab } from '@libs/shared-lib/types';
import { IQuery, QueryType, ReportingTopic } from '@libs/entities-lib/reporting';
import { AllPbiReports } from './standard_queries/PowerBiEmbedded';

export class ReportingPages {
  cards(vue: VuePlugin): ICardSettings[] {
    return [{
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
    }, {
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
        strictLevel: !vue.$hasLevel(UserRoles.level6),
    }, {
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
      strictLevel: !vue.$hasLevel(UserRoles.level6),
    }, {
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
    }, {
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
    },
    ];
  }

  availableCards(vue: VuePlugin): ICardSettings[] {
    let cards = this.cards(vue);
    cards = [...cards,
        ...AllPbiReports.filter((x) => x.queryType === ReportingPages.queryTypeByName(`Cards${vue.$currentUser().currentRole()}`, vue.$i18n?.locale || 'en'))
        .map((r) => ({
          title: r.name,
          button: 'reporting.start',
          route: { name: routes.reporting.powerbi.name, params: { queryId: r.id, queryTypeName: `Cards${vue.$currentUser().currentRole()}` } },
          dataTest: `pbiCard${r.id}`,
        } as ICardSettings))];
    return helpers.availableItems(vue, cards);
  }

  availableTabs(vue: VuePlugin): INavigationTab[] {
    return this.availableCards(vue).map((c) => ({
      text: vue.$t(c.title),
      test: c.dataTest,
      level: c.level,
      roles: c.roles,
      route: c.route as { name: string },
    }));
  }

  static queryTypeByName(queryTypeName: string, locale: string): QueryType {
    if (queryTypeName === 'Custom') {
      return QueryType.Custom;
    }
    return QueryType[queryTypeName + locale as any] as any;
  }

  static titleForQuery(query: IQuery, vue: VuePlugin): string {
    return `${vue.$t(`reporting.query.title.${QueryType[query.queryType]}`)}: ${query.name || vue.$t(`reporting.query.theme.${ReportingTopic[query.topic]}`)}`;
  }
}
