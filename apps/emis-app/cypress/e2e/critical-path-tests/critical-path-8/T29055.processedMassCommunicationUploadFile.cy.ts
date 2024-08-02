import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { MassActionCommunicationMethod, MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import {
  createEventAndTeam,
  MassCommunicationViaUploadFileParams,
  prepareStateCreateAndSearchHouseholds,
  prepareStateMassCommunicationViaUploadFile,
} from '../../helpers/prepareState';
import { MassCommunicationDetailsPage } from '../../../pages/mass-action/mass-communication/massCommunicationDetails.page';

const canRoles = [
  UserRoles.level6,
];

const cannotRoles = [
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';
const householdQuantity = 3;

describe('[T29055] Processed Mass Communication upload file', { tags: ['@communications', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            const resultCreateHouseholds = await prepareStateCreateAndSearchHouseholds(tokenResponse.access_token, resultPrepareStateEvent.event, householdQuantity);
            const massCommunicationUploadFileParamData: MassCommunicationViaUploadFileParams = {
                provider: resultCreateHouseholds.responseCreateHouseholds.provider,
                caseFiles: [resultCreateHouseholds.caseFileCreated1, resultCreateHouseholds.caseFileCreated2, resultCreateHouseholds.caseFileCreated3],
                event: resultPrepareStateEvent.event,
                filePath: 'cypress/downloads/T29055MassCommunication.csv',
                method: MassActionCommunicationMethod.Email,
                messageSubject: { en: 'mock-message-subject-en', fr: 'mock-message-subject-fr' },
                message: { en: 'mock-message-en', fr: 'mock-message-fr' },
              };

            const resultMassActionCaseFileStatusViaUploadFile = await prepareStateMassCommunicationViaUploadFile(massCommunicationUploadFileParamData);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.event.name.translation.en).as('eventName');
            cy.wrap(resultMassActionCaseFileStatusViaUploadFile.mockRequestParamData.messageSubject.en).as('mockMessageSubject');
            cy.wrap(resultMassActionCaseFileStatusViaUploadFile.mockRequestParamData.message.en).as('mockMessage');
            cy.wrap(massCommunicationUploadFileParamData).as('massCommunicationUploadFile');
            cy.wrap(resultMassActionCaseFileStatusViaUploadFile.responseMassCommunicationUpdate).as('responseMassCommunicationUpdate');
            cy.wrap(resultCreateHouseholds.caseFileCreated1.caseFileNumber).as('caseFileNumber1');
            cy.wrap(resultMassActionCaseFileStatusViaUploadFile.responseMassCommunicationUpdate.name).as('massActionName');
            cy.login(roleName);
            cy.goTo(`mass-actions/communications/details/${resultMassActionCaseFileStatusViaUploadFile.responseMassCommunicationUpdate.id}`);
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        // eslint-disable-next-line
        it('should successfully process mass action for case file status update via upload file', function () {
          const massCommunicationDetailsPage = new MassCommunicationDetailsPage();
          cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed, false);
          massCommunicationDetailsPage.getMassActionProcessButton().should('be.visible');
          massCommunicationDetailsPage.getMassActionProcessButton().click();
          massCommunicationDetailsPage.getDialogText().should('eq', 'Are you sure you want to start processing this mass action?');
          massCommunicationDetailsPage.getDialogConfirmCancelButton().should('be.visible');
          massCommunicationDetailsPage.getDialogConfirmSubmitButton().should('be.visible');
          cy.interceptAndValidateCondition({
            httpMethod: 'POST',
            url: 'case-file/mass-actions/**/run',
            actionsCallback: () => {
              massCommunicationDetailsPage.confirmProcessing();
              massCommunicationDetailsPage.getPreProcessingLabelOne().should('eq', 'Please wait while the case files are being processed.');
              massCommunicationDetailsPage.getPreProcessingLabelTwo().should('eq', 'This might take a few minutes depending on the number of processed case files.');
            },
            conditionCallBack: (interception) => (interception.response.statusCode === 200),
            actionsWhenValidationPassed: () => {
              cy.log('Mass communication processed successfully.');
            },
            actionsWhenValidationFailed: () => {
              throw Error('Mass action mass communication not processed');
            },
            alias: 'MassCommunication',
          });
          massCommunicationDetailsPage.waitAndRefreshUntilMassActionStatusUpdated(this.massActionName, 'Processed');
          massCommunicationDetailsPage.getMassActionStatus().contains('Processed').should('be.visible');
          massCommunicationDetailsPage.getMassActionSuccessfulCaseFiles().then((quantity) => {
            if (quantity === householdQuantity.toString()) {
              massCommunicationDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
            } else {
              massCommunicationDetailsPage.getInvalidCasefilesDownloadButton().should('be.enabled');
            }
          });
          massCommunicationDetailsPage.getMassActionType().should('eq', 'Communication');
          massCommunicationDetailsPage.getMassActionDateCreated().should('eq', getToday());
          massCommunicationDetailsPage.verifyAndGetMassActionCreatedBy(getUserName(roleName)).should('eq', getUserName(roleName));
          massCommunicationDetailsPage.getMassCommunicationEvent().should('eq', this.eventName);
          massCommunicationDetailsPage.getMassCommunicationCommunicationMethod().should('eq', 'Email');
          massCommunicationDetailsPage.getMassCommunicationMessageSubject().should('eq', this.mockMessageSubject);
          massCommunicationDetailsPage.getMassCommunicationCommunicationMessage().should('eq', this.mockMessage);
          massCommunicationDetailsPage.getBackToMassActionListButton().should('be.visible');
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo('mass-actions/communications');
        });
        it('should not be able to process mass action for communication via upload file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
