import routes from '@/constants/routes';
import { UserRoles } from '@libs/entities-lib/user';
import { ICardSettings } from '@/types/interfaces/ICardSettings';
import helpers from '@/ui/helpers/helpers';
import { VuePlugin } from '@/ui/plugins/features';
import { INavigationTab } from '@libs/shared-lib/types';

export class ReportingPages {
  cards(): ICardSettings[] {
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
    }, {
      title: 'reporting.eventStatistics',
      button: 'reporting.start',
      route: { name: routes.reporting.home.name },
      dataTest: 'eventStatistics',
      level: UserRoles.level6,
    },
    ];
  }

  availableCards(vue: VuePlugin): ICardSettings[] {
    return helpers.availableItems(vue, this.cards());
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
}
