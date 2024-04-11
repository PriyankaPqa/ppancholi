import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { fixtureBaseMassAction, fixtureGenerateFaCsvFile, fixtureNewMassFinancialAssistance } from '../../../fixtures/mass-actions';
import { MassFinancialAssistanceHomePage } from '../../../pages/mass-action/mass-financial-assistance/massFinancialAssistanceHome.page';

export interface PreProcessFaMassActionStepsParams {
  programName: string,
  eventName: string,
  filePath: string,
  retries: number,
  errorMessage: string,
  financialAssistanceTable: IFinancialAssistanceTableEntity,
  caseFile: ICaseFileEntity,
}

export const cannotPreProcessFaMassActionSteps = (params: Partial<PreProcessFaMassActionStepsParams>) => {
  fixtureGenerateFaCsvFile([params.caseFile], params.financialAssistanceTable.id, params.filePath);
  const baseMassActionData = fixtureBaseMassAction(params.retries);
  const newMassFinancialAssistanceData = fixtureNewMassFinancialAssistance();

  const massFinancialAssistanceHomePage = new MassFinancialAssistanceHomePage();
  massFinancialAssistanceHomePage.getAddMassFinancialAssistanceButton().click();

  const newMassFinancialAssistancePage = massFinancialAssistanceHomePage.selectProcessViaFileUpload();
  newMassFinancialAssistancePage.fillDescription(baseMassActionData);
  newMassFinancialAssistancePage.fillEvent(params.eventName);
  newMassFinancialAssistancePage.fillTableName(params.financialAssistanceTable.name.translation.en);
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
  massFinancialAssistanceDetailsPage.clickShowErrorsButton();
  massFinancialAssistanceDetailsPage.getErrorMessage().should('string', params.errorMessage);
  massFinancialAssistanceDetailsPage.clickInvalidDownloadButton();

  cy.get('@massActionName').then((name) => {
    cy.readFile(`cypress/downloads/${name}.invalid.csv`, 'utf-8').then((fileContent) => {
      const expectedContent = `CaseFileId,CaseFileNumber,Reasons\r\n${params.caseFile.id},${params.caseFile.caseFileNumber},${params.errorMessage}\r\n`;
      expect(fileContent.trim()).to.equal(expectedContent.trim());
    });
  });
};
