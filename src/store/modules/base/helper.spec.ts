/* eslint-disable @typescript-eslint/no-explicit-any */
import { EOptionListItemStatus, IOptionItemData, IOptionSubItem } from '@/entities/optionItem';
import { filterAndSortActiveItems, filterAndSortActiveSubItems } from './index';

describe('Base Helper', () => {

  const itemData = [
    { orderRank: 99, status: EOptionListItemStatus.Active, id: 'item1', },
    { orderRank: 1, status: EOptionListItemStatus.Inactive, id: 'inactive', },  
    { orderRank: 5, status: EOptionListItemStatus.Active, id: 'item3', },  
    { orderRank: 2, status: EOptionListItemStatus.Active, id: 'item4', },  
    { orderRank: 3, status: EOptionListItemStatus.Active, id: 'item5', },
  ] as IOptionItemData[];
  
  const subitemData = [
    { orderRank: 99, status: EOptionListItemStatus.Active, id: 'item1', },
    { orderRank: 1, status: EOptionListItemStatus.Inactive, id: 'inactive', },  
    { orderRank: 5, status: EOptionListItemStatus.Active, id: 'item3', },  
    { orderRank: 2, status: EOptionListItemStatus.Active, id: 'item4', },  
    { orderRank: 3, status: EOptionListItemStatus.Active, id: 'item5', },
  ] as IOptionSubItem[];

  describe('filterAndSortActiveItems', () => {
    it('should always sort on order', () => {
      const results = filterAndSortActiveItems(itemData);
      expect(results.filter((x, xIndex) =>
        results.filter((y, yIndex) => x.orderRank < y.orderRank && xIndex > yIndex).length > 0
      ).length).toBe(0);
    });

    it('should exclude inactive items by default', () => {
      const results = filterAndSortActiveItems(itemData);
      expect(results.filter((x) => x.orderRank === 1).length).toBe(0);
      expect(results.filter((x) => x.orderRank === 2).length).toBe(1);
    });
    
    it('can include-exclude inactive items by choice', () => {
      let results = filterAndSortActiveItems(itemData, true);
      expect(results.filter((x) => x.orderRank === 1).length).toBe(0);
      expect(results.filter((x) => x.orderRank === 2).length).toBe(1);
      
      results = filterAndSortActiveItems(itemData, false);
      expect(results.filter((x) => x.orderRank === 1).length).toBe(1);
      expect(results.filter((x) => x.orderRank === 2).length).toBe(1);
    });
    
    it('can include inactive items when part of actual value', () => {
      let results = filterAndSortActiveItems(itemData, true, ['item1', 'inactive']);
      expect(results.filter((x) => x.orderRank === 1).length).toBe(1);
      expect(results.filter((x) => x.orderRank === 2).length).toBe(1);
      
      results = filterAndSortActiveItems(itemData, true, ['item1']);
      expect(results.filter((x) => x.orderRank === 1).length).toBe(0);
      expect(results.filter((x) => x.orderRank === 2).length).toBe(1);
      
      results = filterAndSortActiveItems(itemData, true, []);
      expect(results.filter((x) => x.orderRank === 1).length).toBe(0);
      expect(results.filter((x) => x.orderRank === 2).length).toBe(1);

      results = filterAndSortActiveItems(itemData, true, 'item1');
      expect(results.filter((x) => x.orderRank === 1).length).toBe(0);
      expect(results.filter((x) => x.orderRank === 2).length).toBe(1);

      results = filterAndSortActiveItems(itemData, true, 'inactive');
      expect(results.filter((x) => x.orderRank === 1).length).toBe(1);
      expect(results.filter((x) => x.orderRank === 2).length).toBe(1);

      results = filterAndSortActiveItems(itemData, false, ['item1']);
      expect(results.filter((x) => x.orderRank === 1).length).toBe(1);
      expect(results.filter((x) => x.orderRank === 2).length).toBe(1);
    });
  });
  
  describe('filterAndSortActiveSubItems', () => {
    it('should always sort on order', () => {
      const results = filterAndSortActiveSubItems(itemData);
      expect(results.filter((x, xIndex) =>
        results.filter((y, yIndex) => x.orderRank < y.orderRank && xIndex > yIndex).length > 0
      ).length).toBe(0);
    });

    it('should exclude inactive items by default', () => {
      const results = filterAndSortActiveSubItems(itemData);
      expect(results.filter((x) => x.orderRank === 1).length).toBe(0);
      expect(results.filter((x) => x.orderRank === 2).length).toBe(1);
    });
    
    it('can include-exclude inactive items by choice', () => {
      let results = filterAndSortActiveSubItems(itemData, true);
      expect(results.filter((x) => x.orderRank === 1).length).toBe(0);
      expect(results.filter((x) => x.orderRank === 2).length).toBe(1);
      
      results = filterAndSortActiveSubItems(itemData, false);
      expect(results.filter((x) => x.orderRank === 1).length).toBe(1);
      expect(results.filter((x) => x.orderRank === 2).length).toBe(1);
    });
    
    it('can include inactive items when part of actual value', () => {
      let results = filterAndSortActiveSubItems(subitemData, true, ['item1', 'inactive']);
      expect(results.filter((x) => x.orderRank === 1).length).toBe(1);
      expect(results.filter((x) => x.orderRank === 2).length).toBe(1);
      
      results = filterAndSortActiveSubItems(subitemData, true, ['item1']);
      expect(results.filter((x) => x.orderRank === 1).length).toBe(0);
      expect(results.filter((x) => x.orderRank === 2).length).toBe(1);
      
      results = filterAndSortActiveSubItems(subitemData, true, []);
      expect(results.filter((x) => x.orderRank === 1).length).toBe(0);
      expect(results.filter((x) => x.orderRank === 2).length).toBe(1);

      results = filterAndSortActiveSubItems(subitemData, true, 'item1');
      expect(results.filter((x) => x.orderRank === 1).length).toBe(0);
      expect(results.filter((x) => x.orderRank === 2).length).toBe(1);

      results = filterAndSortActiveSubItems(subitemData, true, 'inactive');
      expect(results.filter((x) => x.orderRank === 1).length).toBe(1);
      expect(results.filter((x) => x.orderRank === 2).length).toBe(1);

      results = filterAndSortActiveSubItems(subitemData, false, ['item1']);
      expect(results.filter((x) => x.orderRank === 1).length).toBe(1);
      expect(results.filter((x) => x.orderRank === 2).length).toBe(1);
    });
  });
});