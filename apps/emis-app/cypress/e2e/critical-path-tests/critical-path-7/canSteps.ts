import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { UserRoles } from '@libs/entities-lib/user';
import { MassCaseFileStatusUpdateDetailsPage } from '../../../pages/mass-action/mass-case-file-status/massCaseFileStatusUpdateDetails.page';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';

export interface ProcessMassActionCaseFileStatusUpdateCanStepsParams {
  massActionName: string,
  massActionCaseFileStatusUpdateRationale: string,
  massActionCaseFileStatusUpdateReason: string,
  caseFileStatus: string,
  roleName: string,
  householdQuantity: number,
  eventName: string,
}

export const ProcessMassActionCaseFileStatusUpdateCanSteps = (params: ProcessMassActionCaseFileStatusUpdateCanStepsParams) => {
  const massCaseFileStatusUpdateDetailsPage = new MassCaseFileStatusUpdateDetailsPage();
  cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed, false);
  massCaseFileStatusUpdateDetailsPage.getMassActionProcessButton().should('be.visible');
  massCaseFileStatusUpdateDetailsPage.getMassActionProcessButton().click();
  massCaseFileStatusUpdateDetailsPage.getDialogText().should('eq', 'Are you sure you want to start processing this mass action?');
  massCaseFileStatusUpdateDetailsPage.getDialogConfirmCancelButton().should('be.visible');
  massCaseFileStatusUpdateDetailsPage.getDialogConfirmSubmitButton().should('be.visible');
  cy.interceptAndValidateCondition({
    httpMethod: 'POST',
    url: 'case-file/mass-actions/**/run',
    actionsCallback: () => {
      massCaseFileStatusUpdateDetailsPage.confirmProcessing();
      massCaseFileStatusUpdateDetailsPage.getPreProcessingLabelOne().should('eq', 'Please wait while the case files are being processed.');
      massCaseFileStatusUpdateDetailsPage.getPreProcessingLabelTwo().should('eq', 'This might take a few minutes depending on the number of processed case files.');
    },
    conditionCallBack: (interception) => (interception.response.statusCode === 200),
    actionsWhenValidationPassed: () => {
      cy.log('Mass action Case file status update processed successfully.');
    },
    actionsWhenValidationFailed: () => {
      throw Error('Mass action Case file status update not processed');
    },
    alias: 'MassActionCaseFileStatusUpdate',
  });
  cy.log(params.massActionName);
  massCaseFileStatusUpdateDetailsPage.waitAndRefreshUntilMassActionStatusUpdated(params.massActionName, 'Processed');
  massCaseFileStatusUpdateDetailsPage.getMassActionStatus().contains('Processed').should('be.visible');
  massCaseFileStatusUpdateDetailsPage.getMassActionSuccessfulCaseFiles().then((quantity) => {
    if (quantity === params.householdQuantity.toString()) {
      massCaseFileStatusUpdateDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
    } else {
      massCaseFileStatusUpdateDetailsPage.getInvalidCasefilesDownloadButton().should('be.enabled');
    }
  });
  massCaseFileStatusUpdateDetailsPage.getMassActionType().should('eq', 'Case file status update');
  massCaseFileStatusUpdateDetailsPage.getMassActionDateCreated().should('eq', getToday());
  massCaseFileStatusUpdateDetailsPage.verifyAndGetMassActionCreatedBy(getUserName(params.roleName)).should('eq', getUserName(params.roleName));
  massCaseFileStatusUpdateDetailsPage.getMassActionCaseFileStatusDetailsEvent().should('eq', params.eventName);
  massCaseFileStatusUpdateDetailsPage.getMassActionCaseFileStatusDetailsCaseFileStatus().should('eq', params.caseFileStatus);
  massCaseFileStatusUpdateDetailsPage.getMassActionCaseFileStatusDetailsReason().should('eq', params.massActionCaseFileStatusUpdateReason);
  massCaseFileStatusUpdateDetailsPage.getMassActionCaseFileStatusDetailsRationale().should('eq', params.massActionCaseFileStatusUpdateRationale);
  massCaseFileStatusUpdateDetailsPage.getBackToMassActionListButton().should('be.visible');
};

export interface CaseFileDetailsPageAssertionStepsParams {
  caseFileNumber1: string,
  massActionCaseFileStatusUpdateRationale: string,
  massActionCaseFileStatusUpdateReason: string,
  caseFileStatus: string,
  roleName: string,
  caseFileActivityTitle: string
}
export const caseFileDetailsPageAssertionSteps = (params: CaseFileDetailsPageAssertionStepsParams) => {
  cy.goTo('casefile');
  const caseFilesHomePage = new CaseFilesHomePage();
  caseFilesHomePage.searchCaseFileTableFor(params.caseFileNumber1);
  caseFilesHomePage.getCaseFileStatus().should('eq', params.caseFileStatus);

  const caseFileDetailsPage = caseFilesHomePage.goToCaseFileDetail(params.caseFileNumber1);
  if (params.roleName === UserRoles.level6) {
    caseFileDetailsPage.getRoleNameSystemAdmin().should('eq', 'System Admin');
  } else if (params.roleName === UserRoles.level5) {
    caseFileDetailsPage.getUserName().should('eq', getUserName(params.roleName));
  }
  caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(params.roleName)})`);
  caseFileDetailsPage.getStatusText().should('eq', params.caseFileStatus);
  caseFileDetailsPage.getCaseFileActivityTitles().should('string', params.caseFileActivityTitle);
  caseFileDetailsPage.getCaseFileActivityBodies()
    .should('string', `Reason: ${params.massActionCaseFileStatusUpdateReason}`)
    .and('string', `Rationale: ${params.massActionCaseFileStatusUpdateRationale}`);
};
