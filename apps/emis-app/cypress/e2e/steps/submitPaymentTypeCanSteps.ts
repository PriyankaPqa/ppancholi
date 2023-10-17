import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { getToday } from '@libs/cypress-lib/helpers';
import { IFinancialAssistancePaymentEntity } from '@libs/entities-lib/financial-assistance-payment';
import { FinancialAssistanceHomePage } from '../../pages/financial-assistance-payment/financialAssistanceHome.page';

export interface SubmitPaymentTypeCanStepsParams {
  financialAssistancePayment: IFinancialAssistancePaymentEntity,
  paymentType: string,
  roleName: string,
  paymentGroupStatus: string,
}

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
  financialAssistanceHomePage.getApprovalStatusHistory();

  financialAssistanceHomePage.getApprovalHistoryRationaleByIndex(0).should('eq', '-');
  financialAssistanceHomePage.getApprovalHistoryActionByIndex(0).should('eq', 'Submitted');
  financialAssistanceHomePage.getApprovalHistoryRationaleByIndex(1).should('eq', 'Assistance approved on assessment form or assistance did not require approval');
  financialAssistanceHomePage.getApprovalHistoryActionByIndex(1).should('eq', 'Approved - Final');
  financialAssistanceHomePage.getDialogCancelApprovalStatusHistoryButton().click();

  const caseFileDetailsPage = financialAssistanceHomePage.goToCaseFileDetailsPage();
  caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody(`Name: ${financialAssistancePayment.name}`);
  caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
  caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
  caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Financial assistance payment - Approved - Final');
  caseFileDetailsPage.getCaseFileActivityBodies().should('string', `Name: ${financialAssistancePayment.name}`).and('string', 'Amount: $80.00');
};
