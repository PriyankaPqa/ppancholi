import { formatDate } from '@libs/cypress-lib/helpers';

export enum DataTest {
  caseFileActivityTitle = 'caseFileActivity-listItem-content-title',
  caseFileActivityBody = 'caseFileActivity-listItem-content-body',
  sortBy = 'caseFileActivity-case-file-activity-sort-select',
  userName = 'caseFileItem__userName',
  roleName = 'caseFileItem__roleName',
  dateCreated = 'caseFileItem__created',
  backButton = 'back-button',
  caseNote = 'case-note',
}

export class CaseFileActivityPage {
  private caseFileActivityTitle = { selector: DataTest.caseFileActivityTitle };

  private caseFileActivityBody = { selector: DataTest.caseFileActivityBody };

  private userName = { selector: DataTest.userName };

  private roleName = { selector: DataTest.roleName };

  private dateCreated = { selector: DataTest.dateCreated };

  private backButton = { selector: DataTest.backButton };

  private caseNote = { selector: DataTest.caseNote };

  public getCaseFileActivityTitles() {
    return cy.getByDataTest(this.caseFileActivityTitle).invoke('text').then((text) => text.trim());
  }

  public getCaseFileActivityBodies() {
    return cy.getByDataTest(this.caseFileActivityBody).invoke('text').then((text) => text.trim());
  }

  public getUserName(index = 0) {
    return cy.getByDataTest(this.userName).eq(index).invoke('text').then((text) => text.trim());
  }

  public getRoleName(index = 0) {
    return cy.getByDataTest(this.roleName).eq(index).invoke('text').then((text) => text.trim());
  }

  public getCaseFileActivityLogDate(index = 0) {
    return cy.getByDataTest(this.dateCreated).eq(index).invoke('text').then((date) => formatDate(date));
  }

  public goBackToHouseholdProfilePage() {
    cy.getByDataTest(this.backButton).click();
  }

  public goToCaseNotesPage() {
    cy.getByDataTest(this.caseNote).click();
  }
}
