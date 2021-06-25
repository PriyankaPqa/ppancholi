import {
  EFinancialAssistanceStatus, IFinancialAssistanceTableRow, IFinancialAssistanceTableSubRow,
} from '@/entities/financial-assistance';
import { IProgram } from '@/entities/program';
import { IMultilingual } from '@/types';

export type IState = {
  id: uuid;
  name: IMultilingual;
  status: EFinancialAssistanceStatus;
  program: IProgram;
  mainItems: IFinancialAssistanceTableRow[];
  dirty: boolean;
  formDirty: boolean;
  loading: boolean;
  addingItem: boolean | number;
  editedItem: IFinancialAssistanceTableRow;
  editedItemIndex: number;
  editedSubItemIndex: number;
  newItem: IFinancialAssistanceTableRow;
  newSubItem: IFinancialAssistanceTableSubRow;
};
