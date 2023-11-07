import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { fixtureProgram } from '../../../fixtures/events';
import { AddNewEventProgramPage } from '../../../pages/programs/addNewEventProgram.page';
import { createEventAndTeam } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';

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

describe('#TC323# - Add Event Program', { tags: ['@event'] }, () => {
  before(() => {
    cy.getToken().then(async (accessToken) => {
      const { provider, event, team } = await createEventAndTeam(accessToken.access_token, allRoles);
      cy.wrap(provider).as('provider');
      cy.wrap(event).as('eventCreated');
      cy.wrap(team).as('teamCreated');
    });
  });

  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
    }
  });

  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`events/${this.eventCreated.id}/programs/create`);
        });
        it('should successfully add an event program', function () {
          const programData = fixtureProgram(this.test.retries.length);

          const addNewEventProgramPage = new AddNewEventProgramPage();
          addNewEventProgramPage.getStatusName().should('eq', 'Inactive');
          addNewEventProgramPage.uncheckApprovalRequiredCheckbox();
          addNewEventProgramPage.getApprovalRequiredCheckbox().should('not.be.checked');
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
     for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`events/${this.eventCreated.id}/programs/create`);
        });
        it('should not be able to add an event program', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
