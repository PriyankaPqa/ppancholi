import { mockStorage } from '@/store/storage';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { format } from 'date-fns';
import { User, mockUserData } from '@/entities/user';
import helpers from '../helpers/helpers';
import Component from './ErrorReportToast.vue';

const localVue = createLocalVue();
const storage = mockStorage();

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
  storage.user.getters.user = jest.fn(() => user);

  beforeEach(() => {
    jest.spyOn(document, 'getElementsByClassName').mockImplementation(() => [({ style: { display: '' } })]);

    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        error,
        show: true,
        message: 'mock-error-message',
      },
      computed: {
        languageCode: () => 'en',
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
    describe('api', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.api).toEqual('mock-url');
      });
    });

    describe('callPayload', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.callPayload).toEqual({ key1: { key2: 'value' } });
      });
    });

    describe('errorType', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.errorType).toEqual('Request failed with status code 400');
      });
    });

    describe('hasSupportAddress', () => {
      it('returns the right value', async () => {
        wrapper.vm.$store.state.tenantSettingsEntities.currentTenantSettings.supportEmails = { translation: { en: 'mock-email-en' } };
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
        wrapper.vm.$store.state.tenantSettingsEntities.currentTenantSettings.tenantId = '12345';
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

    it('calls addToastCloseButton and addToastReportButton', () => {
      wrapper.vm.addToastCloseButton = jest.fn();
      wrapper.vm.addToastReportButton = jest.fn();
      wrapper.vm.$options.mounted.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.addToastCloseButton).toBeCalledTimes(1);
      expect(wrapper.vm.addToastReportButton).toBeCalledTimes(1);
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
          mocks: {
            $storage: storage,
          },
        });
        JSON.stringify = jest.fn(() => 'mocks-stringified-json-value');

        const time = new Date();
        await wrapper.vm.makeReportPayload();
        expect(wrapper.vm.report).toEqual({
          id: format(time, 'yyyy-MM-dd_H:mm:ss'),
          user,
          timestamp: time.toISOString(),
          api: wrapper.vm.api,
          status: wrapper.vm.error.response.status,
          payload: '{"key1": { "key2": "value" }}',
          errorResponse: 'mocks-stringified-json-value',
          description: '',
          appUrl: wrapper.vm.$route.fullPath,
          tenantId: 'mock-tenant-id',
          languageCode: 'en',
        });
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
