import { mockEventEntity, mockEventMetadata } from '@libs/entities-lib/event';
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
      const event1 = { entity: mockEventEntity('id1'), metadata: mockEventMetadata('id1') };
      const event2 = { entity: mockEventEntity('id2'), metadata: mockEventMetadata('id2') };
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
      const event1 = { entity: mockEventEntity('id1'), metadata: mockEventMetadata('id1') };
      const service = { mockSearch: jest.fn(() => ({
        ids: ['r-id-1', 'r-id-2'],
        value: [event1],
        count: 15,
      })) };
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
});
