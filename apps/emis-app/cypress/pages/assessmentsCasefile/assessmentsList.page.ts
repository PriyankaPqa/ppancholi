import { AddAssessmentsPage } from './addAssessments.page';

export enum DataTest {
  add = 'table__addButton',
  tablePendingAssessment = 'pending-assessment-table',
  assessmentStatus = 'chip-text',
  assessmentStart = 'start-link',
  linkCopy = 'copy-link',
  assessmentDelete = 'delete-link',
}

export class AssessmentsListPage {
  private add = { selector: DataTest.add };

  private assessmentStatus = { selector: DataTest.assessmentStatus };

  private tablePendingAssessment = { selector: DataTest.tablePendingAssessment };

  private assessmentStart = { selector: DataTest.assessmentStart };

  private linkCopy = { selector: DataTest.linkCopy };

  private assessmentDelete = { selector: DataTest.assessmentDelete };

  public addAssessment() {
    cy.getByDataTest(this.add).click();
    return new AddAssessmentsPage();
  }

  public getAddAssessmentButton() {
    return cy.getByDataTest(this.add);
  }

  public getAssessmentStatusTag() {
    return cy.getByDataTest(this.assessmentStatus).invoke('text').then((text) => text.trim());
  }

  public getPendingAssessmentTable() {
    return cy.getByDataTest(this.tablePendingAssessment);
  }

  public getCopyLinkButton() {
    return cy.getByDataTest(this.linkCopy);
  }

  public getAssessmentStartButton() {
    return cy.getByDataTest(this.assessmentStart);
  }

  public getDeleteAssessmentButton() {
    return cy.getByDataTest(this.assessmentDelete);
  }
}
