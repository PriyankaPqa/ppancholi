import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { IEventEntity } from '@libs/entities-lib/event';
import { IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { MassFinancialAssistanceHomePage } from '../../../pages/mass-action/mass-financial-assistance/massFinancialAssistanceHome.page';
import { INewMassFinancialAssistanceFields } from '../../../pages/mass-action/mass-financial-assistance/newMassFinancialAssistance.page';
import { IBaseMassActionFields } from '../../../pages/mass-action/base/baseCreateMassAction';

export interface IMassActionFAUploadFilePassesPreProcessParams {
  baseMassActionData: IBaseMassActionFields;
  newMassFinancialAssistanceData: INewMassFinancialAssistanceFields;
  event: IEventEntity;
  faTable: IFinancialAssistanceTableEntity;
  filePath: string;
  programName: string;
}

export const massActionFinancialAssistanceUploadFilePassesPreProcessCanSteps = (params: IMassActionFAUploadFilePassesPreProcessParams) => {
  const massFinancialAssistanceHomePage = new MassFinancialAssistanceHomePage();
  massFinancialAssistanceHomePage.getAddMassFinancialAssistanceButton().click();

  const newMassFinancialAssistancePage = massFinancialAssistanceHomePage.selectProcessViaFileUpload();
  newMassFinancialAssistancePage.fillDescription(params.baseMassActionData);
  newMassFinancialAssistancePage.fillEvent(params.event.name.translation.en);
  newMassFinancialAssistancePage.fillTableName(params.faTable.name.translation.en);
  newMassFinancialAssistancePage.fillItemSubItem(params.newMassFinancialAssistanceData);
  newMassFinancialAssistancePage.fillPaymentModality(params.newMassFinancialAssistanceData.paymentModality);
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
  massFinancialAssistanceDetailsPage.getMassActionName().should('string', `${params.programName} - ${params.newMassFinancialAssistanceData.item}`);
  massFinancialAssistanceDetailsPage.getMassActionSuccessfulCaseFiles().should('eq', '1');
  massFinancialAssistanceDetailsPage.getMassActionProcessButton().should('be.enabled');
  massFinancialAssistanceDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
};
