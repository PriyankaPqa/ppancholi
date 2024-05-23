import { IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { ICreateHouseholdRequest } from '@libs/entities-lib/household-create';
import { FinancialAssistanceDetailsPage } from 'cypress/pages/financial-assistance-payment/financialAssistanceDetails.page';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { getToday } from '@libs/cypress-lib/helpers';
import { UserRoles } from '@libs/entities-lib/user';
import { IAddNewPaymentLineFields } from '../../../pages/financial-assistance-payment/addNewPaymentLine.page';
import { AddFinancialAssistancePage } from '../../../pages/financial-assistance-payment/addFinancialAssistance.page';

export interface PaymentLineCanStepsParams {
  faTable: IFinancialAssistanceTableEntity,
  retries: number,
  paymentLineData: IAddNewPaymentLineFields,
  groupTitle: string,
  household: ICreateHouseholdRequest,
}

export interface PaymentGroupStatusUpdateParam {
  paymentStatus: string,
  paymentModality: string,
  roleName?: string,
}

const addPaymentLineCanSteps = (params: Partial<PaymentLineCanStepsParams>) => {
  const addFinancialAssistancePage = new AddFinancialAssistancePage();
  addFinancialAssistancePage.selectTable(params.faTable.name.translation.en);
  addFinancialAssistancePage.fillDescription(`Financial Description ${params.groupTitle} Payment Line - retries - ${params.retries}`);

  const addNewPaymentLinePage = addFinancialAssistancePage.addPaymentLine();
  addNewPaymentLinePage.fill(params.paymentLineData);
  if (params.groupTitle === 'Gift card' || params.groupTitle === 'Invoice' || params.groupTitle === 'Voucher') {
    addNewPaymentLinePage.getRelatedNumberField().should('be.visible');
    addNewPaymentLinePage.fillRelatedNumber(params.paymentLineData.relatedNumber);
    addNewPaymentLinePage.fillAmount(params.paymentLineData.amount);
  }
  addNewPaymentLinePage.addNewPaymentLine();
};

const addPaymentLineChequeCanSteps = (params: Partial<PaymentLineCanStepsParams>) => {
  const addFinancialAssistancePage = new AddFinancialAssistancePage();
  addFinancialAssistancePage.getAddPaymentLineButton().should('be.disabled');
  addFinancialAssistancePage.getCreateButton().should('not.be.enabled');
  addFinancialAssistancePage.selectTable(params.faTable.name.translation.en);
  addFinancialAssistancePage.fillDescription(`Financial Description Cheque Payment Line - retries - ${params.retries}`);
  addFinancialAssistancePage.getAddPaymentLineButton().click();

  const addNewPaymentLinePage = addFinancialAssistancePage.addPaymentLine();
  addNewPaymentLinePage.fill(params.paymentLineData);
  addNewPaymentLinePage.getAmountValue().should('eq', params.paymentLineData.amount);
  // eslint-disable-next-line
  addNewPaymentLinePage.getPayeeNameValue().should('eq', `${params.household.primaryBeneficiary.identitySet.firstName} ${params.household.primaryBeneficiary.identitySet.lastName}`);
  addNewPaymentLinePage.getPayeeTypeElement().contains('Individual').should('be.visible');
  addNewPaymentLinePage.getStreetValue().should('eq', params.household.homeAddress.streetAddress);
  addNewPaymentLinePage.getUnitSuiteValue().should('eq', params.household.homeAddress.unitSuite);
  addNewPaymentLinePage.getCityValue().should('eq', params.household.homeAddress.city);
  addNewPaymentLinePage.getProvinceElement().contains('Alberta').should('be.visible');
  addNewPaymentLinePage.getPostalCodeValue().should('eq', params.household.homeAddress.postalCode);
  addNewPaymentLinePage.addNewPaymentLine();
};

const financialAssistanceCanSteps = (params: Partial<PaymentLineCanStepsParams>) => {
  const addFinancialAssistancePage = new AddFinancialAssistancePage();
  addFinancialAssistancePage.getSectionTitleElement().contains('Payment line(s)').should('be.visible');
  addFinancialAssistancePage.getPaymentLineGroupTitle().should('string', params.groupTitle);
  addFinancialAssistancePage.getItemEditButton().should('be.visible');
  addFinancialAssistancePage.getItemDeleteButton().should('be.visible');
  addFinancialAssistancePage.getAddPaymentLineButton().should('be.enabled');
  addFinancialAssistancePage.getSubmitAssistanceButton().should('not.be.enabled');
  addFinancialAssistancePage.getCreateButton().click();

  cy.contains('The financial assistance has been successfully created').should('be.visible');
  addFinancialAssistancePage.getPaymentStatus().should('eq', 'New');
  addFinancialAssistancePage.getPaymentLineGroupStatus().should('eq', 'Payment must be submitted');
  addFinancialAssistancePage.getPaymentEditButton().should('be.visible');
  addFinancialAssistancePage.getPaymentDeleteButton().should('be.visible');
  addFinancialAssistancePage.getPaymentLineItemTitle().should('eq', `${params.paymentLineData.item} > ${params.paymentLineData.subItem}`);
  if (params.groupTitle === 'Gift card' || params.groupTitle === 'Invoice' || params.groupTitle === 'Voucher') {
    addFinancialAssistancePage.getRelatedNumber().should('string', params.paymentLineData.relatedNumber);
  }
  addFinancialAssistancePage.getAddPaymentLineButton().should('be.enabled');
  addFinancialAssistancePage.getSubmitAssistanceButton().should('be.enabled');
  addFinancialAssistancePage.getBackToFinancialAssistanceButton().should('be.enabled');
};

export const paymentLineGeneralCanSteps = (params: Partial<PaymentLineCanStepsParams>) => {
  cy.interceptAndRetryUntilNoMoreStatus('**/case-file/case-files/metadata/*', 404);
  addPaymentLineCanSteps(params);
  financialAssistanceCanSteps(params);
};

export const paymentLineChequeCanSteps = (params: Partial<PaymentLineCanStepsParams>) => {
  cy.interceptAndRetryUntilNoMoreStatus('**/case-file/case-files/metadata/*', 404);
  addPaymentLineChequeCanSteps(params);
  financialAssistanceCanSteps(params);
};

// eslint-disable-next-line
export const updatePaymentGroupStatusTo = ({ paymentStatus, paymentModality, roleName }: Partial<PaymentGroupStatusUpdateParam>) => {
  const financialAssistanceDetailsPage = new FinancialAssistanceDetailsPage();
  financialAssistanceDetailsPage.selectPaymentLineStatus(paymentStatus);
  if (paymentStatus === 'Cancelled') {
    if (paymentModality === 'E-Transfer') {
      cy.contains('Please choose a reason for the cancellation').should('be.visible');
      financialAssistanceDetailsPage.getCancellationReasonField();
      financialAssistanceDetailsPage.getCancellationReasonFieldItems().should('have.length', 7); // 7 option as reason for cancellation
      financialAssistanceDetailsPage.chooseAnyCancellationReason();
      financialAssistanceDetailsPage.getDialogSubmitButton().should('be.enabled');
      financialAssistanceDetailsPage.getDialogCancelButton().should('be.enabled');
      financialAssistanceDetailsPage.getDialogSubmitButton().click();
    } else {
      cy.contains(`Are you sure you want to cancel all ${paymentModality} payment lines? This action is irreversible.`).should('be.visible');
      financialAssistanceDetailsPage.getDialogConfirmSubmitButton().should('be.enabled');
      financialAssistanceDetailsPage.getDialogConfirmCancelButton().should('be.enabled');
      financialAssistanceDetailsPage.getDialogConfirmSubmitButton().click();
    }
  }

  cy.contains('Payment status successfully updated.').should('be.visible');

  if (paymentStatus === 'Inprogress') {
    financialAssistanceDetailsPage.getPaymentLineStatusElement().contains('In progress').should('be.visible');
  } else {
    financialAssistanceDetailsPage.getPaymentLineStatusElement().contains(paymentStatus).should('be.visible');
  }

  if (paymentStatus === 'Cancelled') {
    financialAssistanceDetailsPage.getGroupCancellationByText().should('eq', `Cancelled by: ${getUserName(roleName)} on ${getToday()}`);
    financialAssistanceDetailsPage.getLineCancellationByText().should('eq', `Line cancelled by: ${getUserName(roleName)} on ${getToday()}`);
    financialAssistanceDetailsPage.getPaymentLineItemAmountField().shouldHaveCrossedText(true);
    financialAssistanceDetailsPage.getCancelledLabelText().should('eq', 'Cancelled');
    financialAssistanceDetailsPage.getPaymentGroupListField().contains('Payment total: $0.00').should('be.visible');
    if (paymentModality === 'E-Transfer') {
      financialAssistanceDetailsPage.getGroupCancellationReasonText().should('eq', 'Reason:  1 - Recipient rejected');
      financialAssistanceDetailsPage.getLineCancellationReasonText().should('eq', 'Reason:  1 - Recipient rejected');
    }
  } else if (paymentStatus === 'Completed') {
    financialAssistanceDetailsPage.getPaymentLineItemAmountField().shouldHaveCrossedText(false);
    financialAssistanceDetailsPage.getPaymentGroupListField().contains('Payment total: $80.00').should('be.visible');
    if (roleName === UserRoles.contributorFinance) {
      financialAssistanceDetailsPage.getPaymentLineItemCancelButton().should('not.exist');
    } else {
      financialAssistanceDetailsPage.getPaymentLineItemCancelButton().should('be.visible');
    }
  } else if (paymentStatus === 'Issued') {
    financialAssistanceDetailsPage.getPaymentLineItemAmountField().shouldHaveCrossedText(false);
    financialAssistanceDetailsPage.getPaymentGroupListField().contains('Payment total: $80.00').should('be.visible');
    financialAssistanceDetailsPage.getPaymentLineItemCancelButton().should('not.exist');
  } else if (paymentStatus === 'Inprogress') {
    financialAssistanceDetailsPage.getPaymentLineItemCancelButton().should('not.exist');
  }
};
