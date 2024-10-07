import { createLocalVue, shallowMount } from '@/test/testSetup';
import Component from './AppointmentTimePicker.vue';

const localVue = createLocalVue();

describe('AppointmentTimePicker', () => {
  let wrapper;

  const props = {
    date: '2024-10-01',
    duration: 30,
    availabilities: [{ startDate: '2024-10-01T14:00:00.000Z', endDate: '2024-10-01T16:00:00.000Z' }],
  };

  const doMount = (otherOptions = {}) => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: props,
      ...otherOptions,
    });
  };

  describe('Computed', () => {
    describe('firstTime', () => {
      it('returns the minimum start hour of the time slots minus the duration', async () => {
        const availableSlots = [{ start: '2024-10-01 11:00' }, { start: '2024-10-01 10:30' }];
        doMount({ computed: { availableSlots() {
          return availableSlots;
        } } });
        expect(wrapper.vm.firstTime).toEqual('10:00');

        await wrapper.setProps({ duration: 60 });
        expect(wrapper.vm.firstTime).toEqual('09:30');
      });
      it('returns 09:00 if there is no duration or no availabilities', async () => {
        doMount();
        await wrapper.setProps({ duration: null });
        expect(wrapper.vm.firstTime).toEqual('09:00');
        await wrapper.setProps({ avalabilites: [] });
        expect(wrapper.vm.firstTime).toEqual('09:00');
      });
    });

    describe('availableSlots', () => {
      it('cuts the availabilites in calendar slots of the set duration - 30 min', () => {
        doMount();
        expect(wrapper.vm.availableSlots).toEqual([
          { name: 'Available',
            start: new Date('2024-10-01T14:00:00.000Z'),
            end: new Date('2024-10-01T14:30:00.000Z'),
            color: 'white',
            timed: true },
          { name: 'Available',
            start: new Date('2024-10-01T14:30:00.000Z'),
            end: new Date('2024-10-01T15:00:00.000Z'),
            color: 'white',
            timed: true },
          { name: 'Available',
            start: new Date('2024-10-01T15:00:00.000Z'),
            end: new Date('2024-10-01T15:30:00.000Z'),
            color: 'white',
            timed: true },
          { name: 'Available',
            start: new Date('2024-10-01T15:30:00.000Z'),
            end: new Date('2024-10-01T16:00:00.000Z'),
            color: 'white',
            timed: true },
        ]);
      });
      it('cuts the availabilites in calendar slots of the set duration - 60 min', async () => {
        doMount();
        await wrapper.setProps({ duration: 60 });
        expect(wrapper.vm.availableSlots).toEqual([
          { name: 'Available',
            start: new Date('2024-10-01T14:00:00.000Z'),
            end: new Date('2024-10-01T15:00:00.000Z'),
            color: 'white',
            timed: true },
          { name: 'Available',
            start: new Date('2024-10-01T15:00:00.000Z'),
            end: new Date('2024-10-01T16:00:00.000Z'),
            color: 'white',
            timed: true },
        ]);
      });
    });
  });

  describe('Methods', () => {
    describe('parseEventFromTimeSlot', () => {
      it('returns the right calendar object', () => {
        doMount();
        expect(wrapper.vm.parseEventFromTimeSlot(new Date('2024-10-01 09:00'), new Date('2024-10-01 10:00'))).toEqual(
          {
            name: 'Available',
            start: new Date('2024-10-01 09:00'),
            end: new Date('2024-10-01 10:00'),
            color: 'white',
            timed: true,
          },
        );
      });
    });

    describe('getTimeSlotLabel', () => {
      it('returns the right label', async () => {
        doMount();
        await wrapper.setData({ bookedCalendarTime: { start: new Date('2024-10-01 09:00'), end: new Date('2024-10-01 10:00') } });
        expect(wrapper.vm.getTimeSlotLabel({ start: new Date('2024-10-01 09:00') })).toEqual('caseFile.appointments.timePicker.selected');
        expect(wrapper.vm.getTimeSlotLabel({ start: new Date('2024-10-01 11:00') })).toEqual('caseFile.appointments.timePicker.available');
      });
    });
  });

  describe('lifecycle', () => {
    it('on create, calculates the bookedCalendarTime from the prop bookedTime', () => {
      doMount({ propsData: { ...props, bookedTime: { startDate: '2024-10-01 09:00', endDate: '2024-10-01 10:00' } } });
      expect(wrapper.vm.bookedCalendarTime).toEqual({
        name: 'Available',
        start: new Date('2024-10-01 09:00'),
        end: new Date('2024-10-01 10:00'),
        color: 'white',
        timed: true,
      });
    });
  });
});
