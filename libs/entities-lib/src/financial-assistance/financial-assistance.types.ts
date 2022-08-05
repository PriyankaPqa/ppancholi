import { IMultilingual } from '@libs/core-lib/src/types';
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

export interface IFinancialAssistanceOptionItemData {
  optionItemId: string;
  specifiedOther: string;
}

export interface IFinancialAssistanceTableSubItemData {
  id?: uuid;
  subCategory: IFinancialAssistanceOptionItemData;
  maximumAmount: number;
  amountType: EFinancialAmountModes;
  documentationRequired: boolean;
  frequency: EFinancialFrequency;
  status?: Status;
}
export interface IFinancialAssistanceTableItemData {
  id?: uuid;
  mainCategory: IFinancialAssistanceOptionItemData;
  subItems: IFinancialAssistanceTableSubItemData[];
  status?: Status;
}

export interface IFinancialAssistanceTableEntity extends IEntity {
  eventId: uuid;
  programId: uuid;
  name: IMultilingual;
  status: Status;
  items: IFinancialAssistanceTableItemData[];
}

export interface IFinancialAssistanceTableMetadata extends IEntity {
  programId: uuid;
  programName: IMultilingual;
  financialAssistanceTableStatusName: IMultilingual;
}

export interface ICreateFinancialAssistanceTableRequest extends IFinancialAssistanceTableEntity {}

export interface IEditFinancialAssistanceTableRequest extends IEntity {
  name: IMultilingual;
  status: Status;
}

export type IFinancialAssistanceCategoryEntity = IOptionItem;

export type IFinancialAssistanceTableCombined = IEntityCombined<IFinancialAssistanceTableEntity, IFinancialAssistanceTableMetadata>;
