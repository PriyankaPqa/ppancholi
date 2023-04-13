import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockHttpError } from '@libs/services-lib/http-client';
import Component from './ConfirmationError.vue';

const localVue = createLocalVue();
const errors = { response: { data: { errors: [mockHttpError()] } } };

// eslint-disable-next-line no-console
console.warn = jest.fn();

describe('ConfirmRegistrationLib.vue', () => {
  let wrapper;

  const mountWrapper = (computeds) => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        errors,
        phone: 'phone',
      },
      computed: { ...computeds },
      mocks: {
        $hasFeature: () => false,
      },
    });
  };

  beforeEach(() => mountWrapper());

  describe('Template', () => {
  });

  describe('Computed', () => {
    describe('firstError', () => {
      it('returns the first error', async () => {
        expect(wrapper.vm.firstError).toEqual(mockHttpError().code);
      });
    });

    describe('errorMessage', () => {
      it('should return proper message for a duplicate', async () => {
        mountWrapper({ isDuplicateError: () => true });
        expect(wrapper.vm.errorMessage).toEqual('registration.confirmation.error.message.duplicate');
      });

      it('should return proper message when not a duplicate', async () => {
        mountWrapper({ isDuplicateError: () => false });
        expect(wrapper.vm.errorMessage).toEqual('registration.confirmation.error');
      });
    });
  });
});
