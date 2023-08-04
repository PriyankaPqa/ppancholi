import { format } from 'date-fns';
import { formatCurrentDate } from '@libs/cypress-lib/helpers';
import { AssessmentsListPage } from '../../../pages/assessmentsCasefile/assessmentsList.page';

export const verifyPartiallyCompletedCaseFileAssessment = (roleName:string) => {
  const assessmentsListPage = new AssessmentsListPage();
  assessmentsListPage.getCompletedAssessmentTable().contains('Partial').should('be.visible');
  assessmentsListPage.getAssessmentDetailLink().should('be.visible');
  assessmentsListPage.getAssessmentDateAssigned().should('eq', format(Date.now(), 'yyyy-MM-dd'));
  assessmentsListPage.getAssessmentDateModified().should('eq', format(Date.now(), 'yyyy-MM-dd'));
  assessmentsListPage.getAssessmentDateCompletedElement().should('not.be.visible');
  if (roleName === 'Contributor3' || roleName === 'Contributor2' || roleName === 'Contributor1' || roleName === 'ReadOnly') {
    assessmentsListPage.getResumePartialAssessmentButton().should('not.exist');
  } else {
    assessmentsListPage.getResumePartialAssessmentButton().should('be.visible');
  }
};

export const verifyPendingCaseFileAssessment = (roleName:string, assessmentName: string) => {
  const assessmentsListPage = new AssessmentsListPage();
  assessmentsListPage.getPendingAssessmentTable().contains(`${assessmentName}`).should('be.visible');
  assessmentsListPage.getPendingAssessmentTable().contains(`${formatCurrentDate()}`).should('be.visible');
  assessmentsListPage.getPendingAssessmentTable().contains('Pending').should('be.visible');
  if (roleName === 'Contributor3' || roleName === 'Contributor2' || roleName === 'Contributor1' || roleName === 'ReadOnly') {
    assessmentsListPage.getAssessmentStartButton().should('not.exist');
  } else {
    assessmentsListPage.getAssessmentStartButton().should('be.visible');
  }
  if (roleName === 'Level0' || roleName === 'Contributor3' || roleName === 'Contributor2' || roleName === 'Contributor1' || roleName === 'ReadOnly') {
    assessmentsListPage.getDeleteAssessmentButton().should('not.exist');
  } else {
    assessmentsListPage.getDeleteAssessmentButton().should('be.visible');
  }
};

export const verifyFullyCompletedCaseFileAssessment = (roleName:string, assessmentName: string) => {
  const assessmentsListPage = new AssessmentsListPage();
  assessmentsListPage.getCompletedAssessmentTable().contains(`${assessmentName}`).should('be.visible');
  assessmentsListPage.getAssessmentDateAssigned().should('eq', format(Date.now(), 'yyyy-MM-dd'));
  assessmentsListPage.getAssessmentDateModified().should('eq', format(Date.now(), 'yyyy-MM-dd'));
  assessmentsListPage.getAssessmentDateCompletedElement().contains(`${formatCurrentDate()}`).should('be.visible');
  assessmentsListPage.getAssessmentStatusTag().should('eq', 'Completed');
  if (roleName === 'Level6' || roleName === 'Level5' || roleName === 'Level4' || roleName === 'Level3') {
    assessmentsListPage.getEditCompletedAssessmentButton().should('be.visible');
  } else {
    assessmentsListPage.getEditCompletedAssessmentButton().should('not.exist');
  }
};
