import { OptionItem } from './optionItem';
import { mockOptionItemData } from './optionItem.mock';

const mockData = mockOptionItemData()[0];

describe('>>> Option Item', () => {
  describe('>> constructor', () => {
    it('should instantiate id', () => {
      const optionItem = new OptionItem(mockData);
      expect(optionItem.id).toBe('1');
    });

    it('should instantiate created', () => {
      const optionItem = new OptionItem(mockData);
      expect(optionItem.created).toEqual(new Date('2021-01-14T00:00:00.000Z'));
    });

    it('should instantiate timestamp', () => {
      const optionItem = new OptionItem(mockData);
      expect(optionItem.timestamp).toEqual(new Date('2021-01-14T00:00:00.000Z'));
    });

    it('should instantiate eTag', () => {
      const optionItem = new OptionItem(mockData);
      expect(optionItem.eTag).toBe('');
    });

    it('should instantiate name', () => {
      const optionItem = new OptionItem(mockData);
      expect(optionItem.name).toEqual({
        translation: {
          en: 'Flood',
          fr: 'Inundation',
        },
      });
    });

    it('should instantiate orderRank', () => {
      const optionItem = new OptionItem(mockData);
      expect(optionItem.orderRank).toBe(mockData.orderRank);
    });

    it('should instantiate status', () => {
      const optionItem = new OptionItem(mockData);
      expect(optionItem.status).toBe(mockData.status);
    });
  });
});
