import { format } from 'date-fns';
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
