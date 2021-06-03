import { ICaseFile } from '@/entities/case-file';
import { IOptionItemData } from '@/entities/optionItem';

export type IState = {
  caseFiles: Array<ICaseFile>;
  getLoading: boolean;
  searchLoading: boolean;
  duplicateLoading: boolean;
  inactiveReasons: Array<IOptionItemData>;
  closeReasons: Array<IOptionItemData>;
  triageLoading: boolean;
  tagsOptions: Array<IOptionItemData>;
  caseNoteCategories: Array<IOptionItemData>;
  isSavingCaseNote: boolean;
  isLoadingCaseNotes: boolean;
};
