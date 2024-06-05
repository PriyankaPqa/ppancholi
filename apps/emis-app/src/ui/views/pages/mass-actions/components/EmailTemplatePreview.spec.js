import { shallowMount, mount, createLocalVue } from '@/test/testSetup';
import { mockProvider } from '@/services/provider';
import { mockEventEntity } from '@libs/entities-lib/event';
import { mockAssessmentFormEntity } from '@libs/entities-lib/assessment-template';
import Component from './EmailTemplatePreview.vue';

const localVue = createLocalVue();
const services = mockProvider();
const mockEvent = mockEventEntity();
const mockAssessment = mockAssessmentFormEntity();

let wrapper;

const doMount = (otherOptions = {}, fullMount = false) => {
  const options = {
    localVue,
    propsData: {
      show: true,
      event: mockEventEntity({ id: 'mock-id-1' }),
      emailTemplateKey: 'mock-key',
    },
    mocks: {
      $services: services,
    },
    ...otherOptions,
  };

  wrapper = (fullMount ? mount : shallowMount)(Component, options);
};

describe('EmailTemplatePreview', () => {
  describe('Template', () => {
    describe('Attachments', () => {
      it('displays when any file', async () => {
        doMount();
        await wrapper.setProps({ files: [new File(['foo'], 'file1'), new File(['foo'], 'file2')] });
        await wrapper.setData({ loading: false });
        const element = wrapper.findDataTest('email_template_attachments');
        expect(element.exists()).toBeTruthy();
      });

      it('Does not display when no file', async () => {
        doMount();
        await wrapper.setData({ loading: false });
        const element = wrapper.findDataTest('email_template_attachments');
        expect(element.exists()).toBeFalsy();
      });
    });
  });

  describe('Watch', () => {
    describe('event', () => {
      it('set email template if event changes', async () => {
        doMount();
        wrapper.vm.$services.massActions.getEmailTemplate = jest.fn();
        wrapper.vm.setEmailTemplate = jest.fn();
        await wrapper.setProps({ event: mockEvent });
        expect(wrapper.vm.event).toEqual(mockEvent);
        expect(wrapper.vm.setEmailTemplate).toHaveBeenCalled();
      });
    });
  });

  describe('created', () => {
    it('set email template', async () => {
      doMount();
      wrapper.vm.setEmailTemplate = jest.fn();
      await wrapper.vm.setEmailTemplate();
      expect(wrapper.vm.setEmailTemplate).toHaveBeenCalled();
    });
  });

  describe('Methods', () => {
    describe('close', () => {
      it('emits show false', async () => {
        doMount();
        await wrapper.vm.close();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });

    describe('getTarget', () => {
      it('shows assessment preview', async () => {
        doMount();
        const event = {
          target: {
            getAttribute: jest.fn(() => '[assessmentlink]'),
          },
        };
        await wrapper.setProps({ assessment: mockAssessment });
        await wrapper.vm.getTarget(event);
        expect(wrapper.vm.showAssessmentPreview).toEqual(true);
      });

      it('No assessment preview when no assessment', async () => {
        doMount();
        const event = {
          target: {
            getAttribute: jest.fn(() => '[assessmentlink]'),
          },
        };
        wrapper.vm.$toasted.global.info = jest.fn();
        await wrapper.vm.getTarget(event);
        expect(wrapper.vm.showAssessmentPreview).toEqual(false);
        expect(wrapper.vm.$toasted.global.info).toHaveBeenCalledWith(wrapper.vm.$t('massAction.assessment.template.info.needAssessment'));
      });

      it('No assessment preview when wrong link is clicked', async () => {
        doMount();
        const event = {
          target: {
            getAttribute: jest.fn(() => 'redcross.ca'),
          },
        };
        await wrapper.setProps({ assessment: mockAssessment });
        await wrapper.vm.getTarget(event);
        expect(wrapper.vm.showAssessmentPreview).toEqual(false);
      });
    });

    describe('setEmailTemplate', () => {
      it('can get email template', async () => {
        const template = { translation: { en: 'en', fr: 'fr' } };
        doMount();
        wrapper.vm.setEmailTemplate = jest.fn();
        expect(wrapper.vm.emailTemplate).toEqual(null);
        await wrapper.vm.setEmailTemplate();
        expect(wrapper.vm.emailTemplate).toEqual(template);
      });
    });
  });
});
