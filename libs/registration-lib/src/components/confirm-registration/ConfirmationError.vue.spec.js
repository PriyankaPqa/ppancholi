import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockHttpError } from '@libs/services-lib/http-client';
import Component from './ConfirmationError.vue';

const localVue = createLocalVue();
const errors = { response: { data: { errors: [mockHttpError()] } } };

// eslint-disable-next-line no-console
console.warn = jest.fn();

describe('ConfirmRegistration.vue', () => {
  let wrapper;

  describe('Template', () => {
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          errors,
          phone: 'phone',
        },
      });
    });

    describe('firstError', () => {
      it('returns the first error', async () => {
        expect(wrapper.vm.firstError).toEqual(mockHttpError());
      });
    });

    describe('isDuplicateError', () => {
      it('returns false if the error is not a duplicate of a kind', async () => {
        expect(wrapper.vm.isDuplicateError).toEqual(false);
      });

      it('returns true if the error is a duplicate of a kind', async () => {
        const errors = {
          response: {
            data: {
              errors: [
                { code: 'errors.the-beneficiary-have-duplicate-first-name-last-name-birthdate' },
              ],
            },
          },
        };
        await wrapper.setProps({ errors });
        expect(wrapper.vm.isDuplicateError).toEqual(true);
      });

      it('returns true if the error is a duplicate of a kind', async () => {
        const errors = {
          response: {
            data: {
              errors: [
                { code: 'errors.the-beneficiary-have-duplicate-first-name-last-name-phone-number' },
              ],
            },
          },
        };
        await wrapper.setProps({ errors });
        expect(wrapper.vm.isDuplicateError).toEqual(true);
      });

      it('returns true if the error is a duplicate of a kind', async () => {
        const errors = {
          response: {
            data: {
              errors: [
                { code: 'errors.the-household-have-duplicate-first-name-last-name-birthdate' },
              ],
            },
          },
        };
        await wrapper.setProps({ errors });
        expect(wrapper.vm.isDuplicateError).toEqual(true);
      });

      it('returns true if the error is a duplicate of a kind', async () => {
        const errors = {
          response: {
            data: {
              errors: [
                { code: 'errors.the-email-provided-already-exists-in-the-system' },
              ],
            },
          },
        };
        await wrapper.setProps({ errors });
        expect(wrapper.vm.isDuplicateError).toEqual(true);
      });

      it('returns true if the error is a duplicate of a kind', async () => {
        const errors = {
          response: {
            data: {
              errors: [
                { code: 'errors.person-identified-as-duplicate' },
              ],
            },
          },
        };
        await wrapper.setProps({ errors });

        expect(wrapper.vm.isDuplicateError).toEqual(true);
      });
    });

    describe('errorMessage', () => {
      it('should return proper message for a duplicate of a kind', async () => {
        const errors = {
          response: {
            data: {
              errors: [
                { code: 'errors.person-identified-as-duplicate' },
              ],
            },
          },
        };
        await wrapper.setProps({ errors });
        expect(wrapper.vm.errorMessage).toEqual('registration.confirmation.error.message.duplicate');
      });

      it('should return proper message for a duplicate of a kind', async () => {
        expect(wrapper.vm.errorMessage).toEqual('registration.confirmation.error');
      });
    });
  });
});
