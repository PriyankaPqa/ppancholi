import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import {
  createEventAndTeam, prepareStateMultipleHouseholds,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { fixtureBaseMassAction, fixtureGenerateCaseFileStatusCsvFile, fixtureNewCaseFileStatus } from '../../../fixtures/mass-actions';
import { MassCaseFileStatusUpdateHomePage } from '../../../pages/mass-action/mass-case-file-status/massCaseFileStatusUpdateHome.page';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
];

const cannotRoles = [
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
const filePath = 'cypress/downloads/29044MACaseFileStatus.csv';

describe('[T29044] Pre-Processed a Mass case file status (Open to Inactive) via Upload File', { tags: ['@case-file', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            const resultMultipleHousehold = await prepareStateMultipleHouseholds(accessTokenL6, resultPrepareStateEvent.event, householdQuantity);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultMultipleHousehold.householdsCreated[0].registrationResponse.caseFile).as('caseFile1');
            cy.wrap(resultMultipleHousehold.householdsCreated[1].registrationResponse.caseFile).as('caseFile2');
            cy.wrap(resultMultipleHousehold.householdsCreated[2].registrationResponse.caseFile).as('caseFile3');
            cy.login(roleName);
            cy.goTo('mass-actions/case-file-status');
          });
        });

        after(function () {
          if (this.provider && this.teamCreated?.id) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });

        it('should be able to pre-process mass action for Case file status update via upload file', function () {
          fixtureGenerateCaseFileStatusCsvFile([this.caseFile1, this.caseFile2, this.caseFile3], filePath);
          const baseMassActionData = fixtureBaseMassAction(this.test.retries.length);
          const massCaseFileStatusData = fixtureNewCaseFileStatus({
            caseFileStatus: 'Inactive',
            reason: 'Deceased',
          });

          const massCaseFileStatusHomePage = new MassCaseFileStatusUpdateHomePage();
          massCaseFileStatusHomePage.getAddMassCaseFileStatusButton().click();

          const newMassCaseFileStatusPage = massCaseFileStatusHomePage.selectProcessViaFileUpload();
          newMassCaseFileStatusPage.fillNameDescription(baseMassActionData);
          newMassCaseFileStatusPage.fillEvent(this.event.name.translation.en);
          newMassCaseFileStatusPage.fillCaseFileStatus(massCaseFileStatusData.caseFileStatus);
          newMassCaseFileStatusPage.fillReason(massCaseFileStatusData.reason);
          newMassCaseFileStatusPage.fillRationale(massCaseFileStatusData.rationale);
          newMassCaseFileStatusPage.uploadFile().selectFile(filePath, { force: true });
          newMassCaseFileStatusPage.clickNext();
          newMassCaseFileStatusPage.getDialogTitle().should('eq', 'Confirm pre-processing');
          newMassCaseFileStatusPage.getDialogText().should('eq', 'Are you sure you want to start pre-processing this mass action?');
          newMassCaseFileStatusPage.getDialogConfirmSubmitButton().should('be.visible');
          newMassCaseFileStatusPage.getDialogConfirmCancelButton().should('be.visible');
          const massCaseFileStatusDetailsPage = newMassCaseFileStatusPage.confirmPreprocessing();
          massCaseFileStatusDetailsPage.getPreProcessingLabelOne().should('eq', 'Please wait while the file is being pre-processed.');
          massCaseFileStatusDetailsPage.getPreProcessingLabelTwo().should('eq', 'This might take a few minutes, depending on the number of case files');
          cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed);
          massCaseFileStatusDetailsPage.getMassActionStatus().contains('Pre-processed').should('be.visible');
          massCaseFileStatusDetailsPage.getMassActionName().should('string', baseMassActionData.name);
          massCaseFileStatusDetailsPage.getMassActionDescription().should('eq', baseMassActionData.description);
          massCaseFileStatusDetailsPage.getMassActionSuccessfulCaseFiles().should('eq', `${householdQuantity}`.toString());
          massCaseFileStatusDetailsPage.getMassActionSuccessfulCaseFiles().then((quantity) => {
            if (quantity === householdQuantity.toString()) {
              massCaseFileStatusDetailsPage.getMassActionProcessButton().should('be.enabled');
              massCaseFileStatusDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
            } else {
              massCaseFileStatusDetailsPage.getMassActionProcessButton().should('be.disabled');
              massCaseFileStatusDetailsPage.getInvalidCasefilesDownloadButton().should('be.enabled');
            }
          });
          massCaseFileStatusDetailsPage.getMassActionType().should('eq', 'Case file status update');
          massCaseFileStatusDetailsPage.getMassActionDateCreated().should('eq', getToday());
          massCaseFileStatusDetailsPage.verifyAndGetMassActionCreatedBy(getUserName(roleName)).should('eq', getUserName(roleName));
          massCaseFileStatusDetailsPage.getMassActionCaseFileStatusDetailsEvent().should('eq', this.event.name.translation.en);
          massCaseFileStatusDetailsPage.getMassActionCaseFileStatusDetailsCaseFileStatus().should('eq', massCaseFileStatusData.caseFileStatus);
          massCaseFileStatusDetailsPage.getMassActionCaseFileStatusDetailsReason().should('eq', massCaseFileStatusData.reason);
          massCaseFileStatusDetailsPage.getMassActionCaseFileStatusDetailsRationale().should('eq', massCaseFileStatusData.rationale);
          massCaseFileStatusDetailsPage.getBackToMassActionListButton().should('be.visible');
        });
      });
    }
  });

  describe('Cannot Roles', () => {
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo('mass-actions/case-file-status');
        });
        it('should not be able to pre-process a case file status Mass Action', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
