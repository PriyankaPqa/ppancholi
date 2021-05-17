import { IHttpClient } from '@/services/httpClient';
import {
  IOptionItemData, EOptionListItemStatus, EOptionLists, IOptionSubItem,
} from '@/entities/optionItem';
import { IMultilingual } from '@/types';
import { IOptionItemsService } from './optionItems.types';

export class OptionItemsService implements IOptionItemsService {
  constructor(private readonly http: IHttpClient) {}

  getPrefix(list: EOptionLists): string {
    switch (list) {
      case EOptionLists.CaseFileTags:
        return '/case-file/tags';
      case EOptionLists.EventTypes:
        return '/event/event-types';
      case EOptionLists.Genders:
        return '/beneficiary/genders';
      case EOptionLists.PreferredLanguages:
        return '/beneficiary/preferred-languages';
      case EOptionLists.PrimarySpokenLanguages:
        return '/beneficiary/primary-spoken-languages';
      case EOptionLists.AgreementTypes:
        return '/event/agreement-types';
      case EOptionLists.Roles:
        return '/user-account/roles';
      case EOptionLists.CaseFileInactiveReasons:
        return '/case-file/inactive-reasons';
      case EOptionLists.CaseNoteCategories:
        return '/case-file/case-note-categories';
      default:
        return '';
    }
  }

  async getOptionList(list: EOptionLists): Promise<IOptionItemData[]> {
    return this.http.get(`${this.getPrefix(list)}/all`);
  }

  async createOptionItem(list: EOptionLists, optionItem: IOptionItemData): Promise<IOptionItemData> {
    return this.http.post(this.getPrefix(list), optionItem);
  }

  async addSubItem(list: EOptionLists, itemId: string, subItem: IOptionSubItem): Promise<IOptionItemData> {
    return this.http.patch(`${this.getPrefix(list)}/${itemId}/add-subitem`, subItem);
  }

  async updateOptionItem(list: EOptionLists, id: string, name: IMultilingual, description: IMultilingual): Promise<IOptionItemData> {
    return this.http.patch(`${this.getPrefix(list)}/${id}/name-description`, { name, description });
  }

  // eslint-disable-next-line
  async updateOptionSubItem(
    list: EOptionLists,
    itemId: string,
    subItemId: string,
    name: IMultilingual,
    description: IMultilingual,
  ): Promise<IOptionItemData> {
    return this.http.patch(`${this.getPrefix(list)}/${itemId}/subitem/${subItemId}/name-description`, {
      name,
      description,
    });
  }

  async updateOptionItemStatus(list: EOptionLists, id: string, status: EOptionListItemStatus): Promise<IOptionItemData> {
    return this.http.patch(`${this.getPrefix(list)}/${id}/status`, {
      status,
    });
  }

  async updateOptionSubItemStatus(list: EOptionLists, itemId: string, subItemId: string, status: EOptionListItemStatus): Promise<IOptionItemData> {
    return this.http.patch(`${this.getPrefix(list)}/${itemId}/subitem/${subItemId}/status`, {
      status,
    });
  }

  async updateOptionItemOrderRanks(target: EOptionLists, reOrders: Record<string, number>): Promise<IOptionItemData[]> {
    return this.http.patch(`${this.getPrefix(target)}/order-ranks`, {
      reOrders,
    });
  }

  async updateOptionSubItemOrderRanks(target: EOptionLists, itemId: string, reOrders: Record<string, number>): Promise<IOptionItemData[]> {
    return this.http.patch(`${this.getPrefix(target)}/${itemId}/subitem/order-ranks`, {
      reOrders,
    });
  }

  async setOptionItemIsOther(list: EOptionLists, id: string, isOther: boolean): Promise<IOptionItemData> {
    return this.http.patch(`${this.getPrefix(list)}/${id}/is-other`, {
      isOther,
    });
  }

  async setOptionItemIsDefault(list: EOptionLists, id: string, isDefault: boolean): Promise<IOptionItemData> {
    return this.http.patch(`${this.getPrefix(list)}/${id}/is-default`, {
      isDefault,
    });
  }
}
