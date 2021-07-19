import { Status } from '@/entities/base';
import {
  IFinancialAssistanceTableEntity, IFinancialAssistanceTableRow, IFinancialAssistanceTableSubRow,
} from '@/entities/financial-assistance';
import { IProgram } from '@/entities/program';
import { IMultilingual } from '@/types';
import { IState } from '../base/base.types';

export interface IFinancialAssistanceEntityState extends IState<IFinancialAssistanceTableEntity> {
  id: uuid;
  name: IMultilingual;
  status: Status;
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
}
