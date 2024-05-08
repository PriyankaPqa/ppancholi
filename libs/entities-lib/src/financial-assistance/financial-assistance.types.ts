import { IListOption, IMultilingual } from '@libs/shared-lib/types';
import { IEntity, IEntityCombined, Status } from '../base';
import { IOptionItem, IOptionSubItem } from '../optionItem';

export enum EFinancialAmountModes {
  Fixed = 1,
  Variable = 2,
}

export enum EFinancialFrequency {
  OneTime = 1,
  Multiple = 2,
}

export interface IFinancialAssistanceTableSubItem {
  id?: uuid;
  subCategory?: IOptionSubItem;
  maximumAmount: number;
  amountType: EFinancialAmountModes;
  documentationRequired: boolean;
  frequency: EFinancialFrequency;
  status?: Status;
}

export interface IFinancialAssistanceTableItem {
  id?: uuid;
  mainCategory: IOptionItem;
  subItems?: Array<IFinancialAssistanceTableSubItem>;
  status?: Status;
}

export interface IFinancialAssistanceTableSubItemData {
  id?: uuid;
  subCategory: IListOption;
  maximumAmount: number;
  amountType: EFinancialAmountModes;
  documentationRequired: boolean;
  frequency: EFinancialFrequency;
  status?: Status;
}
export interface IFinancialAssistanceTableItemData {
  id?: uuid;
  mainCategory: IListOption;
  subItems: IFinancialAssistanceTableSubItemData[];
  status?: Status;
}

export interface IFinancialAssistanceTableEntity extends IEntity {
  eventId: uuid;
  programId: uuid;
  name: IMultilingual;
  status: Status;
  items: IFinancialAssistanceTableItemData[];
  useForLodging: boolean;
}

export interface ICreateFinancialAssistanceTableRequest extends IFinancialAssistanceTableEntity {}

export interface IEditFinancialAssistanceTableRequest extends IEntity {
  name: IMultilingual;
  status: Status;
  useForLodging: boolean;
}

export type IFinancialAssistanceTableCombined = IEntityCombined<IFinancialAssistanceTableEntity, IEntity>;

export type IdParams = uuid;
