import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { AssessmentsListPage } from '../../../pages/assessmentsCasefile/assessmentsList.page';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';

export interface UpdateHouseholdStatusCanStepsParams {
  actionUpdateHousehold: string,
  updatedStatus: string,
  userActionInformation: string,
  rationale: string,
  roleName: string,
  statusEnum: number,
  casefileId: string,
  casefileActivityBody: string,
}

export const verifyPartiallyCompletedCaseFileAssessment = (roleName:string) => {
  const assessmentsListPage = new AssessmentsListPage();
  assessmentsListPage.getCompletedAssessmentTable().contains('Partial').should('be.visible');
  assessmentsListPage.getAssessmentDetailLink().should('be.visible');
  assessmentsListPage.getAssessmentDateAssigned().should('eq', getToday());
  assessmentsListPage.getAssessmentDateModified().should('eq', getToday());
  assessmentsListPage.getAssessmentDateCompletedElement().should('not.be.visible');
  if (roleName === UserRoles.contributor3 || roleName === UserRoles.contributor2 || roleName === UserRoles.contributor1 || roleName === UserRoles.readonly) {
    assessmentsListPage.getResumePartialAssessmentButton().should('not.exist');
  } else {
    assessmentsListPage.getResumePartialAssessmentButton().should('be.visible');
  }
};

export const verifyPendingCaseFileAssessment = (roleName:string, assessmentName: string) => {
  const assessmentsListPage = new AssessmentsListPage();
  assessmentsListPage.getPendingAssessmentTable().contains(`${assessmentName}`).should('be.visible');
  assessmentsListPage.getPendingAssessmentTable().contains(`${getToday()}`).should('be.visible');
  assessmentsListPage.getPendingAssessmentTable().contains('Pending').should('be.visible');
  if (roleName === UserRoles.contributor3 || roleName === UserRoles.contributor2 || roleName === UserRoles.contributor1 || roleName === UserRoles.readonly) {
    assessmentsListPage.getAssessmentStartButton().should('not.exist');
  } else {
    assessmentsListPage.getAssessmentStartButton().should('be.visible');
  }
  // eslint-disable-next-line vue/max-len
  if (roleName === UserRoles.level0 || roleName === UserRoles.contributor3 || roleName === UserRoles.contributor2 || roleName === UserRoles.contributor1 || roleName === UserRoles.readonly) {
    assessmentsListPage.getDeleteAssessmentButton().should('not.exist');
  } else {
    assessmentsListPage.getDeleteAssessmentButton().should('be.visible');
  }
};

export const verifyFullyCompletedCaseFileAssessment = (roleName:string, assessmentName: string) => {
  const assessmentsListPage = new AssessmentsListPage();
  assessmentsListPage.getCompletedAssessmentTable().contains(`${assessmentName}`).should('be.visible');
  assessmentsListPage.getAssessmentDateAssigned().should('eq', getToday());
  assessmentsListPage.getAssessmentDateModified().should('eq', getToday());
  assessmentsListPage.getAssessmentDateCompletedElement().contains(`${getToday()}`).should('be.visible');
  assessmentsListPage.getAssessmentStatusTag().should('eq', 'Completed');
  if (roleName === UserRoles.level6 || roleName === UserRoles.level5 || roleName === UserRoles.level4 || roleName === UserRoles.level3) {
    assessmentsListPage.getEditCompletedAssessmentButton().should('be.visible');
  } else {
    assessmentsListPage.getEditCompletedAssessmentButton().should('not.exist');
  }
};

export const updateHouseholdStatusCanSteps = (params: Partial<UpdateHouseholdStatusCanStepsParams>) => {
  const householdProfilePage = new HouseholdProfilePage();
  householdProfilePage.getDialogTitle().contains(`${params.actionUpdateHousehold} household profile`).should('be.visible');
  householdProfilePage.getDialogStatus().should('eq', params.updatedStatus);
  householdProfilePage.getDialogUserInfo().should('string', `${getUserName(params.roleName)} (${getUserRoleDescription(params.roleName)})`);
  householdProfilePage.getDialogRationaleElement().should('have.attr', 'label').and('have.string', 'Rationale *');
  householdProfilePage.getDialogCancelButton().should('be.visible');
  householdProfilePage.getDialogApplyButton().should('be.visible');
  householdProfilePage.enterDialogRationale(params.rationale);
  householdProfilePage.getDialogApplyButton().click();
  householdProfilePage.refreshUntilHouseholdStatusUpdatedTo(params.statusEnum);
  householdProfilePage.getHouseholdStatusElement().contains(params.updatedStatus).should('be.visible');
  householdProfilePage.refreshUntilUserActionInformationUpdatedWithStatus(params.userActionInformation.toLowerCase());
  // eslint-disable-next-line
  householdProfilePage.getUserActionInformationElement().contains(`Household ${params.userActionInformation.toLowerCase()} by ${getUserName(params.roleName)} (${getUserRoleDescription(params.roleName)}) - ${getToday()}`).should('be.visible');
  householdProfilePage.getUserRationaleElement().contains(params.rationale).should('be.visible');

  cy.visit(`en/casefile/${params.casefileId}`);
  const caseFileDetailsPage = new CaseFileDetailsPage();
  caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('Household status changed:');
  caseFileDetailsPage.getUserName().should('eq', getUserName(params.roleName));
  caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(params.roleName)})`);
  caseFileDetailsPage.getCaseFileActivityTitle(0).should('string', 'Modified household information');
  caseFileDetailsPage.getCaseFileActivityBody(0).should('string', 'Household status changed:').and('string', params.casefileActivityBody).and('string', params.rationale);
};
