import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import Component from './AvailabilityHours.vue';

const localVue = createLocalVue();

const schedule = () => ({
  0: { day: 0, timeSlots: [] },
  1: { day: 1, timeSlots: [{ start: '09:00:00', end: '12:00:00' }] },
  2: { day: 2, timeSlots: [] },
  3: { day: 3, timeSlots: [] },
  4: { day: 4, timeSlots: [] },
  5: { day: 5, timeSlots: [] },
  6: { day: 6, timeSlots: [] },
});

describe('AvailabilityHours.vue', () => {
  let wrapper;

  const mountWrapper = async (shallow = true, otherOptions = {}) => {
    jest.clearAllMocks();
    wrapper = (shallow ? shallowMount : mount)(Component, {
      localVue,
      propsData: {
        schedule: schedule(),
      },
      ...otherOptions,
    });
  };

  describe('Methods', () => {
    describe('updateTime', () => {
      it('updates the data with the new value for the right day and timeslot', async () => {
        mountWrapper();
        await wrapper.vm.updateTime('15:00:00', 1, 0, 'end');
        expect(wrapper.vm.scheduleCopy).toEqual({
          0: { day: 0, timeSlots: [] },
          1: { day: 1, timeSlots: [{ start: '09:00:00', end: '15:00:00' }] },
          2: { day: 2, timeSlots: [] },
          3: { day: 3, timeSlots: [] },
          4: { day: 4, timeSlots: [] },
          5: { day: 5, timeSlots: [] },
          6: { day: 6, timeSlots: [] },
        });
      });

      it('updates the data correctly with the correct new date if the slot has a date', async () => {
        const newSchedule = schedule();
        newSchedule[1] = { day: 1, date: '2024-01-02', timeSlots: [{ start: '09:00', end: '12:00' }] };
        mountWrapper(true, { propsData: { schedule: newSchedule } });
        await wrapper.vm.updateTime('15:00', 1, 0, 'end');

        expect(wrapper.vm.scheduleCopy).toEqual({
          0: { day: 0, timeSlots: [] },
          1: { day: 1, date: '2024-01-02', timeSlots: [{ start: '09:00', end: '15:00', endDateTime: new Date('2024-01-02 15:00').toISOString() }] },
          2: { day: 2, timeSlots: [] },
          3: { day: 3, timeSlots: [] },
          4: { day: 4, timeSlots: [] },
          5: { day: 5, timeSlots: [] },
          6: { day: 6, timeSlots: [] },
        });
      });
    });

    describe('addSlot', () => {
      it('adds a new slot in the right place when there are no slots in the day', async () => {
        mountWrapper();
        await wrapper.vm.addSlot(2);
        expect(wrapper.vm.scheduleCopy).toEqual({
          0: { day: 0, timeSlots: [] },
          1: { day: 1, timeSlots: [{ start: '09:00:00', end: '12:00:00' }] },
          2: { day: 2, timeSlots: [{ start: '09:00:00', end: '17:00:00' }] },
          3: { day: 3, timeSlots: [] },
          4: { day: 4, timeSlots: [] },
          5: { day: 5, timeSlots: [] },
          6: { day: 6, timeSlots: [] },
        });
      });

      it('adds a new slot in the right place when there are slots in the day', async () => {
        mountWrapper();
        await wrapper.vm.addSlot(1);
        expect(wrapper.vm.scheduleCopy).toEqual({
          0: { day: 0, timeSlots: [] },
          1: { day: 1, timeSlots: [{ start: '09:00:00', end: '12:00:00' }, { start: '12:00:00', end: '17:00:00' }] },
          2: { day: 2, timeSlots: [] },
          3: { day: 3, timeSlots: [] },
          4: { day: 4, timeSlots: [] },
          5: { day: 5, timeSlots: [] },
          6: { day: 6, timeSlots: [] },
        });
      });

      it('adds a new slot in the right place when there are slots in the day with the right dates, if the schedule has a date', async () => {
        const newSchedule = schedule();
        newSchedule[1] = { day: 1, date: '2024-01-02', timeSlots: [{ start: '09:00:00', end: '12:00:00' }] };
        mountWrapper(true, { propsData: { schedule: newSchedule } });
        await wrapper.vm.addSlot(1);
        expect(wrapper.vm.scheduleCopy).toEqual({
          0: { day: 0, timeSlots: [] },
          1: { day: 1,
            date: '2024-01-02',
            timeSlots: [{ start: '09:00:00', end: '12:00:00' }, { start: '12:00:00',
              end: '17:00:00',
              startDateTime: new Date('2024-01-02 12:00').toISOString(),
              endDateTime: new Date('2024-01-02 17:00').toISOString(),
            }] },
          2: { day: 2, timeSlots: [] },
          3: { day: 3, timeSlots: [] },
          4: { day: 4, timeSlots: [] },
          5: { day: 5, timeSlots: [] },
          6: { day: 6, timeSlots: [] },
        });
      });

      it('adds a new slot in the right place when there are no slots in the day with the right dates, if the schedule has a date', async () => {
        const newSchedule = schedule();
        newSchedule[2] = { day: 2, date: '2024-01-02', timeSlots: [] };
        mountWrapper(true, { propsData: { schedule: newSchedule } });
        await wrapper.vm.addSlot(2);
        expect(wrapper.vm.scheduleCopy).toEqual({
          0: { day: 0, timeSlots: [] },
          1: { day: 1, timeSlots: [{ start: '09:00:00', end: '12:00:00' }] },
          2: { day: 2,
            date: '2024-01-02',
            timeSlots: [{ start: '09:00:00',
              end: '17:00:00',
              startDateTime: new Date('2024-01-02 09:00').toISOString(),
              endDateTime: new Date('2024-01-02 17:00').toISOString(),
            }] },
          3: { day: 3, timeSlots: [] },
          4: { day: 4, timeSlots: [] },
          5: { day: 5, timeSlots: [] },
          6: { day: 6, timeSlots: [] },
        });
      });
    });

    describe('deleteSlot', () => {
      it('removes the right slot in the right day - day with 1 slot', async () => {
        mountWrapper();
        await wrapper.vm.deleteSlot(1, 0);
        expect(wrapper.vm.scheduleCopy).toEqual({
          0: { day: 0, timeSlots: [] },
          1: { day: 1, timeSlots: [] },
          2: { day: 2, timeSlots: [] },
          3: { day: 3, timeSlots: [] },
          4: { day: 4, timeSlots: [] },
          5: { day: 5, timeSlots: [] },
          6: { day: 6, timeSlots: [] },
        });
      });
      it('removes the right slot in the right day - day with 2 slot', async () => {
        const newSchedule = schedule();
        newSchedule[2] = { day: 2, timeSlots: [{ start: '09:00:00', end: '12:00:00' }, { start: '12:00:00', end: '17:00:00' }] };
        mountWrapper(true, { propsData: { schedule: newSchedule } });
        await wrapper.vm.deleteSlot(2, 0);
        expect(wrapper.vm.scheduleCopy).toEqual({
          0: { day: 0, timeSlots: [] },
          1: { day: 1, timeSlots: [{ start: '09:00:00', end: '12:00:00' }] },
          2: { day: 2, timeSlots: [{ start: '12:00:00', end: '17:00:00' }] },
          3: { day: 3, timeSlots: [] },
          4: { day: 4, timeSlots: [] },
          5: { day: 5, timeSlots: [] },
          6: { day: 6, timeSlots: [] },
        });
      });
    });

    describe('checkForErrors', () => {
      it('sets showError to false if the schedule has no overlaps or inversed start and end times', async () => {
        const newSchedule = schedule();
        newSchedule[1] = { day: 1, timeSlots: [{ start: '09:00:00', end: '12:00:00' }, { start: '13:00:00', end: '17:00:00' }] };
        mountWrapper(true, { propsData: { schedule: newSchedule } });

        await wrapper.vm.checkForErrors();
        expect(wrapper.vm.showError).toBeFalsy();
      });

      it('sets showError to true if the schedule has the start  after the end', async () => {
        const newSchedule = schedule();
        newSchedule[1] = { day: 1, timeSlots: [{ start: '12:00:00', end: '09:00:00' }, { start: '12:00:00', end: '17:00:00' }] };
        mountWrapper(true, { propsData: { schedule: newSchedule } });

        await wrapper.vm.checkForErrors();
        expect(wrapper.vm.showError).toBeTruthy();
      });
      it('sets showError to true if the schedules overlap', async () => {
        const newSchedule = schedule();
        newSchedule[1] = { day: 1, timeSlots: [{ start: '09:00:00', end: '12:00:00' }, { start: '11:00:00', end: '17:00:00' }] };
        mountWrapper(true, { propsData: { schedule: newSchedule } });

        await wrapper.vm.checkForErrors();
        expect(wrapper.vm.showError).toBeTruthy();
      });

      it('sets showError to true if the schedule start and end are the same', async () => {
        const newSchedule = schedule();
        newSchedule[1] = { day: 1, timeSlots: [{ start: '09:00:00', end: '12:00:00' }, { start: '13:00:00', end: '13:00:00' }] };
        mountWrapper(true, { propsData: { schedule: newSchedule } });

        await wrapper.vm.checkForErrors();
        expect(wrapper.vm.showError).toBeTruthy();
      });
    });
  });

  describe('watch', () => {
    describe('scheduleCopy', () => {
      it('calls checkForErrors and emits the changes and the state of scheduleHasError', async () => {
        mountWrapper();
        wrapper.vm.checkForErrors = jest.fn();
        const newSchedule = schedule();
        newSchedule[1] = { day: 1, timeSlots: [{ start: '09:00', end: '15:00' }] };
        await wrapper.setData({ scheduleCopy: newSchedule });
        expect(wrapper.vm.checkForErrors).toHaveBeenCalled();
        expect(wrapper.emitted('update:schedule')[0][0]).toEqual(wrapper.vm.scheduleCopy);
        expect(wrapper.emitted('update:scheduleHasError')[0][0]).toEqual(false);
      });
    });
  });

  describe('Template', () => {
    describe('table', () => {
      it('renders', () => {
        mountWrapper(false);
        const element = wrapper.findDataTest('appointments-availability-hours-table');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('week day label', () => {
      it('renders and displays name of day for the first time slot of the day', () => {
        mountWrapper(false);
        const element = wrapper.findDataTest('appointments-availability-hours_day_1_0');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain('enums.DayOfWeek.Monday');
      });
      it('renders and displays name of day if there are no time slots', () => {
        mountWrapper(false);
        const element = wrapper.findDataTest('appointments-availability-hours_day_5_no_slots');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain('enums.DayOfWeek.Friday');
      });
      it('does not display name of day for the subsequent time slots of the day', () => {
        const newSchedule = schedule();
        newSchedule[1] = { day: 1, timeSlots: [{ start: '09:00', end: '12:00' }, { start: '11:00', end: '17:00' }] };
        mountWrapper(false, { propsData: { schedule: newSchedule } });
        const element = wrapper.findDataTest('appointments-availability-hours_day_1_1');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('delete button', () => {
      it('renders on time slot rows', () => {
        mountWrapper(false);
        const element = wrapper.findDataTest('delete-time-slot_1_0');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('add button', () => {
      it('renders on time slot rows for the last time slot', () => {
        const newSchedule = schedule();
        newSchedule[1] = { day: 1, timeSlots: [{ start: '09:00', end: '12:00' }, { start: '11:00', end: '17:00' }] };
        mountWrapper(false, { propsData: { schedule: newSchedule } });
        const element1 = wrapper.findDataTest('add-time-slot_1_0');
        expect(element1.exists()).toBeFalsy();
        const element2 = wrapper.findDataTest('add-time-slot_1_1');
        expect(element2.exists()).toBeTruthy();
      });
    });
  });
});
