import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { useMockAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program.mock';
import { mockAppointmentProgram } from '@libs/entities-lib/appointment';
import routes from '@/constants/routes';
import { canadaTimeZones } from '@/constants/canadaTimeZones';
import { mockUserInformation } from '@libs/entities-lib/user-account';
import Component from './AppointmentProgramDetails.vue';

const localVue = createLocalVue();
const { pinia, appointmentProgramStore } = useMockAppointmentProgramStore();

describe('AppointmentProgramDetails.vue', () => {
  let wrapper;

  const mountWrapper = async (shallow = true, otherOptions = {}) => {
    jest.clearAllMocks();
    wrapper = (shallow ? shallowMount : mount)(Component, {
      localVue,
      pinia,
      propsData: {
        show: true,
        appointmentProgramId: 'appt-program-id',
      },
      ...otherOptions,
    });
  };

  describe('computed', () => {
    describe('timeZone', () => {
      it('returns the right value', async () => {
        await mountWrapper();
        const timeZone = canadaTimeZones[0];
        await wrapper.setData({ appointmentProgram: mockAppointmentProgram({ timeZone: timeZone.name }) });
        expect(wrapper.vm.timeZone).toEqual(timeZone);
      });
    });

    describe('schedule', () => {
      test(' turns an array schedule into an object with all week days', () => {
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
    });

    describe('statusHistoryText', () => {
      it('returns the right translation string', async () => {
        mountWrapper();
        await wrapper.setData({ appointmentProgram: mockAppointmentProgram() });
        expect(wrapper.vm.statusHistoryText).toEqual(wrapper.vm.$t('appointmentProgram.details.statusHistoryText.1', { name: mockUserInformation().userName,
          role: mockUserInformation().roleName.translation.en,
          date: 'Jan 1, 2021',
        }));
      });
    });

    describe('editRoute', () => {
      it('returns the edit route', async () => {
        await mountWrapper();
        expect(wrapper.vm.editRoute).toEqual({
          name: routes.events.appointmentPrograms.edit.name,
          params: {
            appointmentProgramId: 'appt-program-id',
          },
        });
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call store fetch by id', async () => {
        mountWrapper();

        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(appointmentProgramStore.fetch).toHaveBeenCalledWith(wrapper.vm.appointmentProgramId);
      });
    });
  });

  describe('Methods', () => {
    describe('deleteAppointmentProgram', () => {
      describe('deleteAppointmentProgram', () => {
        it('calls store delete after confirmation and displays a toast message', async () => {
          mountWrapper();
          await wrapper.vm.deleteAppointmentProgram();
          expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
            title: 'appointmentPrograms.confirm.delete.title',
            messages: 'appointmentPrograms.confirm.delete.message',
          });
          expect(appointmentProgramStore.deleteAppointmentProgram)
            .toHaveBeenCalledWith('appt-program-id');
          expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('appointmentProgram.deleted');
        });
        it('doesnt call delete if no confirmation', async () => {
          mountWrapper();
          wrapper.vm.$confirm = jest.fn(() => false);
          await wrapper.vm.deleteAppointmentProgram();
          expect(appointmentProgramStore.deleteAppointmentProgram)
            .toHaveBeenCalledTimes(0);
        });

        it('displays an error message on store call error', async () => {
          mountWrapper();
          wrapper.vm.$confirm = jest.fn(() => true);
          appointmentProgramStore.deleteAppointmentProgram = jest.fn();
          await wrapper.vm.deleteAppointmentProgram();
          expect(wrapper.vm.$toasted.global.error).toHaveBeenCalledWith('appointmentProgram.deleted.failed');
        });
      });
    });
  });

  describe('template', () => {
    describe('title', () => {
      it('displays the title of the program', async () => {
        await mountWrapper(false);
        await wrapper.setData({ appointmentProgram: mockAppointmentProgram() });
        const element = wrapper.findDataTest('appointmentProgram_details_name');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain(mockAppointmentProgram().name.translation.en);
      });
    });
    describe('time zone', () => {
      it('displays the time zone of the program', async () => {
        await mountWrapper(false, { computed: { timeZone() {
          return { label: 'time-zone', offset: 'offset' };
        } } });
        const element = wrapper.findDataTest('appointmentProgram_details_timeZone');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain('time-zone');
        expect(element.text()).toContain('offset');
      });
    });

    describe('status history', () => {
      it('displays the status history if there is one', async () => {
        await mountWrapper(false);
        await wrapper.setData({ appointmentProgram: mockAppointmentProgram() });
        const element = wrapper.findDataTest('appointmentProgram_details_statusHistory');
        const rationale = wrapper.findDataTest('appointmentProgram_details_statusHistory_rationale');
        expect(element.exists()).toBeTruthy();
        expect(rationale.exists()).toBeTruthy();
        expect(rationale.text()).toContain(mockAppointmentProgram().appointmentProgramStatusHistory.rationale);
      });
      it('does not display the status history if there is none', async () => {
        await mountWrapper(false);
        await wrapper.setData({ appointmentProgram: mockAppointmentProgram({ appointmentProgramStatusHistory: { rationale: null } }) });
        const element = wrapper.findDataTest('appointmentProgram_details_statusHistory');
        const rationale = wrapper.findDataTest('appointmentProgram_details_statusHistory_rationale');
        expect(element.exists()).toBeFalsy();
        expect(rationale.exists()).toBeFalsy();
      });
    });
  });
});
