import { MAX_LENGTH_MD, MAX_LENGTH_SMS } from '@libs/shared-lib/constants/validations';
import { mockEvent } from '@libs/entities-lib/registration-event/registrationEvent.mock';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import utils from '@libs/entities-lib/utils';

import { mockProvider } from '@/services/provider';
import { MassActionCommunicationMethod } from '@libs/entities-lib/mass-action';
import Component from './CommunicationDetailsCreate.vue';

const formCopy = {
  event: mockEvent(),
  messageSubject: { translation: { en: 'en', fr: 'fr' } },
  emailMessage: { translation: { en: 'en', fr: 'fr' } },
  smsMessage: { translation: { en: 'en', fr: 'fr' } },
};

const localVue = createLocalVue();
const services = mockProvider();

describe('CommunicationDetailsCreate.vue', () => {
  let wrapper;

  const doMount = (method) => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        form: {
          event: mockEvent(),
          method,
          messageSubject: { translation: { en: 'en', fr: 'fr' } },
          emailMessage: { translation: { en: 'en', fr: 'fr' } },
          smsMessage: { translation: { en: 'en', fr: 'fr' } },
        },
      },
      mocks: {
        $services: services,
      },
    });
  };

  describe('Template', () => {
    describe('Communication_SMS', () => {
      it('should be not rendered when method is null', async () => {
        doMount(null);
        const element = wrapper.findDataTest('communication-sms-description');
        expect(element.exists()).toBeFalsy();
      });

      it('should be not rendered when method is email', async () => {
        doMount(MassActionCommunicationMethod.Email);
        const element = wrapper.findDataTest('communication-sms-description');
        expect(element.exists()).toBeFalsy();
      });

      it('should be rendered when method is sms', async () => {
        doMount(MassActionCommunicationMethod.SMS);
        const element = wrapper.findDataTest('communication-sms-description');
        expect(element.exists()).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          form: formCopy,
        },
        mocks: {
          $services: services,
        },
      });
    });

    describe('rules', () => {
      it('should return proper rules', () => {
        expect(wrapper.vm.rules)
          .toEqual({
            event: {
              required: true,
            },
            method: {
              required: true,
            },
            messageSubject: {
              required: true,
              max: MAX_LENGTH_MD,
            },
            smsMessage: {
              max: MAX_LENGTH_SMS,
            },
          });
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          form: formCopy,
        },
        mocks: {
          $services: services,
        },
      });
    });

    describe('onClearEvent', () => {
      it('should call onSetEvent with null', () => {
        wrapper.vm.onSetEvent = jest.fn();
        wrapper.vm.onClearEvent();
        expect(wrapper.vm.onSetEvent).toHaveBeenLastCalledWith(null);
      });
    });

    describe('onSetEvent', () => {
      it('should set the event and reset other fields', async () => {
        await wrapper.vm.onSetEvent(mockEvent());
        expect(wrapper.vm.formCopy).toEqual({ ...formCopy });
      });
    });

    describe('fillEmptyMultilingualFields', () => {
      it('calls entityUtils.getFilledMultilingualField and assigns the result to emailSubject', () => {
        const spy = jest.spyOn(utils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-subject-en' } }));
        wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.formCopy.messageSubject).toEqual({ translation: { en: 'mock-subject-en' } });
        spy.mockRestore();
      });
      it('calls entityUtils.getFilledMultilingualField and assigns the result to emailMessage', () => {
        const spy = jest.spyOn(utils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-name-en' } }));
        wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.formCopy.emailMessage).toEqual({ translation: { en: 'mock-name-en' } });
        spy.mockRestore();
      });
      it('calls entityUtils.getFilledMultilingualField and assigns the result to smsMessage', () => {
        const spy = jest.spyOn(utils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-name-en' } }));
        wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.formCopy.smsMessage).toEqual({ translation: { en: 'mock-name-en' } });
        spy.mockRestore();
      });
    });

    describe('clearEmailText', () => {
      it('calls entityUtils.initMultilingualAttributes and assigns the result to emailMessage', () => {
        const spy = jest.spyOn(utils, 'initMultilingualAttributes').mockImplementation(() => ({ translation: { en: 'mock-name-en' } }));
        wrapper.vm.clearEmailText();
        expect(wrapper.vm.formCopy.emailMessage).toEqual({ translation: { en: 'mock-name-en' } });
        spy.mockRestore();
      });
    });

    describe('setLanguageMode', () => {
      it('sets the languageMode', () => {
        wrapper.vm.setLanguageMode('fr');
        expect(wrapper.vm.languageMode).toBe('fr');
      });

      it('calls fillEmptyMultilingualAttributes entity method', () => {
        const spy = jest.spyOn(utils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-name-en' } }));
        wrapper.vm.setLanguageMode('fr');
        expect(spy).toHaveBeenCalledTimes(3);
        spy.mockRestore();
      });
    });
  });

  describe('Watch', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          form: formCopy,
        },

      });
      wrapper.vm.onSetEvent = jest.fn();
    });

    describe('formCopy', () => {
      it('should emit update event with proper params', () => {
        expect(wrapper.emitted('update')[0][0]).toEqual(wrapper.vm.formCopy);
      });
    });

    describe('formCopy.event', () => {
      it('should call onSetEvent with proper param ', async () => {
        expect(wrapper.vm.onSetEvent).toHaveBeenLastCalledWith(wrapper.vm.formCopy.event);
      });
    });
  });
});
