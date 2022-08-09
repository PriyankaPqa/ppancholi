import { IListOption, IMultilingual } from '@libs/shared-lib/types';
import { IEntity, IEntityCombined } from '../base';

export enum DocumentStatus {
  Current = 1,
  Past = 2,
}

export interface ICaseFileDocumentEntity extends IEntity {
  caseFileId: uuid;
  name: string;
  originalFilename: string;
  note: string;
  category: IListOption;
  documentStatus: DocumentStatus;

  validate(): Array<string> | boolean;
}

export interface ICaseFileDocumentMetadata extends IEntity {
  documentCategoryName: IMultilingual;
  documentStatusName: IMultilingual;
}

export type ICaseFileDocumentCombined = IEntityCombined<ICaseFileDocumentEntity, ICaseFileDocumentMetadata>
