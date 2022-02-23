import { ICaseNoteEntity } from '@/entities/case-note';
import { IOptionItem } from '@/entities/optionItem';
import { IState } from '../base/base.types';

export interface ICaseNoteEntityState extends IState<ICaseNoteEntity> {
  caseNoteCategories: IOptionItem[];
  isSavingCaseNote: boolean;
  isLoadingCaseNotes: boolean;
  caseNoteCategoriesFetched: boolean;
}
