import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { fixtureBaseMassAction } from '../../../fixtures/mass-actions';
import { NewDataCorrectionPage } from '../../../pages/mass-action/data-correction/newDataCorrection.page';

export interface PreProcessDataCorrectionFileCanStepsParams {
  retries: number,
  dataCorrectionTypeDataTest: string,
  dataCorrectionTypeDropDown: string,
  filePath: string,
  preprocessedItems: string,
  roleName: string,
  householdQuantity: number,
}

// eslint-disable-next-line
export const preprocessDataCorrectionFileCanSteps = ({retries, dataCorrectionTypeDataTest, dataCorrectionTypeDropDown, filePath, preprocessedItems, householdQuantity, roleName}: Partial<PreProcessDataCorrectionFileCanStepsParams>) => {
  const baseMassActionData = fixtureBaseMassAction(retries);

  const newDataCorrectionPage = new NewDataCorrectionPage();
  newDataCorrectionPage.selectMassActionCorrectionType(dataCorrectionTypeDataTest);
  newDataCorrectionPage.fillMassActionDescription(baseMassActionData.description);
  newDataCorrectionPage.uploadFile().selectFile(filePath, { force: true });
  newDataCorrectionPage.clickNext();
  newDataCorrectionPage.getDialogTitle().should('eq', 'Confirm pre-processing');
  newDataCorrectionPage.getDialogText().should('eq', 'Are you sure you want to start pre-processing this mass action?');
  newDataCorrectionPage.getDialogSubmitButton().should('be.visible');
  newDataCorrectionPage.getDialogCancelButton().should('be.visible');

  const baseDetailsMassActionPage = newDataCorrectionPage.confirmPreprocessing();
  baseDetailsMassActionPage.getPreProcessingLabelOne().should('eq', 'Please wait while the file is being pre-processed.');
  baseDetailsMassActionPage.getPreProcessingLabelTwo().should('eq', `This might take a few minutes, depending on the number of ${preprocessedItems}`);
  cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed);
  baseDetailsMassActionPage.getMassActionStatus().contains('Pre-processed').should('be.visible');
  baseDetailsMassActionPage.getMassActionSuccessfulCaseFiles().then((quantity) => {
    if (quantity === householdQuantity.toString()) {
      baseDetailsMassActionPage.getMassActionProcessButton().should('be.enabled');
      baseDetailsMassActionPage.getInvalidCasefilesDownloadButton().should('be.disabled');
    } else {
      baseDetailsMassActionPage.getMassActionProcessButton().should('be.disabled');
      baseDetailsMassActionPage.getInvalidCasefilesDownloadButton().should('be.enabled');
    }
  });
  baseDetailsMassActionPage.getMassActionName().should('string', dataCorrectionTypeDropDown);
  baseDetailsMassActionPage.getMassActionDescription().should('eq', baseMassActionData.description);
  baseDetailsMassActionPage.getMassActionType().should('eq', dataCorrectionTypeDropDown);
  baseDetailsMassActionPage.getMassActionDateCreated().should('eq', getToday());
  baseDetailsMassActionPage.verifyAndGetMassActionCreatedBy().should('eq', getUserName(roleName));
};
