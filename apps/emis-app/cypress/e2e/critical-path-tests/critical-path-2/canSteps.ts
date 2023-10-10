import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { IFinancialAssistancePaymentEntity } from '@libs/entities-lib/financial-assistance-payment';
import { FinancialAssistanceHomePage } from '../../../pages/financial-assistance-payment/financialAssistanceHome.page';
import { AssessmentsListPage } from '../../../pages/assessmentsCasefile/assessmentsList.page';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';

export interface SubmitPaymentTypeCanStepsParams {
  financialAssistancePayment: IFinancialAssistancePaymentEntity,
  paymentType: string,
  roleName: string,
  paymentGroupStatus: string,
}

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
  if (roleName === 'Contributor3' || roleName === 'Contributor2' || roleName === 'Contributor1' || roleName === 'ReadOnly') {
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
  assessmentsListPage.getAssessmentDateAssigned().should('eq', getToday());
  assessmentsListPage.getAssessmentDateModified().should('eq', getToday());
  assessmentsListPage.getAssessmentDateCompletedElement().contains(`${getToday()}`).should('be.visible');
  assessmentsListPage.getAssessmentStatusTag().should('eq', 'Completed');
  if (roleName === 'Level6' || roleName === 'Level5' || roleName === 'Level4' || roleName === 'Level3') {
    assessmentsListPage.getEditCompletedAssessmentButton().should('be.visible');
  } else {
    assessmentsListPage.getEditCompletedAssessmentButton().should('not.exist');
  }
};

// eslint-disable-next-line
export const submitPaymentTypeCanSteps = ({ financialAssistancePayment, paymentType, roleName, paymentGroupStatus }: Partial<SubmitPaymentTypeCanStepsParams>) => {
  const financialAssistanceHomePage = new FinancialAssistanceHomePage();
  financialAssistanceHomePage.refreshUntilFaPaymentDisplayedWithTotal('$80.00');
  financialAssistanceHomePage.getApprovalStatus().should('eq', 'New');

  const financialAssistanceDetailsPage = financialAssistanceHomePage.getFAPaymentById(financialAssistancePayment.id);
  financialAssistanceDetailsPage.getSubmitAssistanceButton().should('be.enabled');
  financialAssistanceDetailsPage.getBackToFinancialAssistanceButton().should('be.enabled');
  financialAssistanceDetailsPage.getAddPaymentLineButton().should('be.enabled');
  financialAssistanceDetailsPage.getSubmitAssistanceButton().click();
  cy.contains('By clicking Submit your payment will be processed and the status of this financial assistance payment will be Approved.').should('be.visible');
  financialAssistanceDetailsPage.getDialogCancelFinancialAssistanceButton().should('be.enabled');
  financialAssistanceDetailsPage.getDialogSubmitFinancialAssistanceButton().should('be.enabled');
  financialAssistanceDetailsPage.getDialogSubmitFinancialAssistanceButton().click();
  cy.contains('The financial assistance has been successfully submitted').should('be.visible');
  financialAssistanceDetailsPage.getFinancialAssistanceApprovalStatus().should('eq', 'Approved');
  financialAssistanceDetailsPage.getPaymentLineStatus().should('eq', paymentGroupStatus);
  financialAssistanceDetailsPage.goToFinancialAssistanceHomePage();

  financialAssistanceHomePage.refreshUntilFaPaymentDisplayedWithTotal('$80.00');
  financialAssistanceHomePage.getFAPaymentNameById(financialAssistancePayment.id).should('eq', financialAssistancePayment.name);
  financialAssistanceHomePage.getFAPaymentCreatedDate().should('eq', getToday());
  financialAssistanceHomePage.getFAPaymentAmount().should('eq', '$80.00');
  financialAssistanceHomePage.getApprovalStatus().should('eq', 'Approved');
  financialAssistanceHomePage.getApprovalStatusHistoryIcon().should('be.visible');
  financialAssistanceHomePage.expandFAPayment();
  financialAssistanceHomePage.getFAPaymentGroupTitle().should('string', paymentType);
  financialAssistanceHomePage.getFAPaymentGroupTotal().should('eq', '$80.00');
  financialAssistanceHomePage.getFAPaymentPaymentStatus().should('eq', `Status: ${paymentGroupStatus}`);

  const caseFileDetailsPage = financialAssistanceHomePage.goToCaseFileDetailsPage();
  caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody(`Name: ${financialAssistancePayment.name}`);
  caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
  caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
  caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Financial assistance payment - Approved - Final');
  caseFileDetailsPage.getCaseFileActivityBodies().should('string', `Name: ${financialAssistancePayment.name}`).and('string', 'Amount: $80.00');
};

// eslint-disable-next-line
export const updateHouseholdStatusCanSteps = ({ actionUpdateHousehold, updatedStatus, userActionInformation, rationale, roleName, statusEnum, casefileId, casefileActivityBody }: Partial<UpdateHouseholdStatusCanStepsParams>) => {
  const householdProfilePage = new HouseholdProfilePage();
  householdProfilePage.getDialogTitle().contains(`${actionUpdateHousehold} household profile`).should('be.visible');
  householdProfilePage.getDialogStatus().should('eq', updatedStatus);
  householdProfilePage.getDialogUserInfo().should('string', `${getUserName(roleName)} (${getUserRoleDescription(roleName)})`);
  householdProfilePage.getDialogRationaleElement().should('have.attr', 'label').and('have.string', 'Rationale *');
  householdProfilePage.getDialogCancelButton().should('be.visible');
  householdProfilePage.getDialogApplyButton().should('be.visible');
  householdProfilePage.enterDialogRationale(rationale);
  householdProfilePage.getDialogApplyButton().click();
  householdProfilePage.refreshUntilHouseholdStatusUpdatedTo(statusEnum);
  householdProfilePage.getHouseholdStatusElement().contains(updatedStatus).should('be.visible');
  householdProfilePage.refreshUntilUserActionInformationUpdatedWithStatus(userActionInformation.toLowerCase());
  // eslint-disable-next-line
  householdProfilePage.getUserActionInformationElement().contains(`Household ${userActionInformation.toLowerCase()} by ${getUserName(roleName)} (${getUserRoleDescription(roleName)}) - ${getToday()}`).should('be.visible');
  householdProfilePage.getUserRationaleElement().contains(rationale).should('be.visible');

  cy.visit(`en/casefile/${casefileId}`);
  const caseFileDetailsPage = new CaseFileDetailsPage();
  caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('Household status changed:');
  caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
  caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
  caseFileDetailsPage.getCaseFileActivityTitle(0).should('string', 'Modified household information');
  caseFileDetailsPage.getCaseFileActivityBody(0).should('string', 'Household status changed:').and('string', casefileActivityBody).and('string', rationale);
};
