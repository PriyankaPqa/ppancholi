import { HttpClient, IHttpClient } from '@libs/services-lib/http-client';
import { i18n } from '@/ui/plugins/i18n';

export const httpClient: IHttpClient = new HttpClient(i18n);
