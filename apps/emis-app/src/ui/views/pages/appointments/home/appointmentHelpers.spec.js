import helpers from './appointmentHelpers';

describe('helpers', () => {
  describe('weekRange', () => {
    it('returns the start and end of a week as dates', () => {
      const rangeStart = '2024-05-01';
      const result = helpers.weekRange(rangeStart);
      expect(result.start).toEqual(new Date('2024-05-01 0:00'));
      expect(result.end).toEqual(new Date('2024-05-08 0:00'));
    });
  });

  describe('mergeTimeSlots', () => {
    it('merges 2 times slots when the first slot ends when an existing slot starts', () => {
      const timeSlots = [{ start: '03:00', end: '05:00' }];
      const newSlot = { start: '01:00', end: '03:00' };

      expect(helpers.mergeTimeSlots(newSlot, timeSlots)).toEqual([{ start: '01:00', end: '05:00' }]);
    });
    it('merges 2 times slots when the first slot starts when an existing slot ends', () => {
      const timeSlots = [{ start: '03:00', end: '05:00' }];
      const newSlot = { start: '05:00', end: '07:00' };

      expect(helpers.mergeTimeSlots(newSlot, timeSlots)).toEqual([{ start: '03:00', end: '07:00' }]);
    });
  });

  describe('createDropdownTimeIntervals', () => {
    it('creates a list of time intervals with the required start and end and duration - 30 minutes', () => {
      expect(helpers.createDropdownTimeIntervals('08:00', '11:00')).toEqual([
        { text: '08:00 AM', value: '08:00' },
        { text: '08:30 AM', value: '08:30' },
        { text: '09:00 AM', value: '09:00' },
        { text: '09:30 AM', value: '09:30' },
        { text: '10:00 AM', value: '10:00' },
        { text: '10:30 AM', value: '10:30' },
        { text: '11:00 AM', value: '11:00' },
      ]);

      expect(helpers.createDropdownTimeIntervals('17:00', '19:00')).toEqual([
        { text: '05:00 PM', value: '17:00' },
        { text: '05:30 PM', value: '17:30' },
        { text: '06:00 PM', value: '18:00' },
        { text: '06:30 PM', value: '18:30' },
        { text: '07:00 PM', value: '19:00' },
      ]);
    });

    it('creates a list of time intervals with the required start and end and duration - 20 minutes', () => {
      expect(helpers.createDropdownTimeIntervals('08:00', '10:00', 20)).toEqual([
        { text: '08:00 AM', value: '08:00' },
        { text: '08:20 AM', value: '08:20' },
        { text: '08:40 AM', value: '08:40' },
        { text: '09:00 AM', value: '09:00' },
        { text: '09:20 AM', value: '09:20' },
        { text: '09:40 AM', value: '09:40' },
        { text: '10:00 AM', value: '10:00' },
      ]);
    });
    it('creates a list of time intervals with the required start and end and duration - 15 minutes', () => {
      expect(helpers.createDropdownTimeIntervals('08:00', '09:00', 15)).toEqual([
        { text: '08:00 AM', value: '08:00' },
        { text: '08:15 AM', value: '08:15' },
        { text: '08:30 AM', value: '08:30' },
        { text: '08:45 AM', value: '08:45' },
        { text: '09:00 AM', value: '09:00' },
      ]);
    });
    it('creates a list of time intervals with the required start and end and duration - 60 minutes', () => {
      expect(helpers.createDropdownTimeIntervals('08:30', '12:30', 60)).toEqual([
        { text: '08:30 AM', value: '08:30' },
        { text: '09:30 AM', value: '09:30' },
        { text: '10:30 AM', value: '10:30' },
        { text: '11:30 AM', value: '11:30' },
        { text: '12:30 PM', value: '12:30' },
      ]);
    });
  });

  describe('recalculateDifferentDaySlot', () => {
    it('moves the slot from day 0 to day 1 if it overflows entirely - start is next day, end is next day', () => {
      const slot = { startDateTime: new Date(2024, 4, 2, 1, 0).toISOString(),
        start: '01:00',
        endDateTime: new Date(2024, 4, 2, 2, 0).toISOString(),
        end: '02:00' };

      const defaultSchedule = {
        0: { day: 0,
          date: '2024-05-01',
          timeSlots: [] },
        1: { day: 1,
          date: '2024-05-02',
          timeSlots: [],
        },
      };

      const midnight = new Date('2024-05-01 0:00');
      const nextMidnight = new Date(midnight.getTime());
      nextMidnight.setDate(nextMidnight.getDate() + 1);

      helpers.recalculateDifferentDaySlot({ slot, midnight, nextMidnight, currentDay: 0, rangeStartDate: '2024-05-01', fullSchedule: defaultSchedule });

      expect(defaultSchedule).toEqual({
        0: { day: 0, date: '2024-05-01', timeSlots: [] },
        1: { day: 1, date: '2024-05-02', timeSlots: [slot] },
      });
    });

    it('moves part of the slot from day 0 to day 1 if it overflows partly - start is day 0, end is in day 1', () => {
      const slot = { startDateTime: new Date(2024, 4, 1, 23, 0).toISOString(),
        start: '23:00',
        endDateTime: new Date(2024, 4, 2, 2, 0).toISOString(),
        end: '02:00' };

      const defaultSchedule = {
        0: { day: 0,
          date: '2024-05-01',
          timeSlots: [] },
        1: { day: 1,
          date: '2024-05-02',
          timeSlots: [],
        },
      };

      const midnight = new Date('2024-05-01 0:00');
      const nextMidnight = new Date(midnight.getTime());
      nextMidnight.setDate(nextMidnight.getDate() + 1);

      helpers.recalculateDifferentDaySlot({ slot, midnight, nextMidnight, currentDay: 0, rangeStartDate: '2024-05-01', fullSchedule: defaultSchedule });

      expect(defaultSchedule).toEqual({
        0: { day: 0,
          date: '2024-05-01',
          timeSlots: [
            { startDateTime: new Date(2024, 4, 1, 23, 0).toISOString(),
              start: '23:00',
              endDateTime: new Date(2024, 4, 2, 0, 0).toISOString(),
              end: '00:00' },
          ] },
        1: { day: 1,
          date: '2024-05-02',
          timeSlots: [
            { startDateTime: new Date(2024, 4, 2, 0, 0).toISOString(),
              start: '00:00',
              endDateTime: new Date(2024, 4, 2, 2, 0).toISOString(),
              end: '02:00' },
          ] },
      });
    });

    it('moves part of the slot from day 1 to day 0 if it overflows partly - start is day 0, end is in day 1, and slot is initially in day 1', () => {
      const slot = { startDateTime: new Date(2024, 4, 1, 23, 0).toISOString(),
        start: '23:00',
        endDateTime: new Date(2024, 4, 2, 2, 0).toISOString(),
        end: '02:00' };

      const defaultSchedule = {
        0: { day: 0,
          date: '2024-05-01',
          timeSlots: [] },
        1: { day: 1,
          date: '2024-05-02',
          timeSlots: [],
        },
      };

      const midnight = new Date('2024-05-02 0:00');
      const nextMidnight = new Date(midnight.getTime());
      nextMidnight.setDate(nextMidnight.getDate() + 1);

      helpers.recalculateDifferentDaySlot({ slot, midnight, nextMidnight, currentDay: 1, rangeStartDate: '2024-05-01', fullSchedule: defaultSchedule });

      expect(defaultSchedule).toEqual({
        0: { day: 0,
          date: '2024-05-01',
          timeSlots: [
            { startDateTime: new Date(2024, 4, 1, 23, 0).toISOString(),
              start: '23:00',
              endDateTime: new Date(2024, 4, 2, 0, 0).toISOString(),
              end: '00:00' },
          ] },
        1: { day: 1,
          date: '2024-05-02',
          timeSlots: [
            { startDateTime: new Date(2024, 4, 2, 0, 0).toISOString(),
              start: '00:00',
              endDateTime: new Date(2024, 4, 2, 2, 0).toISOString(),
              end: '02:00' },
          ] },
      });
    });

    it('moves part of the slot from day 0 to day 6 if it overflows partly - start is day 0, end is in previous day, needs to be moved to day 6', () => {
      const slot = { startDateTime: new Date(2024, 4, 1, 23, 0).toISOString(),
        start: '23:00',
        endDateTime: new Date(2024, 4, 2, 2, 0).toISOString(),
        end: '02:00' };

      const defaultSchedule = {
        0: { day: 0,
          date: '2024-05-02',
          timeSlots: [] },
        6: { day: 6,
          date: '2024-05-08',
          timeSlots: [],
        },
      };

      const midnight = new Date('2024-05-02 0:00');
      const nextMidnight = new Date(midnight.getTime());
      nextMidnight.setDate(nextMidnight.getDate() + 1);

      helpers.recalculateDifferentDaySlot({ slot, midnight, nextMidnight, currentDay: 0, rangeStartDate: '2024-05-02', fullSchedule: defaultSchedule });

      expect(defaultSchedule).toEqual({
        0: { day: 0,
          date: '2024-05-02',
          timeSlots: [
            { startDateTime: new Date(2024, 4, 2, 0, 0).toISOString(),
              start: '00:00',
              endDateTime: new Date(2024, 4, 2, 2, 0).toISOString(),
              end: '02:00' },
          ] },
        6: { day: 6,
          date: '2024-05-08',
          timeSlots: [
            { startDateTime: new Date(2024, 4, 8, 23, 0).toISOString(),
              start: '23:00',
              endDateTime: new Date(2024, 4, 9, 0, 0).toISOString(),
              end: '00:00' },
          ] },
      });
    });

    it('moves part of the slot from day 6 to day 0 if it overflows partly - start is day 6, end is in next day, needs to be moved to day 0', () => {
      const slot = { startDateTime: new Date(2024, 4, 8, 23, 0).toISOString(),
        start: '23:00',
        endDateTime: new Date(2024, 4, 9, 2, 0).toISOString(),
        end: '02:00' };

      const defaultSchedule = {
        0: { day: 0,
          date: '2024-05-02',
          timeSlots: [] },
        6: { day: 6,
          date: '2024-05-08',
          timeSlots: [],
        },
      };

      const midnight = new Date('2024-05-08 0:00');
      const nextMidnight = new Date(midnight.getTime());
      nextMidnight.setDate(nextMidnight.getDate() + 1);

      helpers.recalculateDifferentDaySlot({ slot, midnight, nextMidnight, currentDay: 6, rangeStartDate: '2024-05-02', fullSchedule: defaultSchedule });

      expect(defaultSchedule).toEqual({
        0: { day: 0,
          date: '2024-05-02',
          timeSlots: [
            { startDateTime: new Date(2024, 4, 2, 0, 0).toISOString(),
              start: '00:00',
              endDateTime: new Date(2024, 4, 2, 2, 0).toISOString(),
              end: '02:00' },
          ] },
        6: { day: 6,
          date: '2024-05-08',
          timeSlots: [
            { startDateTime: new Date(2024, 4, 8, 23, 0).toISOString(),
              start: '23:00',
              endDateTime: new Date(2024, 4, 9, 0, 0).toISOString(),
              end: '00:00' },
          ] },
      });
    });
  });
  describe('setDefaultScheduleToTimeZoneHours', () => {
    it('returns the schedule with the hours set to the local timezone', () => {
      const defaultSchedule = {
        0: { day: 0,
          date: '2024-05-01',
          timeSlots: [
            { startDateTime: new Date(2024, 4, 1, 3, 0), endDateTime: new Date(2024, 4, 1, 5, 0) },
          ] },
      };

      const result = {
        0: { day: 0,
          date: '2024-05-01',
          timeSlots: [
            { startDateTime: new Date(2024, 4, 1, 3, 0),
              endDateTime: new Date(2024, 4, 1, 5, 0),
              start: '03:00',
              end: '05:00',
            },
          ] },
      };

      expect(helpers.setDefaultScheduleToTimeZoneHours(defaultSchedule)).toEqual(result);
    });

    it('returns the schedule with the hours set to a different timezone', () => {
      const defaultSchedule = {
        0: { day: 0,
          date: '2024-05-01',
          timeSlots: [
            { startDateTime: new Date(2024, 4, 1, 3, 0), endDateTime: new Date(2024, 4, 1, 5, 0) },
          ] },
      };

      const timeOffset = new Date().getTimezoneOffset();

      const result = {
        0: { day: 0,
          date: '2024-05-01',
          timeSlots: [
            { startDateTime: new Date(2024, 4, 1, 3, 0),
              endDateTime: new Date(2024, 4, 1, 5, 0),
              start: `0${3 + timeOffset / 60}:00`,
              end: `0${5 + timeOffset / 60}:00`,
            },
          ] },
      };

      expect(helpers.setDefaultScheduleToTimeZoneHours(defaultSchedule, 'UTC')).toEqual(result);
    });

    it('calls recalculateDifferentDaySlot if the slot overflows to a different day', () => {
      helpers.recalculateDifferentDaySlot = jest.fn();

      const defaultSchedule = {
        0: { day: 0,
          date: '2024-05-01',
          timeSlots: [
            { startDateTime: new Date(2024, 4, 1, 11, 0), endDateTime: new Date(2024, 4, 2, 1, 0) },
          ] },
      };

      helpers.setDefaultScheduleToTimeZoneHours(defaultSchedule, 'UTC');
      expect(helpers.recalculateDifferentDaySlot).toHaveBeenCalledTimes(1);
    });
  });
});
