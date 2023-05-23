import { UserRoles } from '@libs/cypress-lib/support/msal';
import { fixtureProgram } from '../../../fixtures/events';
import { AddNewEventProgramPage } from '../../../pages/programs/addNewEventProgram.page';
import { createEventAndTeam } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';

const canRoles = {
  Level6: UserRoles.level6,
};

const cannotRoles = {
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
  Level0: UserRoles.level0,
  Contributor1: UserRoles.contributor1,
  Contributor2: UserRoles.contributor2,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)] as UserRoles[];

const title = '#TC323# - Add Event Program';
describe(`${title}`, () => {
  before(() => {
    cy.getToken().then(async (accessToken) => {
      const { provider, event, team } = await createEventAndTeam(accessToken.access_token, allRolesValues);
      cy.wrap(provider).as('provider');
      cy.wrap(event).as('eventCreated');
      cy.wrap(team).as('teamCreated');
    });
  });

  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider, allRolesValues);
    }
  });

  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleValue);
          cy.goTo(`events/${this.eventCreated.id}/programs/create`);
        });
        it('should successfully add an event program', function () {
          const programData = fixtureProgram(this.test.retries.length);

          const addNewEventProgramPage = new AddNewEventProgramPage();
          addNewEventProgramPage.getStatusName().should('eq', 'Inactive');
          addNewEventProgramPage.getApprovalRequiredCheckbox().should('be.checked');
          addNewEventProgramPage.getProgramCreateButton().click().should('be.disabled');
          addNewEventProgramPage.fill(programData);
          addNewEventProgramPage.toggleStatus();
          addNewEventProgramPage.getStatusName().should('eq', 'Active');
          addNewEventProgramPage.getProgramCreateButton().should('be.enabled');
          addNewEventProgramPage.selectFrenchTab();
          addNewEventProgramPage.fillFrenchData(programData);

          const programDetailsPage = addNewEventProgramPage.createProgram();
          cy.contains('The program has been successfully created.').should('be.visible');
          programDetailsPage.getProgramName().should('eq', programData.name.translation.en);
          programDetailsPage.getEditButton().should('be.visible');
        });
      });
    }
  });

  describe('Cannot Roles', () => {
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleValue);
          cy.goTo(`events/${this.eventCreated.id}/programs/create`);
        });
        it('should not be able to add an event program', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
