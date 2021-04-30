import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { Program, mockProgramsSearchData } from '@/entities/program';
import Component from '../CreateEditProgram.vue';

const localVue = createLocalVue();

describe('CreateEditProgram', () => {
  let wrapper;
  let actions;
  let mockProgram;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProgram = new Program(mockProgramsSearchData()[0]);
    actions = {
      createProgram: jest.fn(() => mockProgram),
      updateProgram: jest.fn(() => mockProgram),
    };

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
      },
      store: {
        modules: {
          program: {
            actions,
          },
        },
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
        await wrapper.vm.handleSubmitError([{ code: 'errors.program-with-this-name-already-exists-for-this-event' }]);
        expect(wrapper.vm.isNameUnique).toBeFalsy();
      });

      it('opens an error toast in case of a different error', async () => {
        jest.spyOn(wrapper.vm.$toasted.global, 'error').mockImplementation(() => {});
        await wrapper.vm.handleSubmitError([{ code: 'foo' }]);

        expect(wrapper.vm.$toasted.global.error).toHaveBeenLastCalledWith('foo');
      });
    });

    describe('submit', () => {
      it('does not call createProgram unless form validation succeeds', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        await wrapper.vm.submit();
        expect(actions.createProgram).toHaveBeenCalledTimes(0);
      });

      it('calls createProgram if isEditMode is false', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(actions.createProgram).toHaveBeenCalledTimes(1);
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
          store: {
            modules: {
              program: {
                actions,
              },
            },
          },
        });

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(actions.updateProgram).toHaveBeenCalledTimes(1);
      });

      test('after submitting, the user is redirected to the event details page', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.submit();

        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.programs.details.name,
          params: {
            programId: mockProgram.id,
          },
        });
      });

      test('after creating an event a toast notification is shown', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('event.programManagement.created');
      });

      test('after updating an event a toast notification is shown', async () => {
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
          store: {
            modules: {
              program: {
                actions,
              },
            },
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
