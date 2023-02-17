/* eslint-disable vue/max-len, max-len */
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { User, mockUserData } from '@libs/entities-lib/user';

import { useMockUserStore } from '@/pinia/user/user.mock';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import { createTestingPinia } from '@pinia/testing';
import helpers from '../helpers/helpers';
import Component from './ErrorReportToast.vue';

const localVue = createLocalVue();

let onLineGetter;

describe('ErrorReportToast', () => {
  let wrapper;

  const error = {
    message: 'Request failed with status code 400',
    request: {
      responseURL: 'mock-url',
    },
    response: {
      data: { errors: [{ code: 'mock-error-code' }] },
      config: { data: '{"key1": { "key2": "value" }}' },
      status: 404,
    },
  };
  const user = new User(mockUserData());
  const errorWAFFormat = {
    message: 'Network Error',
    name: 'AxiosError',
    config: {
      transitional: {
        silentJSONParsing: true,
        forcedJSONParsing: true,
        clarifyTimeoutError: false,
      },
      transformRequest: [
        null,
      ],
      transformResponse: [
        null,
      ],
      timeout: 0,
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
      maxContentLength: -1,
      maxBodyLength: -1,
      env: {
        FormData: null,
      },
      headers: {
        Accept: 'application/json',
        'x-tenant-id': 'c400f50d-7a56-4ef2-8e44-211bfa434724',
        'Accept-Language': 'fr',
        Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjJaUXBKM1VwYmpBWVhZR2FYRUpsOGxWMFRPSSJ9.eyJhdWQiOiI2MzI4ZDIzMC1hMWVlLTRmY2YtOTc5OS0zNTM5ZjE3MTU4ZTkiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vYzQwMGY1MGQtN2E1Ni00ZWYyLThlNDQtMjExYmZhNDM0NzI0L3YyLjAiLCJpYXQiOjE2NjMwOTQzMjEsIm5iZiI6MTY2MzA5NDMyMSwiZXhwIjoxNjYzMDk4OTI0LCJhaW8iOiJBWlFBYS84VEFBQUFRTTJyZ0t3ZkJaeWlKVCtobjVOL2ZzQ3FnNC9ad0E0S1hDaElJb0ZIQURDU0JwRkpJcEFLWFhvVFJMMzE5Vk1uMVNGek9QQW83ZzZhNFVQOFlraTNjSDRORzNjVndBSU90NisvYitQUXlBR0dPSTJKQ2EwRkwxQmdpSmR0dTRlS0VZUWc5dkJRMlhxSk8xYSt6bjlxbjZoZFI1NDdXczc0QWRrR0NNN3VNYW40ckhSSVFBT25QQUhISXVnVE5haE0iLCJhenAiOiIwMzBlNWEzMi1iNmVmLTQ5MjctOTRiYS03NGQ5MWVhYTI1MWUiLCJhenBhY3IiOiIwIiwibmFtZSI6Ik1hcmMtQW5kcsOpIERlc2Now6puZXMiLCJvaWQiOiIwZDIyZjUwYS1lMWFiLTQzNWQtYTlmMC1jZmRhNTAyODY2ZjQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJtYWRlc2NoZW5lc0BjcmN0ZWNobWFpbi5vbm1pY3Jvc29mdC5jb20iLCJyaCI6IjAuQVgwQURmVUF4Rlo2OGs2T1JDRWIta05ISkREU0tHUHVvYzlQbDVrMU9mRnhXT2w5QUo4LiIsInJvbGVzIjpbImxldmVsNiJdLCJzY3AiOiJhcGlfYWNjZXNzIiwic3ViIjoiU2paNkllVTB2TjQzTjY5NGkxSlBkLVBvSmFrMDRjRW1EYzBJUGp4allvNCIsInRpZCI6ImM0MDBmNTBkLTdhNTYtNGVmMi04ZTQ0LTIxMWJmYTQzNDcyNCIsInV0aSI6IkI2ZEhuMnNVTVUteHBqN3JmTW95QUEiLCJ2ZXIiOiIyLjAifQ.HG1ur7k2TezfT_xPKvy5ZA35Ibb4t2OYojihli1xYLQHdLxAaUxcyNk9nhiZ2FR0O2MWydJqjtDsPCQSbGt_5xDXz8LvIW8FSWzKP2nn9FQER4JcrgU2mcNq_lgfP0VkR5dZV351jIbz8ciodCZuttZQz7ZIWAqXiVcief2IJronJ7PM6EqqUW1RUYETI-OJn2bMlTxv_WF_UFy80lJnjSUnSGX4uthParhvvNOESa4mTz3Z9W2-7q3AQpEpvZnC9g5rEhD9U4zi7BJ3kKlQpNUVyZiPksMpYh31nU3tRIyHfUqf3YG1ykjmR39PcIDppnsNUAxGGJEff6KMyBxFoA',
        'X-Request-ID': '02d4d754-98c6-4873-9e7f-9c31d3016d32',
        'X-Correlation-ID': '2bcd78ad-21e4-454f-90cd-4500a6d40ad2',
        'Content-Type': 'application/json',
      },
      baseURL: 'https://api-lab.crc-tech.ca/',
      withCredentials: true,
      method: 'patch',
      url: 'https://api-lab.crc-tech.ca/case-file/case-files/e6112152-be92-4d45-8b9a-69320dc7a835/labels',
      data: '{"labels":[{"name":"<br>","order":1},{"name":"","order":2},{"name":"","order":3},{"name":"","order":4}]}',
    },
    code: 'ERR_NETWORK',
    status: null,
  };
  const pinia = createTestingPinia({ stubActions: false });
  const { userStore } = useMockUserStore(pinia);
  const { tenantSettingsStore } = useMockTenantSettingsStore(pinia);

  beforeEach(() => {
    jest.spyOn(document, 'getElementsByClassName').mockImplementation(() => [({ style: { display: '' } })]);
    onLineGetter = jest.spyOn(window.navigator, 'onLine', 'get');
    userStore.getUser = jest.fn(() => user);

    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        error,
        show: true,
        message: 'mock-error-message',
      },
      computed: {
        languageCode: () => 'en',
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Computed', () => {
    describe('api', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.api).toEqual('mock-url');
        await wrapper.setProps({ error: errorWAFFormat });
        expect(wrapper.vm.api).toEqual('https://api-lab.crc-tech.ca/case-file/case-files/e6112152-be92-4d45-8b9a-69320dc7a835/labels');
      });
    });

    describe('callPayload', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.callPayload).toEqual({ key1: { key2: 'value' } });
        await wrapper.setProps({ error: errorWAFFormat });
        expect(wrapper.vm.callPayload).toEqual({
          labels: [
            {
              name: '<br>',
              order: 1,
            },
            {
              name: '',
              order: 2,
            },
            {
              name: '',
              order: 3,
            },
            {
              name: '',
              order: 4,
            },
          ],
        });
      });
    });

    describe('errorType', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.errorType).toEqual('Request failed with status code 400');
      });
    });

    describe('hasSupportAddress', () => {
      it('returns the right value', async () => {
        tenantSettingsStore.currentTenantSettings.supportEmails = { translation: { en: 'mock-email-en' } };
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.hasSupportAddress).toBeTruthy();
      });
    });

    describe('languageCode', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.languageCode).toEqual('en');
      });
    });

    describe('payloadMaxHeight', () => {
      it('returns the right value when showFullPayload is true', async () => {
        await wrapper.setData({ showFullPayload: true });
        expect(wrapper.vm.payloadMaxHeight).toEqual('none');
      });

      it('returns the right value when showFullPayload is false', async () => {
        await wrapper.setData({ showFullPayload: false });
        expect(wrapper.vm.payloadMaxHeight).toEqual('50px');
      });
    });

    describe('payloadToggleText', () => {
      it('returns the right value when showFullPayload is true', async () => {
        await wrapper.setData({ showFullPayload: true });
        expect(wrapper.vm.payloadToggleText).toEqual('errorReport.errorDialog.hidePayload');
      });

      it('returns the right value when showFullPayload is false', async () => {
        await wrapper.setData({ showFullPayload: false });
        expect(wrapper.vm.payloadToggleText).toEqual('errorReport.errorDialog.showPayload');
      });
    });

    describe('stringifiedCallPayload', () => {
      it('returns the right value', () => {
        JSON.stringify = jest.fn(() => 'mocks-stringified-json-value');
        expect(wrapper.vm.stringifiedCallPayload).toEqual('mocks-stringified-json-value');
      });
    });

    describe('tenantId', () => {
      it('returns the right value', async () => {
        tenantSettingsStore.currentTenantSettings.tenantId = '12345';
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.tenantId).toEqual('12345');
      });
    });
  });

  describe('Mounted', () => {
    it('saves the toaster data in the toast variable', () => {
      expect(JSON.stringify(wrapper.vm.toast)).toEqual(JSON.stringify({
        el: {
          appendChild: jest.fn(),
          querySelector: jest.fn(() => ({
            appendChild: jest.fn(),
          })),
        },
        goAway: jest.fn(),
      }));
    });

    it('calls addToastCloseButton', () => {
      wrapper.vm.addToastCloseButton = jest.fn();
      wrapper.vm.addToastReportButton = jest.fn();
      wrapper.vm.$options.mounted.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.addToastCloseButton).toBeCalledTimes(1);
    });

    describe('addToastReportButton', () => {
      it('should not be called if the navigator is offline', () => {
        onLineGetter.mockReturnValueOnce(false);
        wrapper.vm.addToastReportButton = jest.fn();
        wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.addToastReportButton).toBeCalledTimes(0);
      });

      it('should be called if the navigator is online', () => {
        wrapper.vm.addToastReportButton = jest.fn();
        wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.addToastReportButton).toBeCalledTimes(1);
      });
    });
  });

  describe('Method', () => {
    describe('addToastReportButton', () => {
      it('adds a report button to the toaster', async () => {
        jest.clearAllMocks();
        const spy = jest.spyOn(document, 'createElement').mockImplementation(() => ({
          addEventListener: jest.fn(),
        }));
        wrapper.vm.initReport = jest.fn();
        tenantSettingsStore.currentTenantSettings.supportEmails = {};
        await wrapper.vm.addToastReportButton();
        expect(wrapper.vm.toast.el.appendChild).toBeCalledWith(expect.objectContaining({
          className: 'v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--small report-error-btn',
          innerHTML: 'errorReport.errorDialog.errorDetails',
        }));

        spy.mockRestore();
      });
    });

    describe('addToastCloseButton', () => {
      it('adds a close button to the toaster', async () => {
        wrapper.vm.toast.el.querySelector = jest.fn(() => ({
          appendChild: jest.fn(),
        })).mockReturnThis();

        const spy = jest.spyOn(document, 'createElement').mockImplementation(() => ({
          appendChild: jest.fn(),
          addEventListener: jest.fn(),
        }));

        await wrapper.vm.addToastCloseButton();

        expect(wrapper.vm.toast.el.querySelector('.message-line').appendChild).toHaveBeenCalledWith(expect.objectContaining({
          className: 'close-btn action',
        }));

        spy.mockRestore();
      });
    });

    describe('closeDialog', () => {
      it('sets showErrorReportDialog to false and calls emit', async () => {
        wrapper.setData({ showErrorReportDialog: true });
        await wrapper.vm.closeDialog();

        expect(wrapper.vm.showErrorReportDialog).toBeFalsy();
        expect(wrapper.emitted('update:show')[0][0])
          .toEqual(false);
      });
    });

    describe('initReport', () => {
      it('sets showErrorReportDialog to true, calls toast.goAway and makeReportPayload ', async () => {
        wrapper.setData({ showErrorReportDialog: false });
        wrapper.vm.makeReportPayload = jest.fn();
        await wrapper.vm.initReport();

        expect(wrapper.vm.showErrorReportDialog).toEqual(true);
        expect(wrapper.vm.toast.goAway).toBeCalledTimes(1);
        expect(wrapper.vm.makeReportPayload).toBeCalledTimes(1);
      });
    });

    describe('submitReport', () => {
      it('calls makeDescription and calls the service tenantSettings.sendErrorReport and emits update:show', async () => {
        wrapper.setData({ report: { id: '1234' } });
        wrapper.vm.makeDescription = jest.fn(() => 'mock-description');
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submitReport();

        expect(wrapper.vm.makeDescription).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$services.errorReporting.sendErrorReport).toBeCalledWith({ id: '1234', description: 'mock-description' });
        expect(wrapper.emitted('update:show')[0][0])
          .toEqual(false);
      });

      it('calls $reportToasted if the call fails', async () => {
        jest.spyOn(wrapper.vm.$services.errorReporting, 'sendErrorReport').mockImplementation(() => {
          throw new Error();
        });
        wrapper.vm.$reportToasted = jest.fn();
        await wrapper.vm.submitReport();
        expect(wrapper.vm.$reportToasted).toBeCalledWith('errorReport.errorDialog.reportSentFail', expect.anything());
      });
    });

    describe('makeReportPayload', () => {
      it('sets the right value into report', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            error,
            show: true,
            message: 'mock-error-message',
          },
          computed: {
            languageCode: () => 'en',
            stringifiedCallPayload: () => '{"key1": { "key2": "value" }}',
            tenantId: () => 'mock-tenant-id',
          },
        });

        await wrapper.vm.makeReportPayload();
        expect(wrapper.vm.report).toEqual(expect.objectContaining({
          user,
          api: wrapper.vm.api,
          status: error.response.status,
          payload: '{"key1": { "key2": "value" }}',
          errorResponse: JSON.stringify(error.response, null, 2),
          description: JSON.stringify(wrapper.vm.errorType),
          appUrl: wrapper.vm.$route.fullPath,
          tenantId: 'mock-tenant-id',
          languageCode: 'en',
        }));

        await wrapper.setProps({ error: errorWAFFormat });
        await wrapper.vm.makeReportPayload();
        expect(wrapper.vm.report).toEqual(expect.objectContaining({
          user,
          api: wrapper.vm.api,
          status: errorWAFFormat.response?.status,
          payload: '{"key1": { "key2": "value" }}',
          errorResponse: JSON.stringify(errorWAFFormat.response, null, 2),
          description: JSON.stringify(wrapper.vm.errorType),
          appUrl: wrapper.vm.$route.fullPath,
          tenantId: 'mock-tenant-id',
          languageCode: 'en',
        }));
      });
    });

    describe('makeDescription', () => {
      it('returns the right description content', async () => {
        await wrapper.setData({ descriptionDoing: 'mock-doing', descriptionExpected: 'mock-expected', descriptionHappened: 'mock-happened' });
        const description = wrapper.vm.makeDescription();
        // eslint-disable-next-line max-len
        expect(description).toEqual('errorReport.errorDialog.description.doing mock-doing\nerrorReport.errorDialog.description.expected mock-expected\nerrorReport.errorDialog.description.happened mock-happened');
      });
    });

    describe('makeDescription', () => {
      it('returns the right description content', async () => {
        await wrapper.setData({ descriptionDoing: 'mock-doing', descriptionExpected: 'mock-expected', descriptionHappened: 'mock-happened' });
        const description = wrapper.vm.makeDescription();
        // eslint-disable-next-line max-len
        expect(description).toEqual('errorReport.errorDialog.description.doing mock-doing\nerrorReport.errorDialog.description.expected mock-expected\nerrorReport.errorDialog.description.happened mock-happened');
      });
    });

    describe('copyErrorData', () => {
      it('calls the helper copyToClipBoard with the right value', async () => {
        helpers.copyToClipBoard = jest.fn();
        wrapper.setData({ report: { id: '1234' } });
        JSON.stringify = jest.fn(() => 'mocks-stringified-json-value');
        await wrapper.vm.copyErrorData();

        expect(helpers.copyToClipBoard).toBeCalledWith('mocks-stringified-json-value');
      });
    });
  });
});
