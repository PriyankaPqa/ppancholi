import {
  IOptionItemData, EOptionLists, ICreateOptionItemRequest,
} from '@libs/entities-lib/optionItem';
import { IMultilingual, Status } from '@libs/shared-lib/types';
import { IHttpClient } from '../http-client';
import { IOptionItemsService } from './optionItems.types';

export class OptionItemsService implements IOptionItemsService {
  constructor(private readonly http: IHttpClient) {}

  // eslint-disable-next-line complexity
  getPrefix(list: EOptionLists): string {
    switch (list) {
      case EOptionLists.CaseFileTags:
        return '/case-file/tags';
      case EOptionLists.EventTypes:
        return '/event/event-types';
      case EOptionLists.Genders:
        return '/household/genders';
      case EOptionLists.PreferredLanguages:
        return '/household/preferred-languages';
      case EOptionLists.PrimarySpokenLanguages:
        return '/household/primary-spoken-languages';
      case EOptionLists.AgreementTypes:
        return '/event/agreement-types';
      case EOptionLists.Roles:
        return '/user-account/roles';
      case EOptionLists.CaseFileInactiveReasons:
        return '/case-file/inactive-reasons';
      case EOptionLists.CaseNoteCategories:
        return '/case-file/case-note-categories';
      case EOptionLists.CaseFileCloseReasons:
        return '/case-file/close-reasons';
      case EOptionLists.FinancialAssistanceCategories:
        return '/finance/financial-assistance-categories';
      case EOptionLists.ScreeningId:
        return '/household/screening-ids';
      case EOptionLists.ReferralOutcomeStatus:
        return '/case-file/referral-outcome-statuses';
      case EOptionLists.ReferralTypes:
        return '/case-file/referral-types';
      case EOptionLists.DocumentCategories:
        return '/case-file/document-categories';
      case EOptionLists.ExceptionalAuthenticationTypes:
        return '/event/exceptional-authentication-types';
      case EOptionLists.TaskCategories:
        return '/case-file/task-categories';
      case EOptionLists.AppointmentModalities:
        return '/appointment/appointment-modalities';
      default:
        return '';
    }
  }

  async getOptionList(list: EOptionLists): Promise<IOptionItemData[]> {
    return this.http.get(`${this.getPrefix(list)}/all`);
  }

  async createOptionItem(list: EOptionLists, optionItem: ICreateOptionItemRequest): Promise<IOptionItemData> {
    return this.http.post(this.getPrefix(list), optionItem);
  }

  async addSubItem(list: EOptionLists, itemId: string, subItem: ICreateOptionItemRequest): Promise<IOptionItemData> {
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

  async updateOptionItemStatus(list: EOptionLists, id: string, status: Status): Promise<IOptionItemData> {
    return this.http.patch(`${this.getPrefix(list)}/${id}/status`, {
      status,
    });
  }

  async updateOptionSubItemStatus(list: EOptionLists, itemId: string, subItemId: string, status: Status): Promise<IOptionItemData> {
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

  async setOptionSubItemIsOther(list: EOptionLists, itemId: string, subItemId: string, isOther: boolean): Promise<IOptionItemData> {
    return this.http.patch(`${this.getPrefix(list)}/${itemId}/subitem/${subItemId}/is-other`, {
      isOther,
    });
  }

  async setOptionItemIsDefault(list: EOptionLists, id: string, isDefault: boolean): Promise<IOptionItemData> {
    return this.http.patch(`${this.getPrefix(list)}/${id}/is-default`, {
      isDefault,
    });
  }

  async setOptionItemRestrictFinancial(list: EOptionLists, id: string, restrictFinancial: boolean): Promise<IOptionItemData> {
    return this.http.patch(`${this.getPrefix(list)}/${id}/restrict-financial`, {
      restrictFinancial,
    });
  }

  async setOptionItemLodging(list: EOptionLists, id: string, isLodging: boolean): Promise<IOptionItemData> {
    return this.http.patch(`${this.getPrefix(list)}/${id}/is-lodging`, {
      value: isLodging,
    });
  }

  async setOptionItemIsOnline(list: EOptionLists, id: string, isOnline: boolean): Promise<IOptionItemData> {
    return this.http.patch(`${this.getPrefix(list)}/${id}/is-online`, {
      value: isOnline,
    });
  }
}
