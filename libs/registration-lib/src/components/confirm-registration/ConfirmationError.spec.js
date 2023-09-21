import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockHttpError } from '@libs/services-lib/http-client';
import Component from './ConfirmationError.vue';

const localVue = createLocalVue();
const errors = { response: { data: { errors: [mockHttpError()] } } };

// eslint-disable-next-line no-console
console.warn = jest.fn();

describe('ConfirmationError.vue', () => {
  let wrapper;

  const mountWrapper = (computeds) => {
    wrapper = shallowMount(Component, {
      localVue,
      featureList: [],
      propsData: {
        errors,
        phone: 'phone',
      },
      computed: { ...computeds },
    });
  };

  beforeEach(() => mountWrapper());

  describe('Template', () => {
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('sets the tab details', () => {
        expect(wrapper.vm.$registrationStore.mutateCurrentTab).toHaveBeenCalled();
      });
    });
  });

  describe('Computed', () => {
    describe('firstError', () => {
      it('returns the first error', async () => {
        expect(wrapper.vm.firstError).toEqual(mockHttpError().code);
      });
    });

    describe('errorMessage', () => {
      it('should return proper message for cannotcompletetier2', async () => {
        mountWrapper({ firstError: () => 'errors.cannotcompletetier2' });
        expect(wrapper.vm.errorMessage).toEqual('errors.cannotcompletetier2.details');
      });
      it('should return proper message for a duplicate', async () => {
        mountWrapper({ isDuplicateError: () => true });
        expect(wrapper.vm.errorMessage).toEqual('registration.confirmation.error.message.duplicate');
      });

      it('should return proper message when not a duplicate', async () => {
        mountWrapper({ isDuplicateError: () => false });
        expect(wrapper.vm.errorMessage).toEqual('registration.confirmation.error');
      });
    });

    describe('metaMessage', () => {
      it('returns null if there is no error meta', async () => {
        await wrapper.setProps({ errors: { response: { data: { errors: [mockHttpError({ meta: null })] } } } });
        expect(wrapper.vm.metaMessage).toBeNull();
      });

      it('returns the capitalized key of the error meta', async () => {
        await wrapper.setProps({ errors: { response: { data: { errors: [mockHttpError({ meta: { abc: 'def' } })] } } } });
        expect(wrapper.vm.metaMessage).toEqual({ Abc: 'def' });
      });

      it('returns the tranlation of the value if it is a translation object', async () => {
        await wrapper.setProps({ errors: { response: { data: { errors: [mockHttpError({ meta: { abc: { translation: { en: 'def-en' } } } })] } } } });
        expect(wrapper.vm.metaMessage).toEqual({ Abc: 'def-en' });
      });
    });
  });
});
