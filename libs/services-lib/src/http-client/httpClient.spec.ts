/* eslint-disable @typescript-eslint/no-explicit-any */
import * as uuid from 'uuid';
import Vue from 'vue';
import { camelKeys } from 'js-convert-case';
import axios from 'axios';
import { Toasted } from 'vue-toasted';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { buildQuerySql } from '@/odata-query-sql';
import {
  HttpClient, IRestResponse, mockHttp, mockHttpErrorResponse, GlobalHandler,
} from './index';

import * as owasp from '../utils/owasp';

jest.mock('../utils/owasp', () => ({
  __esModule: true,
  ...jest.requireActual('../utils/owasp'),
}));

jest.mock('uuid');
jest.mock('@/odata-query-sql');
jest.mock('@libs/shared-lib/plugins/applicationInsights/applicationInsights');

const mockAxios = axios.create();
mockAxios.interceptors.request.use = jest.fn();
mockAxios.interceptors.response.use = jest.fn();

let mockHttpClient: any;

export const mockI18n = {
  t: jest.fn((s: string) => s),
  te: jest.fn(),
  silentTranslationWarn: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  applicationInsights.trackException = jest.fn();
});

describe('httpClient', () => {
  describe('Constructor', () => {
    beforeEach(() => {
      jest.spyOn(axios, 'create').mockImplementation(() => mockAxios);

      mockHttpClient = new HttpClient(mockI18n, {
        authentication: true,
        accessToken: 'accessToken',
        redirect403Url: 'redirect403',
        timerBeforeRedirection: 1000,
        useErrorReport: true,
        baseUrl: 'baseUrl',
        localBaseUrl: 'localBaseUrl',
        localApiPortMap: '',
      });
    });

    it('creates AxiosInstance with correct params', () => {
      expect(axios.create).toHaveBeenLastCalledWith({
        baseURL: 'baseUrl',
        withCredentials: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
    });

    it('inits request handler', () => {
      expect(mockAxios.interceptors.request.use).toHaveBeenCalledTimes(1);
    });

    it('inits response handler', () => {
      expect(mockAxios.interceptors.response.use).toHaveBeenCalledTimes(1);
    });

    it('sets baseUrl with the one provider in options', () => {
      expect(mockHttpClient.baseUrl).toBe('baseUrl');
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      jest.useFakeTimers();

      mockI18n.te.mockImplementation(() => true);
      Vue.prototype.$reportToasted = jest.fn();

      mockHttpClient = new HttpClient(mockI18n, {
        authentication: true,
        accessToken: 'accessToken',
        redirect403Url: 'redirect403',
        timerBeforeRedirection: 10000,
        useErrorReport: true,
        baseUrl: 'baseUrl',
        localBaseUrl: 'http://localhost',
        localApiPortMap: '',
      });

      Vue.toasted = {
        global: {
          warning: jest.fn(),
          error: jest.fn(),
        },
      } as Toasted;
    });

    describe('setPublicToken', () => {
      it('sets public token', () => {
        mockHttpClient.setPublicToken('test-id');

        expect(mockHttpClient.axios.defaults.headers['x-public-token']).toBe('test-id');
      });
    });

    describe('setHeadersTenant', () => {
      it('sets tenantId', () => {
        mockHttpClient.setHeadersTenant('test-id');

        expect(mockHttpClient.axios.defaults.headers['x-tenant-id']).toBe('test-id');
      });
    });

    describe('setHeadersLanguage', () => {
      it('sets headers language', () => {
        mockHttpClient.setHeadersLanguage('test-language');

        expect(mockHttpClient.axios.defaults.headers['Accept-Language']).toBe('test-language');
      });
    });

    describe('getGlobalHandler', () => {
      it('returns default value if not defined', () => {
        const result = mockHttpClient.getGlobalHandler({});

        expect(result).toEqual(GlobalHandler.Enabled);
      });

      it('returns defined value', () => {
        const result = mockHttpClient.getGlobalHandler({
          globalHandler: GlobalHandler.Partial,
        });

        expect(result).toEqual(GlobalHandler.Partial);
      });
    });

    describe('responseSuccessHandler', () => {
      it('returns original response if response is expected to download', () => {
        const response = {
          headers: {
            'content-disposition': 'attachment',
          },
        };

        const result = mockHttpClient.responseSuccessHandler(response);

        expect(result).toEqual(response);
      });

      it('returns camelCase format of response if response is not expected to download', () => {
        const response = {
          headers: {
            'Content-Disposition': 'inline',
          },
        };

        const result = mockHttpClient.responseSuccessHandler(response);

        expect(result).toEqual(camelKeys(response, { recursive: true, recursiveInArray: true }));
      });
    });

    describe('responseErrorHandler', () => {
      it('returns false if no error', async () => {
        const result = await mockHttpClient.responseErrorHandler();

        expect(result).toBeFalsy();
      });

      it('toasts unexpected error if no error response', async () => {
        await mockHttpClient.responseErrorHandler({ response: null });
        expect(Vue.prototype.$reportToasted).toHaveBeenCalledWith('error.unexpected_error', { response: null });
      });

      describe('401', () => {
        it('returns false', async () => {
          const result = await mockHttpClient.responseErrorHandler(mockHttpErrorResponse({}, 401));

          expect(result).toBeFalsy();
        });

        it('toasts session expired error', async () => {
          await mockHttpClient.responseErrorHandler(mockHttpErrorResponse({}, 401));
          expect(Vue.toasted.global.error).toHaveBeenCalledWith(mockI18n.t('error.log_in_again'));
        });
      });

      describe('403', () => {
        it('returns false', async () => {
          const result = await mockHttpClient.responseErrorHandler(mockHttpErrorResponse({}, 403));
          expect(result).toBeFalsy();
        });

        it('calls error403Handler if global handler', async () => {
          mockHttpClient.error403Handler = jest.fn();
          await mockHttpClient.responseErrorHandler(mockHttpErrorResponse({}, 403));
          expect(mockHttpClient.error403Handler).toBeCalled();
        });

        it('should not call error403Handler if global handler is not enabled', async () => {
          mockHttpClient.getGlobalHandler = jest.fn(() => GlobalHandler.Partial);
          mockHttpClient.error403Handler = jest.fn();
          await mockHttpClient.responseErrorHandler(mockHttpErrorResponse({}, 403))
            .catch(() => ({}));
          expect(mockHttpClient.error403Handler).not.toHaveBeenCalled();
        });
      });

      it('toasts all errors if global handler activated', async () => {
        mockHttpClient.getFormattedError = jest.fn((error) => error.code);

        await mockHttpClient.responseErrorHandler({
          response: {
            data: {
              errors: [
                {
                  code: 'code 1',
                },
                {
                  code: 'code 2',
                },
              ],
            },
          },
        });

        expect(Vue.toasted.global.error).toHaveBeenCalledTimes(2);
        expect(Vue.toasted.global.error.mock.calls).toEqual([['code 1'], ['code 2']]);
      });

      it('opens the error toaster if the error code has no translation', async () => {
        mockHttpClient.getFormattedError = jest.fn(() => '');
        await mockHttpClient.responseErrorHandler({
          response: {
            data: {
              errors: [
                {
                  code: 'code 1',
                },
                {
                  code: 'code 2',
                },
              ],
            },
          },
        });

        expect(Vue.prototype.$reportToasted).toHaveBeenCalledTimes(2);
        expect(Vue.prototype.$reportToasted.mock.calls).toEqual([['error.unexpected_error', {
          response:
         {
           data: {
             errors: [
               {
                 code: 'code 1',
               },
               {
                 code: 'code 2',
               },
             ],
           },
         },
        }], ['error.unexpected_error', {
          response: {
            data: {
              errors: [
                {
                  code: 'code 1',
                },
                {
                  code: 'code 2',
                },
              ],
            },
          },
        }]]);
      });

      it('rejects if global handler not enabled', async () => {
        mockHttpClient.getGlobalHandler = jest.fn(() => GlobalHandler.Partial);

        const errors = [{ code: '1' }, { code: '2' }];

        await expect(
          mockHttpClient.responseErrorHandler({
            response: {
              data: {
                errors,
              },
            },
          }),
        ).rejects.toEqual({ response: { data: { errors: [{ code: '1' }, { code: '2' }] } } });
      });

      it('toasts unexpected error if error not defined', async () => {
        await mockHttpClient.responseErrorHandler({
          response: {
            data: {
              errors: {},
            },
          },
        });

        expect(Vue.prototype.$reportToasted).toHaveBeenCalledWith(mockI18n.t('error.unexpected_error'), { response: { data: { errors: {} } } });
      });
    });

    describe('requestHandler', () => {
      jest.spyOn(uuid, 'v4').mockImplementation(() => 'uuid-mock');

      it('should set accessToken if existing and authentication is activated', () => {
        const request = {
          headers: {
            common: {
              'X-Request-ID': '',
              'X-Correlation-ID': '',
            },
          },
        };

        const res = mockHttpClient.requestHandler(request);

        expect(res.headers.Authorization).toEqual('Bearer accessToken');
      });

      it('should not set accessToken if ignoreJwt is true', () => {
        const request = {
          headers: {
            common: {
              'X-Request-ID': '',
              'X-Correlation-ID': '',
            },
          },
          ignoreJwt: true,
        };

        const res = mockHttpClient.requestHandler(request);

        expect(res.headers.Authorization).toBeFalsy();
      });

      it('should set the X-Request-ID and X-Correlation-ID header with uuidv4', () => {
        const request = {
          headers: {
            common: {
              'X-Request-ID': '',
              'X-Correlation-ID': '',
            },
          },
        };
        const res = mockHttpClient.requestHandler(request);

        expect(res.headers['X-Request-ID']).toEqual('uuid-mock');
        expect(res.headers['X-Correlation-ID']).toEqual('uuid-mock');
      });

      it('should sanitize932115', () => {
        const request = {
          isOData: true,
          headers: {
            common: {
              'X-Request-ID': '',
              'X-Correlation-ID': '',
            },
          },
          data: {},
        };
        const spy = jest.spyOn(owasp, 'sanitize932115');
        mockHttpClient.requestHandler(request);
        expect(spy).toBeCalled();
      });
    });

    describe('serializeParamsSql', () => {
      it('builds correct query', () => {
        const testQuery = '?$search=(something)';
        (buildQuerySql as any).mockImplementation(jest.fn(() => testQuery));

        // eslint-disable-next-line no-useless-escape
        const expectedResult = '$search=(something)';

        expect(mockHttpClient.serializeParamsSql()).toBe(expectedResult);
      });
    });

    describe('get', () => {
      it('returns correct value', async () => {
        mockHttpClient.getFullResponse = mockHttp().getFullResponse;

        const res = await mockHttpClient.get();

        const expected: IRestResponse<string> = await mockHttp().getFullResponse();

        expect(res).toEqual(expected.data);
      });
    });

    describe('getFullResponse', () => {
      it('returns correct value', async () => {
        mockHttpClient.axios.get = mockHttp().getFullResponse;

        const res = await mockHttpClient.getFullResponse();

        const expected: IRestResponse<string> = await mockHttp().getFullResponse();

        expect(res).toEqual(expected);
      });
    });

    describe('postFullResponse', () => {
      it('returns correct value', async () => {
        mockHttpClient.axios.post = mockHttp().postFullResponse;

        const res = await mockHttpClient.postFullResponse();

        const expected: IRestResponse<string> = await mockHttp().postFullResponse();

        expect(res).toEqual(expected);
      });
    });

    describe('getRestResponseAsFile', () => {
      it('returns the objecturl', () => {
        window.URL.createObjectURL = jest.fn(() => 'new url');

        const res = mockHttpClient.getRestResponseAsFile({});
        expect(res).toEqual('new url');
      });
    });

    describe('post', () => {
      it('returns correct value', async () => {
        mockHttpClient.axios.post = mockHttp().post;

        const res = await mockHttpClient.post();

        const expected: IRestResponse<string> = await mockHttp().post();

        expect(res).toEqual(expected.data);
      });
    });

    describe('patch', () => {
      it('returns correct value', async () => {
        mockHttpClient.axios.patch = mockHttp().patch;

        const res = await mockHttpClient.patch();

        const expected: IRestResponse<string> = await mockHttp().patch();

        expect(res).toEqual(expected.data);
      });
    });

    describe('put', () => {
      it('returns correct value', async () => {
        mockHttpClient.axios.put = mockHttp().put;

        const res = await mockHttpClient.put();

        const expected: IRestResponse<string> = await mockHttp().put();

        expect(res).toEqual(expected.data);
      });
    });

    describe('delete', () => {
      it('returns correct value', async () => {
        mockHttpClient.axios.delete = mockHttp().delete;

        const res = await mockHttpClient.delete();

        const expected: IRestResponse<string> = await mockHttp().delete();

        expect(res).toEqual(expected.data);
      });
    });

    describe('getFormattedError', () => {
      it('returns the error when meta is null', () => {
        const res = mockHttpClient.getFormattedError({
          status: '409',
          code: 'errors.event-has-been-open-before-so-scheduled-open-date-must-not-change',
          title: 'useless title',
          detail: '',
          meta: null,
        });
        expect(res).toBe('errors.event-has-been-open-before-so-scheduled-open-date-must-not-change');
      });

      it('returns the error when meta is string', () => {
        const res = mockHttpClient.getFormattedError({
          status: '409',
          code: 'errors.description-length-more-than-maximum',
          title: 'useless title',
          detail: '',
          meta: { MaxLength: '5' },
        });
        expect(res).toBe('errors.description-length-more-than-maximum');
      });

      it('returns the error when meta is multilingual', () => {
        const res = mockHttpClient.getFormattedError({
          status: '409',
          code: 'errors.maximum-number-of-household-members',
          title: 'useless title',
          detail: '',
          meta: { MaximumNumberOfHouseholdMembers: { translation: { en: 'my english text', fr: 'en francais svp' } } },
        });
        expect(res).toBe('errors.maximum-number-of-household-members');
      });

      it('replaces all instances of the variable in the string', () => {
        mockI18n.silentTranslationWarn = true;

        const res = mockHttpClient.getFormattedError({
          status: '409',
          code: 'my {param1} is really {param1}, not {param2}',
          title: 'my {param1} is really {param1}, not {param2}',
          detail: '',
          meta: { param1: { translation: { en: 'my english text', fr: 'en francais svp' } }, param2: '123' },
        });
        expect(res).toBe('my my english text is really my english text, not 123');
      });
    });

    describe('logToAppInsights', () => {
      it('calls trace when errors object is found and not a 404', async () => {
        mockHttpClient.logToAppInsights([{ error: 'error' }], { response: { status: 500, config: { url: 'my_call_url', method: 'GET' } } });
        expect(applicationInsights.trackTrace).toBeCalledWith(
'my_call_url http error 500',
          { error: [{ error: 'error' }], failedMethod: 'GET', failedRequestUrl: 'my_call_url' },
'httpClient',
'GET',
);
      });

      it('calls exception when errors object is found and a 404', async () => {
        mockHttpClient.logToAppInsights([{ error: 'error' }], { response: { status: 404, config: { url: 'my_call_url', method: 'GET' } } });
        expect(applicationInsights.trackException).toBeCalledWith(
'my_call_url http error 404',
          { error: [{ error: 'error' }], failedMethod: 'GET', failedRequestUrl: 'my_call_url' },
'httpClient',
'GET',
);
      });

      it('calls exception when errors object is not found', async () => {
        const exception = { response: { status: 500, config: { url: 'my_call_url', method: 'GET' } } };
        mockHttpClient.logToAppInsights(null, exception);
        expect(applicationInsights.trackException).toBeCalledWith(
'my_call_url http error 500',
          { error: exception, failedMethod: 'GET', failedRequestUrl: 'my_call_url' },
'httpClient',
'GET',
);
      });

      it('removes GUIDs from url in error name for eventual grouping of similar errors', async () => {
        const exception = { response: { status: 500, config: { url: 'https://emis-dev.crc-tech.ca/fr/events/da9dde49-8f34-4bab-bac8-bba8008b4005/financial-assistance/0da3d377-36f1-40af-b5c6-a0755fa494d9', method: 'GET' } } };
        mockHttpClient.logToAppInsights(null, exception);
        expect(applicationInsights.trackException).toBeCalledWith(
'https://emis-dev.crc-tech.ca/fr/events/GUID/financial-assistance/GUID http error 500',
          { error: exception, failedMethod: 'GET', failedRequestUrl: 'https://emis-dev.crc-tech.ca/fr/events/da9dde49-8f34-4bab-bac8-bba8008b4005/financial-assistance/0da3d377-36f1-40af-b5c6-a0755fa494d9' },
'httpClient',
'GET',
);
      });
    });

    describe('error403Handler', () => {
      it('should display a toast notification', () => {
        mockHttpClient.error403Handler();
        expect(Vue.toasted.global.error).toHaveBeenCalledWith(mockI18n.t('error.access_denied'));
      });

      it('should redirect to redirect403 with proper language after timer', () => {
        const backUp = window.location;
        delete window.location;
        window.location = {
          origin: 'origin',
          pathname: '/en/casefile/',
        } as any;

        const setHrefSpy = jest.fn((href) => href);

        Object.defineProperty(window.location, 'href', {
          set: setHrefSpy,
        });

        mockHttpClient.error403Handler();
        jest.runAllTimers();

        expect(setHrefSpy).toBeCalledWith('origin/en/redirect403');

        window.location = backUp;
      });
    });

    describe('mapRequestForLocalhost', () => {
      const apiPorts = 'assessment:44360,case-file:44355,event:44358,finance:44359';

      it('should do nothing for unmapped domains', () => {
        const request = {
          baseURL: 'https://api-dev2.crc-tech.ca',
          url: '/team/search/teams',
        };
        mockHttpClient.mapRequestForLocalhost(request, apiPorts);
        expect(request.baseURL).toBe('https://api-dev2.crc-tech.ca');
        expect(request.url).toBe('/team/search/teams');
      });

      it('should handle absolute urls', () => {
        const request = {
          baseURL: 'https://api-dev2.crc-tech.ca',
          url: 'http://localhost/case-file/search/case-files',
        };
        mockHttpClient.mapRequestForLocalhost(request, apiPorts);
        expect(request.baseURL).toBe('http://localhost:44355');
        expect(request.url).toBe('/search/case-files');
      });

      it('should handle absolute paths', () => {
        const request = {
          baseURL: 'https://api-dev2.crc-tech.ca',
          url: '/case-file/search/case-files',
        };
        mockHttpClient.mapRequestForLocalhost(request, apiPorts);
        expect(request.baseURL).toBe('http://localhost:44355');
        expect(request.url).toBe('/search/case-files');
      });

      it('should handle relative paths', () => {
        const request = {
          baseURL: 'https://api-dev2.crc-tech.ca',
          url: 'case-file/search/case-files',
        };
        mockHttpClient.mapRequestForLocalhost(request, apiPorts);
        expect(request.baseURL).toBe('http://localhost:44355');
        expect(request.url).toBe('/search/case-files');
      });
    });
  });
});
