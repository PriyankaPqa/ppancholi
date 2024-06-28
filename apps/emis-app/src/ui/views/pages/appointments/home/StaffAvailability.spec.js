import { createLocalVue, shallowMount } from '@/test/testSetup';
import { useMockAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program.mock';
import appointmentHelpers from './appointmentHelpers';
import Component from './StaffAvailability.vue';

const localVue = createLocalVue();
const { pinia, appointmentProgramStore } = useMockAppointmentProgramStore();
const defaultSchedule = [{
  day: 0,
  timeSlots: [{
    start: '09:00',
    end: '12:00',
  },
  {
    start: '13:00',
    end: '17:00',
  },
  ] },
];

appointmentProgramStore.schedule = { defaultSchedule, customSchedule: [] };

describe('StaffAvailability.vue', () => {
  let wrapper;

  const mountWrapper = async (otherOptions = {}) => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      data() {
        return {
          weekStartDate: '2024-05-05',
          timeZone: 'America/Halifax',
          localDefaultSchedule: { },
          mergedLocalTimeSchedule: { },
        };
      },
      ...otherOptions,
    });
  };

  describe('methods', () => {
    describe('calculateSchedules', () => {
      it('calls the helper function and returns the result', async () => {
        const customSchedule = [{ start: new Date('2024-05-06 09:00').toISOString(), end: new Date('2024-05-06 12:00').toISOString() }];

        mountWrapper({ computed: { defaultSchedule() {
          return defaultSchedule;
        },
        customSchedule() {
          return customSchedule;
        } } });

        appointmentHelpers.calculateSchedule = jest.fn(() => ({ scheduleWithLocalHours: { foo: 'scheduleWithLocalHours' }, mergedSchedule: { bar: 'mergedSchedule' } }));
        await wrapper.vm.calculateSchedules();
        expect(appointmentHelpers.calculateSchedule).toHaveBeenCalledWith(
          wrapper.vm.defaultSchedule,
          wrapper.vm.customSchedule,
          wrapper.vm.timeZone,
          wrapper.vm.weekStartDate,
        );

        expect(wrapper.vm.localDefaultSchedule).toEqual({ foo: 'scheduleWithLocalHours' });
        expect(wrapper.vm.mergedLocalTimeSchedule).toEqual({ bar: 'mergedSchedule' });
      });
    });
  });
});
