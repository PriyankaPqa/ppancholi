import { mockOptionItemData, EOptionListItemStatus, EOptionLists } from '@/entities/optionItem';
import { mockHttp } from '@/services/httpClient.mock';
import { OptionItemsService } from './optionItems';

const http = mockHttp();

describe('>>> EventTypes Service', () => {
  const service = new OptionItemsService(http as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPrefix', () => {
    it('returns correct prefix for EOptionLists.EventTypes', () => {
      expect(service.getPrefix(EOptionLists.EventTypes)).toBe('/event/event-types');
    });

    it('returns correct prefix for EOptionLists.Gender', () => {
      expect(service.getPrefix(EOptionLists.Gender)).toBe('/beneficiary/genders');
    });
  });

  test('createOptionItem is linked to the correct URL', async () => {
    const list = EOptionLists.EventTypes;
    await service.createOptionItem(list, mockOptionItemData()[0]);
    expect(http.post).toHaveBeenCalledWith(service.getPrefix(list), mockOptionItemData()[0]);
  });

  test('getOptionList is linked to the correct URL', async () => {
    const list = EOptionLists.EventTypes;
    await service.getOptionList(list);
    expect(http.get).toHaveBeenCalledWith(service.getPrefix(list));
  });

  test('updateOptionItemName is linked to the correct URL', async () => {
    const name = { translation: { en: 'ENGLISH', fr: 'FRENCH' } };
    const list = EOptionLists.EventTypes;
    await service.updateOptionItemName(list, 'ID', name);
    expect(http.patch).toHaveBeenCalledWith(`${service.getPrefix(list)}/ID/name`, { name });
  });

  test('updateOptionItemStatus is linked to the correct URL', async () => {
    const itemStatus = EOptionListItemStatus.Inactive;
    const list = EOptionLists.EventTypes;
    await service.updateOptionItemStatus(list, 'ID', itemStatus);
    expect(http.patch).toHaveBeenCalledWith(`${service.getPrefix(list)}/ID/item-status`, { itemStatus });
  });

  test('updateOptionItemOrderRanks is linked to the correct URL', async () => {
    const reOrders = { ID_1: 1, ID_2: 2 };
    const list = EOptionLists.EventTypes;
    await service.updateOptionItemOrderRanks(list, reOrders);
    expect(http.patch).toHaveBeenCalledWith(`${service.getPrefix(list)}/order-ranks`, { reOrders });
  });

  test('setOptionItemIsOther is linked to the correct URL', async () => {
    const list = EOptionLists.EventTypes;
    await service.setOptionItemIsOther(list, 'ID', true);
    expect(http.patch).toHaveBeenCalledWith(`${service.getPrefix(list)}/ID/is-other`, { isOther: true });
  });

  test('setOptionItemIsDefault is linked to the correct URL', async () => {
    const list = EOptionLists.EventTypes;
    await service.setOptionItemIsDefault(list, 'ID', true);
    expect(http.patch).toHaveBeenCalledWith(`${service.getPrefix(list)}/ID/is-default`, { isDefault: true });
  });
});
