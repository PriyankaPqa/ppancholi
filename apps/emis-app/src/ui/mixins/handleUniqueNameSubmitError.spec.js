import { createLocalVue, shallowMount } from '@/test/testSetup';
import handleUniqueNameSubmitError from '@/ui/mixins/handleUniqueNameSubmitError';

const Component = {
  render() {},
  mixins: [handleUniqueNameSubmitError],
};

const localVue = createLocalVue();
let wrapper;

describe('handleUniqueNameSubmitError.vue', () => {
  describe('Data', () => {
    wrapper = shallowMount(Component, {
      localVue,
    });

    test('isNameUnique', () => {
      expect(wrapper.vm.isNameUnique).toEqual(false);
    });
  });

  describe('Methods', () => {
    describe('handleSubmitError', () => {
      it('opens a generic error toast if the argument is not an array', async () => {
        wrapper.vm.$reportToasted = jest.fn();
        await wrapper.vm.handleSubmitError('foo');
        expect(wrapper.vm.$reportToasted).toHaveBeenLastCalledWith('error.submit_error', 'foo');
      });

      it('sets isNameUnique to false if this is the error in its argument', async () => {
        await wrapper.vm.handleSubmitError([{ code: 'errors.an-entity-with-this-name-already-exists' }]);
        expect(wrapper.vm.isNameUnique).toBeFalsy();
      });

      it(' opens an error toast in case of a different error', async () => {
        const error = { response: { data: { errors: [{ code: 'foo' }] } } };
        wrapper.vm.$toasted.global.error = jest.fn();
        wrapper.vm.$te = jest.fn(() => true);
        await wrapper.vm.handleSubmitError(error);

        expect(wrapper.vm.$toasted.global.error).toHaveBeenLastCalledWith('foo');
      });

      it(' opens an error  report toast in case of a different error and the error code has no translation', async () => {
        const error = { response: { data: { errors: [{ code: 'foo' }] } } };
        wrapper.vm.$reportToasted = jest.fn();
        wrapper.vm.$te = jest.fn(() => false);
        await wrapper.vm.handleSubmitError(error);

        expect(wrapper.vm.$reportToasted).toHaveBeenLastCalledWith('error.submit_error', error);
      });
    });

    describe('resetAsUnique', () => {
      it('sets isNameUnique to true if it is false', async () => {
        wrapper.vm.isNameUnique = false;
        await wrapper.vm.resetAsUnique();
        expect(wrapper.vm.isNameUnique).toBeTruthy();
      });
    });
  });
});
