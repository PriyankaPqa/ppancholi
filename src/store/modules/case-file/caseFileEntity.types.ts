import { ICaseFileEntity } from '@/entities/case-file';
import { IOptionItem } from '@/entities/optionItem';
import { IState } from '../base/base.types';

export interface ICaseFileEntityState extends IState<ICaseFileEntity> {
  tagsOptions: IOptionItem[];
  searchLoading: boolean;
  getLoading: boolean;
  duplicateLoading: boolean;
  inactiveReasons: IOptionItem[];
  closeReasons: IOptionItem[];
  triageLoading: boolean;
  allScreeningIds: IOptionItem[];
  screeningIdsFetched: boolean;
}
