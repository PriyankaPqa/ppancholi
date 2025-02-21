import { mockEventEntity } from '@libs/entities-lib/event';
import helpers from './helpers';

describe('helpers', () => {
  describe('callSearchInInBatches', () => {
    it('returns the right calls if the filter passed is a string', async () => {
      const ids = ['id1', 'id2', 'id3', 'id4', 'id5'];
      const searchInFilter = 'search.in(Entity/HouseholdId, \'{ids}\', \',\')';
      const service = { mockSearch: jest.fn() };
      const otherFilter = 'Entity/EventId eq \'id10\'';
      const otherOptions = { top: 999 };
      const batchSize = 3;
      const api = 'mockSearch';

      await helpers.callSearchInInBatches({ ids, searchInFilter, otherFilter, otherOptions, service, batchSize, api });

      expect(service.mockSearch).toHaveBeenCalledTimes(2);
      expect(service.mockSearch).toHaveBeenCalledWith({
        filter: 'search.in(Entity/HouseholdId, \'id1,id2,id3\', \',\') and Entity/EventId eq \'id10\'',
        top: 999,
      });
      expect(service.mockSearch).toHaveBeenCalledWith({
        filter: 'search.in(Entity/HouseholdId, \'id4,id5\', \',\') and Entity/EventId eq \'id10\'',
        top: 999,
      });
    });

    it('makes the right calls if the filter passed is an object', async () => {
      const ids = ['id1', 'id2', 'id3', 'id4', 'id5'];
      const searchInFilter = { Entity: { Id: { searchIn_az: '{ids}' } } };
      const service = { mockSearch: jest.fn() };
      const otherFilter = 'Entity/EventId eq \'id10\'';
      const otherOptions = { top: 999 };
      const batchSize = 3;
      const api = 'mockSearch';

      await helpers.callSearchInInBatches({ ids, searchInFilter, otherFilter, otherOptions, service, batchSize, api });

      expect(service.mockSearch).toHaveBeenCalledTimes(2);
      expect(service.mockSearch).toHaveBeenCalledWith({
        filter: { Entity: { Id: { searchIn_az: ['id1', 'id2', 'id3'] } } },
        top: 999,
      });
      expect(service.mockSearch).toHaveBeenCalledWith({
        filter: { Entity: { Id: { searchIn_az: ['id4', 'id5'] } } },
        top: 999,
      });
    });

    it('returns the right flattened data', async () => {
      const ids = ['id1', 'id2', 'id3', 'id4', 'id5'];
      const searchInFilter = { Entity: { Id: { searchIn_az: '{ids}' } } };
      const otherFilter = 'Entity/EventId eq \'id10\'';
      const otherOptions = { top: 999 };
      const batchSize = 3;
      const api = 'mockSearch';
      const event1 = { entity: mockEventEntity('id1'), metadata: mockEventEntity('id1') };
      const event2 = { entity: mockEventEntity('id2'), metadata: mockEventEntity('id2') };
      const service = { mockSearch: jest.fn() };

      jest.spyOn(service, 'mockSearch')
        .mockReturnValueOnce({
          ids: ['r-id-1', 'r-id-2'],
          value: [event1],
          count: 15,
          odataCount: 1,
          odataContext: 'abc',
          date: 'my-date',
        })
        .mockReturnValueOnce({
          ids: ['r-id-3', 'r-id-4'],
          value: [event2],
          count: 10,
          odataCount: 2,
          odataContext: 'abc',
        });

      const result = await helpers.callSearchInInBatches({ ids, searchInFilter, otherFilter, otherOptions, service, batchSize, api });

      expect(result).toEqual({
        ids: ['r-id-1', 'r-id-2', 'r-id-3', 'r-id-4'],
        value: [event1, event2],
        count: 25,
        odataCount: 3,
        odataContext: 'abc',
        date: 'my-date',
      });
    });

    it('does not return returns a key if it is null', async () => {
      const ids = ['id1', 'id2', 'id3', 'id4', 'id5'];
      const searchInFilter = { Entity: { Id: { searchIn_az: '{ids}' } } };
      const event1 = { entity: mockEventEntity('id1'), metadata: mockEventEntity('id1') };
      const service = {
        mockSearch: jest.fn(() => ({
          ids: ['r-id-1', 'r-id-2'],
          value: [event1],
          count: 15,
        })),
      };
      const otherFilter = 'Entity/EventId eq \'id10\'';
      const otherOptions = { top: 999 };
      const batchSize = 3;
      const api = 'mockSearch';

      const result = await helpers.callSearchInInBatches({ ids, searchInFilter, otherFilter, otherOptions, service, batchSize, api });

      expect(result).toEqual({
        ids: ['r-id-1', 'r-id-2', 'r-id-1', 'r-id-2'],
        value: [event1, event1],
        count: 30,
      });

      expect(result).not.toContain({
        odataCount: null,
      });
    });
  });

  describe('getEnumKeyText', () => {
    it('should return the string name of the enum that fits the value', () => {
      const test = {
        A: 0,
        B: 1,
        SomeMoreValue: 3,
      };
      let res = helpers.getEnumKeyText(test, 3);
      expect(res).toEqual('SomeMoreValue');
      res = helpers.getEnumKeyText(test, 1);
      expect(res).toEqual('B');
    });
  });

  describe('capitalize', () => {
    it('should format string correctle', () => {
      const str = 'abc abc';
      expect(helpers.capitalize(str)).toEqual('Abc abc');
    });
  });

  describe('toTitleCase', () => {
    it('should format string correctly', () => {
      const str = 'abc abc abc';
      expect(helpers.toTitleCase(str)).toEqual('Abc Abc Abc');
    });
  });

  describe('getFormattedPhoneNumber', () => {
    it('returns the right value when showCountryCode is false', () => {
      expect(helpers.getFormattedPhoneNumber('+15144567777', false)).toEqual('(514) 456-7777');
    });
    it('returns the right value when showCountryCode is true/default', () => {
      expect(helpers.getFormattedPhoneNumber('+15144567777')).toEqual('1 (514) 456-7777');
    });

    test('When value is an invalid phone number, it displays the value untouched', () => {
      expect(helpers.getFormattedPhoneNumber('+15147777', false)).toEqual('+15147777');
    });
  });

  describe('convertDateStringToDateObject', () => {
    it('should convert a Date string into Date object, should not convert a non Date string', () => {
      const obj = {
        any: {
          randomKey1: {
            lt: '2024-06-20T00:00:00.000Z',
          },
          randomKey2: {
            eq: 'mock-content',
          },
        },
      };
      helpers.convertDateStringToDateObject(obj);
      expect(obj).toEqual({
        any: {
          randomKey1: {
            lt: new Date('2024-06-20T00:00:00.000Z'),
          },
          randomKey2: {
            eq: 'mock-content',
          },
        },
      });
    });

    it('should not convert a Date string if it doesnt have length of 24', () => {
      const obj = {
        any: {
          randomKey1: {
            lt: '2024-06-20T00:00:00.00Z',
          },
        },
      };
      helpers.convertDateStringToDateObject(obj);
      expect(obj).toEqual({
        any: {
          randomKey1: {
            lt: '2024-06-20T00:00:00.00Z',
          },
        },
      });
    });

    it('should not convert a Date string if it doesnt end with Z', () => {
      const obj = {
        any: {
          randomKey1: {
            lt: '2024-06-20T00:00:00.000',
          },
        },
      };
      helpers.convertDateStringToDateObject(obj);
      expect(obj).toEqual({
        any: {
          randomKey1: {
            lt: '2024-06-20T00:00:00.000',
          },
        },
      });
    });
  });

  describe('removeInactiveItemsFilterOdata', () => {
    it('returns the right filter if filter is object', () => {
      const params = { filter: { Foo: 'foo' } };
      expect(helpers.removeInactiveItemsFilterOdata(params)).toEqual({ filter: { Foo: 'foo', 'Entity/Status': 'Active' } });
    });
    it('returns the right filter if filter is string', () => {
      const params = { filter: 'filter string' };
      expect(helpers.removeInactiveItemsFilterOdata(params)).toEqual({ filter: 'filter string and Entity/Status eq \'Active\'' });
    });
  });
});
