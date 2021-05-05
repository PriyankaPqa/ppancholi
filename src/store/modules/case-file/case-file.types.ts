import { ICaseFile } from '@/entities/case-file';
import { IOptionItemData } from '@/entities/optionItem';

export type IState = {
  caseFiles: Array<ICaseFile>,
  getLoading: boolean,
  searchLoading: boolean,
  duplicateLoading: boolean;
  tagsOptions: Array<IOptionItemData>,
};
