import { ICaseFileDocumentEntity } from '@libs/entities-lib/case-file-document';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { IState } from '../base/base.types';

export interface ICaseFileDocumentEntityState extends IState<ICaseFileDocumentEntity> {
  categories: IOptionItem[];
  categoriesFetched: boolean;
}
