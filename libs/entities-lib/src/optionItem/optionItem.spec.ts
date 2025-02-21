import { mockBaseData } from '../base';
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
      expect(optionItem.created).toEqual(mockBaseData().created);
    });

    it('should instantiate timestamp', () => {
      const optionItem = new OptionItem(mockData);
      expect(optionItem.timestamp).toEqual(mockBaseData().timestamp);
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

    it('should instantiate description', () => {
      const optionItem = new OptionItem(mockData);

      expect(optionItem.description).toEqual({
        translation: {
          en: 'This is item 1 description',
          fr: 'This is item 1 description FR',
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

    it('should instantiate subitems', () => {
      const optionItem = new OptionItem(mockData);
      expect(optionItem.subitems).toEqual(mockData.subitems);
    });

    it('should instantiate isHidden', () => {
      const optionItem = new OptionItem(mockData);
      expect(optionItem.isHidden).toEqual(mockData.isHidden);
    });

    it('should instantiate isLodging', () => {
      const optionItem = new OptionItem(mockData);
      expect(optionItem.isLodging).toEqual(mockData.isLodging);
    });

    it('should instantiate isOnline', () => {
      const optionItem = new OptionItem(mockData);
      expect(optionItem.isOnline).toEqual(mockData.isOnline);
    });

    it('should instantiate isOnline', () => {
      const optionItem = new OptionItem(mockData);
      expect(optionItem.isRelatedToFinancialAssistance).toEqual(mockData.isRelatedToFinancialAssistance);
    });
  });
});
