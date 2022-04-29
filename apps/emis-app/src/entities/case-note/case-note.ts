import { IMultilingual } from '@/types';
import { BaseEntity } from '@libs/core-lib/entities/base';
import { ICaseNoteEntity } from './case-note.types';

export class CaseNoteEntity extends BaseEntity {
  caseFileId: uuid;

  subject: string;

  description: string;

  category: {
    optionItemId: uuid,
    specifiedOther: string,
  };

  userCreatedBy: {
    userId: uuid,
    userName: string,
    roleId: uuid,
    roleName: IMultilingual,
  };

  userUpdatedBy: {
    userId: uuid,
    userName: string,
    roleId: uuid,
    roleName: IMultilingual,
  };

  isPinned: boolean;

  updatedDate: Date | string;

  constructor(data?: ICaseNoteEntity) {
    if (data) {
      super(data);
      this.caseFileId = data.caseFileId;
      this.subject = data.subject;
      this.description = data.description;
      this.category = data.category;
      this.userCreatedBy = data.userCreatedBy;
      this.userUpdatedBy = data.userUpdatedBy;
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
