import { AuthenticationExceptionalType, getToday, IdentificationIdProvided } from '@libs/cypress-lib/helpers';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { IIdentityAuthentication, IdentityAuthenticationMethod, IdentityAuthenticationStatus } from '@libs/entities-lib/case-file';
import { BaseDetailsMassAction } from '../../../pages/mass-action/base/baseDetailsMassAction';
import { fixtureBaseMassAction } from '../../../fixtures/mass-actions';
import { NewDataCorrectionPage } from '../../../pages/mass-action/data-correction/newDataCorrection.page';

export const updatedIdentityAuthenticationStatus: IIdentityAuthentication = {
  status: IdentityAuthenticationStatus.Passed,
  method: IdentityAuthenticationMethod.Exceptional,
  identificationIds: [{
    optionItemId: IdentificationIdProvided.Other,
    specifiedOther: 'Update Identity Authentication using Mass Action',
  }],
  exceptionalAuthenticationTypeId: {
    optionItemId: AuthenticationExceptionalType.ApprovedByLegal,
    specifiedOther: null,
  },
};

export interface PreProcessDataCorrectionFileCanStepsParams {
  retries: number,
  dataCorrectionTypeDataTest: string,
  dataCorrectionTypeDropDown: string,
  filePath: string,
  preprocessedItems: string,
  roleName: string,
  householdQuantity: number,
  eventName?: string,
}

export interface ProcessDataCorrectionFileCanStepsParams {
  householdQuantity: number,
  processedItems: string,
  massActionName: string,
  massActionType: string,
  roleName: string,
  processedItemsLabelTwo: string,
}

// eslint-disable-next-line
export const preprocessDataCorrectionFileCanSteps = ({retries, dataCorrectionTypeDataTest, dataCorrectionTypeDropDown, filePath, preprocessedItems, householdQuantity, roleName, eventName}: Partial<PreProcessDataCorrectionFileCanStepsParams>) => {
  const baseMassActionData = fixtureBaseMassAction(retries);

  const newDataCorrectionPage = new NewDataCorrectionPage();
  newDataCorrectionPage.selectMassActionCorrectionType(dataCorrectionTypeDataTest);
  if (dataCorrectionTypeDropDown === 'Financial Assistance') {
    newDataCorrectionPage.fillEvent(eventName);
  }
  newDataCorrectionPage.fillMassActionDescription(baseMassActionData.description);
  newDataCorrectionPage.uploadFile().selectFile(filePath, { force: true });
  newDataCorrectionPage.clickNext();
  newDataCorrectionPage.getDialogTitle().should('eq', 'Confirm pre-processing');
  newDataCorrectionPage.getDialogText().should('eq', 'Are you sure you want to start pre-processing this mass action?');
  newDataCorrectionPage.getDialogConfirmSubmitButton().should('be.visible');
  newDataCorrectionPage.getDialogConfirmCancelButton().should('be.visible');

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
  baseDetailsMassActionPage.verifyAndGetMassActionCreatedBy(getUserName(roleName)).should('eq', getUserName(roleName));
  baseDetailsMassActionPage.getBackToMassActionListButton().should('be.visible');
};

export const processDataCorrectionFileSteps = (
  { householdQuantity, processedItems, massActionName, massActionType, roleName, processedItemsLabelTwo = 'records' }: Partial<ProcessDataCorrectionFileCanStepsParams>,
) => {
  const baseDetailsMassActionPage = new BaseDetailsMassAction();
  cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed, false);
  baseDetailsMassActionPage.getMassActionProcessButton().should('be.visible');
  baseDetailsMassActionPage.getMassActionProcessButton().click();
  baseDetailsMassActionPage.getDialogText().should('eq', 'Are you sure you want to start processing this mass action?');
  baseDetailsMassActionPage.getDialogConfirmCancelButton().should('be.visible');
  baseDetailsMassActionPage.getDialogConfirmSubmitButton().should('be.visible');
  cy.interceptAndValidateCondition({
    httpMethod: 'POST',
    url: 'case-file/mass-actions/**/run',
    actionsCallback: () => {
      baseDetailsMassActionPage.confirmProcessing();
      baseDetailsMassActionPage.getPreProcessingLabelOne().should('eq', `Please wait while the ${processedItems} are being processed.`);
      baseDetailsMassActionPage.getPreProcessingLabelTwo().should('eq', `This might take a few minutes depending on the number of processed ${processedItemsLabelTwo}.`);
    },
    conditionCallBack: (interception) => (interception.response.statusCode === 200),
    actionsWhenValidationPassed: () => {
      cy.log('Mass action has been processed successfully.');
    },
    actionsWhenValidationFailed: () => {
      throw Error('Mass action cannot be processed.');
    },
    alias: 'MassActionRun',
  });
  baseDetailsMassActionPage.waitAndRefreshUntilMassActionStatusUpdated(massActionName, 'Processed');
  baseDetailsMassActionPage.getMassActionStatus().contains('Processed').should('be.visible');
  baseDetailsMassActionPage.getMassActionSuccessfulCaseFiles().then((quantity) => {
    if (quantity === householdQuantity.toString()) {
      baseDetailsMassActionPage.getInvalidCasefilesDownloadButton().should('be.disabled');
    } else {
      baseDetailsMassActionPage.getInvalidCasefilesDownloadButton().should('be.enabled');
    }
    baseDetailsMassActionPage.getMassActionType().should('eq', massActionType);
    baseDetailsMassActionPage.getMassActionDateCreated().should('eq', getToday());
    baseDetailsMassActionPage.verifyAndGetMassActionCreatedBy(getUserName(roleName)).should('eq', getUserName(roleName));
    baseDetailsMassActionPage.getBackToMassActionListButton().should('be.visible');
  });
};
