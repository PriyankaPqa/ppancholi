import {
  IFinancialAssistanceTableEntity, IFinancialAssistanceTableItem, IFinancialAssistanceTableSubItem,
} from '@libs/entities-lib/financial-assistance';
import { IProgramEntity } from '@libs/entities-lib/program';
import { IMultilingual } from '@libs/shared-lib/types';
import { Status } from '@libs/entities-lib/base';
import { IState } from '../base/base.types';

export interface IFinancialAssistanceEntityState extends IState<IFinancialAssistanceTableEntity> {
  id: uuid;
  name: IMultilingual;
  status: Status;
  program: IProgramEntity;
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
