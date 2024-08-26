import {
  mockOptionItemData, mockSubItem, EOptionLists,
} from '@libs/entities-lib/optionItem';
import { Status } from '@libs/shared-lib/types';
import { mockHttp } from '../http-client';
import { OptionItemsService } from './optionItems';

const http = mockHttp();

describe('>>> OptionItems Service', () => {
  const service = new OptionItemsService(http as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPrefix', () => {
    it('returns correct prefix for EOptionLists.CaseFileTags', () => {
      expect(service.getPrefix(EOptionLists.CaseFileTags)).toBe('/case-file/tags');
    });

    it('returns correct prefix for EOptionLists.EventTypes', () => {
      expect(service.getPrefix(EOptionLists.EventTypes)).toBe('/event/event-types');
    });

    it('returns correct prefix for EOptionLists.Genders', () => {
      expect(service.getPrefix(EOptionLists.Genders)).toBe('/household/genders');
    });

    it('returns correct prefix for EOptionLists.PreferredLanguages', () => {
      expect(service.getPrefix(EOptionLists.PreferredLanguages)).toBe('/household/preferred-languages');
    });

    it('returns correct prefix for EOptionLists.PrimarySpokenLanguages', () => {
      expect(service.getPrefix(EOptionLists.PrimarySpokenLanguages)).toBe('/household/primary-spoken-languages');
    });

    it('returns correct prefix for EOptionLists.AgreementTypes', () => {
      expect(service.getPrefix(EOptionLists.AgreementTypes)).toBe('/event/agreement-types');
    });

    it('returns correct prefix for EOptionLists.Roles', () => {
      expect(service.getPrefix(EOptionLists.Roles)).toBe('/user-account/roles');
    });

    it('returns correct prefix for EOptionLists.CaseFileInactiveReasons', () => {
      expect(service.getPrefix(EOptionLists.CaseFileInactiveReasons)).toBe('/case-file/inactive-reasons');
    });

    it('returns correct prefix for EOptionLists.CaseNoteCategories', () => {
      expect(service.getPrefix(EOptionLists.CaseNoteCategories)).toBe('/case-file/case-note-categories');
    });

    it('returns correct prefix for EOptionLists.CaseFileCloseReasons', () => {
      expect(service.getPrefix(EOptionLists.CaseFileCloseReasons)).toBe('/case-file/close-reasons');
    });
    it('returns correct prefix for EOptionLists.ReferralOutcomeStatus', () => {
      expect(service.getPrefix(EOptionLists.ReferralOutcomeStatus)).toBe('/case-file/referral-outcome-statuses');
    });
    it('returns correct prefix for EOptionLists.ReferralTypes', () => {
      expect(service.getPrefix(EOptionLists.ReferralTypes)).toBe('/case-file/referral-types');
    });
    it('returns correct prefix for EOptionLists.FinancialAssistanceCategories', () => {
      expect(service.getPrefix(EOptionLists.FinancialAssistanceCategories)).toBe('/finance/financial-assistance-categories');
    });
    it('returns correct prefix for EOptionLists.ScreeningId', () => {
      expect(service.getPrefix(EOptionLists.ScreeningId)).toBe('/household/screening-ids');
    });
    it('returns correct prefix for EOptionLists.DocumentCategories', () => {
      expect(service.getPrefix(EOptionLists.DocumentCategories)).toBe('/case-file/document-categories');
    });
    it('returns correct prefix for EOptionLists.ExceptionalAuthenticationTypes', () => {
      expect(service.getPrefix(EOptionLists.ExceptionalAuthenticationTypes)).toBe('/event/exceptional-authentication-types');
    });
    it('returns correct prefix for EOptionLists.AppointmentModalities', () => {
      expect(service.getPrefix(EOptionLists.AppointmentModalities)).toBe('/appointment/appointment-modalities');
    });
    it('returns correct prefix for EOptionLists.ServiceOptionTypes', () => {
      expect(service.getPrefix(EOptionLists.ServiceOptionTypes)).toBe('/appointment/service-option-types');
    });
  });

  test('createOptionItem is linked to the correct URL', async () => {
    const list = EOptionLists.EventTypes;
    await service.createOptionItem(list, mockOptionItemData()[0]);
    expect(http.post).toHaveBeenCalledWith(service.getPrefix(list), mockOptionItemData()[0]);
  });

  test('addSubItem is linked to the correct URL', async () => {
    const list = EOptionLists.EventTypes;

    const itemId = 'item id';
    const subItem = mockSubItem();

    await service.addSubItem(list, itemId, subItem);
    expect(http.patch).toHaveBeenCalledWith(`${service.getPrefix(list)}/${itemId}/add-subitem`, subItem);
  });

  test('getOptionList is linked to the correct URL', async () => {
    const list = EOptionLists.EventTypes;
    await service.getOptionList(list);
    expect(http.get).toHaveBeenCalledWith(`${service.getPrefix(list)}/all`);
  });

  test('updateOptionItem is linked to the correct URL', async () => {
    const name = { translation: { en: 'ENGLISH', fr: 'FRENCH' } };
    const description = { translation: { en: 'desc' } };
    const list = EOptionLists.EventTypes;
    await service.updateOptionItem(list, 'ID', name, description);
    expect(http.patch).toHaveBeenCalledWith(`${service.getPrefix(list)}/ID/name-description`, { name, description });
  });

  test('updateOptionSubItem is linked to the correct URL', async () => {
    const itemId = 'itemId';
    const subItemId = 'subItemId';
    const name = { translation: { en: 'name EN', fr: 'name FR' } };
    const description = { translation: { en: 'description EN', fr: 'description FR' } };
    const list = EOptionLists.EventTypes;
    await service.updateOptionSubItem(list, itemId, subItemId, name, description);
    expect(http.patch).toHaveBeenCalledWith(`${service.getPrefix(list)}/${itemId}/subitem/${subItemId}/name-description`, {
      name,
      description,
    });
  });

  test('updateOptionItemStatus is linked to the correct URL', async () => {
    const status = Status.Inactive;
    const list = EOptionLists.EventTypes;
    await service.updateOptionItemStatus(list, 'ID', status);
    expect(http.patch).toHaveBeenCalledWith(`${service.getPrefix(list)}/ID/status`, { status });
  });

  test('updateOptionSubItemStatus is linked to the correct URL', async () => {
    const itemId = 'itemId';
    const subItemId = 'subItemId';
    const status = Status.Inactive;
    const list = EOptionLists.EventTypes;
    await service.updateOptionSubItemStatus(list, itemId, subItemId, status);
    expect(http.patch).toHaveBeenCalledWith(`${service.getPrefix(list)}/${itemId}/subitem/${subItemId}/status`, { status });
  });

  test('updateOptionItemOrderRanks is linked to the correct URL', async () => {
    const reOrders = { ID_1: 1, ID_2: 2 };
    const list = EOptionLists.EventTypes;
    await service.updateOptionItemOrderRanks(list, reOrders);
    expect(http.patch).toHaveBeenCalledWith(`${service.getPrefix(list)}/order-ranks`, { reOrders });
  });

  test('updateOptionSubItemOrderRanks is linked to the correct URL', async () => {
    const itemId = 'id';
    const reOrders = { ID_1: 1, ID_2: 2 };
    const list = EOptionLists.EventTypes;
    await service.updateOptionSubItemOrderRanks(list, itemId, reOrders);
    expect(http.patch).toHaveBeenCalledWith(`${service.getPrefix(list)}/${itemId}/subitem/order-ranks`, { reOrders });
  });

  test('setOptionItemIsOther is linked to the correct URL', async () => {
    const list = EOptionLists.EventTypes;
    await service.setOptionItemIsOther(list, 'ID', true);
    expect(http.patch).toHaveBeenCalledWith(`${service.getPrefix(list)}/ID/is-other`, { isOther: true });
  });

  test('setOptionSubItemIsOther is linked to the correct URL', async () => {
    const itemId = 'id';
    const subItemId = 'sub-id';
    const list = EOptionLists.EventTypes;
    await service.setOptionSubItemIsOther(list, itemId, subItemId, true);
    expect(http.patch).toHaveBeenCalledWith(`${service.getPrefix(list)}/${itemId}/subitem/${subItemId}/is-other`, { isOther: true });
  });

  test('setOptionItemIsDefault is linked to the correct URL', async () => {
    const list = EOptionLists.EventTypes;
    await service.setOptionItemIsDefault(list, 'ID', true);
    expect(http.patch).toHaveBeenCalledWith(`${service.getPrefix(list)}/ID/is-default`, { isDefault: true });
  });

  test('setOptionItemRestrictFinancial is linked to the correct URL', async () => {
    const list = EOptionLists.CaseFileTags;
    await service.setOptionItemRestrictFinancial(list, 'ID', true);
    expect(http.patch).toHaveBeenCalledWith(`${service.getPrefix(list)}/ID/restrict-financial`, { restrictFinancial: true });
  });

  test('setOptionItemLodging is linked to the correct URL', async () => {
    const list = EOptionLists.CaseFileTags;
    await service.setOptionItemLodging(list, 'ID', true);
    expect(http.patch).toHaveBeenCalledWith(`${service.getPrefix(list)}/ID/is-lodging`, { value: true });
  });

  test('setOptionItemIsOnline is linked to the correct URL', async () => {
    const list = EOptionLists.AppointmentModalities;
    await service.setOptionItemIsOnline(list, 'ID', true);
    expect(http.patch).toHaveBeenCalledWith(`${service.getPrefix(list)}/ID/is-online`, { value: true });
  });
});
