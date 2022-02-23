import { ICaseFileDocumentEntity } from '@/entities/case-file-document';
import { IOptionItem } from '@/entities/optionItem';
import { IState } from '../base/base.types';

export interface ICaseFileDocumentEntityState extends IState<ICaseFileDocumentEntity> {
  categories: IOptionItem[];
  categoriesFetched: boolean;
}
