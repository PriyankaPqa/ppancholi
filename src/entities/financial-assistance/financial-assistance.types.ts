import { IMultilingual } from '@/types';
import { IOptionItem, IOptionSubItem } from '../optionItem';

export enum EFinancialAssistanceStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

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
  optionItemId: string,
  specifiedOther: string,
}

export interface IFinancialAssistanceTableSubRowData {
  subCategory: IFinancialAssistanceOptionItemData,
  maximumAmount: number,
  amountType: EFinancialAmountModes,
  documentationRequired: boolean,
  frequency: EFinancialFrequency,
}
export interface IFinancialAssistanceTableRowData {
  mainCategory: IFinancialAssistanceOptionItemData,
  subRows: IFinancialAssistanceTableSubRowData[];
}

export interface IFinancialAssistanceTable {
  id?: uuid;
  status?: EFinancialAssistanceStatus;
  eventId: uuid;
  programId: uuid;
  name: IMultilingual;
  rows: IFinancialAssistanceTableRowData[];
}

export interface IFinancialAssistanceTableData extends IFinancialAssistanceTable {}

export interface ICreateFinancialAssistanceTableRequest extends IFinancialAssistanceTable {}
