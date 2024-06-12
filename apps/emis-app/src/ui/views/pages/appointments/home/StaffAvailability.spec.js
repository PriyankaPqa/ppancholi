import { createLocalVue, shallowMount } from '@/test/testSetup';
import { useMockAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program.mock';
import { zonedTimeToUtc } from 'date-fns-tz';
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
          rangeStartDate: '2024-05-05',
          timeZone: 'America/Halifax',
          localDefaultSchedule: { },
          mergedLocalTimeSchedule: { },
        };
      },
      ...otherOptions,
    });
  };

  describe('methods', () => {
    describe('setUTCTimeToDefaultSchedule', () => {
      it('returns the default schedule as an object, with all week days and the time in UTC ', () => {
        mountWrapper({ computed: { defaultSchedule() {
          return defaultSchedule;
        } } });
        const result = wrapper.vm.setUTCTimeToDefaultSchedule(wrapper.vm.defaultSchedule);

        expect(result).toEqual({
          0: {
            day: 0,
            date: '2024-05-05',
            timeSlots: [{
              startDateTime: zonedTimeToUtc('2024-05-05 09:00', wrapper.vm.timeZone).toISOString(),
              start: '09:00',
              endDateTime: zonedTimeToUtc('2024-05-05 12:00', wrapper.vm.timeZone).toISOString(),
              end: '12:00',
            },
            {
              startDateTime: zonedTimeToUtc('2024-05-05 13:00', wrapper.vm.timeZone).toISOString(),
              start: '13:00',
              endDateTime: zonedTimeToUtc('2024-05-05 17:00', wrapper.vm.timeZone).toISOString(),
              end: '17:00',
            },
            ],
          },
          1: { day: 1, date: '2024-05-06', timeSlots: [] },
          2: { day: 2, date: '2024-05-07', timeSlots: [] },
          3: { day: 3, date: '2024-05-08', timeSlots: [] },
          4: { day: 4, date: '2024-05-09', timeSlots: [] },
          5: { day: 5, date: '2024-05-10', timeSlots: [] },
          6: { day: 6, date: '2024-05-11', timeSlots: [] },
        });
      });

      it('sets the right date if the slot ends at midnight ', () => {
        const newDefaultSchedule = [{
          day: 0,
          timeSlots: [{
            start: '13:00',
            end: '00:00',
          },
          ] },
        ];
        mountWrapper({ computed: { defaultSchedule() {
          return newDefaultSchedule;
        } } });

        wrapper.setData({ timeZone: 'UTC' });
        const result = wrapper.vm.setUTCTimeToDefaultSchedule(wrapper.vm.defaultSchedule);

        expect(result).toEqual({
          0: {
            day: 0,
            date: '2024-05-05',
            timeSlots: [
              {
                startDateTime: zonedTimeToUtc('2024-05-05 13:00', wrapper.vm.timeZone).toISOString(),
                start: '13:00',
                endDateTime: zonedTimeToUtc('2024-05-06 00:00', wrapper.vm.timeZone).toISOString(),
                end: '00:00',
              },
            ],
          },
          1: { day: 1, date: '2024-05-06', timeSlots: [] },
          2: { day: 2, date: '2024-05-07', timeSlots: [] },
          3: { day: 3, date: '2024-05-08', timeSlots: [] },
          4: { day: 4, date: '2024-05-09', timeSlots: [] },
          5: { day: 5, date: '2024-05-10', timeSlots: [] },
          6: { day: 6, date: '2024-05-11', timeSlots: [] },
        });
      });
    });

    describe('calculateMergedSchedule', () => {
      it('returns the right schedule mixing the default and the custom ones', () => {
        const newDefaultSchedule = [{
          day: 0,
          timeSlots: [
            {
              start: '09:00',
              end: '10:00',
            },
          ] },
        {
          day: 1,
          timeSlots: [
            {
              start: '09:00',
              end: '10:00',
            },
          ] },
        ];
        const customSchedule = [{ start: new Date('2024-05-06 09:00').toISOString(), end: new Date('2024-05-06 12:00').toISOString() }];

        mountWrapper({ computed: { defaultSchedule() {
          return newDefaultSchedule;
        },
        customSchedule() {
          return customSchedule;
        } } });

        wrapper.setData({ timeZone: 'UTC' });
        wrapper.vm.calculateDefaultScheduleDates();
        wrapper.vm.calculateMergedSchedule();

        const timeOffset = new Date().getTimezoneOffset();

        expect(wrapper.vm.mergedLocalTimeSchedule).toEqual({
          0: {
            day: 0,
            date: '2024-05-05',
            timeSlots: [
              {
                startDateTime: zonedTimeToUtc('2024-05-05 09:00', wrapper.vm.timeZone).toISOString(),
                start: `0${9 - timeOffset / 60}:00`,
                endDateTime: zonedTimeToUtc('2024-05-05 10:00', wrapper.vm.timeZone).toISOString(),
                end: `${timeOffset ? 0 : ''}${10 - timeOffset / 60}:00`,
              },
            ],
          },
          1: { day: 1,
            date: '2024-05-06',
            custom: true,
            timeSlots: [{
              startDateTime: new Date('2024-05-06 09:00').toISOString(),
              start: '09:00',
              endDateTime: new Date('2024-05-06 12:00').toISOString(),
              end: '12:00',

            }] },
          2: { day: 2, date: '2024-05-07', timeSlots: [] },
          3: { day: 3, date: '2024-05-08', timeSlots: [] },
          4: { day: 4, date: '2024-05-09', timeSlots: [] },
          5: { day: 5, date: '2024-05-10', timeSlots: [] },
          6: { day: 6, date: '2024-05-11', timeSlots: [] },
        });
      });
    });
  });
});
