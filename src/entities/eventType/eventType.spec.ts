import { EventType } from './eventType';
import { mockEventTypeData } from './eventType.mock';

const mockData = mockEventTypeData()[0];

describe('>>> EventType', () => {
  describe('>> constructor', () => {
    it('should instantiate id', () => {
      const eventType = new EventType(mockData);
      expect(eventType.id).toBe('1');
    });

    it('should instantiate created', () => {
      const eventType = new EventType(mockData);
      expect(eventType.created).toEqual(new Date('2021-01-14T00:00:00.000Z'));
    });

    it('should instantiate timestamp', () => {
      const eventType = new EventType(mockData);
      expect(eventType.timestamp).toEqual(new Date('2021-01-14T00:00:00.000Z'));
    });

    it('should instantiate eTag', () => {
      const eventType = new EventType(mockData);
      expect(eventType.eTag).toBe('');
    });

    it('should instantiate name', () => {
      const eventType = new EventType(mockData);
      expect(eventType.name).toEqual({
        translation: {
          en: 'Flood',
          fr: 'Inundation',
        },
      });
    });

    it('should instantiate orderRank', () => {
      const eventType = new EventType(mockData);
      expect(eventType.orderRank).toBe(1);
    });

    it('should instantiate status', () => {
      const eventType = new EventType(mockData);
      expect(eventType.status).toBe(1);
    });
  });
});
