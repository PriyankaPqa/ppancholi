import { CaseFileDetailsPage } from './caseFileDetails.page';

export enum DataTest {
  caseNoteCreate = 'caseNote__createBtn',
  caseNoteSubject = 'case-note-form-subject',
  caseNoteCategory = 'case-note-form-categories',
  caseNoteDescription = 'case-note-form-description',
  caseNoteSave = 'case-note-form-save',
  caseFileUserName = 'caseFileItem__userName',
  caseFileRoleName = 'caseFileItem__roleName',
  caseFileCreated = 'caseFileItem__created',
  caseNoteDisplayedSubject = 'caseNotes__subject',
  caseNoteDisplayedCategory = 'caseNotes__category',
  caseNoteDisplayedDescription = 'caseNotes__description',
  caseFileLastEditBy = 'caseFileItem__lastEditBy',
  caseFileLastModifiedDate = 'caseFileItem__lastModifiedDate',
  caseFileEditButton = 'items__editButton',
  caseFileActivity = 'case-file-activity',
  menuButon = 'items__menuButton',
  pageTitle = 'page-title',
}

export interface ICaseNotesData {
  subject?: string;
  category?: string;
  description?: string;
}

export class CaseNotesPage {
  private caseNoteCreate = { selector: DataTest.caseNoteCreate };

  private caseNoteSubject = { selector: DataTest.caseNoteSubject, type: 'input' };

  private caseNoteDescription = { selector: DataTest.caseNoteDescription, type: 'textarea' };

  private caseNoteSave = { selector: DataTest.caseNoteSave };

  private caseFileUserName = { selector: DataTest.caseFileUserName };

  private caseFileRoleName = { selector: DataTest.caseFileRoleName };

  private caseFileCreated = { selector: DataTest.caseFileCreated };

  private caseNoteDisplayedSubject = { selector: DataTest.caseNoteDisplayedSubject };

  private caseNoteDisplayedCategory = { selector: DataTest.caseNoteDisplayedCategory };

  private caseNoteDisplayedDescription = { selector: DataTest.caseNoteDisplayedDescription };

  private caseFileLastEditBy = { selector: DataTest.caseFileLastEditBy };

  private caseFileLastModifiedDate = { selector: DataTest.caseFileLastModifiedDate };

  private caseFileEditButton = { selector: DataTest.caseFileEditButton };

  private caseFileActivity = { selector: DataTest.caseFileActivity };

  private menuButon = { selector: DataTest.menuButon };

  private pageTitle = { selector: DataTest.pageTitle };

  public getCreateCaseNoteButton() {
    return cy.getByDataTest(this.caseNoteCreate);
  }

  async fill(data: ICaseNotesData, roleName:string) {
    if (data.subject) {
      cy.getByDataTest(this.caseNoteSubject).type(`${data.subject} ${roleName}`);
    }

    if (data.category) {
      cy.selectListElementByValue(DataTest.caseNoteCategory, data.category);
    }

    if (data.description) {
      cy.getByDataTest(this.caseNoteDescription).type(`${data.description} ${roleName}`);
    }
  }

  public getCaseNoteButton() {
    return cy.getByDataTest(this.caseNoteSave);
  }

  public getCaseFileUserName() {
    return cy.getByDataTest(this.caseFileUserName).getAndTrimText();
  }

  public getCaseFileRoleName() {
    return cy.getByDataTest(this.caseFileRoleName).getAndTrimText();
  }

  public getCaseNoteSubject() {
    return cy.getByDataTest(this.caseNoteDisplayedSubject).getAndTrimText();
  }

  public getCaseNoteCategory() {
    return cy.getByDataTest(this.caseNoteDisplayedCategory).getAndTrimText();
  }

  public getCaseNoteDescription() {
    return cy.getByDataTest(this.caseNoteDisplayedDescription).getAndTrimText();
  }

  public getCaseFileLastEditBy() {
    return cy.getByDataTest(this.caseFileLastEditBy).getAndTrimText();
  }

  public getCaseFileLastModifiedDate() {
    return cy.getByDataTest(this.caseFileLastModifiedDate).getAndTrimText();
  }

  public getCaseFileEditButton() {
    cy.getByDataTest(this.menuButon).click();
    return cy.getByDataTest(this.caseFileEditButton);
  }

  public goToCaseFileDetailsPage() {
   cy.getByDataTest(this.caseFileActivity).click();
   return new CaseFileDetailsPage();
  }

  public getPageTitle() {
    return cy.getByDataTest(this.pageTitle);
  }
}
