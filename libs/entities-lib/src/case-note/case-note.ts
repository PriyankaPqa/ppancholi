import _cloneDeep from 'lodash/cloneDeep';
import { IUserInformation } from '@libs/shared-lib/types';
import { BaseEntity } from '../base';
import { ICaseNoteEntity } from './case-note.types';

export class CaseNoteEntity extends BaseEntity {
  caseFileId: uuid;

  subject: string;

  description: string;

  category: {
    optionItemId: uuid,
    specifiedOther: string,
  };

  userCreatedBy: IUserInformation;

  userUpdatedBy: IUserInformation;

  isPinned: boolean;

  updatedDate: Date | string;

  constructor(data?: ICaseNoteEntity) {
    if (data) {
      super(data);
      this.caseFileId = data.caseFileId;
      this.subject = data.subject;
      this.description = data.description;
      this.category = _cloneDeep(data.category);
      this.userCreatedBy = _cloneDeep(data.userCreatedBy);
      this.userUpdatedBy = _cloneDeep(data.userUpdatedBy);
      this.isPinned = data.isPinned;
      this.updatedDate = new Date(data.updatedDate);
    } else {
      super();
      this.caseFileId = null;
      this.subject = null;
      this.description = null;
      this.category = null;
      this.userCreatedBy = null;
      this.userUpdatedBy = null;
      this.isPinned = false;
      this.updatedDate = null;
    }
  }

  private validateAttributes(errors: Array<string>) {
    if (!this.subject) {
      errors.push('The subject is required');
    }

    if (!this.category) {
      errors.push('The category is required');
    }

    if (!this.description) {
      errors.push('The description is required');
    }
  }

  validate(): Array<string> | boolean {
    const errors: Array<string> = [];

    this.validateAttributes(errors);
    if (!errors.length) {
      return true;
    }

    return errors;
  }
}
