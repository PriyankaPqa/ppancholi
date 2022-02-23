/**
 * @group ui/mixins
 */

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
        jest.spyOn(wrapper.vm.$toasted.global, 'error').mockImplementation(() => {});
        await wrapper.vm.handleSubmitError('foo');
        expect(wrapper.vm.$toasted.global.error).toHaveBeenLastCalledWith('error.unexpected_error');
      });

      it('sets isNameUnique to false if this is the error in its argument', async () => {
        await wrapper.vm.handleSubmitError([{ code: 'errors.an-entity-with-this-name-already-exists' }]);
        expect(wrapper.vm.isNameUnique).toBeFalsy();
      });

      it(' opens an error toast in case of a different error', async () => {
        jest.spyOn(wrapper.vm.$toasted.global, 'error').mockImplementation(() => {});
        await wrapper.vm.handleSubmitError([{ code: 'foo' }]);

        expect(wrapper.vm.$toasted.global.error).toHaveBeenLastCalledWith('foo');
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
