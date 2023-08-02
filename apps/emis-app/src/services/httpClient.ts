import { HttpClient } from '@libs/services-lib/http-client';
import routes from '../constants/routes';
import { i18n } from '../ui/plugins/i18n';

export const getHttpClient = ({ accessToken, baseUrl, useErrorReport, localApiPortMap }:
  {
    accessToken?: string;
    baseUrl: string;
    useErrorReport: boolean;
    localApiPortMap: string
  }) => new HttpClient(i18n, {
    authentication: true,
    accessToken,
    baseUrl,
    redirect403Url: routes.home.path,
    timerBeforeRedirection: 3000,
    useErrorReport,
    localApiPortMap,
  });

export const httpClient = getHttpClient({
  baseUrl: `${process.env.VITE_API_BASE_URL}/`,
  useErrorReport: true,
  localApiPortMap: process.env.VITE_API_PORTS,
});
