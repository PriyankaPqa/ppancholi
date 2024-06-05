import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createEventAndTeam, prepareStateCreateAndSearchHouseholds, prepareStatePreProcessMassCaseFileStatusUpdate } from '../../helpers/prepareState';
import { MassCaseFileStatusUpdateDetailsPage } from '../../../pages/mass-action/mass-case-file-status/massCaseFileStatusUpdateDetails.page';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';

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

const householdQuantity = 3;
let accessTokenL6 = '';

describe('[T29049] Processed a Mass Case File status via filtered list', { tags: ['@case-file', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.getToken(roleName).then(async (tokenResponse) => {
              const resultCreateAndSearchHouseholds = await prepareStateCreateAndSearchHouseholds(tokenResponse.access_token, this.event, householdQuantity);
              const resultPreProcessMassCaseFileStatus = await prepareStatePreProcessMassCaseFileStatusUpdate(tokenResponse.access_token, this.event);
              cy.wrap(resultPreProcessMassCaseFileStatus.responseMassCreateMassCaseFileStatusUpdate.name).as('massActionName');
              cy.wrap(resultPreProcessMassCaseFileStatus.responseMassCreateMassCaseFileStatusUpdate.id).as('massActionCaseFileStatusUpdateId');
              cy.wrap(resultPreProcessMassCaseFileStatus.responseMassCreateMassCaseFileStatusUpdate.status).as('massActionCaseFileStatus');
              cy.wrap(resultPreProcessMassCaseFileStatus.mockCreateMassCaseFileStatusUpdate.rationale).as('massActionCaseFileStatusUpdateRationale');
              cy.wrap(resultPreProcessMassCaseFileStatus).as('massActionCaseFileStatus');
              cy.wrap(resultCreateAndSearchHouseholds.caseFileCreated1.caseFileNumber).as('caseFileNumber1');
              cy.login(roleName);
              cy.goTo(`mass-actions/case-file-status/details/${resultPreProcessMassCaseFileStatus.responseMassCreateMassCaseFileStatusUpdate.id}`);
            });
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully process mass action for case file status update via filtered list', function () {
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
          massCaseFileStatusUpdateDetailsPage.waitAndRefreshUntilMassActionStatusUpdated(this.massActionName, 'Processed');
          massCaseFileStatusUpdateDetailsPage.getMassActionStatus().contains('Processed').should('be.visible');
          massCaseFileStatusUpdateDetailsPage.getMassActionSuccessfulCaseFiles().then((quantity) => {
            if (quantity === householdQuantity.toString()) {
              massCaseFileStatusUpdateDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
            } else {
              massCaseFileStatusUpdateDetailsPage.getInvalidCasefilesDownloadButton().should('be.enabled');
            }
          });
          massCaseFileStatusUpdateDetailsPage.getMassActionType().should('eq', 'Case file status update');
          massCaseFileStatusUpdateDetailsPage.getMassActionDateCreated().should('eq', getToday());
          massCaseFileStatusUpdateDetailsPage.verifyAndGetMassActionCreatedBy(getUserName(roleName)).should('eq', getUserName(roleName));
          massCaseFileStatusUpdateDetailsPage.getMassActionCaseFileStatusDetailsEvent().should('eq', this.event.name.translation.en);
          massCaseFileStatusUpdateDetailsPage.getMassActionCaseFileStatusDetailsCaseFileStatus().should('eq', 'Inactive');
          massCaseFileStatusUpdateDetailsPage.getMassActionCaseFileStatusDetailsReason().should('eq', 'Deceased');
          massCaseFileStatusUpdateDetailsPage.getMassActionCaseFileStatusDetailsRationale().should('eq', this.massActionCaseFileStatusUpdateRationale);
          massCaseFileStatusUpdateDetailsPage.getBackToMassActionListButton().should('be.visible');

          cy.goTo('casefile');
          const caseFilesHomePage = new CaseFilesHomePage();
          caseFilesHomePage.searchCaseFileTableFor(this.caseFileNumber1);
          caseFilesHomePage.getCaseFileStatus().should('eq', 'Inactive');

          const caseFileDetailsPage = caseFilesHomePage.goToCaseFileDetail(this.caseFileNumber1);
          if (roleName === UserRoles.level6) {
            caseFileDetailsPage.getRoleNameSystemAdmin().should('eq', 'System Admin');
          } else if (roleName === UserRoles.level5) {
            caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          }
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getStatusText().should('eq', 'Inactive');
          caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Case file set to inactive');
          caseFileDetailsPage.getCaseFileActivityBodies().should('string', 'Reason: Deceased').and('string', `Rationale: ${this.massActionCaseFileStatusUpdateRationale}`);
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
        it('should not be able to process mass action case file status update via filtered list', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
