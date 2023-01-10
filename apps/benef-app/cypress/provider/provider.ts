import { EventsService } from '@libs/services-lib/events/entity';
import { getHttpClient } from '../../src/services/httpClient';
import { provider as appProvider } from '../../src/services/provider';

export const useProvider = (accessToken: string) => {
  const httpClient = getHttpClient({ accessToken, baseUrl: Cypress.env('API_BASE_URL'), authentication: true });
  return {
    events: new EventsService(httpClient),
    ...appProvider(httpClient),
  };
};
