import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createEventAndTeam, prepareStateCreateAndSearchHouseholds, prepareStatePreProcessMassCaseFileStatusUpdate } from '../../helpers/prepareState';
import { ProcessMassActionCaseFileStatusUpdateCanSteps, caseFileDetailsPageAssertionSteps } from './canSteps';

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
          ProcessMassActionCaseFileStatusUpdateCanSteps({
            massActionName: this.massActionName,
            massActionCaseFileStatusUpdateRationale: this.massActionCaseFileStatusUpdateRationale,
            massActionCaseFileStatusUpdateReason: 'Deceased',
            caseFileStatus: 'Inactive',
            roleName,
            householdQuantity,
            eventName: this.event.name.translation.en,
          });

          caseFileDetailsPageAssertionSteps({
            caseFileNumber1: this.caseFileNumber1,
            massActionCaseFileStatusUpdateRationale: this.massActionCaseFileStatusUpdateRationale,
            massActionCaseFileStatusUpdateReason: 'Deceased',
            caseFileStatus: 'Inactive',
            roleName,
            caseFileActivityTitle: 'Case file set to inactive',
          });
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
