import { mockOptionItemData, mockOptionSubItem } from '@libs/entities-lib/optionItem';
import { ref } from 'vue';

export function getMockOptionListExtensionComponents() {
  const options = mockOptionItemData();
  const subItem = mockOptionSubItem();
  return {
    items: ref([]),
    list: ref(null),
    getItems: jest.fn(() => options),
    addOrUpdateItem: jest.fn(),
    resetState: jest.fn(),
    fetchItems: jest.fn(() => options),
    fetchSubItems: jest.fn(() => subItem),
    createOption: jest.fn(),
    addSubItem: jest.fn(),
    updateItem: jest.fn(),
    updateSubItem: jest.fn(),
    updateStatus: jest.fn(),
    updateSubItemStatus: jest.fn(),
    updateOrderRanks: jest.fn(),
    updateSubItemOrderRanks: jest.fn(),
    setIsOther: jest.fn(),
    setIsDefault: jest.fn(),
    setRestrictFinancial: jest.fn(),
    setLodging: jest.fn(),
  };
}
