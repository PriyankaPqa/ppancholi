import { CypressEventsService } from '@libs/cypress-lib/services/events';
import { CypressTeamsService } from '@libs/cypress-lib/services/teams';
import { CypressMassActionsService } from '@libs/cypress-lib/services/mass-action';
import { getHttpClient } from '../../src/services/httpClient';
import { provider as appProvider } from '../../src/services/provider';

export const useProvider = (accessToken: string) => {
  const httpClient = getHttpClient({ accessToken, baseUrl: Cypress.env('API_BASE_URL'), useErrorReport: false, localApiPortMap: Cypress.env('API_PORTS') });
  return {
    cypress: {
      events: new CypressEventsService(httpClient),
      teams: new CypressTeamsService(httpClient),
      massAction: new CypressMassActionsService(httpClient),
    },
    ...appProvider(httpClient),
  };
};
