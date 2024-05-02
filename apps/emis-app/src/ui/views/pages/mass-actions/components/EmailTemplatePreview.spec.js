import { shallowMount, mount, createLocalVue } from '@/test/testSetup';
import { mockProvider } from '@/services/provider';
import { mockEventEntity } from '@libs/entities-lib/event';
import Component from './EmailTemplatePreview.vue';

const localVue = createLocalVue();
const services = mockProvider();
const mockEvent = mockEventEntity();
let wrapper;

const doMount = (otherOptions = {}, fullMount = false) => {
  const options = {
    localVue,
    propsData: {
      show: true,
      event: null,
    },
    mocks: {
      $services: services,
    },
    ...otherOptions,
  };

  wrapper = (fullMount ? mount : shallowMount)(Component, options);
};

describe('EmailTemplatePreview', () => {
  describe('Watch', () => {
    describe('event', () => {
      it('set email template if event changes', async () => {
        doMount();
        wrapper.vm.$services.massActions.getEmailTemplate = jest.fn();
        wrapper.vm.setEmailTemplate = jest.fn();
        await wrapper.setData({ event: mockEvent });
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
