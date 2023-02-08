import { CypressEventsService } from '@libs/cypress-lib/services/events';
import { getHttpClient } from '../../src/services/httpClient';
import { provider as appProvider } from '../../src/services/provider';

export const useProvider = (accessToken: string) => {
  const httpClient = getHttpClient({ accessToken, baseUrl: Cypress.env('API_BASE_URL') });
  return {
    cypress: {
      events: new CypressEventsService(httpClient),
    },
    ...appProvider(httpClient),
  };
};
