/**
 * @group services
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as uuid from 'uuid';
import Vue from 'vue';
import camelCaseKeys from 'camelcase-keys';
import axios from 'axios';
import { Toasted } from 'vue-toasted';
import applicationInsights from '@libs/registration-lib/plugins/applicationInsights/applicationInsights';
import { mockHttp } from '@libs/registration-lib/services/httpClient.mock';
import { IRestResponse } from '@libs/registration-lib/types';
import { i18n } from '@/ui/plugins/i18n';
import { HttpClient } from './httpClient';

jest.mock('uuid');
jest.mock('@libs/registration-lib/plugins/applicationInsights/applicationInsights');

const mockAxios = axios.create();
mockAxios.interceptors.request.use = jest.fn();
mockAxios.interceptors.response.use = jest.fn();

let mockHttpClient: any;

beforeEach(() => {
  jest.clearAllMocks();
  i18n.silentTranslationWarn = true;
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

        expect(result).toEqual(camelCaseKeys(response, { deep: true }));
      });
    });

    describe('responseErrorHandler', () => {
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
