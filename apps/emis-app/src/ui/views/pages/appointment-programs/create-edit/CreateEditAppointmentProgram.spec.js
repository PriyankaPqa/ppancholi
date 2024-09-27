import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { useMockAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program.mock';
import { AppointmentProgram, mockAppointmentProgram, mockServiceOption } from '@libs/entities-lib/appointment';
import { Status } from '@libs/shared-lib/types';
import { useMockAppointmentStaffMemberStore } from '@/pinia/appointment-staff-member/appointment-staff-member.mock';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import entityUtils from '@libs/entities-lib/utils';
import { defaultBusinessHours } from '../../appointments/utils/defaultBusinessHours';
import helpers from '../appointmentProgramsHelpers';
import Component from './CreateEditAppointmentProgram.vue';

const localVue = createLocalVue();
const { pinia, appointmentProgramStore } = useMockAppointmentProgramStore();
useMockAppointmentStaffMemberStore(pinia);
useMockUserAccountStore(pinia);

describe('CreateEditAppointmentProgram.vue', () => {
  let wrapper;

  const mountWrapper = async (isEditMode = true, shallow = true, otherOptions = {}) => {
    wrapper = (shallow ? shallowMount : mount)(Component, {
      localVue,
      pinia,
      propsData: {
        appointmentProgramId: 'appt-program-id',
        id: 'EVENT_ID',
      },
      computed: {
        isEditMode() {
          return isEditMode;
        },
      },
      mocks: {
        $route: {
          name: routes.events.appointmentPrograms.edit.name,
          params: {
            id: 'EVENT_ID',
            appointmentProgramId: 'appt-program-id',
          },
        },

      },
      ...otherOptions,
    });
  };

  describe('Computed', () => {
    describe('isEditMode', () => {
      it('returns true if the route is edit', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            appointmentProgramId: 'appt-program-id',
            id: 'EVENT_ID',
          },
          mocks: {
            $route: {
              name: routes.events.appointmentPrograms.edit.name,
              params: {
                id: 'EVENT_ID',
                appointmentProgramId: 'appt-program-id',
              },
            },
          },
        });

        expect(wrapper.vm.isEditMode).toBe(true);
      });

      it('returns false if the route is create', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            appointmentProgramId: 'appt-program-id',
            id: 'EVENT_ID',
          },
          mocks: {
            $route: {
              name: routes.events.appointmentPrograms.create.name,
              params: {
                id: 'EVENT_ID',
              },
            },
          },
        });

        expect(wrapper.vm.isEditMode).toBe(false);
      });
    });

    describe('schedule', () => {
      test('getter turns an array schedule into an object with all week days', () => {
        mountWrapper();
        const businessHours = [{ day: 1, timeSlots: [{ start: '09:00:00', end: '17:00:00' }] }];
        const appointmentProgram = mockAppointmentProgram({ businessHours });
        wrapper.setData({ appointmentProgram });
        expect(wrapper.vm.schedule).toEqual({
          0: { day: 0, timeSlots: [] },
          1: { day: 1, timeSlots: [{ start: '09:00:00', end: '17:00:00' }] },
          2: { day: 2, timeSlots: [] },
          3: { day: 3, timeSlots: [] },
          4: { day: 4, timeSlots: [] },
          5: { day: 5, timeSlots: [] },
          6: { day: 6, timeSlots: [] },
        });
      });
      test('setter turns an object schedule into an array', () => {
        mountWrapper();
        const businessHours = [{ day: 1, timeSlots: [{ start: '09:00:00', end: '17:00:00' }] }];
        const schedule = {
          0: { day: 0, timeSlots: [] },
          1: { day: 1, timeSlots: [{ start: '09:00:00', end: '17:00:00' }] },
          2: { day: 2, timeSlots: [] },
          3: { day: 3, timeSlots: [] },
          4: { day: 4, timeSlots: [] },
          5: { day: 5, timeSlots: [] },
          6: { day: 6, timeSlots: [] },
        };
        wrapper.vm.schedule = schedule;
        expect(wrapper.vm.appointmentProgram.businessHours).toEqual(businessHours);
      });
    });

    describe('scheduleIsModified', () => {
      it('returns false if not in edit mode', async () => {
        await mountWrapper(false);
        expect(wrapper.vm.scheduleIsModified).toBeFalsy();
      });

      it('returns false if in edit mode and the initial business hours are the same as the current ones', async () => {
        await mountWrapper();
        expect(wrapper.vm.scheduleIsModified).toBeFalsy();
      });

      it('returns true if in edit mode and the initial business hours differ from the current ones', async () => {
        await mountWrapper();
        await wrapper.setData({ initialBusinessHours: [] });
        expect(wrapper.vm.scheduleIsModified).toBeTruthy();
      });
    });

    describe('messageIsModified', () => {
      it('returns false if not in edit mode', async () => {
        await mountWrapper(false);
        expect(wrapper.vm.messageIsModified).toBeFalsy();
      });

      it('returns false if in edit mode and the initial message is the same as the current one', async () => {
        await mountWrapper();
        expect(wrapper.vm.messageIsModified).toBeFalsy();
      });

      it('returns true if in edit mode and the initial message differ from the current one', async () => {
        await mountWrapper();
        await wrapper.setData({ initialMessage: { translation: { en: 'abc' } } });
        expect(wrapper.vm.messageIsModified).toBeTruthy();
      });
    });
  });

  describe('lifecycle', () => {
    describe('Created', () => {
      it('when is not edit mode, it should set businessHours to default and eventId', async () => {
        await mountWrapper(false);
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.appointmentProgram.businessHours).toEqual(defaultBusinessHours);
        expect(wrapper.vm.appointmentProgram.eventId).toEqual('EVENT_ID');
      });

      it('when in edit mode, should fetch the appointment program and set the appointment program and initial data', async () => {
        await mountWrapper();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(appointmentProgramStore.fetch).toHaveBeenCalledWith('appt-program-id');
        expect(wrapper.vm.appointmentProgram).toEqual(mockAppointmentProgram());
        expect(wrapper.vm.initialBusinessHours).toEqual(mockAppointmentProgram().businessHours);
        expect(wrapper.vm.initialMessage).toEqual(mockAppointmentProgram().emailConfirmationMessage);
      });
    });
  });

  describe('Methods', () => {
    describe('back', () => {
      it('calls router back', async () => {
        await mountWrapper(false);
        wrapper.vm.$router.back = jest.fn();
        wrapper.vm.back();
        expect(wrapper.vm.$router.back).toHaveBeenCalled();
      });
    });

    describe('setLanguageMode', () => {
      it('sets the languageMode', async () => {
        await mountWrapper();
        wrapper.vm.setLanguageMode('fr');
        expect(wrapper.vm.languageMode).toBe('fr');
      });

      it('calls fillEmptyMultilingualAttributes entity method', async () => {
        await mountWrapper();
        wrapper.vm.appointmentProgram.fillEmptyMultilingualAttributes = jest.fn();
        await wrapper.vm.setLanguageMode('fr');
        expect(wrapper.vm.appointmentProgram.fillEmptyMultilingualAttributes).toHaveBeenCalledTimes(1);
      });
    });

    describe('onStatusChange', () => {
      it('changes the appointment program status when in not edit mode', () => {
        mountWrapper(false);
        helpers.canSetActiveStatus = jest.fn(() => true);
        wrapper.vm.onStatusChange(2);
        expect(wrapper.vm.appointmentProgram.appointmentProgramStatus).toEqual(2);
      });

      it('in edit mode should show the dialog and save if answered', async () => {
        mountWrapper();
        helpers.canSetActiveStatus = jest.fn(() => true);
        const userInput = { answered: true, rationale: 'some rationale' };
        wrapper.vm.$refs.rationaleDialog.open = jest.fn(() => userInput);
        wrapper.vm.$refs.rationaleDialog.close = jest.fn();
        await wrapper.vm.onStatusChange(Status.Inactive);

        expect(wrapper.vm.$refs.rationaleDialog.open).toHaveBeenCalledWith({
          title: 'appointmentProgram.edit.changeStatus.rationale.title',
          userBoxText: 'appointmentProgram.edit.changeStatus.rationale.message',
        });

        expect(appointmentProgramStore.setAppointmentProgramStatus)
          .toHaveBeenCalledWith(wrapper.vm.appointmentProgram.id, Status.Inactive, 'some rationale');
        expect(wrapper.vm.$refs.rationaleDialog.close).toHaveBeenCalled();
      });

      it('does not call the endpoint if canSetActiveStatus returns false and shows the right message', async () => {
        jest.clearAllMocks();
        await mountWrapper();
        helpers.canSetActiveStatus = jest.fn(() => false);
        await wrapper.vm.onStatusChange(Status.Active);
        expect(appointmentProgramStore.setAppointmentProgramStatus).not.toHaveBeenCalled();
        expect(wrapper.vm.$message).toHaveBeenCalled();
      });
    });

    describe('createDisabled', () => {
      it('returns true if there is an error or loading', async () => {
        await mountWrapper(false);
        expect(wrapper.vm.createDisabled(true)).toBeTruthy();
        await wrapper.setData({ loading: true });
        expect(wrapper.vm.createDisabled(false)).toBeTruthy();
        await wrapper.setData({ loading: false, scheduleHasError: true });
        expect(wrapper.vm.createDisabled(false)).toBeTruthy();
        await wrapper.setData({ loading: false, scheduleHasError: false, showServiceOptionsError: true });
        expect(wrapper.vm.createDisabled(false)).toBeTruthy();
        await wrapper.setData({ loading: false, scheduleHasError: false, showServiceOptionsError: false, editorError: 'error' });
        expect(wrapper.vm.createDisabled(false)).toBeTruthy();
      });
      it('returns true if there is no error', async () => {
        await mountWrapper(false);
        await wrapper.setData({ loading: false, scheduleHasError: false, showServiceOptionsError: false, editorError: '' });
        expect(wrapper.vm.createDisabled(false)).toBeFalsy();
      });
    });

    describe('editDisabled', () => {
      it('returns true if createDisabled returns true', async () => {
        await mountWrapper(true);
        wrapper.vm.createDisabled = jest.fn(() => true);
        expect(wrapper.vm.editDisabled(false, false)).toBeTruthy();
      });

      it('returns true if nothing is changed', async () => {
        await mountWrapper(true);
        wrapper.vm.createDisabled = jest.fn(() => false);
        expect(wrapper.vm.editDisabled(false, false)).toBeTruthy();
      });

      it('returns true if createDisabled is false but nothing is changed', async () => {
        await mountWrapper(true, true, { computed:
          { scheduleIsModified() {
            return false;
          },
          messageIsModified() {
            return false;
          } } });
        wrapper.vm.createDisabled = jest.fn(() => false);
        expect(wrapper.vm.editDisabled(false, false)).toBeTruthy();
      });

      it('returns false if createDisabled is false and something changed', async () => {
        await mountWrapper(true, true, { computed:
          { scheduleIsModified() {
            return true;
          },
          messageIsModified() {
            return false;
          } } });
        wrapper.vm.createDisabled = jest.fn(() => false);
        expect(wrapper.vm.editDisabled(false, false)).toBeFalsy();
      });

      it('returns false if createDisabled is false and the form changed', async () => {
        await mountWrapper(true, true);
        wrapper.vm.createDisabled = jest.fn(() => false);
        expect(wrapper.vm.editDisabled(false, true)).toBeFalsy();
      });
    });

    describe('validateForm', () => {
      it('returns true if all policy validations succeed', async () => {
        helpers.validServiceOptionsCount = jest.fn(() => true);
        entityUtils.validateMultilingualFieldRequired = jest.fn(() => true);
        await mountWrapper(false);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        expect(wrapper.vm.validateForm()).toBeTruthy();
      });

      it('returns false if form is invalid', async () => {
        await mountWrapper(false);
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        expect(await wrapper.vm.validateForm()).toBeFalsy();
      });

      it('returns false if validServiceOptionsCount is false', async () => {
        helpers.validServiceOptionsCount = jest.fn(() => false);
        await mountWrapper(false);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        expect(await wrapper.vm.validateForm()).toBeFalsy();
      });

      it('returns false if validateMultilingualFieldRequired is false and sets the editor error text', async () => {
        helpers.validServiceOptionsCount = jest.fn(() => true);
        entityUtils.validateMultilingualFieldRequired = jest.fn(() => false);
        await mountWrapper(false);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        expect(await wrapper.vm.validateForm()).toBeFalsy();
        expect(wrapper.vm.editorError).toEqual('validations.required');
      });

      it('returns false if validateMultilingualFieldLength is false and sets the editor', async () => {
        helpers.validServiceOptionsCount = jest.fn(() => true);
        entityUtils.validateMultilingualFieldRequired = jest.fn(() => true);
        entityUtils.validateMultilingualFieldLength = jest.fn(() => false);
        await mountWrapper(false);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        expect(await wrapper.vm.validateForm()).toBeFalsy();
        expect(wrapper.vm.editorError).toEqual({ key: 'validations.max', params: [{ value: 3000 }] });
      });
    });

    describe('submit', () => {
      beforeEach(async () => {
        await mountWrapper(false);
        wrapper.vm.validateForm = jest.fn(() => true);
      });

      it('does not call create unless form validation succeeds', async () => {
        wrapper.vm.createAppointmentProgram = jest.fn();
        wrapper.vm.validateForm = jest.fn(() => false);
        await wrapper.vm.submit();
        expect(wrapper.vm.createAppointmentProgram).toHaveBeenCalledTimes(0);
      });

      it('calls the store createAppointmentProgram with the right payload', async () => {
        const program = new AppointmentProgram();
        program.serviceOptions = [mockServiceOption()];
        wrapper.vm.appointmentProgram = program;
        await wrapper.vm.submit();
        expect(appointmentProgramStore.createAppointmentProgram).toHaveBeenCalledWith(program);
      });

      it('calls a toaster after creating', async () => {
        const program = new AppointmentProgram();
        program.serviceOptions = [mockServiceOption()];
        wrapper.vm.appointmentProgram = program;
        await wrapper.vm.submit();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('event.appointmentProgram.created');
      });

      it('sends to details page after creating', async () => {
        const program = new AppointmentProgram();
        program.serviceOptions = [mockServiceOption()];
        wrapper.vm.appointmentProgram = program;
        wrapper.vm.$refs.form.reset = jest.fn();
        appointmentProgramStore.createAppointmentProgram = jest.fn(() => mockAppointmentProgram({ id: '1' }));
        await wrapper.vm.submit();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.events.appointmentPrograms.details.name, params: { appointmentProgramId: '1' },
        });
      });

      it('sends to details page after editing', async () => {
        mountWrapper();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        helpers.canSetActiveStatus = jest.fn(() => true);
        const program = new AppointmentProgram();
        program.serviceOptions = [mockServiceOption()];
        wrapper.vm.appointmentProgram = program;
        wrapper.vm.$refs.form.reset = jest.fn();
        appointmentProgramStore.updateAppointmentProgram = jest.fn(() => mockAppointmentProgram({ id: '1' }));
        await wrapper.vm.submit();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.events.appointmentPrograms.details.name, params: { appointmentProgramId: '1' },
        });
      });

      it('calls an error toaster if creating fails', async () => {
        const program = new AppointmentProgram();
        program.serviceOptions = [mockServiceOption()];
        wrapper.vm.appointmentProgram = program;
        appointmentProgramStore.createAppointmentProgram = jest.fn();
        await wrapper.vm.submit();
        expect(wrapper.vm.$toasted.global.error).toHaveBeenCalledWith('event.appointmentProgram.create.failed');
      });

      it('calls the store updateAppointmentProgram with the right payload in edit mode', async () => {
        mountWrapper();
        wrapper.vm.validateForm = jest.fn(() => true);
        helpers.canSetActiveStatus = jest.fn(() => true);
        const program = new AppointmentProgram();
        program.serviceOptions = [mockServiceOption()];
        wrapper.vm.appointmentProgram = program;
        await wrapper.vm.submit();
        expect(appointmentProgramStore.updateAppointmentProgram).toHaveBeenCalledWith(mockAppointmentProgram());
      });

      it('calls a toaster after updating', async () => {
        mountWrapper();
        wrapper.vm.validateForm = jest.fn(() => true);
        const program = new AppointmentProgram();
        program.serviceOptions = [mockServiceOption()];
        wrapper.vm.appointmentProgram = program;
        await wrapper.vm.submit();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('event.appointmentProgram.updated');
      });

      it('resets initialBusinessHours after updating', async () => {
        mountWrapper();
        wrapper.vm.validateForm = jest.fn(() => true);
        await wrapper.setData({ initialBusinessHours: [] });
        await wrapper.vm.submit();
        expect(wrapper.vm.initialBusinessHours).toEqual(wrapper.vm.appointmentProgram.businessHours);
      });

      it('calls an error toaster if updating fails', async () => {
        mountWrapper();
        wrapper.vm.validateForm = jest.fn(() => true);
        const program = new AppointmentProgram();
        program.serviceOptions = [mockServiceOption()];
        wrapper.vm.appointmentProgram = program;
        appointmentProgramStore.updateAppointmentProgram = jest.fn();
        await wrapper.vm.submit();
        expect(wrapper.vm.$toasted.global.error).toHaveBeenCalledWith('event.appointmentProgram.updated.failed');
      });
    });
  });

  describe('Template', () => {
    describe('name', () => {
      it('renders', () => {
        mountWrapper(false, false);
        const element = wrapper.findDataTest('appointment-program-name');
        expect(element.exists()).toBeTruthy();
      });
    });
    describe('timeZone', () => {
      it('renders', () => {
        mountWrapper(false, false);
        const element = wrapper.findDataTest('appointment-program-time-zone');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('status', () => {
      it('renders', () => {
        mountWrapper(false, false);
        const element = wrapper.findDataTest('appointment-program-status');
        expect(element.exists()).toBeTruthy();
      });

      it('calls the method onStatusChange on change', () => {
        mountWrapper(false, false);
        wrapper.vm.onStatusChange = jest.fn();
        const element = wrapper.findDataTest('appointment-program-status');
        element.vm.$emit('input');
        expect(wrapper.vm.onStatusChange).toHaveBeenCalledTimes(1);
      });
    });

    describe('email subject dropdown', () => {
      it('renders', async () => {
        await mountWrapper(true, false);
        const element = wrapper.findDataTest('appointment-program-edit-email-subject');
        expect(element.exists()).toBeTruthy();
      });
    });
    describe('text editor', () => {
      it('renders', async () => {
        await mountWrapper(true, false);
        const element = wrapper.findDataTest('appointment-program-edit-email-message');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('text editor error', () => {
      it('renders when there is an error', async () => {
        await mountWrapper(true, true);
        const element = wrapper.findDataTest('appointment-program-edit-email-message-error');
        expect(element.exists()).toBeFalsy();
        // Wait for the watcher to change values
        await wrapper.vm.$nextTick();
        await wrapper.setData({ editorError: 'error' });
        const element2 = wrapper.findDataTest('appointment-program-edit-email-message-error');
        expect(element2.exists()).toBeTruthy();
      });
    });

    describe('saveButton', () => {
      it('renders in edit mode', async () => {
        await mountWrapper(true, false);
        const element = wrapper.findDataTest('appointment-program-edit-save');
        expect(element.exists()).toBeTruthy();
      });
      it('does not render in create mode', async () => {
        await mountWrapper(false, false);
        const element = wrapper.findDataTest('appointment-program-edit-save');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('submitButton', () => {
      it('renders in create mode', async () => {
        await mountWrapper(false, false);
        const element = wrapper.findDataTest('appointment-program-create-submit');
        expect(element.exists()).toBeTruthy();
      });
      it('does not render in create mode', async () => {
        await mountWrapper(true, false);
        const element = wrapper.findDataTest('appointment-program-create-submit');
        expect(element.exists()).toBeFalsy();
      });
    });
  });
});
