import { IMassActionEntity, MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { IEventEntity } from '@libs/entities-lib/event';
import { IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { getToday } from '@libs/cypress-lib/helpers';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { MassFinancialAssistanceHomePage } from '../../../pages/mass-action/mass-financial-assistance/massFinancialAssistanceHome.page';
import { fixtureBaseMassAction, fixtureGenerateFaCsvFile, fixtureNewMassFinancialAssistance } from '../../../fixtures/mass-actions';
import { MassFinancialAssistanceDetailsPage } from '../../../pages/mass-action/mass-financial-assistance/massFinancialAssistanceDetails.page';
import { AddFinancialAssistancePage } from '../../../pages/financial-assistance-payment/addFinancialAssistance.page';
import { IAddNewPaymentLineFields } from '../../../pages/financial-assistance-payment/addNewPaymentLine.page';

export interface IMassActionFAUploadFilePassesPreProcessParams {
  caseFile: ICaseFileEntity;
  event: IEventEntity;
  faTable: IFinancialAssistanceTableEntity;
  filePath: string;
  programName: string;
  retries: number;
}

export interface IMassActionFAUploadFilePassesProcessParams {
  event: IEventEntity;
  faTable: IFinancialAssistanceTableEntity;
  householdQuantity: number;
  programName: string;
  retries: number;
  massFinancialAssistance: IMassActionEntity
  roleName: string;
}

export interface ManuallyCreateFaPaymentParams {
  faTableName: string,
  paymentLineData: IAddNewPaymentLineFields,
  eventId: string,
  programId: string,
  addFinancialAssistancePage: AddFinancialAssistancePage,
}

// eslint-disable-next-line max-statements
export const massActionFinancialAssistanceUploadFilePassesPreProcessCanSteps = (params: IMassActionFAUploadFilePassesPreProcessParams) => {
  fixtureGenerateFaCsvFile([params.caseFile], params.faTable.id, params.filePath);
  const baseMassActionData = fixtureBaseMassAction(params.retries);
  const newMassFinancialAssistanceData = fixtureNewMassFinancialAssistance();
  const massFinancialAssistanceHomePage = new MassFinancialAssistanceHomePage();
  massFinancialAssistanceHomePage.getAddMassFinancialAssistanceButton().click();

  const newMassFinancialAssistancePage = massFinancialAssistanceHomePage.selectProcessViaFileUpload();
  newMassFinancialAssistancePage.fillDescription(baseMassActionData);
  newMassFinancialAssistancePage.fillEvent(params.event.name.translation.en);
  newMassFinancialAssistancePage.fillTableName(params.faTable.name.translation.en);
  newMassFinancialAssistancePage.fillItemSubItem(newMassFinancialAssistanceData);
  newMassFinancialAssistancePage.fillPaymentModality(newMassFinancialAssistanceData.paymentModality);
  newMassFinancialAssistancePage.uploadFile().selectFile(params.filePath, { force: true });
  newMassFinancialAssistancePage.clickNext();
  newMassFinancialAssistancePage.getDialogTitle().should('eq', 'Confirm pre-processing');
  newMassFinancialAssistancePage.getDialogText().should('eq', 'Are you sure you want to start pre-processing this mass action?');
  newMassFinancialAssistancePage.getDialogConfirmSubmitButton().should('be.visible');
  newMassFinancialAssistancePage.getDialogConfirmCancelButton().should('be.visible');
  const massFinancialAssistanceDetailsPage = newMassFinancialAssistancePage.confirmPreprocessing();
  massFinancialAssistanceDetailsPage.getPreProcessingLabelOne().should('eq', 'Please wait while the file is being pre-processed.');
  massFinancialAssistanceDetailsPage.getPreProcessingLabelTwo().should('eq', 'This might take a few minutes, depending on the number of case files');
  cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed);
  massFinancialAssistanceDetailsPage.getMassActionName().as('massActionName');
  massFinancialAssistanceDetailsPage.getMassActionStatus().contains('Pre-processed').should('be.visible');
  massFinancialAssistanceDetailsPage.getMassActionName().should('string', `${params.programName} - ${newMassFinancialAssistanceData.item}`);
  massFinancialAssistanceDetailsPage.getMassActionProcessButton().should('be.enabled');
  massFinancialAssistanceDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
  massFinancialAssistanceDetailsPage.getMassActionDescription().should('eq', baseMassActionData.description);
  massFinancialAssistanceDetailsPage.getMassActionProjectedAmount().should('string', `${parseFloat(newMassFinancialAssistanceData.paymentAmount)}.00`);
  massFinancialAssistanceDetailsPage.getMassActionSuccessfulCaseFiles().should('eq', '1');
  massFinancialAssistanceDetailsPage.getMassActionProcessButton().should('be.visible');
  massFinancialAssistanceDetailsPage.getMassActionType().should('eq', 'Financial assistance');
  massFinancialAssistanceDetailsPage.getMassActionDateCreated().should('eq', getToday());
  massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsEvent().should('eq', params.event.name.translation.en);
  massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsTable().should('eq', params.faTable.name.translation.en);
  massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsProgram().should('eq', params.programName);
  massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsItem().should('eq', newMassFinancialAssistanceData.item);
  massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsSubItem().should('eq', newMassFinancialAssistanceData.subItem);
  massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsPaymentModality().should('eq', newMassFinancialAssistanceData.paymentModality.toLowerCase());
  massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsPaymentAmount().should('eq', `$${newMassFinancialAssistanceData.paymentAmount}`);
  massFinancialAssistanceDetailsPage.getBackToMassActionListButton().should('be.enabled');
};

export const massActionFinancialAssistanceUploadFilePassesProcessCanSteps = (params: IMassActionFAUploadFilePassesProcessParams) => {
  const newMassFinancialAssistanceData = fixtureNewMassFinancialAssistance({ paymentModality: 'Cheque' });
  const massFinancialAssistanceDetailsPage = new MassFinancialAssistanceDetailsPage();
  cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed);
  massFinancialAssistanceDetailsPage.getMassActionProcessButton().should('be.visible');
  massFinancialAssistanceDetailsPage.getMassActionProcessButton().click();
  massFinancialAssistanceDetailsPage.getDialogText().should('eq', 'Are you sure you want to start processing this mass action?');
  massFinancialAssistanceDetailsPage.getDialogConfirmCancelButton().should('be.visible');
  massFinancialAssistanceDetailsPage.getDialogConfirmSubmitButton().should('be.visible');
  massFinancialAssistanceDetailsPage.confirmProcessing();
  massFinancialAssistanceDetailsPage.getPreProcessingLabelOne().should('eq', 'Please wait while the case files are being processed.');
  massFinancialAssistanceDetailsPage.getPreProcessingLabelTwo().should('eq', 'This might take a few minutes depending on the number of processed case files.');
  cy.waitForMassActionToBe(MassActionRunStatus.Processed);
  massFinancialAssistanceDetailsPage.getMassActionStatus().contains('Processed').should('be.visible');
  massFinancialAssistanceDetailsPage.getMassActionProjectedAmount().should('string', `${parseFloat(newMassFinancialAssistanceData.paymentAmount) * params.householdQuantity}.00`);
  massFinancialAssistanceDetailsPage.getMassActionSuccessfulCaseFiles().should('string', params.householdQuantity);
  massFinancialAssistanceDetailsPage.getMassActionType().should('eq', 'Financial assistance');
  massFinancialAssistanceDetailsPage.getMassActionDateCreated().should('eq', getToday());
  massFinancialAssistanceDetailsPage.verifyAndGetMassActionCreatedBy(getUserName(params.roleName)).should('eq', getUserName(params.roleName));
  massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsEvent().should('eq', params.event.name.translation.en);
  massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsTable().should('eq', params.faTable.name.translation.en);
  massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsProgram().should('eq', params.programName);
  massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsItem().should('eq', newMassFinancialAssistanceData.item);
  massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsSubItem().should('eq', newMassFinancialAssistanceData.subItem);
  massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsPaymentModality().should('eq', newMassFinancialAssistanceData.paymentModality.toLowerCase());
  massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsPaymentAmount().should('eq', `$${newMassFinancialAssistanceData.paymentAmount}`);
  massFinancialAssistanceDetailsPage.getBackToMassActionListButton().should('be.enabled');
};

export const manuallyCreatePrepaidCardFaPaymentCanSteps = (params: ManuallyCreateFaPaymentParams) => {
  const addFinancialAssistancePage = params.addFinancialAssistancePage;
  addFinancialAssistancePage.getAddPaymentLineButton().should('be.disabled');
  addFinancialAssistancePage.getCreateButton().should('be.disabled');
  addFinancialAssistancePage.getBackToFinancialAssistanceButton().should('be.enabled');
  cy.interceptAndValidateCondition({
    httpMethod: 'GET',
    url: `**/event/events/${params.eventId}/programs/${params.programId}`,
    actionsCallback: () => {
      addFinancialAssistancePage.selectTable(params.faTableName);
      addFinancialAssistancePage.fillDescription('Financial Description Payment');
    },
    conditionCallBack: (interception) => (interception.response.statusCode === 200),
    actionsWhenValidationPassed: () => {
      addFinancialAssistancePage.getAddPaymentLineButton().should('be.enabled');
    },
    actionsWhenValidationFailed: () => {
      throw Error('Cannot fetch programs');
    },
    alias: 'getProgram',
    timeout: 4000,
  });
  addFinancialAssistancePage.getCreateButton().should('be.disabled');
  addFinancialAssistancePage.getBackToFinancialAssistanceButton().should('be.enabled');

  const addNewPaymentLinePage = addFinancialAssistancePage.goToAddNewPaymentLinePage();
  addNewPaymentLinePage.fill(params.paymentLineData);
  addNewPaymentLinePage.getAmountValue().should('eq', params.paymentLineData.amount);
  addNewPaymentLinePage.addNewPaymentLine();

  addFinancialAssistancePage.getPaymentLineGroupTitle().should('eq', 'Prepaid card');
  addFinancialAssistancePage.getItemEditButton().should('be.visible');
  addFinancialAssistancePage.getItemDeleteButton().should('be.visible');
  addFinancialAssistancePage.getAddPaymentLineButton().should('be.enabled');
  addFinancialAssistancePage.getSubmitAssistanceButton().should('be.disabled');
  addFinancialAssistancePage.getCreateButton().click();

  cy.contains('The financial assistance has been successfully created').should('be.visible');
  addFinancialAssistancePage.getPaymentStatus().should('eq', 'New');
  addFinancialAssistancePage.getPaymentEditButton().should('be.visible');
  addFinancialAssistancePage.getPaymentDeleteButton().should('be.visible');
  addFinancialAssistancePage.getPaymentLineItemTitle().should('eq', `${params.paymentLineData.item} > ${params.paymentLineData.subItem}`);
  addFinancialAssistancePage.getAddPaymentLineButton().should('be.enabled');
  addFinancialAssistancePage.getSubmitAssistanceButton().should('be.enabled');
  addFinancialAssistancePage.getBackToFinancialAssistanceButton().should('be.enabled');
};
