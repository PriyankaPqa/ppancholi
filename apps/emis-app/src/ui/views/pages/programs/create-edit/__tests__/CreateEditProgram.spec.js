import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';
import { mockProgramEntity } from '@/entities/program';
import Component from '../CreateEditProgram.vue';

const localVue = createLocalVue();

describe('CreateEditProgram', () => {
  let wrapper;
  let mockProgram;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProgram = mockProgramEntity();

    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        id: 'EVENT_ID',
      },
      mocks: {
        $route: {
          name: routes.programs.create.name,
          params: {
            id: 'EVENT_ID',
          },
        },
        $storage: mockStorage(),
      },
    });
  });

  describe('Methods', () => {
    describe('back', () => {
      it('returns to the programs home page', () => {
        wrapper.vm.back();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.programs.home.name,
        });
      });
    });

    describe('handleSubmitError', () => {
      it('sets isNameUnique to false if this is the error in its argument', async () => {
        const error = { response: { data: { errors: [{ code: 'errors.program-with-this-name-already-exists-for-this-event' }] } } };
        await wrapper.vm.handleSubmitError(error);
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

    describe('submit', () => {
      it('does not call createProgram unless form validation succeeds', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        await wrapper.vm.submit();
        expect(wrapper.vm.$storage.program.actions.createProgram).toHaveBeenCalledTimes(0);
      });

      it('calls createProgram if isEditMode is false', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(wrapper.vm.$storage.program.actions.createProgram).toHaveBeenCalledTimes(1);
      });

      it('calls updateProgram if isEditMode is true', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'EVENT_ID',
            programId: 'PROGRAM_ID',
          },
          computed: {
            isEditMode() {
              return true;
            },
          },
          mocks: {
            $storage: mockStorage(),
          },
        });

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(wrapper.vm.$storage.program.actions.updateProgram).toHaveBeenCalledTimes(1);
      });

      test('after submitting, the user is redirected to the event details page', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.setData({
          program: mockProgram,
        });

        await wrapper.vm.submit();

        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.programs.details.name,
          params: {
            programId: mockProgram.id,
          },
        });
      });

      test('after creating a program a toast notification is shown', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('event.programManagement.created');
      });

      test('after updating a program a toast notification is shown', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'EVENT_ID',
            programId: 'PROGRAM_ID',
          },
          computed: {
            isEditMode() {
              return true;
            },
          },
          mocks: {
            $storage: mockStorage(),
          },
        });

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('event.programManagement.updated');
      });
    });
  });

  describe('Computed', () => {
    describe('isEditMode', () => {
      it('returns true if the route is edit', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'EVENT_ID',
            programId: 'PROGRAM_ID',
          },
          mocks: {
            $route: {
              name: routes.programs.edit.name,
              params: {
                id: 'EVENT_ID',
                programId: 'PROGRAM_ID',
              },
            },
          },
        });

        expect(wrapper.vm.isEditMode).toBe(true);
      });

      it('returns false if the route is create', () => {
        expect(wrapper.vm.isEditMode).toBe(false);
      });
    });

    describe('submitLabel', () => {
      it('returns common.save if in edit mode', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'EVENT_ID',
            programId: 'PROGRAM_ID',
          },
          computed: {
            isEditMode() {
              return true;
            },
          },
        });

        expect(wrapper.vm.submitLabel).toBe('common.save');
      });

      it('returns common.buttons.create if not in edit mode', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'EVENT_ID',
            programId: 'PROGRAM_ID',
          },
          computed: {
            isEditMode() {
              return false;
            },
          },
        });

        expect(wrapper.vm.submitLabel).toBe('common.buttons.create');
      });
    });

    describe('helpLink', () => {
      it('returns the correct url in edit mode', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'EVENT_ID',
            programId: 'PROGRAM_ID',
          },
          computed: {
            isEditMode() {
              return true;
            },
          },
        });

        expect(wrapper.vm.helpLink).toBe('zendesk.help_link.edit_program');
      });

      it('returns the correct url in create mode', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'EVENT_ID',
            programId: 'PROGRAM_ID',
          },
          computed: {
            isEditMode() {
              return false;
            },
          },
        });

        expect(wrapper.vm.helpLink).toBe('zendesk.help_link.create_program');
      });
    });
  });

  describe('Template', () => {
    describe('Event handlers', () => {
      beforeEach(() => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            id: 'EVENT_ID',
          },
        });
      });

      test('the save button calls the submit method', async () => {
        await wrapper.setData({
          isDirty: true,
        });
        const spy = jest.spyOn(wrapper.vm, 'submit').mockImplementation(() => {});
        const button = wrapper.findDataTest('save');
        await button.trigger('click');
        expect(wrapper.vm.submit).toHaveBeenCalledTimes(1);
        spy.mockRestore();
      });

      test('the cancel button calls the back method', async () => {
        const spy = jest.spyOn(wrapper.vm, 'back').mockImplementation(() => {});
        const button = wrapper.findDataTest('cancel');
        await button.trigger('click');
        expect(wrapper.vm.back).toHaveBeenCalledTimes(1);
        spy.mockRestore();
      });
    });
  });
});
