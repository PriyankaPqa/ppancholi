import { formatDate } from '@libs/cypress-lib/helpers';
import { AddAssessmentsPage } from './addAssessments.page';

export enum DataTest {
  add = 'table__addButton',
  tablePendingAssessment = 'pending-assessment-table',
  tableCompletedAssessment = 'completed-assessment-table',
  assessmentStatus = 'chip-text',
  assessmentStart = 'start-link',
  linkCopy = 'copy-link',
  assessmentDelete = 'delete-link',
  assessmentDetailLink = 'assessmentDetail-link',
  resumeAssessment = 'resume-link',
  dateAssigned = 'date-assigned',
  dateModified = 'date-modified',
  dateCompleted = 'date-completed',
  resumePartialAssessmentLink = 'resume-link',
  editAssessmentLink = 'edit-link',
}

export class AssessmentsListPage {
  private add = { selector: DataTest.add };

  private assessmentStatus = { selector: DataTest.assessmentStatus };

  private tablePendingAssessment = { selector: DataTest.tablePendingAssessment };

  private tableCompletedAssessment = { selector: DataTest.tableCompletedAssessment };

  private assessmentStart = { selector: DataTest.assessmentStart };

  private assessmentDetailLink = { selector: DataTest.assessmentDetailLink };

  private linkCopy = { selector: DataTest.linkCopy };

  private assessmentDelete = { selector: DataTest.assessmentDelete };

  private dateAssigned = { selector: DataTest.dateAssigned };

  private dateModified = { selector: DataTest.dateModified };

  private dateCompleted = { selector: DataTest.dateCompleted };

  private resumePartialAssessmentLink = { selector: DataTest.resumePartialAssessmentLink };

  private editAssessmentLink = { selector: DataTest.editAssessmentLink };

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

  public getCompletedAssessmentTable() {
    return cy.getByDataTest(this.tableCompletedAssessment);
  }

  public getCopyLinkButton() {
    return cy.getByDataTest(this.linkCopy);
  }

  public getAssessmentStartButton() {
    return cy.getByDataTest(this.assessmentStart);
  }

  public getAssessmentDetailLink() {
    return cy.getByDataTest(this.assessmentDetailLink);
  }

  public getAssessmentDateAssigned() {
    return cy.getByDataTest(this.dateAssigned).invoke('text').then((date) => formatDate(date));
  }

  public getAssessmentDateModified() {
    return cy.getByDataTest(this.dateModified).invoke('text').then((date) => formatDate(date));
  }

  public getAssessmentDateCompleted() {
    return cy.getByDataTest(this.dateCompleted).invoke('text').then((date) => formatDate(date));
  }

  public getAssessmentDateCompletedElement() {
    return cy.getByDataTest(this.dateCompleted);
  }

  public getResumePartialAssessmentButton() {
    return cy.getByDataTest(this.resumePartialAssessmentLink);
  }

  public getEditCompletedAssessmentButton() {
    return cy.getByDataTest(this.editAssessmentLink);
  }

  public getDeleteAssessmentButton() {
    return cy.getByDataTest(this.assessmentDelete);
  }
}
