import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { mockEventSummary } from '@libs/entities-lib/event/event.mock';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { mockAssessmentFormEntity, mockSearchDataForm, PublishStatus } from '@libs/entities-lib/assessment-template';
import { Status } from '@libs/entities-lib/base';
import utils from '@libs/entities-lib/utils';

import { mockProvider } from '@/services/provider';
import Component from './AssessmentDetailsCreate.vue';

const formCopy = {
  event: mockEventSummary(),
  assessment: mockAssessmentFormEntity(),
  emailSubject: { translation: { en: 'en', fr: 'fr' } },
  emailAdditionalDescription: { translation: { en: 'en', fr: 'fr' } },
  emailTopCustomContent: { translation: { en: 'en top', fr: 'fr top' } },
};

const localVue = createLocalVue();
const services = mockProvider();

describe('AssessmentDetailsCreate.vue', () => {
  let wrapper;

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
            assessment: {
              required: true,
            },
            emailSubject: {
              required: true,
              max: MAX_LENGTH_MD,
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
        await wrapper.vm.onSetEvent(mockEventSummary());
        expect(wrapper.vm.formCopy).toEqual({ ...formCopy, assessment: null });
      });
      it('should search for assessments', async () => {
        wrapper.vm.$services.assessmentForms.search = jest.fn(() => mockSearchDataForm);
        await wrapper.vm.onSetEvent(mockEventSummary());
        expect(wrapper.vm.$services.assessmentForms.search).toHaveBeenCalledWith({
          filter: { 'Entity/EventId': mockEventSummary().id, 'Entity/Status': Status.Active, 'Entity/PublishStatus': PublishStatus.Published },
          orderBy: `Entity/Name/Translation/${wrapper.vm.$i18n.locale}`,
        });
        expect(wrapper.vm.assessments).toEqual(mockSearchDataForm.value.map((x) => x.entity));
      });
    });

    describe('fillEmptyMultilingualFields', () => {
      it('calls entityUtils.getFilledMultilingualField and assigns the result to emailSubject', () => {
        const spy = jest.spyOn(utils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-subject-en' } }));
        wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.formCopy.emailSubject).toEqual({ translation: { en: 'mock-subject-en' } });
        spy.mockRestore();
      });
      it('calls entityUtils.getFilledMultilingualField and assigns the result to emailAdditionalDescription', () => {
        const spy = jest.spyOn(utils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-name-en' } }));
        wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.formCopy.emailAdditionalDescription).toEqual({ translation: { en: 'mock-name-en' } });
        spy.mockRestore();
      });
      it('calls entityUtils.getFilledMultilingualField and assigns the result to emailTopCustomContent', () => {
        const spy = jest.spyOn(utils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-name-en' } }));
        wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.formCopy.emailTopCustomContent).toEqual({ translation: { en: 'mock-name-en' } });
        spy.mockRestore();
      });
    });

    describe('clearEmailText', () => {
      it('calls entityUtils.initMultilingualAttributes and assigns the result to emailAdditionalDescription', () => {
        const spy = jest.spyOn(utils, 'initMultilingualAttributes').mockImplementation(() => ({ translation: { en: 'mock-name-en' } }));
        wrapper.vm.clearEmailText();
        expect(wrapper.vm.formCopy.emailAdditionalDescription).toEqual({ translation: { en: 'mock-name-en' } });
        expect(wrapper.vm.formCopy.emailTopCustomContent).not.toEqual({ translation: { en: 'mock-name-en' } });
        spy.mockRestore();
      });
      it('calls entityUtils.initMultilingualAttributes and assigns the result to emailTopCustomContent if true', () => {
        const spy = jest.spyOn(utils, 'initMultilingualAttributes').mockImplementation(() => ({ translation: { en: 'mock-name-en' } }));
        wrapper.vm.clearEmailText(true);
        expect(wrapper.vm.formCopy.emailAdditionalDescription).not.toEqual({ translation: { en: 'mock-name-en' } });
        expect(wrapper.vm.formCopy.emailTopCustomContent).toEqual({ translation: { en: 'mock-name-en' } });
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
