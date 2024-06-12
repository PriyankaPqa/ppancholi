import { createLocalVue, shallowMount } from '@/test/testSetup';

import Component from './CustomSchedule.vue';

const localVue = createLocalVue();
const defaultSchedule = { 0: { date: '2024-05-01',
  day: 0,
  timeSlots: [{
    startDateTime: new Date(2024, 4, 1, 9, 0).toISOString(),
    start: '09:00',
    endDateTime: new Date(2024, 4, 1, 17, 0).toISOString(),
    end: '12:00',
  },
  {
    startDateTime: new Date(2024, 4, 1, 9, 0).toISOString(),
    start: '13:00',
    endDateTime: new Date(2024, 4, 1, 17, 0).toISOString(),
    end: '17:00',
  },
  ] },
};

describe('CustomSchedule.vue', () => {
  let wrapper;

  const mountWrapper = async (otherOptions = {}) => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        show: true,
        defaultSchedule,
        customSchedule: [],
        mergedLocalTimeSchedule: defaultSchedule,
      },
      ...otherOptions,
    });
  };

  describe('methods', () => {
    describe('calculateNewCustomSchedule', () => {
      it('returns the custom schedule for a day schedule when it differs from the default schedule', () => {
        mountWrapper();
        const newTimeSlot = {
          startDateTime: new Date(2024, 4, 1, 10, 0).toISOString(),
          start: '10:00',
          endDateTime: new Date(2024, 4, 1, 17, 0).toISOString(),
          end: '17:00',
        };
        wrapper.setData({ localSchedule: { 0: { ...defaultSchedule[0], timeSlots: [newTimeSlot] } } });
        expect(wrapper.vm.calculateNewCustomSchedule()).toEqual([{ start: newTimeSlot.startDateTime, end: newTimeSlot.endDateTime }]);
      });

      it('returns the custom schedule for the whole day if it differs from the default schedule by one extra slot', () => {
        mountWrapper();
        const newTimeSlot = {
          startDateTime: new Date(2024, 4, 1, 10, 0).toISOString(),
          start: '19:00',
          endDateTime: new Date(2024, 4, 1, 17, 0).toISOString(),
          end: '20:00',
        };
        wrapper.setData({ localSchedule: { 0: { ...defaultSchedule[0], timeSlots: [...defaultSchedule[0].timeSlots, newTimeSlot] } } });
        expect(wrapper.vm.calculateNewCustomSchedule()).toEqual([
          { start: defaultSchedule[0].timeSlots[0].startDateTime, end: defaultSchedule[0].timeSlots[0].endDateTime },
          { start: defaultSchedule[0].timeSlots[1].startDateTime, end: defaultSchedule[0].timeSlots[1].endDateTime },
          { start: newTimeSlot.startDateTime, end: newTimeSlot.endDateTime },
        ]);
      });

      it('returns the custom schedule for only the day that differs from the default schedule (day 0)', () => {
        const newTimeSlot = {
          startDateTime: new Date(2024, 4, 1, 10, 0).toISOString(),
          start: '19:00',
          endDateTime: new Date(2024, 4, 1, 17, 0).toISOString(),
          end: '20:00',
        };

        const day1DefaultSchedule = {
          day: 1,
          date: '2024-05-02',
          timeSlots: [
            {
              startDateTime: new Date(2024, 4, 2, 9, 0).toISOString(),
              start: '09:00',
              endDateTime: new Date(2024, 4, 2, 17, 0).toISOString(),
              end: '12:00',
            },
          ] };

        mountWrapper({ propsData: {
          show: true,
          defaultSchedule: { ...defaultSchedule, 1: day1DefaultSchedule },
          customSchedule: [],
          mergedLocalTimeSchedule: { ...defaultSchedule, 1: day1DefaultSchedule },
        } });

        wrapper.setData({ localSchedule: { ...defaultSchedule, 1: { ...day1DefaultSchedule, timeSlots: [newTimeSlot] } } });
        expect(wrapper.vm.calculateNewCustomSchedule()).toEqual([{ start: newTimeSlot.startDateTime, end: newTimeSlot.endDateTime },
        ]);
      });

      it('returns the right custom schedule for a day schedule if the current schedule is empty and the default schedule is not', () => {
        mountWrapper();
        wrapper.setData({ localSchedule: { 0: { ...defaultSchedule[0], timeSlots: [] } } });
        expect(wrapper.vm.calculateNewCustomSchedule()).toEqual([{ start: new Date(`${defaultSchedule[0].date} 0:00`).toISOString(),
          end: new Date(`${defaultSchedule[0].date} 0:00`).toISOString() }]);
      });

      it('returns nothing if the current schedule and the default schedule are the same', () => {
        mountWrapper();
        wrapper.setData({ localSchedule: defaultSchedule });
        expect(wrapper.vm.calculateNewCustomSchedule()).toEqual([]);
      });
    });
  });
});
