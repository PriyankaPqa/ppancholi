import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import {
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem,
  prepareStateHousehold } from '../../helpers/prepareState';
import { fixtureBaseMassAction, fixtureNewMassCommunication, writeCSVContentToFile } from '../../../fixtures/mass-actions';
import { MassCommunicationHomePage } from '../../../pages/mass-action/mass-communication/massCommunicationHome.page';
import { createTestXlsxFile } from '../../../fixtures/event-document';

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
const filePath = 'cypress/downloads/T29052MassCommunicationFile.csv';
const attachFileName = 'T29052MockXlxsFile';
const attachFilePath = `cypress/downloads/${attachFileName}.xlsx`;

describe('[T29052] Pre-process mass communication upload file.', { tags: ['@communications', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            // eslint-disable-next-line
            const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, EFinancialAmountModes.Fixed);
            const resultHousehold = await prepareStateHousehold(accessTokenL6, resultPrepareStateEvent.event);
            await createTestXlsxFile(attachFileName);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event.name.translation.en).as('eventName');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultCreateProgram.table.id).as('faTableId');
            cy.wrap(resultHousehold.registrationResponse.caseFile.id).as('caseFileId');
            cy.login(roleName);
            cy.goTo('mass-actions/communications');
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully pre-process mass communication upload file', function () {
          const baseMassActionData = fixtureBaseMassAction(this.test.retries.length);
          const massCommunicationData = fixtureNewMassCommunication();
          writeCSVContentToFile(filePath, [{
            CaseFileId: this.caseFileId,
          }]);
          const massCommunicationHomePage = new MassCommunicationHomePage();
          massCommunicationHomePage.getAddNewMassCommunicationButton().click();
          const newMassCommunicationPage = massCommunicationHomePage.goToCreateMassCommunicationViaFileUploadPage();
          newMassCommunicationPage.fillNameDescription(baseMassActionData);
          newMassCommunicationPage.fillEventName(this.eventName);
          newMassCommunicationPage.fillCommunicationMessageSubject(massCommunicationData.messageSubject);
          newMassCommunicationPage.fillCommunicationMessageText(massCommunicationData.messageText);
          newMassCommunicationPage.uploadAttachFile().selectFile(attachFilePath, { force: true });
          newMassCommunicationPage.uploadFile().selectFile(filePath, { force: true });
          newMassCommunicationPage.clickNext();
          newMassCommunicationPage.getDialogTitle().should('eq', 'Confirm pre-processing');
          newMassCommunicationPage.getDialogText().should('eq', 'Are you sure you want to start pre-processing this mass action?');
          newMassCommunicationPage.getDialogConfirmSubmitButton().should('be.visible');
          newMassCommunicationPage.getDialogConfirmCancelButton().should('be.visible');

          const massCommunicationDetailsPage = newMassCommunicationPage.confirmPreprocessing();
          massCommunicationDetailsPage.getPreProcessingLabelOne().should('eq', 'Please wait while the file is being pre-processed.');
          massCommunicationDetailsPage.getPreProcessingLabelTwo().should('eq', 'This might take a few minutes, depending on the number of case files');
          cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed);
          massCommunicationDetailsPage.getMassActionStatus().contains('Pre-processed').should('be.visible');
          massCommunicationDetailsPage.getDeleteButton().should('be.enabled');
          massCommunicationDetailsPage.getEditButton().should('be.enabled');
          massCommunicationDetailsPage.getMassActionSuccessfulCaseFiles().then((quantity) => {
            if (quantity === '1') {
              massCommunicationDetailsPage.getMassActionProcessButton().should('be.enabled');
              massCommunicationDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
            } else {
              massCommunicationDetailsPage.getMassActionProcessButton().should('be.disabled');
              massCommunicationDetailsPage.getInvalidCasefilesDownloadButton().should('be.enabled');
            }
          });
          massCommunicationDetailsPage.getMassActionName().should('string', baseMassActionData.name);
          massCommunicationDetailsPage.getMassActionDescription().should('eq', baseMassActionData.description);
          massCommunicationDetailsPage.getMassActionProcessButton().should('be.enabled');
          massCommunicationDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
          massCommunicationDetailsPage.getMassActionType().should('eq', 'Communication');
          massCommunicationDetailsPage.getMassActionDateCreated().should('eq', getToday());
          massCommunicationDetailsPage.verifyAndGetMassActionCreatedBy(getUserName(roleName)).should('eq', getUserName(roleName));
          massCommunicationDetailsPage.getMassCommunicationEvent().should('eq', this.eventName);
          massCommunicationDetailsPage.getMassCommunicationCommunicationMethod().should('eq', 'Email');
          massCommunicationDetailsPage.getMassCommunicationMessageSubject().should('eq', massCommunicationData.messageSubject);
          massCommunicationDetailsPage.getMassCommunicationCommunicationMessage().should('eq', massCommunicationData.messageText);
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
        it('should not be able to pre-process mass communications upload file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
