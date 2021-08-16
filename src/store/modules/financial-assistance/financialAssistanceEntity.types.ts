import { Status } from '@/entities/base';
import {
  IFinancialAssistanceTableEntity, IFinancialAssistanceTableItem, IFinancialAssistanceTableSubItem,
} from '@/entities/financial-assistance';
import { IProgram } from '@/entities/program';
import { IMultilingual } from '@/types';
import { IState } from '../base/base.types';

export interface IFinancialAssistanceEntityState extends IState<IFinancialAssistanceTableEntity> {
  id: uuid;
  name: IMultilingual;
  status: Status;
  program: IProgram;
  mainItems: IFinancialAssistanceTableItem[];
  dirty: boolean;
  formDirty: boolean;
  loading: boolean;
  addingItem: boolean | number;
  editedItem: IFinancialAssistanceTableItem;
  editedItemIndex: number;
  editedSubItemIndex: number;
  newItem: IFinancialAssistanceTableItem;
  newSubItem: IFinancialAssistanceTableSubItem;
}
