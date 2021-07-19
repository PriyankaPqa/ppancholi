import { IMultilingual } from '@/types';
import { IEntity, IEntityCombined } from '@/entities/base/base.types';
import { IOptionItem, IOptionSubItem } from '../optionItem';

export enum EFinancialAmountModes {
  Fixed = 'Fixed',
  Variable = 'Variable',
}

export enum EFinancialFrequency {
  OneTime = 'OneTime',
  Multiple = 'Multiple',
}

export interface IFinancialAssistanceTableSubRow {
  subCategory?: IOptionSubItem;
  maximumAmount: number;
  amountType: EFinancialAmountModes;
  documentationRequired: boolean;
  frequency: EFinancialFrequency;
}
export interface IFinancialAssistanceTableRow {
  mainCategory: IOptionItem;
  subRows?: Array<IFinancialAssistanceTableSubRow>;
}

export interface IFinancialAssistanceOptionItemData {
  optionItemId: string;
  specifiedOther: string;
}

export interface IFinancialAssistanceTableSubRowData {
  subCategory: IFinancialAssistanceOptionItemData;
  maximumAmount: number;
  amountType: EFinancialAmountModes;
  documentationRequired: boolean;
  frequency: EFinancialFrequency;
}
export interface IFinancialAssistanceTableRowData {
  mainCategory: IFinancialAssistanceOptionItemData;
  subRows: IFinancialAssistanceTableSubRowData[];
}

export interface IFinancialAssistanceTableEntity extends IEntity {
  eventId: uuid;
  programId: uuid;
  name: IMultilingual;
  rows: IFinancialAssistanceTableRowData[];
}

export interface IFinancialAssistanceTableMetadata extends IEntity {
  programId: uuid;
  programName: IMultilingual;
  financialAssistanceTableStatusName: IMultilingual;
}

export interface ICreateFinancialAssistanceTableRequest extends IFinancialAssistanceTableEntity {}

export type IFinancialAssistanceTableCombined = IEntityCombined<IFinancialAssistanceTableEntity, IFinancialAssistanceTableMetadata>;
