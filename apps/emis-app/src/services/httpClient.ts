import { HttpClient } from '@libs/core-lib/services/http-client';
import { i18n } from '@/ui/plugins/i18n';
import { localStorageKeys } from '@/constants/localStorage';
import routes from '@/constants/routes';

export const httpClient = new HttpClient(i18n, {
  authentication: true,
  accessTokenKey: localStorageKeys.accessToken.name,
  redirect403Url: routes.home.path,
  timerBeforeRedirection: 3000,
  useErrorReport: true,
});
