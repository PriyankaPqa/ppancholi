import { HttpClient } from '@libs/services-lib/http-client';
import { i18n } from '../ui/plugins/i18n';

export const getHttpClient = (
  { accessToken, baseUrl, authentication, useErrorReport }: { accessToken: string; baseUrl: string; authentication: boolean; useErrorReport: boolean },
) => new HttpClient(i18n, {
  authentication,
  accessToken,
  baseUrl,
  redirect403Url: null,
  timerBeforeRedirection: 3000,
  useErrorReport,
});

export const httpClient = getHttpClient({
  authentication: false,
  accessToken: null,
  baseUrl: `${process.env.VITE_API_BASE_URL}/`,
  useErrorReport: false,
});
