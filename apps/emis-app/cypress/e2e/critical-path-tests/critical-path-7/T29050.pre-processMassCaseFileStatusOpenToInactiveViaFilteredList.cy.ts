import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { fixtureBaseMassAction, fixtureNewCaseFileStatus } from '../../../fixtures/mass-actions';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createEventAndTeam, prepareStateMultipleHouseholds } from '../../helpers/prepareState';
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

describe('[T29050] Pre-process a Mass Case File status(Open to Inactive) via filtered list', { tags: ['@case-file', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            // eslint-disable-next-line
            const resultMultipleHousehold = await prepareStateMultipleHouseholds(accessTokenL6, resultPrepareStateEvent.event, householdQuantity);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultMultipleHousehold.householdsCreated[0].registrationResponse.caseFile).as('caseFileCreated1');
            cy.wrap(resultMultipleHousehold.householdsCreated[1].registrationResponse.caseFile).as('caseFileCreated2');
            cy.wrap(resultMultipleHousehold.householdsCreated[2].registrationResponse.caseFile).as('caseFileCreated3');
            cy.login(roleName);
            cy.goTo('mass-actions/case-file-status');
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully pre-process mass action for case file status update from open to inactive via filtered list', function () {
          const baseMassActionData = fixtureBaseMassAction(this.test.retries.length);
          const massCaseFileStatusUpdateData = fixtureNewCaseFileStatus({
            caseFileStatus: 'Inactive',
            reason: 'Deceased',
            rationale: 'it is not Mandatory field',
          });
          const massCaseFileStatusUpdateHomePage = new MassCaseFileStatusUpdateHomePage();
          massCaseFileStatusUpdateHomePage.getAddMassCaseFileStatusButton().click();

          const massActionViaListPage = massCaseFileStatusUpdateHomePage.selectProcessViaFilteredList();
          massActionViaListPage.addFilter();
          massActionViaListPage.enterEventName(this.event.name.translation.en);
          massActionViaListPage.applyFilter();
          massActionViaListPage.getCaseFileTable().contains(this.caseFileCreated1.caseFileNumber).should('be.visible');
          massActionViaListPage.getCaseFileTable().contains(this.caseFileCreated2.caseFileNumber).should('be.visible');
          massActionViaListPage.getCaseFileTable().contains(this.caseFileCreated3.caseFileNumber).should('be.visible');

          const newMassCaseFileStatusUpdatePage = massActionViaListPage.goToNewMassCaseFileStatusUpdatePage();
          newMassCaseFileStatusUpdatePage.fillNameDescription(baseMassActionData);
          newMassCaseFileStatusUpdatePage.fillEvent(this.event.name.translation.en);
          newMassCaseFileStatusUpdatePage.fillCaseFileStatus(massCaseFileStatusUpdateData.caseFileStatus);
          newMassCaseFileStatusUpdatePage.fillReason(massCaseFileStatusUpdateData.reason);
          newMassCaseFileStatusUpdatePage.fillRationale(massCaseFileStatusUpdateData.rationale);
          newMassCaseFileStatusUpdatePage.clickNext();
          newMassCaseFileStatusUpdatePage.getDialogTitle().should('eq', 'Confirm pre-processing');
          newMassCaseFileStatusUpdatePage.getDialogText().should('eq', 'Are you sure you want to start pre-processing this mass action?');
          newMassCaseFileStatusUpdatePage.getDialogConfirmSubmitButton().should('be.visible');
          newMassCaseFileStatusUpdatePage.getDialogConfirmCancelButton().should('be.visible');

          const massCaseFileStatusUpdateDetailsPage = newMassCaseFileStatusUpdatePage.confirmPreprocessing();
          massCaseFileStatusUpdateDetailsPage.getPreProcessingLabelOne().should('eq', 'Please wait while the file is being pre-processed.');
          massCaseFileStatusUpdateDetailsPage.getPreProcessingLabelTwo().should('eq', 'This might take a few minutes, depending on the number of case files');
          cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed);
          massCaseFileStatusUpdateDetailsPage.getMassActionStatus().contains('Pre-processed').should('be.visible');
          massCaseFileStatusUpdateDetailsPage.getMassActionName().should('string', baseMassActionData.name);
          massCaseFileStatusUpdateDetailsPage.getMassActionDescription().should('eq', baseMassActionData.description);
          massCaseFileStatusUpdateDetailsPage.getMassActionSuccessfulCaseFiles().then((quantity) => {
            if (quantity === householdQuantity.toString()) {
              massCaseFileStatusUpdateDetailsPage.getMassActionProcessButton().should('be.enabled');
              massCaseFileStatusUpdateDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
            } else {
              massCaseFileStatusUpdateDetailsPage.getMassActionProcessButton().should('be.disabled');
              massCaseFileStatusUpdateDetailsPage.getInvalidCasefilesDownloadButton().should('be.enabled');
            }
          });
          massCaseFileStatusUpdateDetailsPage.getMassActionProcessButton().should('be.enabled');
          massCaseFileStatusUpdateDetailsPage.getMassActionType().should('eq', 'Case file status update');
          massCaseFileStatusUpdateDetailsPage.getMassActionDateCreated().should('eq', getToday());
          massCaseFileStatusUpdateDetailsPage.verifyAndGetMassActionCreatedBy(getUserName(roleName)).should('eq', getUserName(roleName));
          massCaseFileStatusUpdateDetailsPage.getMassActionCaseFileStatusDetailsEvent().should('eq', this.event.name.translation.en);
          massCaseFileStatusUpdateDetailsPage.getMassActionCaseFileStatusDetailsCaseFileStatus().should('eq', massCaseFileStatusUpdateData.caseFileStatus);
          massCaseFileStatusUpdateDetailsPage.getMassActionCaseFileStatusDetailsReason().should('eq', massCaseFileStatusUpdateData.reason);
          massCaseFileStatusUpdateDetailsPage.getMassActionCaseFileStatusDetailsRationale().should('eq', massCaseFileStatusUpdateData.rationale);
          massCaseFileStatusUpdateDetailsPage.getBackToMassActionListButton().should('be.visible');
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
        it('should not be able to pre-process mass action for case file status via filtered list', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
