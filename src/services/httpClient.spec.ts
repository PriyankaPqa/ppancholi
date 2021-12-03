/* eslint-disable @typescript-eslint/no-explicit-any */
import * as uuid from 'uuid';
import Vue from 'vue';
import { camelKeys } from 'js-convert-case';
import axios from 'axios';
import { Toasted } from 'vue-toasted';
import applicationInsights from '@crctech/registration-lib/src/plugins/applicationInsights/applicationInsights';
import buildQuery from '@/services/odata-query';
import { mockHttp } from '@/services/httpClient.mock';
import { httpClient, HttpClient, IRestResponse } from './httpClient';
import { i18n } from '@/ui/plugins/i18n';
import { localStorageKeys } from '@/constants/localStorage';

jest.mock('uuid');
jest.mock('@/services/odata-query');
jest.mock('@crctech/registration-lib/src/plugins/applicationInsights/applicationInsights');

const mockAxios = axios.create();
mockAxios.interceptors.request.use = jest.fn();
mockAxios.interceptors.response.use = jest.fn();

let mockHttpClient: any;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('httpClient', () => {
  describe('Constructor', () => {
    beforeEach(() => {
      jest.spyOn(axios, 'create').mockImplementation(() => mockAxios);

      mockHttpClient = new HttpClient();
    });

    it('creates AxiosInstance with correct params', () => {
      expect(axios.create).toHaveBeenLastCalledWith({
        baseURL: `${process.env.VUE_APP_API_BASE_URL}/`,
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
  });

  describe('Methods', () => {
    beforeEach(() => {
      mockHttpClient = new HttpClient();

      Vue.toasted = {
        global: {
          warning: jest.fn(),
          error: jest.fn(),
        },
      } as Toasted;
    });

    describe('setHeadersTenant', () => {
      it('sets tenantId', () => {
        mockHttpClient.setHeadersTenant('test-id');

        expect(mockHttpClient.axios.defaults.headers.common['x-tenant-id']).toBe('test-id');
      });
    });

    describe('setHeadersLanguage', () => {
      it('sets headers language', () => {
        mockHttpClient.setHeadersLanguage('test-language');

        expect(mockHttpClient.axios.defaults.headers.common['Accept-Language']).toBe('test-language');
      });
    });

    describe('isGlobalHandlerEnabled', () => {
      it('returns default value if not defined', () => {
        const result = mockHttpClient.isGlobalHandlerEnabled({});

        expect(result).toBeTruthy();
      });

      it('returns defined value', () => {
        const result = mockHttpClient.isGlobalHandlerEnabled({
          globalHandler: false,
        });

        expect(result).toBeFalsy();
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

    describe('error401Handler', () => {
      it('toasts warning message', () => {
        mockHttpClient.error401Handler();

        expect(Vue.toasted.global.warning).toHaveBeenCalledWith(i18n.t('error.401.refresh'));
      });

      it('sets local storage if value not exists in storage', () => {
        const mockLocalStorage = {
          getItem: jest.fn(),
          setItem: jest.fn(),
        };

        Object.defineProperty(window, 'localStorage', {
          value: mockLocalStorage,
          writable: true,
        });

        mockHttpClient.error401Handler();

        expect(global.localStorage.setItem).toHaveBeenCalledWith(localStorageKeys.last401Redirect.name, expect.anything());
      });
    });

    describe('responseErrorHandler', () => {
      it('returns false if no response', async () => {
        const result = await mockHttpClient.responseErrorHandler();

        expect(result).toBeFalsy();
      });

      it('returns false if is 401', async () => {
        const result = await mockHttpClient.responseErrorHandler({
          response: {
            status: 401,
          },
        });

        expect(result).toBeFalsy();
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

      it('rejects if global handler deactivated', async () => {
        mockHttpClient.isGlobalHandlerEnabled = jest.fn(() => false);

        const errors = [{ code: '1' }, { code: '2' }];

        await expect(
          mockHttpClient.responseErrorHandler({
            response: {
              data: {
                errors,
              },
            },
          }),
        ).rejects.toEqual(errors);
      });

      it('toasts unexpected error if error not defined', async () => {
        await mockHttpClient.responseErrorHandler({
          response: {
            data: {
              errors: {},
            },
          },
        });

        expect(Vue.toasted.global.error).toHaveBeenCalledWith(i18n.t('error.unexpected_error'));
      });
    });

    describe('requestHandler', () => {
      jest.spyOn(uuid, 'v4').mockImplementation(() => 'uuid-mock');

      it('should set accessToken if existing', () => {
        Object.defineProperty(window, 'localStorage', {
          value: {
            getItem: jest.fn(() => 'test access token'),
          },
          writable: true,
        });

        const request = {
          headers: {
            common: {
              'X-Request-ID': '',
              'X-Correlation-ID': '',
            },
          },
        };

        const res = mockHttpClient.requestHandler(request);

        expect(res.headers.common.Authorization).toEqual('Bearer test access token');
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

        expect(res.headers.common['X-Request-ID']).toEqual('uuid-mock');
        expect(res.headers.common['X-Correlation-ID']).toEqual('uuid-mock');
      });

      it('should define paramsSerializer if Odata', () => {
        const request = {
          isOData: true,
          headers: {
            common: {
              'X-Request-ID': '',
              'X-Correlation-ID': '',
            },
          },
        };

        const res = mockHttpClient.requestHandler(request);

        expect(res.paramsSerializer).toEqual(mockHttpClient.serializeParams);
      });
    });

    describe('serializeParams', () => {
      it('builds correct query', () => {
        const testQuery = '?$search=(something)';
        (buildQuery as any).mockImplementation(jest.fn(() => testQuery));

        // eslint-disable-next-line no-useless-escape
        const expectedResult = 'search=(something)';

        expect(mockHttpClient.serializeParams()).toBe(expectedResult);
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
        const res = httpClient.getFormattedError({
          status: '409',
          code: 'errors.event-has-been-open-before-so-scheduled-open-date-must-not-change',
          title: 'useless title',
          detail: '',
          meta: null,
        });
        expect(res).toBe('Event has been open before so scheduled open date must not change');
      });

      it('returns the error when meta is string', () => {
        const res = httpClient.getFormattedError({
          status: '409',
          code: 'errors.description-length-more-than-maximum',
          title: 'useless title',
          detail: '',
          meta: { MaxLength: '5' },
        });
        expect(res).toBe('The description length must be 5 or less');
      });

      it('returns the error when meta is multilingual', () => {
        const res = httpClient.getFormattedError({
          status: '409',
          code: 'errors.maximum-number-of-household-members',
          title: 'useless title',
          detail: '',
          meta: { MaximumNumberOfHouseholdMembers: { translation: { en: 'my english text', fr: 'en francais svp' } } },
        });
        expect(res).toBe('The maximum number of household members is my english text');
      });

      it('replaces all instances of the variable in the string', () => {
        i18n.silentTranslationWarn = true;

        const res = httpClient.getFormattedError({
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
        expect(applicationInsights.trackTrace).toBeCalledWith('my_call_url http error 500',
          { error: [{ error: 'error' }], failedMethod: 'GET', failedRequestUrl: 'my_call_url' }, 'httpClient', 'GET');
      });

      it('calls exception when errors object is found and a 404', async () => {
        mockHttpClient.logToAppInsights([{ error: 'error' }], { response: { status: 404, config: { url: 'my_call_url', method: 'GET' } } });
        expect(applicationInsights.trackException).toBeCalledWith('my_call_url http error 404',
          { error: [{ error: 'error' }], failedMethod: 'GET', failedRequestUrl: 'my_call_url' }, 'httpClient', 'GET');
      });

      it('calls exception when errors object is not found', async () => {
        const exception = { response: { status: 500, config: { url: 'my_call_url', method: 'GET' } } };
        mockHttpClient.logToAppInsights(null, exception);
        expect(applicationInsights.trackException).toBeCalledWith('my_call_url http error 500',
          { error: exception, failedMethod: 'GET', failedRequestUrl: 'my_call_url' }, 'httpClient', 'GET');
      });

      it('removes GUIDs from url in error name for eventual grouping of similar errors', async () => {
        const exception = { response: { status: 500, config: { url: 'https://emis-dev.crc-tech.ca/fr/events/da9dde49-8f34-4bab-bac8-bba8008b4005/financial-assistance/0da3d377-36f1-40af-b5c6-a0755fa494d9', method: 'GET' } } };
        mockHttpClient.logToAppInsights(null, exception);
        expect(applicationInsights.trackException).toBeCalledWith('https://emis-dev.crc-tech.ca/fr/events/GUID/financial-assistance/GUID http error 500',
          { error: exception, failedMethod: 'GET', failedRequestUrl: 'https://emis-dev.crc-tech.ca/fr/events/da9dde49-8f34-4bab-bac8-bba8008b4005/financial-assistance/0da3d377-36f1-40af-b5c6-a0755fa494d9' }, 'httpClient', 'GET');
      });
    });
  });
});
