import { DomainBaseService } from '@libs/core-lib/services/base';
import { IHttpClient } from '@libs/core-lib/services/http-client';
import { IOptionItemData, IOptionSubItem } from '@/entities/optionItem';
import { IOptionItemBaseService } from '@/services/option-items-base/base.types';
import { IMultilingual } from '@/types';
import { Status } from '@libs/core-lib/entities/base';

export class OptionItemBaseService extends DomainBaseService<IOptionItemData, uuid> implements IOptionItemBaseService {
  constructor(http: IHttpClient, apiUrlSuffix: string, controller: string) {
    super(http, apiUrlSuffix, controller);
  }

  async createOptionItem(optionItem: IOptionItemData): Promise<IOptionItemData> {
    return this.http.post(`${this.baseUrl}`, optionItem);
  }

  async addSubItem(itemId: string, subItem: IOptionSubItem): Promise<IOptionItemData> {
    return this.http.patch(`${this.baseUrl}/${itemId}/add-subitem`, subItem);
  }

  async updateOptionItem(id: string, name: IMultilingual, description: IMultilingual): Promise<IOptionItemData> {
    return this.http.patch(`${this.baseUrl}/${id}/name-description`, { name, description });
  }

  // eslint-disable-next-line
  async updateOptionSubItem(itemId: string, subItemId: string, name: IMultilingual, description: IMultilingual): Promise<IOptionItemData> {
    return this.http.patch(`${this.baseUrl}/${itemId}/subitem/${subItemId}/name-description`, {
      name,
      description,
    });
  }

  async updateOptionItemStatus(id: string, status: Status): Promise<IOptionItemData> {
    return this.http.patch(`${this.baseUrl}/${id}/status`, {
      status,
    });
  }

  async updateOptionSubItemStatus(itemId: string, subItemId: string, status: Status): Promise<IOptionItemData> {
    return this.http.patch(`${this.baseUrl}/${itemId}/subitem/${subItemId}/status`, {
      status,
    });
  }

  async updateOptionItemOrderRanks(reOrders: Record<string, number>): Promise<IOptionItemData[]> {
    return this.http.patch(`${this.baseUrl}/order-ranks`, {
      reOrders,
    });
  }

  async updateOptionSubItemOrderRanks(itemId: string, reOrders: Record<string, number>): Promise<IOptionItemData[]> {
    return this.http.patch(`${this.baseUrl}/${itemId}/subitem/order-ranks`, {
      reOrders,
    });
  }

  async setOptionItemIsOther(id: string, isOther: boolean): Promise<IOptionItemData> {
    return this.http.patch(`${this.baseUrl}/${id}/is-other`, {
      isOther,
    });
  }

  async setOptionItemIsDefault(id: string, isDefault: boolean): Promise<IOptionItemData> {
    return this.http.patch(`${this.baseUrl}/${id}/is-default`, {
      isDefault,
    });
  }
}
