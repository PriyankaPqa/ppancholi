import { ICaseNoteEntity } from '@libs/entities-lib/case-note';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { IState } from '../base/base.types';

export interface ICaseNoteEntityState extends IState<ICaseNoteEntity> {
  caseNoteCategories: IOptionItem[];
  isSavingCaseNote: boolean;
  caseNoteCategoriesFetched: boolean;
}
