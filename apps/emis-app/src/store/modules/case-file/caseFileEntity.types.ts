import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { IState } from '../base/base.types';

export interface ICaseFileEntityState extends IState<ICaseFileEntity> {
  searchLoading: boolean;
  tagsOptions: IOptionItem[];
  inactiveReasons: IOptionItem[];
  closeReasons: IOptionItem[];
  allScreeningIds: IOptionItem[];
  tagsOptionsFetched: boolean;
  inactiveReasonsFetched: boolean;
  closeReasonsFetched: boolean;
  screeningIdsFetched: boolean;
}
