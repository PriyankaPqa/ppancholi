import { IListOption } from '@libs/shared-lib/types';
import { BaseEntity } from '../base';
import { ICaseFileDocumentEntity, DocumentStatus } from './case-file-document.types';

export class CaseFileDocumentEntity extends BaseEntity implements ICaseFileDocumentEntity {
  caseFileId: uuid;

  name: string;

  originalFilename: string;

  note: string;

  category: IListOption;

  documentStatus: DocumentStatus;

  constructor(data?: ICaseFileDocumentEntity) {
    if (data) {
      super(data);
      this.caseFileId = data.caseFileId;
      this.name = data.name;
      this.originalFilename = data.originalFilename;
      this.note = data.note;
      this.category = data.category ? { ...data.category } : null;
      this.documentStatus = data.documentStatus;
    } else {
      super();
      this.caseFileId = null;
      this.name = null;
      this.originalFilename = null;
      this.note = null;
      this.category = { optionItemId: null, specifiedOther: null };
      this.documentStatus = null;
    }
  }

  private validateAttributes(errors: Array<string>) {
    if (!this.caseFileId) {
      errors.push('The case file id is required');
    }

    if (!this.name) {
      errors.push('The name is required');
    }
  }

  /**
   * Validate business rules (non specific to the application)
   */
  validate(): Array<string> | boolean {
    const errors: Array<string> = [];

    this.validateAttributes(errors);
    if (!errors.length) {
      return true;
    }

    return errors;
  }
}
